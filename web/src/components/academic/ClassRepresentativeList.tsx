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

const GET_CLASS_REPRESENTATIVES = gql`
  query GetClassRepresentatives {
    academic_class_representative(order_by: { created_at: desc }) {
      id
      user_id
      section_id
      batch_id
      appointed_at
      is_active
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
      section {
        id
        name
      }
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
    user_account(
      where: { is_active: { _eq: true } }
      order_by: { created_at: desc }
    ) {
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

const CREATE_CLASS_REPRESENTATIVE = gql`
  mutation CreateClassRepresentative(
    $object: academic_class_representative_insert_input!
  ) {
    insert_academic_class_representative_one(object: $object) {
      id
      user_id
      section_id
      batch_id
      appointed_at
      is_active
    }
  }
`

const UPDATE_CLASS_REPRESENTATIVE = gql`
  mutation UpdateClassRepresentative(
    $id: uuid!
    $changes: academic_class_representative_set_input!
  ) {
    update_academic_class_representative_by_pk(
      pk_columns: { id: $id }
      _set: $changes
    ) {
      id
      user_id
      section_id
      batch_id
      appointed_at
      is_active
    }
  }
`

const DELETE_CLASS_REPRESENTATIVE = gql`
  mutation DeleteClassRepresentative($id: uuid!) {
    delete_academic_class_representative_by_pk(id: $id) {
      id
    }
  }
`

interface ClassRepresentative {
  id: string
  user_id: string
  section_id: string
  batch_id: string
  appointed_at: string | null
  is_active: boolean
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
  section?: {
    id: string
    name: string
  }
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

const ClassRepresentativeList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRep, setEditingRep] = useState<ClassRepresentative | null>(null)
  const [copyingRep, setCopyingRep] = useState<ClassRepresentative | null>(null)
  const [form] = Form.useForm()
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null)

  const {
    data: repsData,
    loading: repsLoading,
    refetch,
  } = useQuery<{
    academic_class_representative: ClassRepresentative[]
  }>(GET_CLASS_REPRESENTATIVES)
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
  const [createRep] = useMutation(CREATE_CLASS_REPRESENTATIVE)
  const [updateRep] = useMutation(UPDATE_CLASS_REPRESENTATIVE)
  const [deleteRep] = useMutation(DELETE_CLASS_REPRESENTATIVE)

  const handleCreate = () => {
    setEditingRep(null)
    setCopyingRep(null)
    setSelectedBatch(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (rep: ClassRepresentative) => {
    setEditingRep(rep)
    setCopyingRep(null)
    setSelectedBatch(rep.batch_id)
    form.setFieldsValue({
      ...rep,
      appointed_at: rep.appointed_at ? dayjs(rep.appointed_at) : null,
    })
    setIsModalOpen(true)
  }

  const handleCopy = (rep: ClassRepresentative) => {
    setCopyingRep(rep)
    setEditingRep(null)
    setSelectedBatch(rep.batch_id)
    form.setFieldsValue({
      ...rep,
      appointed_at: rep.appointed_at ? dayjs(rep.appointed_at) : null,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteRep({ variables: { id } })
      message.success('Class representative deleted successfully')
      refetch()
    } catch {
      message.error('Failed to delete class representative')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const repData = {
        ...values,
        appointed_at: values.appointed_at
          ? values.appointed_at.format('YYYY-MM-DD')
          : null,
      }

      if (editingRep) {
        await updateRep({
          variables: {
            id: editingRep.id,
            changes: repData,
          },
        })
        message.success('Class representative updated successfully')
      } else {
        await createRep({
          variables: {
            object: repData,
          },
        })
        message.success('Class representative created successfully')
      }

      setIsModalOpen(false)
      form.resetFields()
      setSelectedBatch(null)
      refetch()
    } catch {
      message.error(
        editingRep
          ? 'Failed to update class representative'
          : 'Failed to create class representative'
      )
    }
  }

  const filteredSections = selectedBatch
    ? sectionsData?.academic_section.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (s: any) => s.batch_id === selectedBatch
      )
    : sectionsData?.academic_section

  const columns = [
    {
      title: 'User',
      key: 'user',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: ClassRepresentative) => {
        const profile = record.account?.profiles?.[0]
        if (profile) {
          return `${profile.first_name} ${profile.last_name}${profile.student_id ? ` (${profile.student_id})` : ''}`
        }
        return (
          record.account?.email ||
          record.account?.phone ||
          record.user_id.substring(0, 8) + '...'
        )
      },
    },
    {
      title: 'Batch',
      key: 'batch',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: ClassRepresentative) => {
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
      title: 'Section',
      dataIndex: ['section', 'name'],
      key: 'section',
    },
    {
      title: 'Appointed At',
      dataIndex: 'appointed_at',
      key: 'appointed_at',
      render: (date: string | null) => date || '-',
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
      render: (_: any, record: ClassRepresentative) => (
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
            title='Delete class representative'
            description='Are you sure you want to delete this class representative?'
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
          Add Class Representative
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={repsData?.academic_class_representative || []}
        loading={repsLoading}
        rowKey='id'
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={
          editingRep
            ? 'Edit Class Representative'
            : copyingRep
              ? 'Copy Class Representative'
              : 'Create Class Representative'
        }
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
          setSelectedBatch(null)
        }}
        okText={editingRep ? 'Update' : 'Create'}
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
                String(option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {usersData?.user_account.map((user: any) => {
                const profile = user.profiles?.[0]
                const displayName = profile
                  ? `${profile.first_name} ${profile.last_name}${profile.student_id ? ` (${profile.student_id})` : ''}`
                  : user.email || user.phone
                return (
                  <Select.Option
                    key={user.id}
                    value={user.id}
                    label={displayName}
                  >
                    {displayName} - {user.email || user.phone}
                  </Select.Option>
                )
              })}
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
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
            <Select placeholder='Select section' disabled={!selectedBatch}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {filteredSections?.map((section: any) => (
                <Select.Option key={section.id} value={section.id}>
                  {section.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name='appointed_at' label='Appointed At'>
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

export default ClassRepresentativeList
