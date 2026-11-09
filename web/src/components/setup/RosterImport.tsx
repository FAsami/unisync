'use client'

import { useState } from 'react'
import {
  Alert,
  App,
  Button,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Upload,
} from 'antd'
import { Download, Upload as UploadIcon } from 'lucide-react'
import { api } from '@/lib/api/client'
import { ApiError, messageOf, unwrap } from '@/lib/api/errors'
import type { StudentImportResult } from '@/lib/api/schema'
import { parseRoster, ROSTER_TEMPLATE, type RosterRow } from '@/lib/csv'

type RowResult = StudentImportResult['rows'][number]

const OUTCOME: Record<string, { color: string; label: string }> = {
  created: { color: 'green', label: 'New' },
  updated: { color: 'blue', label: 'Updated' },
  unchanged: { color: 'default', label: 'No change' },
  error: { color: 'red', label: 'Fix' },
}

const isImportResult = (value: unknown): value is StudentImportResult =>
  Boolean(value && typeof value === 'object' && 'rows' in value)

/**
 * Roster import: paste or upload a sheet, check it (dry run, nothing saved),
 * then import. The API imports all rows or none.
 */
export const RosterImport = ({
  open,
  onClose,
  onImported,
}: {
  open: boolean
  onClose: () => void
  onImported: () => void
}) => {
  const { message } = App.useApp()
  const [text, setText] = useState('')
  const [rows, setRows] = useState<RosterRow[]>([])
  const [problem, setProblem] = useState<string | null>(null)
  const [checked, setChecked] = useState<StudentImportResult | null>(null)
  const [busy, setBusy] = useState(false)

  const reset = () => {
    setText('')
    setRows([])
    setProblem(null)
    setChecked(null)
  }

  const read = (value: string) => {
    setText(value)
    setChecked(null)
    setProblem(null)
    const parsed = parseRoster(value)
    if (parsed.missing.length > 0) {
      setRows([])
      setProblem(`The sheet needs these columns: ${parsed.missing.join(', ')}.`)
      return
    }
    setRows(parsed.rows)
  }

  const send = async (dryRun: boolean) => {
    setBusy(true)
    setProblem(null)
    try {
      const result = await unwrap(
        api.POST('/api/v1/students/import', {
          body: {
            rows: rows.map((row) => ({ ...row, sectionId: null })),
            dryRun,
          },
        })
      )
      if (dryRun) {
        setChecked(result)
      } else {
        message.success(
          `Imported: ${result.created} new, ${result.updated} updated, ${result.unchanged} unchanged.`
        )
        reset()
        onImported()
      }
    } catch (e) {
      if (e instanceof ApiError && isImportResult(e.details)) {
        setChecked(e.details)
        setProblem(e.message)
      } else {
        setProblem(messageOf(e))
      }
    } finally {
      setBusy(false)
    }
  }

  const ready = checked !== null && Number(checked.failed) === 0

  return (
    <Modal
      open={open}
      width={860}
      title='Import students'
      onCancel={() => {
        reset()
        onClose()
      }}
      footer={
        <Space>
          <Button
            onClick={() => {
              reset()
              onClose()
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={rows.length === 0}
            loading={busy && !ready}
            onClick={() => send(true)}
          >
            Check {rows.length > 0 ? `${rows.length} rows` : ''}
          </Button>
          <Button
            type='primary'
            disabled={!ready}
            loading={busy && ready}
            onClick={() => send(false)}
          >
            Import
          </Button>
        </Space>
      }
    >
      <p className='text-[var(--color-ink-muted)] mb-3'>
        One student per row with the columns{' '}
        <code>phone, first name, last name, student id, batch, section</code>.
        Batch and section are the names you use here (for example 2026 and A).
        Re-importing the same sheet changes nothing.
      </p>
      <Space className='mb-3' wrap>
        <Upload
          accept='.csv,text/csv'
          showUploadList={false}
          beforeUpload={async (file) => {
            read(await file.text())
            return false
          }}
        >
          <Button icon={<UploadIcon size={16} />}>Choose CSV file</Button>
        </Upload>
        <Button
          icon={<Download size={16} />}
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(ROSTER_TEMPLATE)}`}
          download='unisync-roster-template.csv'
        >
          Template
        </Button>
      </Space>
      <Input.TextArea
        rows={5}
        value={text}
        onChange={(e) => read(e.target.value)}
        placeholder={'Or paste from a spreadsheet:\n' + ROSTER_TEMPLATE}
        style={{ fontFamily: 'monospace' }}
      />

      {problem ? (
        <Alert
          type='error'
          showIcon
          message={problem}
          style={{ marginTop: 16 }}
        />
      ) : null}
      {checked && ready ? (
        <Alert
          type='success'
          showIcon
          style={{ marginTop: 16 }}
          message={`Ready: ${checked.created} new, ${checked.updated} updated, ${checked.unchanged} unchanged. Nothing is saved until you press Import.`}
        />
      ) : null}

      {checked ? (
        <Table<RowResult>
          style={{ marginTop: 16 }}
          size='small'
          rowKey='row'
          dataSource={checked.rows}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          columns={[
            { title: 'Row', dataIndex: 'row', width: 60 },
            { title: 'Phone', dataIndex: 'phone', width: 150 },
            {
              title: 'Result',
              dataIndex: 'outcome',
              width: 110,
              render: (o: string) => (
                <Tag color={OUTCOME[o]?.color}>{OUTCOME[o]?.label ?? o}</Tag>
              ),
            },
            {
              title: 'What to fix',
              dataIndex: 'errors',
              render: (errors: Record<string, string> | null) =>
                errors ? Object.values(errors).join(' ') : null,
            },
          ]}
        />
      ) : null}
    </Modal>
  )
}
