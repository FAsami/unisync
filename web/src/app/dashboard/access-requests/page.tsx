'use client'

import { useState } from 'react'
import { App, Button, Form, Input, Segmented, Space, Table, Tag } from 'antd'
import dayjs from 'dayjs'
import { api } from '@/lib/api/client'
import { messageOf, unwrap } from '@/lib/api/errors'
import type { AccessRequest } from '@/lib/api/schema'
import { useLoad } from '@/lib/useLoad'
import { useDashboardSession } from '@/components/DashboardSession'
import { FormModal } from '@/components/setup/FormModal'
import { LoadError, PageHeader } from '@/components/setup/ui'

type Status = 'pending' | 'approved' | 'rejected'

const STATUS_COLOR: Record<string, string> = {
  pending: 'gold',
  approved: 'green',
  rejected: 'red',
}

const AccessRequestsPage = () => {
  const { message } = App.useApp()
  const { refresh: refreshSession } = useDashboardSession()
  const [status, setStatus] = useState<Status>('pending')
  const [rejecting, setRejecting] = useState<AccessRequest | null>(null)
  const [approving, setApproving] = useState<string | null>(null)
  const { data, error, loading, reload } = useLoad(`requests:${status}`, () =>
    unwrap(
      api.GET('/api/v1/access-requests', { params: { query: { status } } })
    )
  )

  const done = async () => {
    await Promise.all([reload(), refreshSession()])
  }

  const approve = async (request: AccessRequest) => {
    setApproving(request.id)
    try {
      await unwrap(
        api.POST('/api/v1/access-requests/{id}/approve', {
          params: { path: { id: request.id } },
        })
      )
      message.success(
        `${request.firstName} is on the roster and can sign in now.`
      )
      await done()
    } catch (e) {
      message.error(messageOf(e))
    } finally {
      setApproving(null)
    }
  }

  return (
    <div>
      <PageHeader
        title='Access requests'
        description="Students whose number wasn't on your roster ask to join here. Approving adds them to the section they chose."
      />
      <Segmented<Status>
        style={{ marginBottom: 16 }}
        value={status}
        onChange={setStatus}
        options={[
          { label: 'Waiting', value: 'pending' },
          { label: 'Approved', value: 'approved' },
          { label: 'Rejected', value: 'rejected' },
        ]}
      />
      <LoadError error={error} onRetry={reload} />
      <Table<AccessRequest>
        rowKey='id'
        loading={loading}
        dataSource={data}
        scroll={{ x: 800 }}
        pagination={{ pageSize: 20, hideOnSinglePage: true }}
        locale={{
          emptyText:
            status === 'pending'
              ? 'No one is waiting'
              : `No ${status} requests`,
        }}
        columns={[
          {
            title: 'Name',
            render: (_, r) => `${r.firstName} ${r.lastName}`,
          },
          { title: 'Student ID', dataIndex: 'studentId' },
          { title: 'Phone', dataIndex: 'phone' },
          {
            title: 'Section',
            render: (_, r) => `${r.batch.name} · ${r.section.name}`,
          },
          {
            title: 'Asked',
            dataIndex: 'createdAt',
            render: (v: string) => dayjs(v).format('D MMM YYYY, h:mm A'),
          },
          {
            title: 'Status',
            render: (_, r) => (
              <Space direction='vertical' size={0}>
                <Tag color={STATUS_COLOR[r.status]}>{r.status}</Tag>
                {r.rejectionReason ? (
                  <span className='text-xs text-[var(--color-ink-faint)]'>
                    {r.rejectionReason}
                  </span>
                ) : null}
              </Space>
            ),
          },
          ...(status === 'pending'
            ? [
                {
                  title: '',
                  key: 'actions',
                  align: 'right' as const,
                  render: (_: unknown, r: AccessRequest) => (
                    <Space>
                      <Button
                        type='primary'
                        loading={approving === r.id}
                        onClick={() => approve(r)}
                      >
                        Approve
                      </Button>
                      <Button danger onClick={() => setRejecting(r)}>
                        Reject
                      </Button>
                    </Space>
                  ),
                },
              ]
            : []),
        ]}
      />

      <FormModal<{ reason?: string }>
        open={rejecting !== null}
        title={
          rejecting
            ? `Reject ${rejecting.firstName} ${rejecting.lastName}?`
            : 'Reject'
        }
        okText='Reject'
        onCancel={() => setRejecting(null)}
        onSubmit={async ({ reason }) => {
          if (!rejecting) return
          await unwrap(
            api.POST('/api/v1/access-requests/{id}/reject', {
              params: { path: { id: rejecting.id } },
              body: { reason: reason?.trim() || null },
            })
          )
          message.success('Request rejected.')
          setRejecting(null)
          await done()
        }}
      >
        <Form.Item
          label='Reason (optional)'
          name='reason'
          extra='Shown to the student if they ask again.'
        >
          <Input.TextArea rows={3} maxLength={500} />
        </Form.Item>
      </FormModal>
    </div>
  )
}

export default AccessRequestsPage
