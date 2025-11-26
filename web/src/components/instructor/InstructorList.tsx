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
    Switch,
    Tag,
} from 'antd'
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'

const GET_INSTRUCTORS = gql`
  query GetInstructors {
    user_account(
      where: { 
        _or: [
          { role: { _eq: "instructor" } },
          { role: { _eq: "admin" } }
        ]
      }
      order_by: { created_at: desc }
    ) {
      id
      phone
      email
      role
      is_active
      phone_verified_at
      email_verified_at
      created_at
      updated_at
      profiles {
        id
        first_name
        last_name
        student_id
        date_of_birth
        address
        created_at
        updated_at
      }
    }
  }
`

const CREATE_INSTRUCTOR = gql`
  mutation CreateInstructor(
    $account: user_account_insert_input!
  ) {
    insert_user_account_one(object: $account) {
      id
      phone
      email
      role
      is_active
    }
  }
`

const UPDATE_INSTRUCTOR = gql`
  mutation UpdateInstructor(
    $id: uuid!
    $changes: user_account_set_input!
  ) {
    update_user_account_by_pk(
      pk_columns: { id: $id }
      _set: $changes
    ) {
      id
      phone
      email
      role
      is_active
    }
  }
`

const UPDATE_PROFILE = gql`
  mutation UpdateProfile(
    $id: uuid!
    $changes: user_profile_set_input!
  ) {
    update_user_profile_by_pk(
      pk_columns: { id: $id }
      _set: $changes
    ) {
      id
      first_name
      last_name
      student_id
      date_of_birth
      address
    }
  }
`

const CREATE_PROFILE = gql`
  mutation CreateProfile($object: user_profile_insert_input!) {
    insert_user_profile_one(object: $object) {
      id
      first_name
      last_name
      student_id
      date_of_birth
      address
    }
  }
`

const DELETE_INSTRUCTOR = gql`
  mutation DeleteInstructor($id: uuid!) {
    delete_user_account_by_pk(id: $id) {
      id
    }
  }
`

interface Profile {
    id: string
    first_name: string
    last_name: string
    student_id: string | null
    date_of_birth: string | null
    address: string | null
    created_at: string
    updated_at: string
}

interface Instructor {
    id: string
    phone: string
    email: string | null
    role: string
    is_active: boolean
    phone_verified_at: string | null
    email_verified_at: string | null
    created_at: string
    updated_at: string
    profiles?: Profile[]
}

const InstructorList = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
    const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null)
    const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
    const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null)
    const [form] = Form.useForm()
    const [profileForm] = Form.useForm()

    const { data: instructorsData, loading: instructorsLoading, refetch } = useQuery<{
        user_account: Instructor[]
    }>(GET_INSTRUCTORS)

    const [createInstructor] = useMutation(CREATE_INSTRUCTOR)
    const [updateInstructor] = useMutation(UPDATE_INSTRUCTOR)
    const [deleteInstructor] = useMutation(DELETE_INSTRUCTOR)
    const [createProfile] = useMutation(CREATE_PROFILE)
    const [updateProfile] = useMutation(UPDATE_PROFILE)

    const handleCreate = () => {
        setEditingInstructor(null)
        form.resetFields()
        form.setFieldsValue({ role: 'instructor', is_active: true })
        setIsModalOpen(true)
    }

    const handleEdit = (instructor: Instructor) => {
        setEditingInstructor(instructor)
        form.setFieldsValue(instructor)
        setIsModalOpen(true)
    }

    const handleEditProfile = (instructor: Instructor) => {
        setSelectedInstructor(instructor)
        const profile = instructor.profiles?.[0]
        if (profile) {
            setEditingProfile(profile)
            profileForm.setFieldsValue(profile)
        } else {
            setEditingProfile(null)
            profileForm.resetFields()
        }
        setIsProfileModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteInstructor({ variables: { id } })
            message.success('Instructor deleted successfully')
            refetch()
        } catch (error) {
            message.error('Failed to delete instructor')
        }
    }

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()

            if (editingInstructor) {
                await updateInstructor({
                    variables: {
                        id: editingInstructor.id,
                        changes: values,
                    },
                })
                message.success('Instructor updated successfully')
            } else {
                await createInstructor({
                    variables: {
                        account: values,
                    },
                })
                message.success('Instructor created successfully')
            }

            setIsModalOpen(false)
            form.resetFields()
            refetch()
        } catch (error) {
            message.error(
                editingInstructor
                    ? 'Failed to update instructor'
                    : 'Failed to create instructor'
            )
        }
    }

    const handleProfileSubmit = async () => {
        try {
            const values = await profileForm.validateFields()

            if (editingProfile) {
                await updateProfile({
                    variables: {
                        id: editingProfile.id,
                        changes: values,
                    },
                })
                message.success('Profile updated successfully')
            } else {
                await createProfile({
                    variables: {
                        object: {
                            ...values,
                            user_id: selectedInstructor?.id,
                        },
                    },
                })
                message.success('Profile created successfully')
            }

            setIsProfileModalOpen(false)
            profileForm.resetFields()
            setSelectedInstructor(null)
            setEditingProfile(null)
            refetch()
        } catch (error) {
            message.error(
                editingProfile
                    ? 'Failed to update profile'
                    : 'Failed to create profile'
            )
        }
    }

    const columns = [
        {
            title: 'Name',
            key: 'name',
            render: (_: any, record: Instructor) => {
                const profile = record.profiles?.[0]
                if (profile) {
                    return `${profile.first_name} ${profile.last_name}`
                }
                return <Tag color="orange">No Profile</Tag>
            },
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (email: string | null, record: Instructor) => (
                <span>
                    {email || '-'}
                    {email && record.email_verified_at && (
                        <Tag color="green" style={{ marginLeft: 8 }}>Verified</Tag>
                    )}
                </span>
            ),
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone: string, record: Instructor) => (
                <span>
                    {phone}
                    {record.phone_verified_at && (
                        <Tag color="green" style={{ marginLeft: 8 }}>Verified</Tag>
                    )}
                </span>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => (
                <Tag color={role === 'admin' ? 'red' : 'blue'}>
                    {role.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Instructor) => (
                <Space>
                    <Button
                        type="link"
                        icon={<UserOutlined />}
                        onClick={() => handleEditProfile(record)}
                    >
                        Profile
                    </Button>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete instructor"
                        description="Are you sure you want to delete this instructor?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
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
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Add Instructor
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={instructorsData?.user_account || []}
                loading={instructorsLoading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingInstructor ? 'Edit Instructor' : 'Create Instructor'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => {
                    setIsModalOpen(false)
                    form.resetFields()
                }}
                okText={editingInstructor ? 'Update' : 'Create'}
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="phone"
                        label="Phone"
                        rules={[
                            { required: true, message: 'Please enter phone number' },
                            { pattern: /^[0-9]{11}$/, message: 'Phone must be 11 digits' },
                        ]}
                    >
                        <Input placeholder="01XXXXXXXXX" disabled={!!editingInstructor} />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { type: 'email', message: 'Please enter a valid email' },
                        ]}
                    >
                        <Input placeholder="instructor@example.com" />
                    </Form.Item>
                    {!editingInstructor && (
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                { required: true, message: 'Please enter password' },
                                { min: 6, message: 'Password must be at least 6 characters' },
                            ]}
                        >
                            <Input.Password placeholder="Enter password" />
                        </Form.Item>
                    )}
                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: 'Please select a role' }]}
                    >
                        <Select placeholder="Select role">
                            <Select.Option value="instructor">Instructor</Select.Option>
                            <Select.Option value="admin">Admin</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="is_active"
                        label="Active"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={editingProfile ? 'Edit Profile' : 'Create Profile'}
                open={isProfileModalOpen}
                onOk={handleProfileSubmit}
                onCancel={() => {
                    setIsProfileModalOpen(false)
                    profileForm.resetFields()
                    setSelectedInstructor(null)
                    setEditingProfile(null)
                }}
                okText={editingProfile ? 'Update' : 'Create'}
                width={600}
            >
                <Form form={profileForm} layout="vertical">
                    <Form.Item
                        name="first_name"
                        label="First Name"
                        rules={[{ required: true, message: 'Please enter first name' }]}
                    >
                        <Input placeholder="John" />
                    </Form.Item>
                    <Form.Item
                        name="last_name"
                        label="Last Name"
                        rules={[{ required: true, message: 'Please enter last name' }]}
                    >
                        <Input placeholder="Doe" />
                    </Form.Item>
                    <Form.Item
                        name="student_id"
                        label="Employee/Instructor ID"
                    >
                        <Input placeholder="EMP-001" />
                    </Form.Item>
                    <Form.Item
                        name="date_of_birth"
                        label="Date of Birth"
                    >
                        <Input type="date" />
                    </Form.Item>
                    <Form.Item
                        name="address"
                        label="Address"
                    >
                        <Input.TextArea rows={3} placeholder="Enter address" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default InstructorList
