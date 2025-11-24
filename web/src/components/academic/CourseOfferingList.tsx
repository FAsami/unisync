'use client'

import { useState } from 'react'
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Modal,
  Form,
  Input,
  Select,
  Switch,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'

const GET_COURSE_OFFERINGS = gql`
  query GetCourseOfferings {
    academic_course_offering(order_by: { created_at: desc }) {
      id
      course_id
      batch_id
      section_id
      teacher_id
      academic_year
      is_active
      created_at
      updated_at
      course {
        id
        code
        name
      }
      batch {
        id
        name
      }
      section {
        id
        name
      }
    }
  }
`

const GET_COURSES = gql`
  query GetCourses {
    academic_course {
      id
      code
      name
    }
  }
`

const GET_BATCHES = gql`
  query GetBatches {
    academic_batch {
      id
      name
    }
  }
`

const GET_SECTIONS = gql`
  query GetSections {
    academic_section {
      id
      name
      batch_id
    }
  }
`

const GET_USERS = gql`
  query GetUsers {
    user_account(where: { is_active: { _eq: true } }, order_by: { created_at: desc }) {
      id
      phone
      email
      role
      profiles {
        id
        first_name
        last_name
        student_id
      }
    }
  }
`

const CREATE_COURSE_OFFERING = gql`
  mutation CreateCourseOffering($object: academic_course_offering_insert_input!) {
    insert_academic_course_offering_one(object: $object) {
      id
      course_id
      batch_id
      section_id
      teacher_id
      academic_year
      is_active
    }
  }
`

const UPDATE_COURSE_OFFERING = gql`
  mutation UpdateCourseOffering(
    $id: uuid!
    $changes: academic_course_offering_set_input!
  ) {
    update_academic_course_offering_by_pk(
      pk_columns: { id: $id }
      _set: $changes
    ) {
      id
      course_id
      batch_id
      section_id
      teacher_id
      academic_year
      is_active
    }
  }
`

const DELETE_COURSE_OFFERING = gql`
  mutation DeleteCourseOffering($id: uuid!) {
    delete_academic_course_offering_by_pk(id: $id) {
      id
    }
  }
`

interface CourseOffering {
  id: string
  course_id: string
  batch_id: string
  section_id: string
  teacher_id: string
  academic_year: string
  is_active: boolean
  created_at: string
  updated_at: string
  course?: {
    id: string
    code: string
    name: string
  }
  batch?: {
    id: string
    name: string
  }
  section?: {
    id: string
    name: string
  }
}

const CourseOfferingList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOffering, setEditingOffering] = useState<CourseOffering | null>(null)
  const [copyingOffering, setCopyingOffering] = useState<CourseOffering | null>(null)
  const [form] = Form.useForm()
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null)

  const { data: offeringsData, loading: offeringsLoading, refetch } = useQuery<{
    academic_course_offering: CourseOffering[]
  }>(GET_COURSE_OFFERINGS)
  const { data: coursesData } = useQuery<{
    academic_course: Array<{ id: string; code: string; name: string }>
  }>(GET_COURSES)
  const { data: batchesData } = useQuery<{
    academic_batch: Array<{ id: string; name: string }>
  }>(GET_BATCHES)
  const { data: sectionsData } = useQuery<{
    academic_section: Array<{ id: string; name: string; batch_id: string }>
  }>(GET_SECTIONS)
  const { data: usersData } = useQuery<{
    user_account: Array<{
      id: string
      phone: string
      email: string
      role: string
      profiles?: Array<{
        id: string
        first_name: string
        last_name: string
        student_id: string | null
      }>
    }>
  }>(GET_USERS)
  const [createOffering] = useMutation(CREATE_COURSE_OFFERING)
  const [updateOffering] = useMutation(UPDATE_COURSE_OFFERING)
  const [deleteOffering] = useMutation(DELETE_COURSE_OFFERING)

  const handleCreate = () => {
    setEditingOffering(null)
    setCopyingOffering(null)
    setSelectedBatch(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (offering: CourseOffering) => {
    setEditingOffering(offering)
    setCopyingOffering(null)
    setSelectedBatch(offering.batch_id)
    form.setFieldsValue(offering)
    setIsModalOpen(true)
  }

  const handleCopy = (offering: CourseOffering) => {
    setCopyingOffering(offering)
    setEditingOffering(null)
    setSelectedBatch(offering.batch_id)
    form.setFieldsValue({
      ...offering,
      academic_year: `${offering.academic_year} (Copy)`,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteOffering({ variables: { id } })
      message.success('Course offering deleted successfully')
      refetch()
    } catch (error) {
      message.error('Failed to delete course offering')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (editingOffering) {
        await updateOffering({
          variables: {
            id: editingOffering.id,
            changes: values,
          },
        })
        message.success('Course offering updated successfully')
      } else {
        await createOffering({
          variables: {
            object: values,
          },
        })
        message.success('Course offering created successfully')
      }

      setIsModalOpen(false)
      form.resetFields()
      setSelectedBatch(null)
      refetch()
    } catch (error) {
      message.error(
        editingOffering
          ? 'Failed to update course offering'
          : 'Failed to create course offering'
      )
    }
  }

  const filteredSections = selectedBatch
    ? sectionsData?.academic_section.filter((s: any) => s.batch_id === selectedBatch)
    : sectionsData?.academic_section

  const columns = [
    {
      title: 'Course',
      key: 'course',
      render: (_: any, record: CourseOffering) => (
        <span>
          {record.course ? `${record.course.code} - ${record.course.name}` : '-'}
        </span>
      ),
    },
    {
      title: 'Batch',
      dataIndex: ['batch', 'name'],
      key: 'batch',
    },
    {
      title: 'Section',
      dataIndex: ['section', 'name'],
      key: 'section',
    },
    {
      title: 'Academic Year',
      dataIndex: 'academic_year',
      key: 'academic_year',
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (isActive ? 'Active' : 'Inactive'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CourseOffering) => (
        <Space>
          <Button
            type='link'
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type='link'
            icon={<CopyOutlined />}
            onClick={() => handleCopy(record)}
          >
            Copy
          </Button>
          <Popconfirm
            title='Delete course offering'
            description='Are you sure you want to delete this course offering?'
            onConfirm={() => handleDelete(record.id)}
            okText='Yes'
            cancelText='No'
          >
            <Button type='link' danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button type='primary' icon={<PlusOutlined />} onClick={handleCreate}>
          Add Course Offering
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={offeringsData?.academic_course_offering || []}
        loading={offeringsLoading}
        rowKey='id'
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={
          editingOffering
            ? 'Edit Course Offering'
            : copyingOffering
              ? 'Copy Course Offering'
              : 'Create Course Offering'
        }
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
          setSelectedBatch(null)
        }}
        okText={editingOffering ? 'Update' : 'Create'}
        width={600}
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            name='course_id'
            label='Course'
            rules={[{ required: true, message: 'Please select a course' }]}
          >
            <Select placeholder='Select course'>
              {coursesData?.academic_course.map((course: any) => (
                <Select.Option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name='batch_id'
            label='Batch'
            rules={[{ required: true, message: 'Please select a batch' }]}
          >
            <Select
              placeholder='Select batch'
              onChange={(value) => {
                setSelectedBatch(value)
                form.setFieldsValue({ section_id: undefined })
              }}
            >
              {batchesData?.academic_batch.map((batch: any) => (
                <Select.Option key={batch.id} value={batch.id}>
                  {batch.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name='section_id'
            label='Section'
            rules={[{ required: true, message: 'Please select a section' }]}
          >
            <Select
              placeholder='Select section'
              disabled={!selectedBatch}
            >
              {filteredSections?.map((section: any) => (
                <Select.Option key={section.id} value={section.id}>
                  {section.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name='teacher_id'
            label='Teacher'
            rules={[{ required: true, message: 'Please select a teacher' }]}
          >
            <Select
              placeholder='Select teacher'
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {usersData?.user_account
                .filter((user: any) => user.role === 'instructor' || user.role === 'admin')
                .map((user: any) => {
                  const profile = user.profiles?.[0]
                  const displayName = profile
                    ? `${profile.first_name} ${profile.last_name}${profile.student_id ? ` (${profile.student_id})` : ''}`
                    : user.email || user.phone
                  return (
                    <Select.Option key={user.id} value={user.id} label={displayName}>
                      {displayName} - {user.email || user.phone}
                    </Select.Option>
                  )
                })}
            </Select>
          </Form.Item>
          <Form.Item
            name='academic_year'
            label='Academic Year'
            rules={[{ required: true, message: 'Please enter academic year' }]}
          >
            <Input placeholder='e.g., 2024-2025' />
          </Form.Item>
          <Form.Item
            name='is_active'
            label='Active'
            valuePropName='checked'
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CourseOfferingList

