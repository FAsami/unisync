'use client'

import { useState } from 'react'
import {
  App,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Space,
  Switch,
  Table,
  Tag,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { api } from '@/lib/api/client'
import { unwrap } from '@/lib/api/errors'
import { fields, type Batch, type Section } from '@/lib/api/schema'
import { useLoad } from '@/lib/useLoad'
import { FormModal } from '@/components/setup/FormModal'
import { LoadError, PageHeader, useDelete } from '@/components/setup/ui'

type BatchValues = {
  name: string
  year: number
  semesterCount: number
  currentSemester: number
  startDate?: Dayjs | null
  endDate?: Dayjs | null
  isActive: boolean
}
type SectionValues = {
  name: string
  capacity?: number | null
  isActive: boolean
}

const day = (value?: Dayjs | null) =>
  value ? value.format('YYYY-MM-DD') : null

const BatchesPage = () => {
  const { message } = App.useApp()
  const confirmDelete = useDelete()
  const { data, error, loading, reload } = useLoad('batches', () =>
    unwrap(api.GET('/api/v1/batches'))
  )
  const [batchModal, setBatchModal] = useState<{ batch?: Batch } | null>(null)
  const [sectionModal, setSectionModal] = useState<{
    batch: Batch
    section?: Section
  } | null>(null)

  const saveBatch = async (values: BatchValues) => {
    const body = {
      ...values,
      startDate: day(values.startDate),
      endDate: day(values.endDate),
    }
    const editing = batchModal?.batch
    if (editing) {
      await unwrap(
        api.PATCH('/api/v1/batches/{id}', {
          params: { path: { id: editing.id } },
          body,
        })
      )
    } else {
      await unwrap(api.POST('/api/v1/batches', { body }))
    }
    message.success(editing ? 'Batch saved.' : 'Batch added.')
    setBatchModal(null)
    await reload()
  }

  const saveSection = async (values: SectionValues) => {
    if (!sectionModal) return
    const { batch, section } = sectionModal
    const body = { ...values, capacity: values.capacity ?? null }
    if (section) {
      await unwrap(
        api.PATCH('/api/v1/sections/{id}', {
          params: { path: { id: section.id } },
          body: fields(body),
        })
      )
    } else {
      await unwrap(
        api.POST('/api/v1/sections', { body: { ...body, batchId: batch.id } })
      )
    }
    message.success(section ? 'Section saved.' : 'Section added.')
    setSectionModal(null)
    await reload()
  }

  const sectionTable = (batch: Batch) => (
    <Table<Section>
      rowKey='id'
      size='small'
      pagination={false}
      dataSource={batch.sections}
      locale={{ emptyText: 'No sections yet' }}
      columns={[
        {
          title: 'Section',
          dataIndex: 'name',
          render: (name: string, s) => (
            <Space>
              {name}
              {s.isActive ? null : <Tag>Inactive</Tag>}
            </Space>
          ),
        },
        {
          title: 'Students',
          dataIndex: 'studentCount',
          render: (n: number, s) =>
            s.capacity ? `${n} / ${s.capacity}` : String(n),
        },
        {
          title: '',
          key: 'actions',
          align: 'right',
          render: (_, s) => (
            <Space>
              <Button
                size='small'
                onClick={() => setSectionModal({ batch, section: s })}
              >
                Edit
              </Button>
              <Button
                size='small'
                danger
                onClick={() =>
                  confirmDelete({
                    title: `Delete section ${s.name}?`,
                    remove: () =>
                      unwrap(
                        api.DELETE('/api/v1/sections/{id}', {
                          params: { path: { id: s.id } },
                        })
                      ),
                    markInactive: () =>
                      unwrap(
                        api.PATCH('/api/v1/sections/{id}', {
                          params: { path: { id: s.id } },
                          body: fields({ isActive: false }),
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
        title='Batches & sections'
        description='A batch is an intake year; students belong to a section of a batch.'
        extra={
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => setBatchModal({})}
          >
            Add batch
          </Button>
        }
      />
      <LoadError error={error} onRetry={reload} />
      <Table<Batch>
        rowKey='id'
        loading={loading}
        dataSource={data}
        scroll={{ x: 760 }}
        pagination={false}
        locale={{ emptyText: 'No batches yet. Add the first one.' }}
        expandable={{
          expandedRowRender: sectionTable,
          rowExpandable: () => true,
        }}
        columns={[
          {
            title: 'Batch',
            dataIndex: 'name',
            render: (name: string, b) => (
              <Space>
                <strong>{name}</strong>
                {b.isActive ? null : <Tag>Inactive</Tag>}
              </Space>
            ),
          },
          { title: 'Year', dataIndex: 'year' },
          {
            title: 'Semester',
            render: (_, b) => `${b.currentSemester} of ${b.semesterCount}`,
          },
          {
            title: 'Sections',
            render: (_, b) => b.sections.length,
          },
          { title: 'Students', dataIndex: 'studentCount' },
          {
            title: '',
            key: 'actions',
            align: 'right',
            render: (_, b) => (
              <Space>
                <Button
                  size='small'
                  icon={<PlusOutlined />}
                  onClick={() => setSectionModal({ batch: b })}
                >
                  Section
                </Button>
                <Button
                  size='small'
                  onClick={() => setBatchModal({ batch: b })}
                >
                  Edit
                </Button>
                <Button
                  size='small'
                  danger
                  onClick={() =>
                    confirmDelete({
                      title: `Delete batch ${b.name}?`,
                      remove: () =>
                        unwrap(
                          api.DELETE('/api/v1/batches/{id}', {
                            params: { path: { id: b.id } },
                          })
                        ),
                      markInactive: () =>
                        unwrap(
                          api.PATCH('/api/v1/batches/{id}', {
                            params: { path: { id: b.id } },
                            body: fields({ isActive: false }),
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

      <FormModal<BatchValues>
        open={batchModal !== null}
        title={
          batchModal?.batch ? `Edit ${batchModal.batch.name}` : 'Add batch'
        }
        initialValues={
          batchModal?.batch
            ? {
                name: batchModal.batch.name,
                year: Number(batchModal.batch.year),
                semesterCount: Number(batchModal.batch.semesterCount),
                currentSemester: Number(batchModal.batch.currentSemester),
                startDate: batchModal.batch.startDate
                  ? dayjs(batchModal.batch.startDate)
                  : null,
                endDate: batchModal.batch.endDate
                  ? dayjs(batchModal.batch.endDate)
                  : null,
                isActive: batchModal.batch.isActive,
              }
            : {
                year: dayjs().year(),
                semesterCount: 8,
                currentSemester: 1,
                isActive: true,
              }
        }
        onCancel={() => setBatchModal(null)}
        onSubmit={saveBatch}
      >
        <Form.Item
          label='Name'
          name='name'
          rules={[
            { required: true, message: 'Name the batch, like 2026 or 51st' },
          ]}
        >
          <Input maxLength={100} placeholder='e.g. 2026' />
        </Form.Item>
        <Space size='middle' wrap>
          <Form.Item
            label='Intake year'
            name='year'
            rules={[{ required: true }]}
          >
            <InputNumber min={2000} max={2100} />
          </Form.Item>
          <Form.Item
            label='Semesters'
            name='semesterCount'
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={16} />
          </Form.Item>
          <Form.Item
            label='Current semester'
            name='currentSemester'
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={16} />
          </Form.Item>
        </Space>
        <Space size='middle' wrap>
          <Form.Item label='Starts' name='startDate'>
            <DatePicker />
          </Form.Item>
          <Form.Item label='Ends' name='endDate'>
            <DatePicker />
          </Form.Item>
        </Space>
        <Form.Item label='Active' name='isActive' valuePropName='checked'>
          <Switch />
        </Form.Item>
      </FormModal>

      <FormModal<SectionValues>
        open={sectionModal !== null}
        title={
          sectionModal?.section
            ? `Edit section ${sectionModal.section.name}`
            : `Add a section to ${sectionModal?.batch.name ?? ''}`
        }
        initialValues={
          sectionModal?.section
            ? {
                name: sectionModal.section.name,
                capacity:
                  sectionModal.section.capacity === null
                    ? null
                    : Number(sectionModal.section.capacity),
                isActive: sectionModal.section.isActive,
              }
            : { isActive: true }
        }
        onCancel={() => setSectionModal(null)}
        onSubmit={saveSection}
      >
        <Form.Item
          label='Name'
          name='name'
          rules={[{ required: true, message: 'Name the section, like A' }]}
        >
          <Input maxLength={50} placeholder='e.g. A' />
        </Form.Item>
        <Form.Item label='Capacity' name='capacity'>
          <InputNumber min={1} max={1000} placeholder='Optional' />
        </Form.Item>
        <Form.Item label='Active' name='isActive' valuePropName='checked'>
          <Switch />
        </Form.Item>
      </FormModal>
    </div>
  )
}

export default BatchesPage
