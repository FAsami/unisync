'use client'

import { useState } from 'react'
import {
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { api } from '@/lib/api/client'
import { unwrap } from '@/lib/api/errors'
import { fields, type Course } from '@/lib/api/schema'
import { useLoad } from '@/lib/useLoad'
import { FormModal } from '@/components/setup/FormModal'
import { LoadError, PageHeader, useDelete } from '@/components/setup/ui'

type CourseValues = {
  code: string
  name: string
  creditHours: number
  semester: number
  courseType: 'THEORY' | 'LAB'
  description?: string
  isActive: boolean
}

const CoursesPage = () => {
  const { message } = App.useApp()
  const confirmDelete = useDelete()
  const [semester, setSemester] = useState<number | undefined>()
  const [modal, setModal] = useState<{ course?: Course } | null>(null)
  const { data, error, loading, reload } = useLoad(
    `courses:${semester ?? ''}`,
    () =>
      unwrap(
        api.GET('/api/v1/courses', {
          params: { query: semester ? { semester } : {} },
        })
      )
  )

  const save = async (values: CourseValues) => {
    const body = { ...values, description: values.description ?? '' }
    const editing = modal?.course
    if (editing) {
      await unwrap(
        api.PATCH('/api/v1/courses/{id}', {
          params: { path: { id: editing.id } },
          body,
        })
      )
    } else {
      await unwrap(api.POST('/api/v1/courses', { body }))
    }
    message.success(editing ? 'Course saved.' : 'Course added.')
    setModal(null)
    await reload()
  }

  return (
    <div>
      <PageHeader
        title='Courses'
        description="Your department's course catalogue. Offer a course to a section under Course offerings."
        extra={
          <>
            <Select
              allowClear
              placeholder='All semesters'
              style={{ width: 160 }}
              value={semester}
              onChange={setSemester}
              options={Array.from({ length: 12 }, (_, i) => ({
                value: i + 1,
                label: `Semester ${i + 1}`,
              }))}
            />
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={() => setModal({})}
            >
              Add course
            </Button>
          </>
        }
      />
      <LoadError error={error} onRetry={reload} />
      <Table<Course>
        rowKey='id'
        loading={loading}
        dataSource={data}
        scroll={{ x: 760 }}
        pagination={{ pageSize: 50, hideOnSinglePage: true }}
        locale={{ emptyText: 'No courses yet' }}
        columns={[
          { title: 'Code', dataIndex: 'code', width: 120 },
          {
            title: 'Name',
            dataIndex: 'name',
            render: (name: string, c) => (
              <Space>
                {name}
                {c.isActive ? null : <Tag>Inactive</Tag>}
              </Space>
            ),
          },
          { title: 'Semester', dataIndex: 'semester', width: 100 },
          { title: 'Credits', dataIndex: 'creditHours', width: 90 },
          {
            title: 'Type',
            dataIndex: 'courseType',
            width: 100,
            render: (t: string) => (
              <Tag color={t === 'LAB' ? 'purple' : 'blue'}>{t}</Tag>
            ),
          },
          {
            title: '',
            key: 'actions',
            align: 'right',
            render: (_, c) => (
              <Space>
                <Button size='small' onClick={() => setModal({ course: c })}>
                  Edit
                </Button>
                <Button
                  size='small'
                  danger
                  onClick={() =>
                    confirmDelete({
                      title: `Delete ${c.code}?`,
                      remove: () =>
                        unwrap(
                          api.DELETE('/api/v1/courses/{id}', {
                            params: { path: { id: c.id } },
                          })
                        ),
                      markInactive: () =>
                        unwrap(
                          api.PATCH('/api/v1/courses/{id}', {
                            params: { path: { id: c.id } },
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

      <FormModal<CourseValues>
        open={modal !== null}
        title={modal?.course ? `Edit ${modal.course.code}` : 'Add course'}
        initialValues={
          modal?.course
            ? {
                code: modal.course.code,
                name: modal.course.name,
                creditHours: Number(modal.course.creditHours),
                semester: Number(modal.course.semester),
                courseType: modal.course.courseType as 'THEORY' | 'LAB',
                description: modal.course.description ?? '',
                isActive: modal.course.isActive,
              }
            : {
                courseType: 'THEORY',
                creditHours: 3,
                semester: semester ?? 1,
                isActive: true,
              }
        }
        onCancel={() => setModal(null)}
        onSubmit={save}
      >
        <Form.Item
          label='Code'
          name='code'
          rules={[{ required: true, message: 'Enter the course code' }]}
        >
          <Input maxLength={20} placeholder='e.g. CSE-101' />
        </Form.Item>
        <Form.Item
          label='Name'
          name='name'
          rules={[{ required: true, message: 'Enter the course name' }]}
        >
          <Input maxLength={200} />
        </Form.Item>
        <Space size='middle' wrap>
          <Form.Item
            label='Semester'
            name='semester'
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={16} />
          </Form.Item>
          <Form.Item
            label='Credit hours'
            name='creditHours'
            rules={[{ required: true }]}
          >
            <InputNumber min={0} max={12} step={0.5} />
          </Form.Item>
          <Form.Item label='Type' name='courseType'>
            <Select
              style={{ width: 120 }}
              options={[
                { value: 'THEORY', label: 'Theory' },
                { value: 'LAB', label: 'Lab' },
              ]}
            />
          </Form.Item>
        </Space>
        <Form.Item label='Description' name='description'>
          <Input.TextArea rows={2} maxLength={1000} />
        </Form.Item>
        <Form.Item label='Active' name='isActive' valuePropName='checked'>
          <Switch />
        </Form.Item>
      </FormModal>
    </div>
  )
}

export default CoursesPage
