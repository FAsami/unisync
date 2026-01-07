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
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'

const GET_BUILDINGS = gql`
  query GetBuildings {
    venue_building(order_by: { created_at: desc }) {
      id
      name
      code
      address
      latitude
      longitude
      created_at
      updated_at
    }
  }
`

const CREATE_BUILDING = gql`
  mutation CreateBuilding($object: venue_building_insert_input!) {
    insert_venue_building_one(object: $object) {
      id
      name
      code
      address
      latitude
      longitude
    }
  }
`

const UPDATE_BUILDING = gql`
  mutation UpdateBuilding($id: uuid!, $changes: venue_building_set_input!) {
    update_venue_building_by_pk(pk_columns: { id: $id }, _set: $changes) {
      id
      name
      code
      address
      latitude
      longitude
    }
  }
`

const DELETE_BUILDING = gql`
  mutation DeleteBuilding($id: uuid!) {
    delete_venue_building_by_pk(id: $id) {
      id
    }
  }
`

interface Building {
  id: string
  name: string
  code: string
  address: string
  latitude: number
  longitude: number
  created_at: string
  updated_at: string
}

const BuildingList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null)
  const [copyingBuilding, setCopyingBuilding] = useState<Building | null>(null)
  const [form] = Form.useForm()

  const { data, loading, refetch } = useQuery<{ venue_building: Building[] }>(
    GET_BUILDINGS
  )
  const [createBuilding] = useMutation(CREATE_BUILDING)
  const [updateBuilding] = useMutation(UPDATE_BUILDING)
  const [deleteBuilding] = useMutation(DELETE_BUILDING)

  const handleCreate = () => {
    setEditingBuilding(null)
    setCopyingBuilding(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (building: Building) => {
    setEditingBuilding(building)
    setCopyingBuilding(null)
    form.setFieldsValue(building)
    setIsModalOpen(true)
  }

  const handleCopy = (building: Building) => {
    setCopyingBuilding(building)
    setEditingBuilding(null)
    form.setFieldsValue({
      ...building,
      code: `${building.code}_copy`,
      name: `${building.name} (Copy)`,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteBuilding({ variables: { id } })
      message.success('Building deleted successfully')
      refetch()
    } catch {
      message.error('Failed to delete building')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (editingBuilding) {
        await updateBuilding({
          variables: {
            id: editingBuilding.id,
            changes: values,
          },
        })
        message.success('Building updated successfully')
      } else {
        await createBuilding({
          variables: {
            object: values,
          },
        })
        message.success('Building created successfully')
      }

      setIsModalOpen(false)
      form.resetFields()
      refetch()
    } catch {
      message.error(
        editingBuilding
          ? 'Failed to update building'
          : 'Failed to create building'
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
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Location',
      key: 'location',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Building) => (
        <span>
          {record.latitude}, {record.longitude}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Building) => (
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
            title='Delete building'
            description='Are you sure you want to delete this building?'
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
          Add Building
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.venue_building || []}
        loading={loading}
        rowKey='id'
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={
          editingBuilding
            ? 'Edit Building'
            : copyingBuilding
              ? 'Copy Building'
              : 'Create Building'
        }
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        okText={editingBuilding ? 'Update' : 'Create'}
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            name='code'
            label='Code'
            rules={[{ required: true, message: 'Please enter building code' }]}
          >
            <Input placeholder='e.g., ENG-01' />
          </Form.Item>
          <Form.Item
            name='name'
            label='Name'
            rules={[{ required: true, message: 'Please enter building name' }]}
          >
            <Input placeholder='e.g., Engineering Building' />
          </Form.Item>
          <Form.Item
            name='address'
            label='Address'
            rules={[{ required: true, message: 'Please enter address' }]}
          >
            <Input.TextArea rows={2} placeholder='Building address' />
          </Form.Item>
          <Form.Item
            name='latitude'
            label='Latitude'
            rules={[{ required: true, message: 'Please enter latitude' }]}
          >
            <Input placeholder='e.g., 23.8103' />
          </Form.Item>
          <Form.Item
            name='longitude'
            label='Longitude'
            rules={[{ required: true, message: 'Please enter longitude' }]}
          >
            <Input placeholder='e.g., 90.4125' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default BuildingList
