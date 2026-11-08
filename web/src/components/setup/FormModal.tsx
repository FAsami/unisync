'use client'

import { useEffect, useId, useState, type ReactNode } from 'react'
import { Alert, Form, Modal } from 'antd'
import { formError } from './ui'

/**
 * A modal form that submits to the API. Field errors from the API land under
 * their fields; anything else shows as an alert. Closes only on success.
 */
export const FormModal = <T extends object>({
  open,
  title,
  okText = 'Save',
  initialValues,
  onCancel,
  onSubmit,
  children,
  width,
}: {
  open: boolean
  title: string
  okText?: string
  initialValues?: Partial<T>
  onCancel: () => void
  onSubmit: (values: T) => Promise<unknown>
  children: ReactNode
  width?: number
}) => {
  const [form] = Form.useForm<T>()
  // Several of these stay mounted on one page; a unique form name prefixes
  // the field ids so each label points at its own input.
  const formName = `form${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      form.resetFields()
      if (initialValues) form.setFieldsValue(initialValues as never)
      setError(null)
    }
    // Reset only when the modal opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const submit = async () => {
    let values: T
    try {
      values = await form.validateFields()
    } catch {
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit(values)
    } catch (e) {
      setError(formError(form, e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      title={title}
      okText={okText}
      onOk={submit}
      confirmLoading={saving}
      onCancel={onCancel}
      forceRender
      width={width}
    >
      {error ? (
        <Alert
          type='error'
          showIcon
          message={error}
          style={{ marginBottom: 16 }}
        />
      ) : null}
      <Form
        form={form}
        name={formName}
        layout='vertical'
        requiredMark='optional'
      >
        {children}
      </Form>
    </Modal>
  )
}
