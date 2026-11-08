'use client'

import { useMemo, useState } from 'react'
import {
  App,
  Button,
  Card,
  DatePicker,
  Empty,
  Form,
  Select,
  Space,
  Tag,
  TimePicker,
  Typography,
} from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { api } from '@/lib/api/client'
import { unwrap } from '@/lib/api/errors'
import type { Batch, Routine } from '@/lib/api/schema'
import { useLoad } from '@/lib/useLoad'
import { FormModal } from '@/components/setup/FormModal'
import {
  DAYS,
  LoadError,
  PageHeader,
  SectionSelect,
  hhmm,
  useDelete,
} from '@/components/setup/ui'

type SlotValues = {
  offeringId: string
  dayOfWeek: number
  time: [Dayjs, Dayjs]
  eventType: string
  roomId?: string | null
  term: [Dayjs, Dayjs]
}

const EVENT_TYPES = ['lecture', 'lab', 'tutorial', 'exam', 'other']
const EVENT_COLOR: Record<string, string> = {
  lecture: 'blue',
  lab: 'purple',
  tutorial: 'cyan',
  exam: 'red',
  other: 'default',
}

const findBatch = (batches: Batch[] | undefined, sectionId?: string) =>
  batches?.find((b) => b.sections.some((s) => s.id === sectionId))

const RoutinePage = () => {
  const { message } = App.useApp()
  const confirmDelete = useDelete()
  const [sectionId, setSectionId] = useState<string | undefined>()
  const [modal, setModal] = useState<{
    slot?: Routine
    dayOfWeek?: number
  } | null>(null)

  const batches = useLoad('batches', () => unwrap(api.GET('/api/v1/batches')))
  const rooms = useLoad('rooms', () => unwrap(api.GET('/api/v1/rooms')))
  const offerings = useLoad(`offerings:${sectionId ?? ''}`, () =>
    sectionId
      ? unwrap(
          api.GET('/api/v1/offerings', {
            params: { query: { sectionId, active: true } },
          })
        )
      : Promise.resolve([])
  )
  const { data, error, loading, reload } = useLoad(
    `routines:${sectionId ?? ''}`,
    () =>
      sectionId
        ? unwrap(
            api.GET('/api/v1/routines', {
              params: { query: { sectionId, active: true } },
            })
          )
        : Promise.resolve([])
  )

  const byDay = useMemo(() => {
    const days: Routine[][] = DAYS.map(() => [])
    for (const slot of data ?? []) days[Number(slot.dayOfWeek)]?.push(slot)
    for (const list of days)
      list.sort((a, b) => a.startTime.localeCompare(b.startTime))
    return days
  }, [data])

  const batch = findBatch(batches.data, sectionId)

  const defaultTerm = (): [Dayjs, Dayjs] => {
    const start = batch?.startDate ? dayjs(batch.startDate) : dayjs()
    const end = batch?.endDate ? dayjs(batch.endDate) : start.add(6, 'month')
    return [start, end.isAfter(start) ? end : start.add(6, 'month')]
  }

  const save = async (values: SlotValues) => {
    const body = {
      offeringId: values.offeringId,
      dayOfWeek: values.dayOfWeek,
      startTime: values.time[0].format('HH:mm'),
      endTime: values.time[1].format('HH:mm'),
      eventType: values.eventType,
      roomId: values.roomId ?? null,
      effectiveFrom: values.term[0].format('YYYY-MM-DD'),
      effectiveTo: values.term[1].format('YYYY-MM-DD'),
      isActive: true,
    }
    const editing = modal?.slot
    if (editing) {
      await unwrap(
        api.PUT('/api/v1/routines/{id}', {
          params: { path: { id: editing.id } },
          body,
        })
      )
    } else {
      await unwrap(api.POST('/api/v1/routines', { body }))
    }
    message.success(editing ? 'Class saved.' : 'Class added to the routine.')
    setModal(null)
    await reload()
  }

  const roomOptions = useMemo(() => {
    const groups = new Map<string, { value: string; label: string }[]>()
    for (const room of rooms.data ?? []) {
      const list = groups.get(room.buildingName) ?? []
      list.push({ value: room.id, label: room.label })
      groups.set(room.buildingName, list)
    }
    return [...groups].map(([label, options]) => ({ label, options }))
  }, [rooms.data])

  const editing = modal?.slot

  return (
    <div>
      <PageHeader
        title='Weekly routine'
        description="A section's regular classes. Day-to-day changes (cancel, move, room) are made by teachers and CRs in the mobile app."
        extra={
          <Button
            type='primary'
            icon={<PlusOutlined />}
            disabled={!sectionId}
            onClick={() => setModal({})}
          >
            Add class
          </Button>
        }
      />
      <Space wrap className='mb-4'>
        <SectionSelect
          batches={batches.data}
          value={sectionId}
          onChange={setSectionId}
          placeholder='Choose a section to see its week'
          aria-label='Section'
          style={{ width: 280 }}
        />
      </Space>
      <LoadError error={error} onRetry={reload} />

      {!sectionId ? (
        <Empty description='Choose a section to see and edit its weekly routine.' />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7 gap-3'>
          {DAYS.map((dayName, day) => (
            <Card
              key={dayName}
              size='small'
              title={dayName}
              loading={loading && !data}
              extra={
                <Button
                  type='text'
                  size='small'
                  aria-label={`Add a class on ${dayName}`}
                  icon={<PlusOutlined />}
                  onClick={() => setModal({ dayOfWeek: day })}
                />
              }
              styles={{ body: { padding: 8 } }}
            >
              {byDay[day].length === 0 ? (
                <Typography.Text type='secondary' className='text-xs'>
                  No classes
                </Typography.Text>
              ) : (
                <Space direction='vertical' style={{ width: '100%' }} size={6}>
                  {byDay[day].map((slot) => (
                    <div
                      key={slot.id}
                      className='border border-gray-200 rounded p-2 bg-gray-50'
                    >
                      <div className='flex justify-between items-start gap-1'>
                        <Typography.Text strong>
                          {hhmm(slot.startTime)}–{hhmm(slot.endTime)}
                        </Typography.Text>
                        <Space size={0}>
                          <Button
                            type='text'
                            size='small'
                            aria-label='Edit class'
                            icon={<EditOutlined />}
                            onClick={() => setModal({ slot })}
                          />
                          <Button
                            type='text'
                            size='small'
                            danger
                            aria-label='Delete class'
                            icon={<DeleteOutlined />}
                            onClick={() =>
                              confirmDelete({
                                title: `Remove ${slot.course.code} on ${dayName} at ${hhmm(slot.startTime)}?`,
                                content:
                                  'It disappears from the routine, along with any changes made to its classes.',
                                remove: () =>
                                  unwrap(
                                    api.DELETE('/api/v1/routines/{id}', {
                                      params: { path: { id: slot.id } },
                                    })
                                  ),
                                done: reload,
                              })
                            }
                          />
                        </Space>
                      </div>
                      <div className='text-sm'>
                        <strong>{slot.course.code}</strong> {slot.course.name}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {slot.teacher.name}
                        {slot.room ? ` · ${slot.room.label}` : ''}
                      </div>
                      {slot.eventType !== 'lecture' ? (
                        <Tag
                          color={EVENT_COLOR[slot.eventType]}
                          className='mt-1'
                        >
                          {slot.eventType}
                        </Tag>
                      ) : null}
                    </div>
                  ))}
                </Space>
              )}
            </Card>
          ))}
        </div>
      )}

      <FormModal<SlotValues>
        open={modal !== null}
        title={editing ? `Edit ${editing.course.code}` : 'Add a class'}
        initialValues={
          editing
            ? {
                offeringId: editing.offeringId,
                dayOfWeek: Number(editing.dayOfWeek),
                time: [
                  dayjs(`2000-01-01T${editing.startTime}`),
                  dayjs(`2000-01-01T${editing.endTime}`),
                ],
                eventType: editing.eventType,
                roomId: editing.room?.id ?? null,
                term: [
                  dayjs(editing.effectiveFrom),
                  dayjs(editing.effectiveTo),
                ],
              }
            : {
                dayOfWeek: modal?.dayOfWeek ?? 0,
                eventType: 'lecture',
                term: defaultTerm(),
              }
        }
        onCancel={() => setModal(null)}
        onSubmit={save}
      >
        <Form.Item
          label='Course'
          name='offeringId'
          rules={[{ required: true, message: 'Choose the course' }]}
          extra={
            offerings.data?.length === 0
              ? 'This section has no course offerings yet. Add them under Course offerings first.'
              : undefined
          }
        >
          <Select
            showSearch
            optionFilterProp='label'
            loading={!offerings.data}
            options={(offerings.data ?? []).map((o) => ({
              value: o.id,
              label: `${o.course.code} · ${o.course.name} (${o.teacher.name})`,
            }))}
          />
        </Form.Item>
        <Space size='middle' wrap>
          <Form.Item label='Day' name='dayOfWeek' rules={[{ required: true }]}>
            <Select
              style={{ width: 140 }}
              options={DAYS.map((d, i) => ({ value: i, label: d }))}
            />
          </Form.Item>
          <Form.Item
            label='Time'
            name='time'
            rules={[{ required: true, message: 'Choose the start and end' }]}
          >
            <TimePicker.RangePicker
              format='HH:mm'
              minuteStep={5}
              needConfirm={false}
            />
          </Form.Item>
        </Space>
        <Space size='middle' wrap>
          <Form.Item label='Type' name='eventType'>
            <Select
              style={{ width: 140 }}
              options={EVENT_TYPES.map((t) => ({
                value: t,
                label: t[0].toUpperCase() + t.slice(1),
              }))}
            />
          </Form.Item>
          <Form.Item label='Room' name='roomId'>
            <Select
              allowClear
              showSearch
              optionFilterProp='label'
              placeholder='No room'
              style={{ width: 240 }}
              loading={!rooms.data}
              options={roomOptions}
            />
          </Form.Item>
        </Space>
        <Form.Item
          label='Runs'
          name='term'
          rules={[{ required: true, message: 'Choose when this class runs' }]}
          extra='The first and last week this class meets.'
        >
          <DatePicker.RangePicker />
        </Form.Item>
      </FormModal>
    </div>
  )
}

export default RoutinePage
