/** Parses CSV text (RFC 4180 quoting, comma or semicolon) into rows of cells. */
export const parseCsv = (text: string): string[][] => {
  const source = text.replace(/^﻿/, '')
  const firstLine = source.split(/\r?\n/, 1)[0] ?? ''
  const delimiter =
    (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0)
      ? ';'
      : ','
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let i = 0; i < source.length; i++) {
    const ch = source[i]
    if (quoted) {
      if (ch === '"' && source[i + 1] === '"') {
        cell += '"'
        i++
      } else if (ch === '"') {
        quoted = false
      } else {
        cell += ch
      }
    } else if (ch === '"') {
      quoted = true
    } else if (ch === delimiter) {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && source[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += ch
    }
  }
  row.push(cell)
  rows.push(row)
  return rows
    .map((r) => r.map((c) => c.trim()))
    .filter((r) => r.some((c) => c !== ''))
}

const normalise = (header: string) =>
  header.toLowerCase().replace(/[^a-z]/g, '')

const COLUMNS = {
  phone: ['phone', 'mobile', 'mobilenumber', 'phonenumber', 'number'],
  firstName: ['firstname', 'first', 'givenname'],
  lastName: ['lastname', 'last', 'surname', 'familyname'],
  studentId: ['studentid', 'id', 'roll', 'rollno', 'rollnumber'],
  batch: ['batch'],
  section: ['section'],
} as const

const REQUIRED = {
  phone: 'phone',
  firstName: 'first name',
  lastName: 'last name',
  batch: 'batch',
  section: 'section',
}

export type RosterRow = {
  phone: string
  firstName: string
  lastName: string
  studentId: string | null
  batch: string | null
  section: string | null
}

/**
 * Reads a roster sheet with a header row. Returns the rows, or the names of
 * the required columns it could not find.
 */
export const parseRoster = (
  text: string
): { rows: RosterRow[]; missing: string[] } => {
  const [header, ...body] = parseCsv(text)
  if (!header) return { rows: [], missing: [] }
  const index = Object.fromEntries(
    Object.entries(COLUMNS).map(([key, names]) => [
      key,
      header.findIndex((h) =>
        (names as readonly string[]).includes(normalise(h))
      ),
    ])
  ) as Record<keyof typeof COLUMNS, number>

  const missing = Object.entries(REQUIRED)
    .filter(([key]) => index[key as keyof typeof COLUMNS] < 0)
    .map(([, label]) => label)
  if (missing.length > 0) return { rows: [], missing }

  const cell = (row: string[], key: keyof typeof COLUMNS) =>
    index[key] >= 0 ? (row[index[key]] ?? '') : ''
  return {
    missing: [],
    rows: body.map((row) => ({
      phone: cell(row, 'phone'),
      firstName: cell(row, 'firstName'),
      lastName: cell(row, 'lastName'),
      studentId: cell(row, 'studentId') || null,
      batch: cell(row, 'batch') || null,
      section: cell(row, 'section') || null,
    })),
  }
}

export const ROSTER_TEMPLATE =
  'phone,first name,last name,student id,batch,section\n01712345678,Ada,Rahman,2026-001,2026,A\n'
