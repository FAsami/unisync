'use client'

import { useState } from 'react'
import {
  App,
  Button,
  Form,
  Input,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { api } from '@/lib/api/client'
import { unwrap } from '@/lib/api/errors'
import { fields, type Offering } from '@/lib/api/schema'
import { useLoad } from '@/lib/useLoad'
import { FormModal } from '@/components/setup/FormModal'
import {
  LoadError,
  PageHeader,
  SectionSelect,
  useDelete,
} from '@/components/setup/ui'

type OfferingValues = {
  courseId: string
  sectionId: string
  teacherId: string
  academicYear: string
  isActive: boolean
}

const defaultYear = () => {
  const y = dayjs().year()
  return `${y}-${y + 1}`
}

const OfferingsPage = () => {
  const { message } = App.useApp()
  const confirmDelete = useDelete()
  const [sectionId, setSectionId] = useState<string | undefined>()
  const [modal, setModal] = useState<{ offering?: Offering } | null>(null)

  const batches = useLoad('batches', () => unwrap(api.GET('/api/v1/batches')))
  const courses = useLoad('courses', () =>
    unwrap(api.GET('/api/v1/courses', { params: { query: { active: true } } }))
  )
  const teachers = useLoad('teachers', () =>
    unwrap(api.GET('/api/v1/teachers', { params: { query: { active: true } } }))
  )
  const { data, error, loading, reload } = useLoad(
    `offerings:${sectionId ?? ''}`,
    () =>
      unwrap(api.GET('/api/v1/offerings', { params: { query: { sectionId } } }))
  )

  const save = async (values: OfferingValues) => {
    const editing = modal?.offering
    if (editing) {
      await unwrap(
        api.PATCH('/api/v1/offerings/{id}', {
          params: { path: { id: editing.id } },
          body: fields({
            teacherId: values.teacherId,
            academicYear: values.academicYear,
            isActive: values.isActive,
          }),
        })
      )
    } else {
      await unwrap(api.POST('/api/v1/offerings', { body: values }))
    }
    message.success(editing ? 'Offering saved.' : 'Offering added.')
    setModal(null)
    await reload()
  }

  const editing = modal?.offering

  return (
    <div>
      <PageHeader
        title='Course offerings'
        description='Which teacher teaches which course to which section. Then put its classes on the weekly routine.'
        extra={
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => setModal({})}
          >
            Add offering
          </Button>
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
      </Space>
      <LoadError error={error} onRetry={reload} />
      <Table<Offering>
        rowKey='id'
        loading={loading}
        dataSource={data}
        scroll={{ x: 860 }}
        pagination={{ pageSize: 50, hideOnSinglePage: true }}
        locale={{ emptyText: 'No offerings yet' }}
        columns={[
          {
            title: 'Course',
            render: (_, o) => (
              <Space>
                <strong>{o.course.code}</strong>
                {o.course.name}
                {o.isActive ? null : <Tag>Inactive</Tag>}
              </Space>
            ),
          },
          {
            title: 'Section',
            render: (_, o) => `${o.batch.name} · ${o.section.name}`,
          },
          { title: 'Teacher', render: (_, o) => o.teacher.name },
          { title: 'Year', dataIndex: 'academicYear', width: 110 },
          {
            title: 'Weekly classes',
            dataIndex: 'routineCount',
            width: 120,
          },
          {
            title: '',
            key: 'actions',
            align: 'right',
            render: (_, o) => (
              <Space>
                <Button size='small' onClick={() => setModal({ offering: o })}>
                  Edit
                </Button>
                <Button
                  size='small'
                  danger
                  onClick={() =>
                    confirmDelete({
                      title: `Delete ${o.course.code} for ${o.batch.name} · ${o.section.name}?`,
                      remove: () =>
                        unwrap(
                          api.DELETE('/api/v1/offerings/{id}', {
                            params: { path: { id: o.id } },
                          })
                        ),
                      markInactive: () =>
                        unwrap(
                          api.PATCH('/api/v1/offerings/{id}', {
                            params: { path: { id: o.id } },
                            body: fields({ isActive: false }),
                          })
                        ),
                      done: reload,
                    })
                  }
                >
                  Delete
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <FormModal<OfferingValues>
        open={modal !== null}
        title={
          editing
            ? `Edit ${editing.course.code} · ${editing.batch.name} ${editing.section.name}`
            : 'Add offering'
        }
        initialValues={
          editing
            ? {
                courseId: editing.course.id,
                sectionId: editing.section.id,
                teacherId: editing.teacher.id,
                academicYear: editing.academicYear,
                isActive: editing.isActive,
              }
            : { sectionId, academicYear: defaultYear(), isActive: true }
        }
        onCancel={() => setModal(null)}
        onSubmit={save}
      >
        <Form.Item
          label='Course'
          name='courseId'
          rules={[{ required: true, message: 'Choose the course' }]}
          extra={
            editing
              ? 'To change the course or section, add a new offering.'
              : undefined
          }
        >
          <Select
            showSearch
            disabled={Boolean(editing)}
            optionFilterProp='label'
            loading={!courses.data}
            options={(courses.data ?? []).map((c) => ({
              value: c.id,
              label: `${c.code} · ${c.name}`,
            }))}
          />
        </Form.Item>
        <Form.Item
          label='Section'
          name='sectionId'
          rules={[{ required: true, message: 'Choose the section' }]}
        >
          {editing ? (
            <Select
              disabled
              options={[
                {
                  value: editing.section.id,
                  label: `${editing.batch.name} · ${editing.section.name}`,
                },
              ]}
            />
          ) : (
            <SectionSelect batches={batches.data} />
          )}
        </Form.Item>
        <Form.Item
          label='Teacher'
          name='teacherId'
          rules={[{ required: true, message: 'Choose the teacher' }]}
        >
          <Select
            showSearch
            optionFilterProp='label'
            loading={!teachers.data}
            options={(teachers.data ?? []).map((t) => ({
              value: t.id,
              label: `${t.firstName} ${t.lastName} · ${t.designation}`,
            }))}
          />
        </Form.Item>
        <Form.Item
          label='Academic year'
          name='academicYear'
          rules={[{ required: true, message: 'Enter the academic year' }]}
        >
          <Input maxLength={20} placeholder='e.g. 2026-2027' />
        </Form.Item>
        {editing ? (
          <Form.Item label='Active' name='isActive' valuePropName='checked'>
            <Switch />
          </Form.Item>
        ) : null}
      </FormModal>
    </div>
  )
}

export default OfferingsPage
