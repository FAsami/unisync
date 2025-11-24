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
  InputNumber,
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

const GET_COURSES = gql`
  query GetCourses {
    academic_course(order_by: { created_at: desc }) {
      id
      department_id
      code
      name
      description
      credit_hours
      semester
      course_type
      syllabus_url
      is_active
      created_at
      updated_at
      department {
        id
        name
        code
      }
    }
  }
`

const GET_DEPARTMENTS = gql`
  query GetDepartments {
    academic_department {
      id
      name
      code
    }
  }
`

const CREATE_COURSE = gql`
  mutation CreateCourse($object: academic_course_insert_input!) {
    insert_academic_course_one(object: $object) {
      id
      department_id
      code
      name
      description
      credit_hours
      semester
      course_type
      syllabus_url
      is_active
    }
  }
`

const UPDATE_COURSE = gql`
  mutation UpdateCourse($id: uuid!, $changes: academic_course_set_input!) {
    update_academic_course_by_pk(pk_columns: { id: $id }, _set: $changes) {
      id
      department_id
      code
      name
      description
      credit_hours
      semester
      course_type
      syllabus_url
      is_active
    }
  }
`

const DELETE_COURSE = gql`
  mutation DeleteCourse($id: uuid!) {
    delete_academic_course_by_pk(id: $id) {
      id
    }
  }
`

interface Course {
  id: string
  department_id: string
  code: string
  name: string
  description: string
  credit_hours: number
  semester: number
  course_type: string
  syllabus_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  department?: {
    id: string
    name: string
    code: string
  }
}

interface Department {
  id: string
  name: string
  code: string
}

const CourseList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [copyingCourse, setCopyingCourse] = useState<Course | null>(null)
  const [form] = Form.useForm()

  const {
    data: coursesData,
    loading: coursesLoading,
    refetch,
  } = useQuery<{
    academic_course: Course[]
  }>(GET_COURSES)
  const { data: departmentsData } = useQuery<{
    academic_department: Department[]
  }>(GET_DEPARTMENTS)
  const [createCourse] = useMutation(CREATE_COURSE)
  const [updateCourse] = useMutation(UPDATE_COURSE)
  const [deleteCourse] = useMutation(DELETE_COURSE)

  const handleCreate = () => {
    setEditingCourse(null)
    setCopyingCourse(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setCopyingCourse(null)
    form.setFieldsValue(course)
    setIsModalOpen(true)
  }

  const handleCopy = (course: Course) => {
    setCopyingCourse(course)
    setEditingCourse(null)
    form.setFieldsValue({
      ...course,
      code: `${course.code}_copy`,
      name: `${course.name} (Copy)`,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCourse({ variables: { id } })
      message.success('Course deleted successfully')
      refetch()
    } catch (error) {
      message.error('Failed to delete course')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (editingCourse) {
        await updateCourse({
          variables: {
            id: editingCourse.id,
            changes: values,
          },
        })
        message.success('Course updated successfully')
      } else {
        await createCourse({
          variables: {
            object: values,
          },
        })
        message.success('Course created successfully')
      }

      setIsModalOpen(false)
      form.resetFields()
      refetch()
    } catch (error) {
      message.error(
        editingCourse ? 'Failed to update course' : 'Failed to create course'
      )
    }
  }

  const columns = [
    {
      title: 'Department',
      key: 'department',
      render: (_: any, record: Course) => (
        <span>
          {record.department
            ? `${record.department.code} - ${record.department.name}`
            : '-'}
        </span>
      ),
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Credit Hours',
      dataIndex: 'credit_hours',
      key: 'credit_hours',
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
    },
    {
      title: 'Type',
      dataIndex: 'course_type',
      key: 'course_type',
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
      render: (_: any, record: Course) => (
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
            title='Delete course'
            description='Are you sure you want to delete this course?'
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
          Add Course
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={coursesData?.academic_course || []}
        loading={coursesLoading}
        rowKey='id'
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={
          editingCourse
            ? 'Edit Course'
            : copyingCourse
              ? 'Copy Course'
              : 'Create Course'
        }
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        okText={editingCourse ? 'Update' : 'Create'}
        width={600}
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            name='department_id'
            label='Department'
            rules={[{ required: true, message: 'Please select a department' }]}
          >
            <Select placeholder='Select department'>
              {departmentsData?.academic_department.map((dept) => (
                <Select.Option key={dept.id} value={dept.id}>
                  {dept.code} - {dept.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name='code'
            label='Code'
            rules={[{ required: true, message: 'Please enter course code' }]}
          >
            <Input placeholder='e.g., CSE301' />
          </Form.Item>
          <Form.Item
            name='name'
            label='Name'
            rules={[{ required: true, message: 'Please enter course name' }]}
          >
            <Input placeholder='e.g., Data Structures' />
          </Form.Item>
          <Form.Item
            name='description'
            label='Description'
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea rows={3} placeholder='Course description' />
          </Form.Item>
          <Form.Item
            name='credit_hours'
            label='Credit Hours'
            rules={[{ required: true, message: 'Please enter credit hours' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0.5} step={0.5} />
          </Form.Item>
          <Form.Item
            name='semester'
            label='Semester'
            rules={[{ required: true, message: 'Please enter semester' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} max={12} />
          </Form.Item>
          <Form.Item
            name='course_type'
            label='Course Type'
            rules={[{ required: true, message: 'Please select course type' }]}
            initialValue='THEORY'
          >
            <Select>
              <Select.Option value='THEORY'>Theory</Select.Option>
              <Select.Option value='LAB'>Lab</Select.Option>
              <Select.Option value='PROJECT'>Project</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name='syllabus_url' label='Syllabus URL'>
            <Input placeholder='https://...' />
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

export default CourseList
