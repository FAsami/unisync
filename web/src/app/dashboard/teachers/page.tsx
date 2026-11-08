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
  Table,
  Tag,
} from 'antd'
import { Plus } from 'lucide-react'
import { api } from '@/lib/api/client'
import { messageOf, unwrap } from '@/lib/api/errors'
import { fields, type Teacher } from '@/lib/api/schema'
import { useLoad } from '@/lib/useLoad'
import { PhoneInput } from '@/components/PhoneInput'
import { FormModal } from '@/components/setup/FormModal'
import { LoadError, PageHeader } from '@/components/setup/ui'

type TeacherValues = {
  phone: string
  firstName: string
  lastName: string
  designation: string
}

const PHONE_RULES = [
  { required: true, message: 'Enter the mobile number' },
  {
    pattern: /^\+8801\d{9}$/,
    message: 'Enter a Bangladeshi mobile number, like 1712345678',
  },
]

const TeachersPage = () => {
  const { message } = App.useApp()
  const [q, setQ] = useState('')
  const [show, setShow] = useState<'active' | 'inactive'>('active')
  const [modal, setModal] = useState<{ teacher?: Teacher } | null>(null)
  const { data, error, loading, reload } = useLoad(
    `teachers:${show}:${q}`,
    () =>
      unwrap(
        api.GET('/api/v1/teachers', {
          params: { query: { active: show === 'active', q: q || undefined } },
        })
      )
  )

  const save = async (values: TeacherValues) => {
    const editing = modal?.teacher
    if (editing) {
      await unwrap(
        api.PATCH('/api/v1/teachers/{id}', {
          params: { path: { id: editing.id } },
          body: fields(values),
        })
      )
    } else {
      await unwrap(api.POST('/api/v1/teachers', { body: fields(values) }))
    }
    message.success(
      editing
        ? 'Teacher saved.'
        : `${values.firstName} can now sign in to the mobile app with ${values.phone}.`
    )
    setModal(null)
    await reload()
  }

  const setActive = async (teacher: Teacher, isActive: boolean) => {
    try {
      await unwrap(
        api.PATCH('/api/v1/teachers/{id}', {
          params: { path: { id: teacher.id } },
          body: fields({ isActive }),
        })
      )
      message.success(
        isActive
          ? `${teacher.firstName} is active again.`
          : `${teacher.firstName} is deactivated and signed out.`
      )
      await reload()
    } catch (e) {
      message.error(messageOf(e))
    }
  }

  return (
    <div>
      <PageHeader
        title='Teachers'
        description='Teachers sign in to the mobile app with their number. They see the classes you assign them under Course offerings.'
        extra={
          <Button
            type='primary'
            icon={<Plus size={16} />}
            onClick={() => setModal({})}
          >
            Add teacher
          </Button>
        }
      />
      <Space wrap className='mb-4'>
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
          placeholder='Search name or number'
          onSearch={setQ}
          style={{ width: 260 }}
        />
      </Space>
      <LoadError error={error} onRetry={reload} />
      <Table<Teacher>
        rowKey='id'
        loading={loading}
        dataSource={data}
        scroll={{ x: 760 }}
        pagination={{ pageSize: 50, hideOnSinglePage: true }}
        locale={{ emptyText: q ? 'No one matches' : 'No teachers yet' }}
        columns={[
          {
            title: 'Name',
            render: (_, t) => `${t.firstName} ${t.lastName}`,
          },
          { title: 'Designation', dataIndex: 'designation' },
          { title: 'Phone', dataIndex: 'phone' },
          {
            title: 'Courses',
            dataIndex: 'offeringCount',
            width: 90,
          },
          {
            title: 'Status',
            width: 110,
            render: (_, t) =>
              t.isActive ? <Tag color='green'>Active</Tag> : <Tag>Off</Tag>,
          },
          {
            title: '',
            key: 'actions',
            align: 'right',
            render: (_, t) => (
              <Space>
                <Button size='small' onClick={() => setModal({ teacher: t })}>
                  Edit
                </Button>
                {t.isActive ? (
                  <Popconfirm
                    title={`Deactivate ${t.firstName}?`}
                    description='They are signed out and can no longer sign in.'
                    okText='Deactivate'
                    okButtonProps={{ danger: true }}
                    onConfirm={() => setActive(t, false)}
                  >
                    <Button size='small' danger>
                      Deactivate
                    </Button>
                  </Popconfirm>
                ) : (
                  <Button size='small' onClick={() => setActive(t, true)}>
                    Reactivate
                  </Button>
                )}
              </Space>
            ),
          },
        ]}
      />

      <FormModal<TeacherValues>
        open={modal !== null}
        title={
          modal?.teacher
            ? `Edit ${modal.teacher.firstName} ${modal.teacher.lastName}`
            : 'Add teacher'
        }
        initialValues={
          modal?.teacher
            ? {
                phone: modal.teacher.phone,
                firstName: modal.teacher.firstName,
                lastName: modal.teacher.lastName,
                designation: modal.teacher.designation,
              }
            : { designation: 'Lecturer' }
        }
        onCancel={() => setModal(null)}
        onSubmit={save}
      >
        <Form.Item
          label='Mobile number'
          name='phone'
          rules={PHONE_RULES}
          extra={
            modal?.teacher
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
        <Form.Item
          label='Designation'
          name='designation'
          rules={[{ required: true, message: 'Enter the designation' }]}
        >
          <Input maxLength={100} placeholder='e.g. Assistant Professor' />
        </Form.Item>
      </FormModal>
    </div>
  )
}

export default TeachersPage
