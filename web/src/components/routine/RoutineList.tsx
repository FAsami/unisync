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
    TimePicker,
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

const GET_ROUTINES = gql`
  query GetRoutines {
    event_routine(order_by: { created_at: desc }) {
      id
      name
      course_offering_id
      day_of_week
      start_time
      end_time
      event_type
      effective_from
      effective_to
      is_active
      metadata
      created_at
      updated_at
      course_offering {
        id
        course {
          code
          name
        }
        section {
          name
        }
        batch {
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
      course {
        code
        name
      }
      section {
        name
      }
      batch {
        name
      }
    }
  }
`

const CREATE_ROUTINE = gql`
  mutation CreateRoutine($object: event_routine_insert_input!) {
    insert_event_routine_one(object: $object) {
      id
      name
      course_offering_id
      day_of_week
      start_time
      end_time
      event_type
      effective_from
      effective_to
      is_active
    }
  }
`

const UPDATE_ROUTINE = gql`
  mutation UpdateRoutine($id: uuid!, $changes: event_routine_set_input!) {
    update_event_routine_by_pk(pk_columns: { id: $id }, _set: $changes) {
      id
      name
      course_offering_id
      day_of_week
      start_time
      end_time
      event_type
      effective_from
      effective_to
      is_active
    }
  }
`

const DELETE_ROUTINE = gql`
  mutation DeleteRoutine($id: uuid!) {
    delete_event_routine_by_pk(id: $id) {
      id
    }
  }
`

interface CourseOffering {
    id: string
    course: {
        code: string
        name: string
    }
    section: {
        name: string
    }
    batch: {
        name: string
    }
}

interface Routine {
    id: string
    name: string
    course_offering_id: string | null
    day_of_week: number
    start_time: string
    end_time: string
    event_type: string
    effective_from: string
    effective_to: string
    is_active: boolean
    metadata: any
    created_at: string
    updated_at: string
    course_offering?: {
        id: string
        course: {
            code: string
            name: string
        }
        section: {
            name: string
        }
        batch: {
            name: string
        }
    }
}

const DAYS_OF_WEEK = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
]

const EVENT_TYPES = [
    { value: 'lecture', label: 'Lecture' },
    { value: 'lab', label: 'Lab' },
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'exam', label: 'Exam' },
    { value: 'other', label: 'Other' },
]

const RoutineList = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null)
    const [copyingRoutine, setCopyingRoutine] = useState<Routine | null>(null)
    const [form] = Form.useForm()

    const { data, loading, refetch } = useQuery<{ event_routine: Routine[] }>(
        GET_ROUTINES
    )
    const { data: courseOfferingsData } = useQuery<{
        academic_course_offering: CourseOffering[]
    }>(GET_COURSE_OFFERINGS)
    const [createRoutine] = useMutation(CREATE_ROUTINE)
    const [updateRoutine] = useMutation(UPDATE_ROUTINE)
    const [deleteRoutine] = useMutation(DELETE_ROUTINE)

    const handleCreate = () => {
        setEditingRoutine(null)
        setCopyingRoutine(null)
        form.resetFields()
        setIsModalOpen(true)
    }

    const handleEdit = (routine: Routine) => {
        setEditingRoutine(routine)
        setCopyingRoutine(null)
        form.setFieldsValue({
            ...routine,
            start_time: dayjs(routine.start_time, 'HH:mm:ss'),
            end_time: dayjs(routine.end_time, 'HH:mm:ss'),
            effective_from: dayjs(routine.effective_from),
            effective_to: dayjs(routine.effective_to),
        })
        setIsModalOpen(true)
    }

    const handleCopy = (routine: Routine) => {
        setCopyingRoutine(routine)
        setEditingRoutine(null)
        form.setFieldsValue({
            ...routine,
            name: `${routine.name} (Copy)`,
            start_time: dayjs(routine.start_time, 'HH:mm:ss'),
            end_time: dayjs(routine.end_time, 'HH:mm:ss'),
            effective_from: dayjs(routine.effective_from),
            effective_to: dayjs(routine.effective_to),
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteRoutine({ variables: { id } })
            message.success('Routine deleted successfully')
            refetch()
        } catch (error) {
            message.error('Failed to delete routine')
        }
    }

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()

            const formattedValues = {
                ...values,
                start_time: values.start_time.format('HH:mm:ss'),
                end_time: values.end_time.format('HH:mm:ss'),
                effective_from: values.effective_from.format('YYYY-MM-DD'),
                effective_to: values.effective_to.format('YYYY-MM-DD'),
            }

            if (editingRoutine) {
                await updateRoutine({
                    variables: {
                        id: editingRoutine.id,
                        changes: formattedValues,
                    },
                })
                message.success('Routine updated successfully')
            } else {
                await createRoutine({
                    variables: {
                        object: formattedValues,
                    },
                })
                message.success('Routine created successfully')
            }

            setIsModalOpen(false)
            form.resetFields()
            refetch()
        } catch (error) {
            message.error(
                editingRoutine ? 'Failed to update routine' : 'Failed to create routine'
            )
        }
    }

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Course',
            key: 'course',
            render: (_: any, record: Routine) =>
                record.course_offering
                    ? `${record.course_offering.course.code} - ${record.course_offering.course.name}`
                    : '-',
        },
        {
            title: 'Section/Batch',
            key: 'section_batch',
            render: (_: any, record: Routine) =>
                record.course_offering
                    ? `${record.course_offering.section.name} / ${record.course_offering.batch.name}`
                    : '-',
        },
        {
            title: 'Day',
            dataIndex: 'day_of_week',
            key: 'day_of_week',
            render: (day: number) =>
                DAYS_OF_WEEK.find((d) => d.value === day)?.label || day,
        },
        {
            title: 'Time',
            key: 'time',
            render: (_: any, record: Routine) => (
                <span>
                    {dayjs(record.start_time, 'HH:mm:ss').format('HH:mm')} -{' '}
                    {dayjs(record.end_time, 'HH:mm:ss').format('HH:mm')}
                </span>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'event_type',
            key: 'event_type',
            render: (type: string) =>
                EVENT_TYPES.find((t) => t.value === type)?.label || type,
        },
        {
            title: 'Effective Period',
            key: 'effective_period',
            render: (_: any, record: Routine) => (
                <span>
                    {dayjs(record.effective_from).format('MMM DD, YYYY')} -{' '}
                    {dayjs(record.effective_to).format('MMM DD, YYYY')}
                </span>
            ),
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
            render: (_: any, record: Routine) => (
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
                        title='Delete routine'
                        description='Are you sure you want to delete this routine?'
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
                    Add Routine
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={data?.event_routine || []}
                loading={loading}
                rowKey='id'
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={
                    editingRoutine
                        ? 'Edit Routine'
                        : copyingRoutine
                            ? 'Copy Routine'
                            : 'Create Routine'
                }
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => {
                    setIsModalOpen(false)
                    form.resetFields()
                }}
                okText={editingRoutine ? 'Update' : 'Create'}
                width={600}
            >
                <Form form={form} layout='vertical'>
                    <Form.Item
                        name='name'
                        label='Name'
                        rules={[{ required: true, message: 'Please enter routine name' }]}
                    >
                        <Input placeholder='e.g., CSE101 Monday Lecture' />
                    </Form.Item>
                    <Form.Item name='course_offering_id' label='Course Offering'>
                        <Select
                            placeholder='Select course offering'
                            showSearch
                            optionFilterProp='children'
                            allowClear
                        >
                            {courseOfferingsData?.academic_course_offering.map(
                                (offering: any) => (
                                    <Select.Option key={offering.id} value={offering.id}>
                                        {offering.course.code} - {offering.course.name} (
                                        {offering.section.name} / {offering.batch.name})
                                    </Select.Option>
                                )
                            )}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name='day_of_week'
                        label='Day of Week'
                        rules={[{ required: true, message: 'Please select day of week' }]}
                    >
                        <Select placeholder='Select day'>
                            {DAYS_OF_WEEK.map((day) => (
                                <Select.Option key={day.value} value={day.value}>
                                    {day.label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name='start_time'
                        label='Start Time'
                        rules={[{ required: true, message: 'Please select start time' }]}
                    >
                        <TimePicker format='HH:mm' style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name='end_time'
                        label='End Time'
                        rules={[{ required: true, message: 'Please select end time' }]}
                    >
                        <TimePicker format='HH:mm' style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name='event_type'
                        label='Event Type'
                        rules={[{ required: true, message: 'Please select event type' }]}
                        initialValue='lecture'
                    >
                        <Select placeholder='Select event type'>
                            {EVENT_TYPES.map((type) => (
                                <Select.Option key={type.value} value={type.value}>
                                    {type.label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name='effective_from'
                        label='Effective From'
                        rules={[
                            { required: true, message: 'Please select effective from date' },
                        ]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name='effective_to'
                        label='Effective To'
                        rules={[
                            { required: true, message: 'Please select effective to date' },
                        ]}
                    >
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

export default RoutineList
