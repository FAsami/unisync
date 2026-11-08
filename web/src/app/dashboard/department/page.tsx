'use client'

import { useEffect, useState } from 'react'
import { Alert, App, Button, Card, Form, Input } from 'antd'
import { api } from '@/lib/api/client'
import { unwrap } from '@/lib/api/errors'
import { useDashboardSession } from '@/components/DashboardSession'
import { PageHeader, formError } from '@/components/setup/ui'

type Values = { code: string; name: string; description?: string }

const DepartmentPage = () => {
  const { department, refresh } = useDashboardSession()
  const { message } = App.useApp()
  const [form] = Form.useForm<Values>()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    form.setFieldsValue({
      code: department.code,
      name: department.name,
      description: department.description ?? '',
    })
  }, [department, form])

  const save = async (values: Values) => {
    setSaving(true)
    setError(null)
    try {
      await unwrap(
        api.PATCH('/api/v1/department', {
          body: { ...values, description: values.description ?? '' },
        })
      )
      await refresh()
      message.success('Department saved.')
    } catch (e) {
      setError(formError(form, e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='max-w-2xl'>
      <PageHeader
        title='Department'
        description='The name students and teachers see in the app.'
      />
      <Card>
        {error ? (
          <Alert
            type='error'
            showIcon
            message={error}
            style={{ marginBottom: 16 }}
          />
        ) : null}
        <Form form={form} layout='vertical' onFinish={save}>
          <Form.Item
            label='Code'
            name='code'
            rules={[
              { required: true, message: 'Enter a short code, like CSE' },
            ]}
            extra='Short code, stored in capitals.'
          >
            <Input maxLength={16} style={{ maxWidth: 200 }} />
          </Form.Item>
          <Form.Item
            label='Name'
            name='name'
            rules={[{ required: true, message: 'Enter the department name' }]}
          >
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item label='Description' name='description'>
            <Input.TextArea rows={3} maxLength={1000} />
          </Form.Item>
          <Button type='primary' htmlType='submit' loading={saving}>
            Save
          </Button>
        </Form>
      </Card>
    </div>
  )
}

export default DepartmentPage
