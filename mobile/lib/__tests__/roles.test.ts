import { canSend, roleLabel } from '../roles'

it('gives the Send tab to teachers, department admins and CRs only', () => {
  expect(canSend('teacher')).toBe(true)
  expect(canSend('admin')).toBe(true)
  expect(canSend('student')).toBe(false)
  expect(canSend('student', true)).toBe(true)
  expect(canSend('class_representative')).toBe(true) // older tokens
  expect(canSend(null)).toBe(false)
})

it('labels roles, with CR as a mark on a student', () => {
  expect(roleLabel('student')).toBe('Student')
  expect(roleLabel('student', true)).toBe('Student · CR')
  expect(roleLabel('admin')).toBe('Department admin')
  expect(roleLabel('teacher')).toBe('Teacher')
})
