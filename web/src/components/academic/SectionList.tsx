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

const GET_SECTIONS = gql`
  query GetSections {
    academic_section(order_by: { created_at: desc }) {
      id
      batch_id
      name
      capacity
      is_active
      created_at
      updated_at
      batch {
        id
        name
        department {
          id
          name
          code
        }
      }
    }
  }
`

const GET_BATCHES = gql`
  query GetBatches {
    academic_batch {
      id
      name
      department {
        id
        name
        code
      }
    }
  }
`

const CREATE_SECTION = gql`
  mutation CreateSection($object: academic_section_insert_input!) {
    insert_academic_section_one(object: $object) {
      id
      batch_id
      name
      capacity
      is_active
    }
  }
`

const UPDATE_SECTION = gql`
  mutation UpdateSection($id: uuid!, $changes: academic_section_set_input!) {
    update_academic_section_by_pk(pk_columns: { id: $id }, _set: $changes) {
      id
      batch_id
      name
      capacity
      is_active
    }
  }
`

const DELETE_SECTION = gql`
  mutation DeleteSection($id: uuid!) {
    delete_academic_section_by_pk(id: $id) {
      id
    }
  }
`

interface Section {
  id: string
  batch_id: string
  name: string
  capacity: number | null
  is_active: boolean
  created_at: string
  updated_at: string
  batch?: {
    id: string
    name: string
    department?: {
      id: string
      name: string
      code: string
    }
  }
}

interface Batch {
  id: string
  name: string
  department?: {
    id: string
    name: string
    code: string
  }
}

const SectionList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [copyingSection, setCopyingSection] = useState<Section | null>(null)
  const [form] = Form.useForm()

  const {
    data: sectionsData,
    loading: sectionsLoading,
    refetch,
  } = useQuery<{
    academic_section: Section[]
  }>(GET_SECTIONS)
  const { data: batchesData } = useQuery<{ academic_batch: Batch[] }>(
    GET_BATCHES
  )
  const [createSection] = useMutation(CREATE_SECTION)
  const [updateSection] = useMutation(UPDATE_SECTION)
  const [deleteSection] = useMutation(DELETE_SECTION)

  const handleCreate = () => {
    setEditingSection(null)
    setCopyingSection(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (section: Section) => {
    setEditingSection(section)
    setCopyingSection(null)
    form.setFieldsValue(section)
    setIsModalOpen(true)
  }

  const handleCopy = (section: Section) => {
    setCopyingSection(section)
    setEditingSection(null)
    form.setFieldsValue({
      ...section,
      name: `${section.name}_copy`,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteSection({ variables: { id } })
      message.success('Section deleted successfully')
      refetch()
    } catch (error) {
      message.error('Failed to delete section')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (editingSection) {
        await updateSection({
          variables: {
            id: editingSection.id,
            changes: values,
          },
        })
        message.success('Section updated successfully')
      } else {
        await createSection({
          variables: {
            object: values,
          },
        })
        message.success('Section created successfully')
      }

      setIsModalOpen(false)
      form.resetFields()
      refetch()
    } catch (error) {
      message.error(
        editingSection ? 'Failed to update section' : 'Failed to create section'
      )
    }
  }

  const columns = [
    {
      title: 'Batch',
      key: 'batch',
      render: (_: any, record: Section) => {
        const dept = record.batch?.department
        return (
          <span>
            {dept ? `${dept.code} - ` : ''}
            {record.batch?.name || '-'}
          </span>
        )
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity: number | null) => capacity || '-',
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
      render: (_: any, record: Section) => (
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
            title='Delete section'
            description='Are you sure you want to delete this section?'
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
          Add Section
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={sectionsData?.academic_section || []}
        loading={sectionsLoading}
        rowKey='id'
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={
          editingSection
            ? 'Edit Section'
            : copyingSection
              ? 'Copy Section'
              : 'Create Section'
        }
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        okText={editingSection ? 'Update' : 'Create'}
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            name='batch_id'
            label='Batch'
            rules={[{ required: true, message: 'Please select a batch' }]}
          >
            <Select placeholder='Select batch'>
              {batchesData?.academic_batch.map((batch) => {
                const dept = batch.department
                return (
                  <Select.Option key={batch.id} value={batch.id}>
                    {dept ? `${dept.code} - ` : ''}
                    {batch.name}
                  </Select.Option>
                )
              })}
            </Select>
          </Form.Item>
          <Form.Item
            name='name'
            label='Name'
            rules={[{ required: true, message: 'Please enter section name' }]}
          >
            <Input placeholder='e.g., A' />
          </Form.Item>
          <Form.Item name='capacity' label='Capacity'>
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              placeholder='e.g., 50'
            />
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

export default SectionList
