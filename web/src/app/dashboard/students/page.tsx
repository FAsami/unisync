'use client'

import { useState } from 'react'
import {
  App,
  Button,
  Form,
  Input,
  Popconfirm,
  Segmented,
  Space,
  Switch,
  Table,
  Tooltip,
} from 'antd'
import { PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { api } from '@/lib/api/client'
import { messageOf, unwrap } from '@/lib/api/errors'
import { fields, type Student } from '@/lib/api/schema'
import { useLoad } from '@/lib/useLoad'
import { PhoneInput } from '@/components/PhoneInput'
import { FormModal } from '@/components/setup/FormModal'
import { RosterImport } from '@/components/setup/RosterImport'
import { LoadError, PageHeader, SectionSelect } from '@/components/setup/ui'

type StudentValues = {
  phone: string
  firstName: string
  lastName: string
  studentId?: string
  sectionId: string
}

const StudentsPage = () => {
  const { message } = App.useApp()
  const [sectionId, setSectionId] = useState<string | undefined>()
  const [show, setShow] = useState<'active' | 'inactive'>('active')
  const [q, setQ] = useState('')
  const [modal, setModal] = useState<{ student?: Student } | null>(null)
  const [importing, setImporting] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  const batches = useLoad('batches', () => unwrap(api.GET('/api/v1/batches')))
  const { data, error, loading, reload } = useLoad(
    `students:${sectionId ?? ''}:${show}:${q}`,
    () =>
      unwrap(
        api.GET('/api/v1/students', {
          params: {
            query: {
              sectionId,
              active: show === 'active',
              q: q || undefined,
            },
          },
        })
      )
  )

  const save = async (values: StudentValues) => {
    const body = { ...values, studentId: values.studentId?.trim() || null }
    const editing = modal?.student
    if (editing) {
      await unwrap(
        api.PATCH('/api/v1/students/{id}', {
          params: { path: { id: editing.id } },
          body: fields(body),
        })
      )
    } else {
      await unwrap(api.POST('/api/v1/students', { body: fields(body) }))
    }
    message.success(
      editing
        ? 'Student saved.'
        : `${values.firstName} can now sign in to the mobile app.`
    )
    setModal(null)
    await Promise.all([reload(), batches.reload()])
  }

  const run = async (
    id: string,
    action: () => Promise<unknown>,
    done: string
  ) => {
    setBusy(id)
    try {
      await action()
      message.success(done)
      await reload()
    } catch (e) {
      message.error(messageOf(e))
    } finally {
      setBusy(null)
    }
  }

  const setCr = (s: Student, on: boolean) =>
    run(
      s.id,
      () =>
        unwrap(
          on
            ? api.PUT('/api/v1/students/{id}/class-representative', {
                params: { path: { id: s.id } },
              })
            : api.DELETE('/api/v1/students/{id}/class-representative', {
                params: { path: { id: s.id } },
              })
        ),
      on
        ? `${s.firstName} is now a CR of ${s.section?.name ?? 'their section'}.`
        : `${s.firstName} is no longer a CR.`
    )

  const setActive = (s: Student, isActive: boolean) =>
    run(
      s.id,
      () =>
        unwrap(
          api.PATCH('/api/v1/students/{id}', {
            params: { path: { id: s.id } },
            body: fields({ isActive }),
          })
        ),
      isActive
        ? `${s.firstName} is active again.`
        : `${s.firstName} is deactivated and signed out.`
    )

  return (
    <div>
      <PageHeader
        title='Students'
        description="Your roster. Students on it sign in to the mobile app with their number; no one else can. A CR can post notices and change their section's classes."
        extra={
          <>
            <Button
              icon={<UploadOutlined />}
              onClick={() => setImporting(true)}
            >
              Import
            </Button>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={() => setModal({})}
            >
              Add student
            </Button>
          </>
        }
      />
      <Space wrap className='mb-4'>
        <SectionSelect
          batches={batches.data}
          value={sectionId}
          onChange={setSectionId}
          allowClear
          activeOnly={false}
          placeholder='All sections'
          aria-label='Filter by section'
          style={{ width: 220 }}
        />
        <Segmented
          value={show}
          onChange={setShow}
          options={[
            { label: 'Active', value: 'active' },
            { label: 'Deactivated', value: 'inactive' },
          ]}
        />
        <Input.Search
          allowClear
          placeholder='Search name, ID or number'
          onSearch={setQ}
          style={{ width: 260 }}
        />
      </Space>
      <LoadError error={error} onRetry={reload} />
      <Table<Student>
        rowKey='id'
        loading={loading}
        dataSource={data}
        scroll={{ x: 900 }}
        pagination={{ pageSize: 50, hideOnSinglePage: true }}
        locale={{
          emptyText: q
            ? 'No one matches'
            : 'No students here yet. Add them one by one or import a sheet.',
        }}
        columns={[
          {
            title: 'Name',
            render: (_, s) => `${s.firstName} ${s.lastName}`,
          },
          { title: 'Student ID', dataIndex: 'studentId' },
          { title: 'Phone', dataIndex: 'phone' },
          {
            title: 'Section',
            render: (_, s) =>
              s.batch && s.section
                ? `${s.batch.name} · ${s.section.name}`
                : '—',
          },
          {
            title: (
              <Tooltip title='Class representative'>
                <span>CR</span>
              </Tooltip>
            ),
            width: 80,
            render: (_, s) => (
              <Switch
                size='small'
                checked={s.isClassRepresentative}
                disabled={!s.isActive || !s.section}
                loading={busy === s.id}
                onChange={(on) => setCr(s, on)}
                aria-label={`CR: ${s.firstName} ${s.lastName}`}
              />
            ),
          },
          {
            title: '',
            key: 'actions',
            align: 'right',
            render: (_, s) => (
              <Space>
                <Button size='small' onClick={() => setModal({ student: s })}>
                  Edit
                </Button>
                {s.isActive ? (
                  <Popconfirm
                    title={`Deactivate ${s.firstName}?`}
                    description='They are signed out and can no longer sign in.'
                    okText='Deactivate'
                    okButtonProps={{ danger: true }}
                    onConfirm={() => setActive(s, false)}
                  >
                    <Button size='small' danger>
                      Deactivate
                    </Button>
                  </Popconfirm>
                ) : (
                  <Button size='small' onClick={() => setActive(s, true)}>
                    Reactivate
                  </Button>
                )}
              </Space>
            ),
          },
        ]}
      />

      <FormModal<StudentValues>
        open={modal !== null}
        title={
          modal?.student
            ? `Edit ${modal.student.firstName} ${modal.student.lastName}`
            : 'Add student'
        }
        initialValues={
          modal?.student
            ? {
                phone: modal.student.phone,
                firstName: modal.student.firstName,
                lastName: modal.student.lastName,
                studentId: modal.student.studentId ?? '',
                sectionId: modal.student.section?.id,
              }
            : { sectionId }
        }
        onCancel={() => setModal(null)}
        onSubmit={save}
      >
        <Form.Item
          label='Mobile number'
          name='phone'
          rules={[
            { required: true, message: 'Enter the mobile number' },
            {
              pattern: /^\+8801\d{9}$/,
              message: 'Enter a Bangladeshi mobile number, like 1712345678',
            },
          ]}
          extra={
            modal?.student
              ? 'Changing the number signs them out everywhere.'
              : undefined
          }
        >
          <PhoneInput />
        </Form.Item>
        <Space size='middle' wrap>
          <Form.Item
            label='First name'
            name='firstName'
            rules={[{ required: true, message: 'Enter the first name' }]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            label='Last name'
            name='lastName'
            rules={[{ required: true, message: 'Enter the last name' }]}
          >
            <Input maxLength={100} />
          </Form.Item>
        </Space>
        <Form.Item label='Student ID' name='studentId'>
          <Input maxLength={50} />
        </Form.Item>
        <Form.Item
          label='Section'
          name='sectionId'
          rules={[{ required: true, message: 'Choose the section' }]}
          extra={
            modal?.student?.isClassRepresentative
              ? 'Moving a CR to another section ends their CR mark.'
              : undefined
          }
        >
          <SectionSelect batches={batches.data} />
        </Form.Item>
      </FormModal>

      <RosterImport
        open={importing}
        onClose={() => setImporting(false)}
        onImported={() => {
          setImporting(false)
          void reload()
          void batches.reload()
        }}
      />
    </div>
  )
}

export default StudentsPage
