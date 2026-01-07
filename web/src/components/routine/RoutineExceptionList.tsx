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

const GET_ROUTINE_EXCEPTIONS = gql`
  query GetRoutineExceptions {
    event_routine_exception(order_by: { exception_date: desc }) {
      id
      routine_id
      exception_date
      reason
      created_by
      created_at
      routine {
        id
        name
        course_offering {
          course {
            code
            name
          }
        }
      }
    }
  }
`

const GET_ROUTINES = gql`
  query GetRoutines {
    event_routine(where: { is_active: { _eq: true } }) {
      id
      name
      course_offering {
        course {
          code
          name
        }
      }
    }
  }
`

const CREATE_ROUTINE_EXCEPTION = gql`
  mutation CreateRoutineException(
    $object: event_routine_exception_insert_input!
  ) {
    insert_event_routine_exception_one(object: $object) {
      id
      routine_id
      exception_date
      reason
      created_by
    }
  }
`

const UPDATE_ROUTINE_EXCEPTION = gql`
  mutation UpdateRoutineException(
    $id: uuid!
    $changes: event_routine_exception_set_input!
  ) {
    update_event_routine_exception_by_pk(
      pk_columns: { id: $id }
      _set: $changes
    ) {
      id
      routine_id
      exception_date
      reason
    }
  }
`

const DELETE_ROUTINE_EXCEPTION = gql`
  mutation DeleteRoutineException($id: uuid!) {
    delete_event_routine_exception_by_pk(id: $id) {
      id
    }
  }
`

interface Routine {
  id: string
  name: string
  course_offering?: {
    course: {
      code: string
      name: string
    }
  }
}

interface RoutineException {
  id: string
  routine_id: string
  exception_date: string
  reason: string
  created_by: string
  created_at: string
  routine: {
    id: string
    name: string
    course_offering?: {
      course: {
        code: string
        name: string
      }
    }
  }
}

const RoutineExceptionList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingException, setEditingException] =
    useState<RoutineException | null>(null)
  const [copyingException, setCopyingException] =
    useState<RoutineException | null>(null)
  const [form] = Form.useForm()

  const { data, loading, refetch } = useQuery<{
    event_routine_exception: RoutineException[]
  }>(GET_ROUTINE_EXCEPTIONS)
  const { data: routinesData } = useQuery<{
    event_routine: Routine[]
  }>(GET_ROUTINES)
  const [createException] = useMutation(CREATE_ROUTINE_EXCEPTION)
  const [updateException] = useMutation(UPDATE_ROUTINE_EXCEPTION)
  const [deleteException] = useMutation(DELETE_ROUTINE_EXCEPTION)

  const handleCreate = () => {
    setEditingException(null)
    setCopyingException(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (exception: RoutineException) => {
    setEditingException(exception)
    setCopyingException(null)
    form.setFieldsValue({
      ...exception,
      exception_date: dayjs(exception.exception_date),
    })
    setIsModalOpen(true)
  }

  const handleCopy = (exception: RoutineException) => {
    setCopyingException(exception)
    setEditingException(null)
    form.setFieldsValue({
      ...exception,
      exception_date: dayjs(exception.exception_date),
      reason: `${exception.reason} (Copy)`,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteException({ variables: { id } })
      message.success('Routine exception deleted successfully')
      refetch()
    } catch {
      message.error('Failed to delete routine exception')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      const formattedValues = {
        ...values,
        exception_date: values.exception_date.format('YYYY-MM-DD'),
        // TODO: Replace with actual user ID from auth context
        created_by: '00000000-0000-0000-0000-000000000000',
      }

      if (editingException) {
        await updateException({
          variables: {
            id: editingException.id,
            changes: {
              routine_id: formattedValues.routine_id,
              exception_date: formattedValues.exception_date,
              reason: formattedValues.reason,
            },
          },
        })
        message.success('Routine exception updated successfully')
      } else {
        await createException({
          variables: {
            object: formattedValues,
          },
        })
        message.success('Routine exception created successfully')
      }

      setIsModalOpen(false)
      form.resetFields()
      refetch()
    } catch {
      message.error(
        editingException
          ? 'Failed to update routine exception'
          : 'Failed to create routine exception'
      )
    }
  }

  const columns = [
    {
      title: 'Routine',
      key: 'routine',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: RoutineException) => record.routine.name,
    },
    {
      title: 'Course',
      key: 'course',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: RoutineException) =>
        record.routine.course_offering
          ? `${record.routine.course_offering.course.code} - ${record.routine.course_offering.course.name}`
          : '-',
    },
    {
      title: 'Exception Date',
      dataIndex: 'exception_date',
      key: 'exception_date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: RoutineException) => (
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
            title='Delete routine exception'
            description='Are you sure you want to delete this routine exception?'
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
          Add Routine Exception
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.event_routine_exception || []}
        loading={loading}
        rowKey='id'
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={
          editingException
            ? 'Edit Routine Exception'
            : copyingException
              ? 'Copy Routine Exception'
              : 'Create Routine Exception'
        }
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        okText={editingException ? 'Update' : 'Create'}
        width={600}
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            name='routine_id'
            label='Routine'
            rules={[{ required: true, message: 'Please select a routine' }]}
          >
            <Select
              placeholder='Select routine'
              showSearch
              optionFilterProp='children'
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {routinesData?.event_routine.map((routine: any) => (
                <Select.Option key={routine.id} value={routine.id}>
                  {routine.name}
                  {routine.course_offering &&
                    ` (${routine.course_offering.course.code})`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name='exception_date'
            label='Exception Date'
            rules={[
              { required: true, message: 'Please select exception date' },
            ]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name='reason'
            label='Reason'
            rules={[{ required: true, message: 'Please enter reason' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder='e.g., Public Holiday, University Closed'
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default RoutineExceptionList
