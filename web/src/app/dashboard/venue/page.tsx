'use client'

import { useState } from 'react'
import { App, Button, Form, Input, InputNumber, Space, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { api } from '@/lib/api/client'
import { unwrap } from '@/lib/api/errors'
import type { Building, Room } from '@/lib/api/schema'
import { useLoad } from '@/lib/useLoad'
import { FormModal } from '@/components/setup/FormModal'
import { LoadError, PageHeader, useDelete } from '@/components/setup/ui'

type BuildingValues = { name: string; code: string; address: string }
type RoomValues = {
  roomNumber: string
  roomName?: string
  floor: string
  capacity?: number | null
}

const VenuePage = () => {
  const { message } = App.useApp()
  const confirmDelete = useDelete()
  const { data, error, loading, reload } = useLoad('buildings', () =>
    unwrap(api.GET('/api/v1/buildings'))
  )
  const [buildingModal, setBuildingModal] = useState<{
    building?: Building
  } | null>(null)
  const [roomModal, setRoomModal] = useState<{
    building: Building
    room?: Room
  } | null>(null)

  const saveBuilding = async (values: BuildingValues) => {
    const editing = buildingModal?.building
    if (editing) {
      await unwrap(
        api.PATCH('/api/v1/buildings/{id}', {
          params: { path: { id: editing.id } },
          body: values,
        })
      )
    } else {
      await unwrap(api.POST('/api/v1/buildings', { body: values }))
    }
    message.success(editing ? 'Building saved.' : 'Building added.')
    setBuildingModal(null)
    await reload()
  }

  const saveRoom = async (values: RoomValues) => {
    if (!roomModal) return
    const body = {
      ...values,
      roomName: values.roomName || null,
      capacity: values.capacity ?? null,
      buildingId: roomModal.building.id,
    }
    if (roomModal.room) {
      await unwrap(
        api.PATCH('/api/v1/rooms/{id}', {
          params: { path: { id: roomModal.room.id } },
          body,
        })
      )
    } else {
      await unwrap(api.POST('/api/v1/rooms', { body }))
    }
    message.success(roomModal.room ? 'Room saved.' : 'Room added.')
    setRoomModal(null)
    await reload()
  }

  const roomTable = (building: Building) => (
    <Table<Room>
      rowKey='id'
      size='small'
      pagination={false}
      dataSource={building.rooms}
      locale={{ emptyText: 'No rooms yet' }}
      columns={[
        { title: 'Room', dataIndex: 'roomNumber' },
        { title: 'Name', dataIndex: 'roomName' },
        { title: 'Floor', dataIndex: 'floor' },
        { title: 'Seats', dataIndex: 'capacity' },
        {
          title: '',
          key: 'actions',
          align: 'right',
          render: (_, room) => (
            <Space>
              <Button
                size='small'
                onClick={() => setRoomModal({ building, room })}
              >
                Edit
              </Button>
              <Button
                size='small'
                danger
                onClick={() =>
                  confirmDelete({
                    title: `Delete room ${room.label}?`,
                    remove: () =>
                      unwrap(
                        api.DELETE('/api/v1/rooms/{id}', {
                          params: { path: { id: room.id } },
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
  )

  return (
    <div>
      <PageHeader
        title='Buildings & rooms'
        description='Shared by every department. Rooms can be put on the routine, and teachers can move a class to one.'
        extra={
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => setBuildingModal({})}
          >
            Add building
          </Button>
        }
      />
      <LoadError error={error} onRetry={reload} />
      <Table<Building>
        rowKey='id'
        loading={loading}
        dataSource={data}
        scroll={{ x: 700 }}
        pagination={false}
        locale={{ emptyText: 'No buildings yet' }}
        expandable={{ expandedRowRender: roomTable, rowExpandable: () => true }}
        columns={[
          { title: 'Code', dataIndex: 'code', width: 100 },
          { title: 'Building', dataIndex: 'name' },
          { title: 'Address', dataIndex: 'address' },
          { title: 'Rooms', render: (_, b) => b.rooms.length, width: 80 },
          {
            title: '',
            key: 'actions',
            align: 'right',
            render: (_, b) => (
              <Space>
                <Button
                  size='small'
                  icon={<PlusOutlined />}
                  onClick={() => setRoomModal({ building: b })}
                >
                  Room
                </Button>
                <Button
                  size='small'
                  onClick={() => setBuildingModal({ building: b })}
                >
                  Edit
                </Button>
                <Button
                  size='small'
                  danger
                  onClick={() =>
                    confirmDelete({
                      title: `Delete ${b.name}?`,
                      remove: () =>
                        unwrap(
                          api.DELETE('/api/v1/buildings/{id}', {
                            params: { path: { id: b.id } },
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

      <FormModal<BuildingValues>
        open={buildingModal !== null}
        title={
          buildingModal?.building
            ? `Edit ${buildingModal.building.name}`
            : 'Add building'
        }
        initialValues={
          buildingModal?.building
            ? {
                name: buildingModal.building.name,
                code: buildingModal.building.code,
                address: buildingModal.building.address,
              }
            : undefined
        }
        onCancel={() => setBuildingModal(null)}
        onSubmit={saveBuilding}
      >
        <Form.Item
          label='Name'
          name='name'
          rules={[{ required: true, message: 'Enter the building name' }]}
        >
          <Input maxLength={200} placeholder='e.g. Academic Building 1' />
        </Form.Item>
        <Form.Item
          label='Code'
          name='code'
          rules={[{ required: true, message: 'Enter a short code' }]}
        >
          <Input maxLength={16} placeholder='e.g. AB1' style={{ width: 160 }} />
        </Form.Item>
        <Form.Item
          label='Address'
          name='address'
          rules={[{ required: true, message: 'Enter the address' }]}
        >
          <Input maxLength={300} />
        </Form.Item>
      </FormModal>

      <FormModal<RoomValues>
        open={roomModal !== null}
        title={
          roomModal?.room
            ? `Edit room ${roomModal.room.label}`
            : `Add a room to ${roomModal?.building.name ?? ''}`
        }
        initialValues={
          roomModal?.room
            ? {
                roomNumber: roomModal.room.roomNumber,
                roomName: roomModal.room.roomName,
                floor: roomModal.room.floor,
                capacity:
                  roomModal.room.capacity === null
                    ? null
                    : Number(roomModal.room.capacity),
              }
            : undefined
        }
        onCancel={() => setRoomModal(null)}
        onSubmit={saveRoom}
      >
        <Space size='middle' wrap>
          <Form.Item
            label='Room number'
            name='roomNumber'
            rules={[{ required: true, message: 'Enter the room number' }]}
          >
            <Input maxLength={20} placeholder='e.g. 301' />
          </Form.Item>
          <Form.Item
            label='Floor'
            name='floor'
            rules={[{ required: true, message: 'Enter the floor' }]}
          >
            <Input maxLength={20} placeholder='e.g. 3' />
          </Form.Item>
        </Space>
        <Form.Item label='Name' name='roomName'>
          <Input maxLength={100} placeholder='Optional, e.g. Networking Lab' />
        </Form.Item>
        <Form.Item label='Seats' name='capacity'>
          <InputNumber min={1} max={5000} placeholder='Optional' />
        </Form.Item>
      </FormModal>
    </div>
  )
}

export default VenuePage
