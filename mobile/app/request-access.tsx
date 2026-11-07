import React, { useEffect, useMemo, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { AuthHeader, AuthSubmitButton } from '@/components/auth'
import { SelectModal } from '@/components/ui/SelectModal'
import { CodeField, Notice, PhoneField, PickerField, TextField } from '@/components/signin/Fields'
import { SignInScreen } from '@/components/signin/SignInScreen'
import { api, ApiError, call, unwrap } from '@/lib/api'
import type { components } from '@/lib/api/generated'
import { formatPhone, normalizePhone } from '@/lib/phone'

type Department = components['schemas']['DepartmentItem']
type Picker = 'department' | 'batch' | 'section' | null

const CODE_LENGTH = 6

/**
 * For students missing from their department's roster: details → verify the
 * phone with a code → the department decides, and texts the result.
 */
export default function RequestAccess() {
  const router = useRouter()
  const params = useLocalSearchParams<{ phone?: string }>()

  const [directory, setDirectory] = useState<Department[]>()
  const [directoryError, setDirectoryError] = useState<ApiError>()
  const [local, setLocal] = useState(params.phone?.replace(/^\+880/, '') ?? '')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [departmentId, setDepartmentId] = useState<string>()
  const [batchId, setBatchId] = useState<string>()
  const [sectionId, setSectionId] = useState<string>()
  const [picker, setPicker] = useState<Picker>(null)

  const [step, setStep] = useState<'details' | 'code' | 'sent'>('details')
  const [code, setCode] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [problem, setProblem] = useState<ApiError>()
  const [busy, setBusy] = useState(false)

  const loadDirectory = async () => {
    setDirectoryError(undefined)
    try {
      setDirectory(await call(async () => unwrap(await api.GET('/api/v1/directory'))))
    } catch (error) {
      setDirectoryError(error as ApiError)
    }
  }

  useEffect(() => {
    void loadDirectory()
  }, [])

  const department = directory?.find((d) => d.id === departmentId)
  const batch = department?.batches.find((b) => b.id === batchId)
  const section = batch?.sections.find((s) => s.id === sectionId)
  const phone = useMemo(() => normalizePhone(local), [local])

  const checkDetails = (): boolean => {
    const next: Record<string, string> = {}
    if (!phone) next.phone = 'Enter your number, like 1712 345678.'
    if (!firstName.trim()) next.firstName = 'Enter your first name.'
    if (!lastName.trim()) next.lastName = 'Enter your last name.'
    if (!/^[A-Za-z0-9-]{1,32}$/.test(studentId.trim())) next.studentId = 'Enter your student ID (letters, numbers and dashes).'
    if (!sectionId) next.sectionId = 'Choose your department, batch and section.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const sendCode = async () => {
    setProblem(undefined)
    if (!checkDetails()) return
    setBusy(true)
    try {
      await call(async () => unwrap(await api.POST('/api/v1/access-requests/code', { body: { phone: phone! } })))
      setStep('code')
    } catch (error) {
      setProblem(error as ApiError)
    } finally {
      setBusy(false)
    }
  }

  const submit = async (value = code) => {
    if (value.length !== CODE_LENGTH || busy) return
    setProblem(undefined)
    setBusy(true)
    try {
      await call(async () =>
        unwrap(
          await api.POST('/api/v1/access-requests', {
            body: { phone: phone!, code: value, firstName: firstName.trim(), lastName: lastName.trim(), studentId: studentId.trim(), sectionId: sectionId ?? null },
          })
        )
      )
      setStep('sent')
    } catch (error) {
      const apiError = error as ApiError
      setCode('')
      if (apiError.code === 'VALIDATION_FAILED' && !apiError.fieldErrors.code) {
        setErrors(apiError.fieldErrors)
        setStep('details')
      }
      setProblem(apiError)
    } finally {
      setBusy(false)
    }
  }

  if (step === 'sent') {
    return (
      <SignInScreen>
        <VStack className="flex-1 justify-center" space="lg">
          <AuthHeader title="Request sent" subtitle={`${department?.name ?? 'Your department'} will review it. We'll text ${formatPhone(phone ?? '')} when they decide.`} />
          <AuthSubmitButton onPress={() => router.replace({ pathname: '/login', params: { phone: phone ?? undefined } })} text="Back to sign in" />
        </VStack>
      </SignInScreen>
    )
  }

  const problemNotice = problem ? (
    problem.code === 'ALREADY_REGISTERED' ? (
      <Notice message={problem.message} action={{ label: 'Sign in instead', onPress: () => router.replace({ pathname: '/login', params: { phone: phone ?? undefined } }) }} />
    ) : (
      <Notice message={problem.message} />
    )
  ) : null

  if (step === 'code') {
    return (
      <SignInScreen>
        <VStack className="flex-1 justify-center" space="lg">
          <AuthHeader title="Confirm your number" subtitle={`We texted a code to ${formatPhone(phone ?? '')}. Enter it to send your request.`} />
          <CodeField value={code} onChange={setCode} length={CODE_LENGTH} onComplete={submit} />
          {problemNotice}
          <AuthSubmitButton onPress={() => submit()} isLoading={busy} text="Send request" disabled={code.length !== CODE_LENGTH} />
          <AuthSubmitButton onPress={() => setStep('details')} text="Edit my details" />
        </VStack>
      </SignInScreen>
    )
  }

  return (
    <SignInScreen>
      <VStack space="lg">
        <AuthHeader title="Request access" subtitle="Your department checks these details before you can sign in." />

        <PhoneField value={local} onChange={setLocal} error={errors.phone} />
        <TextField label="First name" value={firstName} onChange={setFirstName} error={errors.firstName} />
        <TextField label="Last name" value={lastName} onChange={setLastName} error={errors.lastName} />
        <TextField label="Student ID" value={studentId} onChange={setStudentId} error={errors.studentId} autoCapitalize="characters" placeholder="e.g. 211000000" />

        {directoryError ? (
          <Notice message={directoryError.message} action={{ label: 'Try again', onPress: loadDirectory }} />
        ) : (
          <>
            <PickerField label="Department" value={department?.name} placeholder={directory ? 'Choose your department' : 'Loading…'} onPress={() => setPicker('department')} disabled={!directory} />
            <PickerField label="Batch" value={batch?.name} placeholder="Choose your batch" onPress={() => setPicker('batch')} disabled={!department} />
            <PickerField label="Section" value={section?.name} placeholder="Choose your section" onPress={() => setPicker('section')} disabled={!batch} error={errors.sectionId} />
          </>
        )}

        {problemNotice}
        <AuthSubmitButton onPress={sendCode} isLoading={busy} text="Continue" />
        <Text className="text-typography-500 text-center text-sm">We&apos;ll text you a code to confirm the number is yours.</Text>
      </VStack>

      <SelectModal
        isOpen={picker === 'department'}
        onClose={() => setPicker(null)}
        title="Department"
        items={directory ?? []}
        keyExtractor={(d) => d.id}
        renderItem={(d, selected) => <Text className={selected ? 'font-bold text-primary-600' : 'text-typography-900'}>{d.name} ({d.code})</Text>}
        selectedItem={department}
        onSelect={(d) => {
          setDepartmentId(d.id)
          setBatchId(undefined) // a new department invalidates the batch and section
          setSectionId(undefined)
          setPicker(null)
        }}
      />
      <SelectModal
        isOpen={picker === 'batch'}
        onClose={() => setPicker(null)}
        title="Batch"
        items={department?.batches ?? []}
        keyExtractor={(b) => b.id}
        renderItem={(b, selected) => <Text className={selected ? 'font-bold text-primary-600' : 'text-typography-900'}>{b.name}</Text>}
        selectedItem={batch}
        onSelect={(b) => {
          setBatchId(b.id)
          setSectionId(undefined)
          setPicker(null)
        }}
      />
      <SelectModal
        isOpen={picker === 'section'}
        onClose={() => setPicker(null)}
        title="Section"
        items={batch?.sections ?? []}
        keyExtractor={(s) => s.id}
        renderItem={(s, selected) => <Text className={selected ? 'font-bold text-primary-600' : 'text-typography-900'}>Section {s.name}</Text>}
        selectedItem={section}
        onSelect={(s) => {
          setSectionId(s.id)
          setPicker(null)
        }}
      />
    </SignInScreen>
  )
}
