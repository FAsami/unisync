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

const GET_DEPARTMENTS = gql`
  query GetDepartments {
    academic_department(order_by: { code: asc }) {
      id
      code
      name
      description
      head_user_id
      is_active
    }
  }
`

const CREATE_DEPARTMENT = gql`
  mutation CreateDepartment($object: academic_department_insert_input!) {
    insert_academic_department_one(object: $object) {
      id
      code
      name
      description
      head_user_id
      is_active
    }
  }
`

const UPDATE_DEPARTMENT = gql`
  mutation UpdateDepartment(
    $id: uuid!
    $changes: academic_department_set_input!
  ) {
    update_academic_department_by_pk(pk_columns: { id: $id }, _set: $changes) {
      id
      code
      name
      description
      head_user_id
      is_active
    }
  }
`

const DELETE_DEPARTMENT = gql`
  mutation DeleteDepartment($id: uuid!) {
    delete_academic_department_by_pk(id: $id) {
      id
    }
  }
`

interface Department {
  id: string
  code: string
  name: string
  description: string | null
  head_user_id: string | null
  is_active: boolean
}

const DepartmentList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  )
  const [copyingDepartment, setCopyingDepartment] = useState<Department | null>(
    null
  )
  const [form] = Form.useForm()

  const { data, loading, refetch } = useQuery<{
    academic_department: Department[]
  }>(GET_DEPARTMENTS)
  const [createDepartment] = useMutation(CREATE_DEPARTMENT)
  const [updateDepartment] = useMutation(UPDATE_DEPARTMENT)
  const [deleteDepartment] = useMutation(DELETE_DEPARTMENT)

  const handleCreate = () => {
    setEditingDepartment(null)
    setCopyingDepartment(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (department: Department) => {
    setEditingDepartment(department)
    setCopyingDepartment(null)
    form.setFieldsValue(department)
    setIsModalOpen(true)
  }

  const handleCopy = (department: Department) => {
    setCopyingDepartment(department)
    setEditingDepartment(null)
    form.setFieldsValue({
      ...department,
      code: `${department.code}_copy`,
      name: `${department.name} (Copy)`,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDepartment({ variables: { id } })
      message.success('Department deleted successfully')
      refetch()
    } catch (error) {
      message.error('Failed to delete department')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (editingDepartment) {
        await updateDepartment({
          variables: {
            id: editingDepartment.id,
            changes: values,
          },
        })
        message.success('Department updated successfully')
      } else {
        await createDepartment({
          variables: {
            object: values,
          },
        })
        message.success('Department created successfully')
      }

      setIsModalOpen(false)
      form.resetFields()
      refetch()
    } catch (error) {
      message.error(
        editingDepartment
          ? 'Failed to update department'
          : 'Failed to create department'
      )
    }
  }

  const columns = [
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string | null) => text || '-',
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
      render: (_: any, record: Department) => (
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
            title='Delete department'
            description='Are you sure you want to delete this department?'
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
          Add Department
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.academic_department || []}
        loading={loading}
        rowKey='id'
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={
          editingDepartment
            ? 'Edit Department'
            : copyingDepartment
              ? 'Copy Department'
              : 'Create Department'
        }
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        okText={editingDepartment ? 'Update' : 'Create'}
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            name='code'
            label='Code'
            rules={[
              { required: true, message: 'Please enter department code' },
            ]}
          >
            <Input placeholder='e.g., CSE' />
          </Form.Item>
          <Form.Item
            name='name'
            label='Name'
            rules={[
              { required: true, message: 'Please enter department name' },
            ]}
          >
            <Input placeholder='e.g., Computer Science & Engineering' />
          </Form.Item>
          <Form.Item name='description' label='Description'>
            <Input.TextArea rows={3} placeholder='Department description' />
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

export default DepartmentList

