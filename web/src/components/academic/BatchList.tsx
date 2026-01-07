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
  DatePicker,
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
import dayjs from 'dayjs'

const GET_BATCHES = gql`
  query GetBatches {
    academic_batch(order_by: { created_at: desc }) {
      id
      departmant_id
      name
      current_semester
      year
      semester_count
      start_date
      end_date
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

const CREATE_BATCH = gql`
  mutation CreateBatch($object: academic_batch_insert_input!) {
    insert_academic_batch_one(object: $object) {
      id
      departmant_id
      name
      current_semester
      year
      semester_count
      start_date
      end_date
      is_active
    }
  }
`

const UPDATE_BATCH = gql`
  mutation UpdateBatch($id: uuid!, $changes: academic_batch_set_input!) {
    update_academic_batch_by_pk(pk_columns: { id: $id }, _set: $changes) {
      id
      departmant_id
      name
      current_semester
      year
      semester_count
      start_date
      end_date
      is_active
    }
  }
`

const DELETE_BATCH = gql`
  mutation DeleteBatch($id: uuid!) {
    delete_academic_batch_by_pk(id: $id) {
      id
    }
  }
`

interface Batch {
  id: string
  departmant_id: string
  name: string
  current_semester: number
  year: number
  semester_count: number
  start_date: string | null
  end_date: string | null
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

const BatchList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
  const [copyingBatch, setCopyingBatch] = useState<Batch | null>(null)
  const [form] = Form.useForm()

  const {
    data: batchesData,
    loading: batchesLoading,
    refetch,
  } = useQuery<{
    academic_batch: Batch[]
  }>(GET_BATCHES)
  const { data: departmentsData } = useQuery<{
    academic_department: Department[]
  }>(GET_DEPARTMENTS)
  const [createBatch] = useMutation(CREATE_BATCH)
  const [updateBatch] = useMutation(UPDATE_BATCH)
  const [deleteBatch] = useMutation(DELETE_BATCH)

  const handleCreate = () => {
    setEditingBatch(null)
    setCopyingBatch(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch)
    setCopyingBatch(null)
    form.setFieldsValue({
      ...batch,
      start_date: batch.start_date ? dayjs(batch.start_date) : null,
      end_date: batch.end_date ? dayjs(batch.end_date) : null,
    })
    setIsModalOpen(true)
  }

  const handleCopy = (batch: Batch) => {
    setCopyingBatch(batch)
    setEditingBatch(null)
    form.setFieldsValue({
      ...batch,
      name: `${batch.name} (Copy)`,
      start_date: batch.start_date ? dayjs(batch.start_date) : null,
      end_date: batch.end_date ? dayjs(batch.end_date) : null,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteBatch({ variables: { id } })
      message.success('Batch deleted successfully')
      refetch()
    } catch {
      message.error('Failed to delete batch')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const batchData = {
        ...values,
        start_date: values.start_date
          ? values.start_date.format('YYYY-MM-DD')
          : null,
        end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null,
      }

      if (editingBatch) {
        await updateBatch({
          variables: {
            id: editingBatch.id,
            changes: batchData,
          },
        })
        message.success('Batch updated successfully')
      } else {
        await createBatch({
          variables: {
            object: batchData,
          },
        })
        message.success('Batch created successfully')
      }

      setIsModalOpen(false)
      form.resetFields()
      refetch()
    } catch {
      message.error(
        editingBatch ? 'Failed to update batch' : 'Failed to create batch'
      )
    }
  }

  const columns = [
    {
      title: 'Department',
      key: 'department',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Batch) => (
        <span>
          {record.department
            ? `${record.department.code} - ${record.department.name}`
            : '-'}
        </span>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: 'Current Semester',
      dataIndex: 'current_semester',
      key: 'current_semester',
    },
    {
      title: 'Semester Count',
      dataIndex: 'semester_count',
      key: 'semester_count',
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Batch) => (
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
            title='Delete batch'
            description='Are you sure you want to delete this batch?'
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
          Add Batch
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={batchesData?.academic_batch || []}
        loading={batchesLoading}
        rowKey='id'
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={
          editingBatch
            ? 'Edit Batch'
            : copyingBatch
              ? 'Copy Batch'
              : 'Create Batch'
        }
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        okText={editingBatch ? 'Update' : 'Create'}
        width={600}
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            name='departmant_id'
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
            name='name'
            label='Name'
            rules={[{ required: true, message: 'Please enter batch name' }]}
          >
            <Input placeholder='e.g., 2024-2025' />
          </Form.Item>
          <Form.Item
            name='year'
            label='Year'
            rules={[{ required: true, message: 'Please enter year' }]}
          >
            <InputNumber style={{ width: '100%' }} min={2000} max={2100} />
          </Form.Item>
          <Form.Item
            name='current_semester'
            label='Current Semester'
            rules={[
              { required: true, message: 'Please enter current semester' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={1} max={12} />
          </Form.Item>
          <Form.Item
            name='semester_count'
            label='Semester Count'
            rules={[{ required: true, message: 'Please enter semester count' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} max={20} />
          </Form.Item>
          <Form.Item name='start_date' label='Start Date'>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name='end_date' label='End Date'>
            <DatePicker style={{ width: '100%' }} />
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

export default BatchList
