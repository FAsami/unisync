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
  Select,
  DatePicker,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'
import dayjs from 'dayjs'

const GET_USER_ENROLLMENTS = gql`
  query GetUserEnrollments {
    academic_user_enrollment(order_by: { created_at: desc }) {
      id
      user_id
      course_offering_id
      status
      enrolled_at
      created_at
      updated_at
      account {
        id
        phone
        email
        profiles {
          id
          first_name
          last_name
          student_id
        }
      }
      course_offering {
        id
        academic_year
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
  }
`

const GET_COURSE_OFFERINGS = gql`
  query GetCourseOfferings {
    academic_course_offering {
      id
      academic_year
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

const CREATE_USER_ENROLLMENT = gql`
  mutation CreateUserEnrollment($object: academic_user_enrollment_insert_input!) {
    insert_academic_user_enrollment_one(object: $object) {
      id
      user_id
      course_offering_id
      status
      enrolled_at
    }
  }
`

const UPDATE_USER_ENROLLMENT = gql`
  mutation UpdateUserEnrollment(
    $id: uuid!
    $changes: academic_user_enrollment_set_input!
  ) {
    update_academic_user_enrollment_by_pk(
      pk_columns: { id: $id }
      _set: $changes
    ) {
      id
      user_id
      course_offering_id
      status
      enrolled_at
    }
  }
`

const DELETE_USER_ENROLLMENT = gql`
  mutation DeleteUserEnrollment($id: uuid!) {
    delete_academic_user_enrollment_by_pk(id: $id) {
      id
    }
  }
`

interface UserEnrollment {
  id: string
  user_id: string
  course_offering_id: string
  status: string
  enrolled_at: string
  created_at: string
  updated_at: string
  account?: {
    id: string
    phone: string
    email: string
    profiles?: Array<{
      id: string
      first_name: string
      last_name: string
      student_id: string | null
    }>
  }
  course_offering?: {
    id: string
    academic_year: string
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
}

const UserEnrollmentList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEnrollment, setEditingEnrollment] = useState<UserEnrollment | null>(null)
  const [copyingEnrollment, setCopyingEnrollment] = useState<UserEnrollment | null>(null)
  const [form] = Form.useForm()

  const { data: enrollmentsData, loading: enrollmentsLoading, refetch } = useQuery<{
    academic_user_enrollment: UserEnrollment[]
  }>(GET_USER_ENROLLMENTS)
  const { data: offeringsData } = useQuery(GET_COURSE_OFFERINGS)
  const { data: usersData } = useQuery(GET_USERS)
  const [createEnrollment] = useMutation(CREATE_USER_ENROLLMENT)
  const [updateEnrollment] = useMutation(UPDATE_USER_ENROLLMENT)
  const [deleteEnrollment] = useMutation(DELETE_USER_ENROLLMENT)

  const handleCreate = () => {
    setEditingEnrollment(null)
    setCopyingEnrollment(null)
    form.resetFields()
    form.setFieldsValue({
      enrolled_at: dayjs(),
      status: 'ENROLLED',
    })
    setIsModalOpen(true)
  }

  const handleEdit = (enrollment: UserEnrollment) => {
    setEditingEnrollment(enrollment)
    setCopyingEnrollment(null)
    form.setFieldsValue({
      ...enrollment,
      enrolled_at: dayjs(enrollment.enrolled_at),
    })
    setIsModalOpen(true)
  }

  const handleCopy = (enrollment: UserEnrollment) => {
    setCopyingEnrollment(enrollment)
    setEditingEnrollment(null)
    form.setFieldsValue({
      ...enrollment,
      enrolled_at: dayjs(),
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteEnrollment({ variables: { id } })
      message.success('User enrollment deleted successfully')
      refetch()
    } catch (error) {
      message.error('Failed to delete user enrollment')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const enrollmentData = {
        ...values,
        enrolled_at: values.enrolled_at
          ? values.enrolled_at.toISOString()
          : new Date().toISOString(),
      }

      if (editingEnrollment) {
        await updateEnrollment({
          variables: {
            id: editingEnrollment.id,
            changes: enrollmentData,
          },
        })
        message.success('User enrollment updated successfully')
      } else {
        await createEnrollment({
          variables: {
            object: enrollmentData,
          },
        })
        message.success('User enrollment created successfully')
      }

      setIsModalOpen(false)
      form.resetFields()
      refetch()
    } catch (error) {
      message.error(
        editingEnrollment
          ? 'Failed to update user enrollment'
          : 'Failed to create user enrollment'
      )
    }
  }

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: UserEnrollment) => {
        const profile = record.account?.profiles?.[0]
        if (profile) {
          return `${profile.first_name} ${profile.last_name}${profile.student_id ? ` (${profile.student_id})` : ''}`
        }
        return record.account?.email || record.account?.phone || record.user_id.substring(0, 8) + '...'
      },
    },
    {
      title: 'Course',
      key: 'course',
      render: (_: any, record: UserEnrollment) => (
        <span>
          {record.course_offering?.course
            ? `${record.course_offering.course.code} - ${record.course_offering.course.name}`
            : '-'}
        </span>
      ),
    },
    {
      title: 'Batch',
      dataIndex: ['course_offering', 'batch', 'name'],
      key: 'batch',
    },
    {
      title: 'Section',
      dataIndex: ['course_offering', 'section', 'name'],
      key: 'section',
    },
    {
      title: 'Academic Year',
      dataIndex: ['course_offering', 'academic_year'],
      key: 'academic_year',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Enrolled At',
      dataIndex: 'enrolled_at',
      key: 'enrolled_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: UserEnrollment) => (
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
            title='Delete user enrollment'
            description='Are you sure you want to delete this enrollment?'
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
          Add User Enrollment
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={enrollmentsData?.academic_user_enrollment || []}
        loading={enrollmentsLoading}
        rowKey='id'
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={
          editingEnrollment
            ? 'Edit User Enrollment'
            : copyingEnrollment
              ? 'Copy User Enrollment'
              : 'Create User Enrollment'
        }
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        okText={editingEnrollment ? 'Update' : 'Create'}
        width={600}
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            name='user_id'
            label='User'
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select
              placeholder='Select user'
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {usersData?.user_account.map((user: any) => {
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
            name='course_offering_id'
            label='Course Offering'
            rules={[{ required: true, message: 'Please select a course offering' }]}
          >
            <Select placeholder='Select course offering'>
              {offeringsData?.academic_course_offering.map((offering: any) => {
                const course = offering.course
                const batch = offering.batch
                const section = offering.section
                return (
                  <Select.Option key={offering.id} value={offering.id}>
                    {course ? `${course.code} - ${course.name}` : ''} |{' '}
                    {batch?.name || ''} | {section?.name || ''} |{' '}
                    {offering.academic_year}
                  </Select.Option>
                )
              })}
            </Select>
          </Form.Item>
          <Form.Item
            name='status'
            label='Status'
            rules={[{ required: true, message: 'Please select status' }]}
            initialValue='ENROLLED'
          >
            <Select>
              <Select.Option value='ENROLLED'>Enrolled</Select.Option>
              <Select.Option value='DROPPED'>Dropped</Select.Option>
              <Select.Option value='COMPLETED'>Completed</Select.Option>
              <Select.Option value='FAILED'>Failed</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name='enrolled_at'
            label='Enrolled At'
            rules={[{ required: true, message: 'Please select enrollment date' }]}
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              format='YYYY-MM-DD HH:mm:ss'
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserEnrollmentList

