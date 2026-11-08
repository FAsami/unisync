'use client'

import Link from 'next/link'
import { Card, Col, Empty, List, Row, Statistic, Steps, Tag } from 'antd'
import { api } from '@/lib/api/client'
import { unwrap } from '@/lib/api/errors'
import { useLoad } from '@/lib/useLoad'
import { useDashboardSession } from '@/components/DashboardSession'
import { LoadError, PageHeader } from '@/components/setup/ui'

const loadOverview = async () => {
  const [batches, courses, teachers, offerings, routines, pending] =
    await Promise.all([
      unwrap(api.GET('/api/v1/batches')),
      unwrap(api.GET('/api/v1/courses')),
      unwrap(api.GET('/api/v1/teachers')),
      unwrap(api.GET('/api/v1/offerings')),
      unwrap(api.GET('/api/v1/routines')),
      unwrap(
        api.GET('/api/v1/access-requests', {
          params: { query: { status: 'pending' } },
        })
      ),
    ])
  return { batches, courses, teachers, offerings, routines, pending }
}

const DashboardPage = () => {
  const { department } = useDashboardSession()
  const { data, error, reload, loading } = useLoad('overview', loadOverview)

  const active = <T extends { isActive: boolean }>(items?: T[]) =>
    items?.filter((i) => i.isActive).length ?? 0
  const sections =
    data?.batches.reduce(
      (n, b) => n + b.sections.filter((s) => s.isActive).length,
      0
    ) ?? 0
  const students =
    data?.batches.reduce((n, b) => n + Number(b.studentCount), 0) ?? 0

  const setupSteps = [
    {
      title: 'Batches & sections',
      done: sections > 0,
      href: '/dashboard/batches',
    },
    {
      title: 'Courses',
      done: active(data?.courses) > 0,
      href: '/dashboard/courses',
    },
    {
      title: 'Teachers',
      done: active(data?.teachers) > 0,
      href: '/dashboard/teachers',
    },
    { title: 'Students', done: students > 0, href: '/dashboard/students' },
    {
      title: 'Course offerings',
      done: active(data?.offerings) > 0,
      href: '/dashboard/offerings',
    },
    {
      title: 'Weekly routine',
      done: active(data?.routines) > 0,
      href: '/dashboard/routine',
    },
  ]
  const current = setupSteps.findIndex((s) => !s.done)

  return (
    <div>
      <PageHeader
        title={department.name}
        description='Set up your department here. Students and teachers see their classes, changes and notices in the mobile app.'
      />
      <LoadError error={error} onRetry={reload} />

      <Row gutter={[16, 16]} className='mb-6'>
        {[
          { label: 'Sections', value: sections },
          { label: 'Students', value: students },
          { label: 'Teachers', value: active(data?.teachers) },
          { label: 'Courses', value: active(data?.courses) },
          { label: 'Weekly classes', value: active(data?.routines) },
        ].map((stat) => (
          <Col key={stat.label} xs={12} md={8} lg={4}>
            <Card size='small' loading={loading && !data}>
              <Statistic title={stat.label} value={stat.value} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title='Waiting for you'
            extra={<Link href='/dashboard/access-requests'>All requests</Link>}
          >
            {data && data.pending.length === 0 ? (
              <Empty description='No access requests waiting' />
            ) : (
              <List
                loading={!data}
                dataSource={data?.pending.slice(0, 5)}
                renderItem={(r) => (
                  <List.Item
                    extra={
                      <Link href='/dashboard/access-requests'>Review</Link>
                    }
                  >
                    <List.Item.Meta
                      title={`${r.firstName} ${r.lastName}`}
                      description={`${r.batch.name} · ${r.section.name} · ${r.studentId}`}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title='Setup'
            extra={
              current === -1 ? <Tag color='green'>All set</Tag> : undefined
            }
          >
            <Steps
              direction='vertical'
              size='small'
              current={current === -1 ? setupSteps.length : current}
              items={setupSteps.map((s) => ({
                title: <Link href={s.href}>{s.title}</Link>,
                status: s.done ? 'finish' : undefined,
              }))}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardPage
