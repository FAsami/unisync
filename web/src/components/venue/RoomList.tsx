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
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'

const GET_ROOMS = gql`
  query GetRooms {
    venue_room(order_by: { created_at: desc }) {
      id
      building_id
      room_number
      floor
      capacity
      facility
      room_name
      created_at
      updated_at
      building {
        id
        name
        code
      }
    }
  }
`

const GET_BUILDINGS = gql`
  query GetBuildings {
    venue_building {
      id
      name
      code
    }
  }
`

const CREATE_ROOM = gql`
  mutation CreateRoom($object: venue_room_insert_input!) {
    insert_venue_room_one(object: $object) {
      id
      building_id
      room_number
      floor
      capacity
      facility
      room_name
    }
  }
`

const UPDATE_ROOM = gql`
  mutation UpdateRoom($id: uuid!, $changes: venue_room_set_input!) {
    update_venue_room_by_pk(pk_columns: { id: $id }, _set: $changes) {
      id
      building_id
      room_number
      floor
      capacity
      facility
      room_name
    }
  }
`

const DELETE_ROOM = gql`
  mutation DeleteRoom($id: uuid!) {
    delete_venue_room_by_pk(id: $id) {
      id
    }
  }
`

interface Room {
  id: string
  building_id: string
  room_number: string
  floor: string
  capacity: number | null
  facility: unknown
  room_name: string
  created_at: string
  updated_at: string
  building?: {
    id: string
    name: string
    code: string
  }
}

interface Building {
  id: string
  name: string
  code: string
}

const RoomList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [copyingRoom, setCopyingRoom] = useState<Room | null>(null)
  const [form] = Form.useForm()

  const {
    data: roomsData,
    loading: roomsLoading,
    refetch,
  } = useQuery<{ venue_room: Room[] }>(GET_ROOMS)
  const { data: buildingsData } = useQuery<{ venue_building: Building[] }>(
    GET_BUILDINGS
  )
  const [createRoom] = useMutation(CREATE_ROOM)
  const [updateRoom] = useMutation(UPDATE_ROOM)
  const [deleteRoom] = useMutation(DELETE_ROOM)

  const handleCreate = () => {
    setEditingRoom(null)
    setCopyingRoom(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (room: Room) => {
    setEditingRoom(room)
    setCopyingRoom(null)
    form.setFieldsValue({
      ...room,
      facility: room.facility ? JSON.stringify(room.facility, null, 2) : '',
    })
    setIsModalOpen(true)
  }

  const handleCopy = (room: Room) => {
    setCopyingRoom(room)
    setEditingRoom(null)
    form.setFieldsValue({
      ...room,
      room_number: `${room.room_number}_copy`,
      room_name: `${room.room_name} (Copy)`,
      facility: room.facility ? JSON.stringify(room.facility, null, 2) : '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteRoom({ variables: { id } })
      message.success('Room deleted successfully')
      refetch()
    } catch {
      message.error('Failed to delete room')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      let facilityValue = null
      if (values.facility) {
        try {
          facilityValue = JSON.parse(values.facility)
        } catch {
          message.error('Invalid JSON format for facility')
          return
        }
      }

      const roomData = {
        ...values,
        facility: facilityValue,
      }

      if (editingRoom) {
        await updateRoom({
          variables: {
            id: editingRoom.id,
            changes: roomData,
          },
        })
        message.success('Room updated successfully')
      } else {
        await createRoom({
          variables: {
            object: roomData,
          },
        })
        message.success('Room created successfully')
      }

      setIsModalOpen(false)
      form.resetFields()
      refetch()
    } catch {
      message.error(
        editingRoom ? 'Failed to update room' : 'Failed to create room'
      )
    }
  }

  const columns = [
    {
      title: 'Building',
      key: 'building',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Room) => (
        <span>
          {record.building
            ? `${record.building.code} - ${record.building.name}`
            : '-'}
        </span>
      ),
    },
    {
      title: 'Room Number',
      dataIndex: 'room_number',
      key: 'room_number',
    },
    {
      title: 'Room Name',
      dataIndex: 'room_name',
      key: 'room_name',
    },
    {
      title: 'Floor',
      dataIndex: 'floor',
      key: 'floor',
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity: number | null) => capacity || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Room) => (
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
            title='Delete room'
            description='Are you sure you want to delete this room?'
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
          Add Room
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={roomsData?.venue_room || []}
        loading={roomsLoading}
        rowKey='id'
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={
          editingRoom ? 'Edit Room' : copyingRoom ? 'Copy Room' : 'Create Room'
        }
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        okText={editingRoom ? 'Update' : 'Create'}
        width={600}
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            name='building_id'
            label='Building'
            rules={[{ required: true, message: 'Please select a building' }]}
          >
            <Select placeholder='Select building'>
              {buildingsData?.venue_building.map((building) => (
                <Select.Option key={building.id} value={building.id}>
                  {building.code} - {building.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name='room_number'
            label='Room Number'
            rules={[{ required: true, message: 'Please enter room number' }]}
          >
            <Input placeholder='e.g., 101' />
          </Form.Item>
          <Form.Item
            name='room_name'
            label='Room Name'
            rules={[{ required: true, message: 'Please enter room name' }]}
          >
            <Input placeholder='e.g., Lecture Hall 1' />
          </Form.Item>
          <Form.Item
            name='floor'
            label='Floor'
            rules={[{ required: true, message: 'Please enter floor' }]}
          >
            <Input placeholder='e.g., 1' />
          </Form.Item>
          <Form.Item name='capacity' label='Capacity'>
            <InputNumber
              style={{ width: '100%' }}
              placeholder='e.g., 50'
              min={1}
            />
          </Form.Item>
          <Form.Item
            name='facility'
            label='Facility (JSON)'
            tooltip='Enter facility information as JSON (e.g., {"projector": true, "whiteboard": true})'
          >
            <Input.TextArea
              rows={4}
              placeholder='{"projector": true, "whiteboard": true}'
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default RoomList
