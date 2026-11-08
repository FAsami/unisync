'use client'

import type { ReactNode } from 'react'
import { Alert, App, Select, Typography, type FormInstance } from 'antd'
import { ApiError, messageOf } from '@/lib/api/errors'
import type { Batch } from '@/lib/api/schema'

export const PageHeader = ({
  title,
  description,
  extra,
}: {
  title: string
  description?: ReactNode
  extra?: ReactNode
}) => (
  <div className='flex flex-wrap items-start justify-between gap-4 mb-6'>
    <div>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {title}
      </Typography.Title>
      {description ? (
        <Typography.Paragraph type='secondary' style={{ margin: '4px 0 0' }}>
          {description}
        </Typography.Paragraph>
      ) : null}
    </div>
    {extra ? <div className='flex flex-wrap gap-2'>{extra}</div> : null}
  </div>
)

export const LoadError = ({
  error,
  onRetry,
}: {
  error: unknown
  onRetry: () => void
}) =>
  error ? (
    <Alert
      type='error'
      showIcon
      style={{ marginBottom: 16 }}
      message={messageOf(error)}
      action={
        <Typography.Link onClick={onRetry} style={{ marginLeft: 8 }}>
          Try again
        </Typography.Link>
      }
    />
  ) : null

/**
 * Shows an API failure on a form: field messages from VALIDATION_FAILED go
 * under their fields, and the summary is returned for an alert.
 */
export const formError = <T,>(
  form: FormInstance<T>,
  error: unknown
): string => {
  if (error instanceof ApiError) {
    const fields = Object.entries(error.fieldErrors)
    if (fields.length > 0) {
      const known = new Set(
        form.getFieldsError().map((field) => String(field.name[0]))
      )
      form.setFields(
        fields
          .filter(([name]) => known.has(name))
          .map(([name, message]) => ({
            name: name as never,
            errors: [message],
          }))
      )
      const unplaced = fields.filter(([name]) => !known.has(name))
      if (unplaced.length > 0) return unplaced.map(([, m]) => m).join(' ')
    }
  }
  return messageOf(error)
}

/**
 * Confirms and deletes. If the API answers 409 IN_USE and the record can be
 * deactivated instead, offers that.
 */
export const useDelete = () => {
  const { modal, message } = App.useApp()

  return (options: {
    title: string
    content?: ReactNode
    remove: () => Promise<unknown>
    markInactive?: () => Promise<unknown>
    done: () => void
  }) =>
    modal.confirm({
      title: options.title,
      content: options.content ?? 'This cannot be undone.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await options.remove()
          message.success('Deleted.')
          options.done()
        } catch (error) {
          const deactivate = options.markInactive
          if (
            error instanceof ApiError &&
            error.code === 'IN_USE' &&
            deactivate
          ) {
            modal.confirm({
              title: 'It is still in use',
              content: `${error.message} Mark it inactive? It stays in past records but can't be picked for anything new.`,
              okText: 'Mark inactive',
              onOk: async () => {
                try {
                  await deactivate()
                  message.success('Marked inactive.')
                  options.done()
                } catch (e) {
                  message.error(messageOf(e))
                }
              },
            })
          } else {
            message.error(messageOf(error))
          }
        }
      },
    })
}

/** Section picker grouped by batch. */
export const SectionSelect = ({
  batches,
  value,
  onChange,
  allowClear,
  placeholder = 'Choose a section',
  activeOnly = true,
  style,
  id,
  'aria-label': ariaLabel,
}: {
  batches: Batch[] | undefined
  value?: string
  onChange?: (value: string | undefined) => void
  allowClear?: boolean
  placeholder?: string
  activeOnly?: boolean
  style?: React.CSSProperties
  /** Set by Form.Item so its label points here. */
  id?: string
  'aria-label'?: string
}) => (
  <Select
    id={id}
    aria-label={ariaLabel}
    value={value}
    onChange={onChange}
    allowClear={allowClear}
    placeholder={placeholder}
    showSearch
    optionFilterProp='label'
    style={style}
    loading={!batches}
    options={(batches ?? [])
      .filter((b) => !activeOnly || b.isActive)
      .map((b) => ({
        label: b.name,
        title: b.name,
        options: b.sections
          .filter((s) => !activeOnly || s.isActive)
          .map((s) => ({ value: s.id, label: `${b.name} · ${s.name}` })),
      }))
      .filter((group) => group.options.length > 0)}
  />
)

export const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

/** "09:00:00" → "09:00" */
export const hhmm = (time: string) => time.slice(0, 5)
