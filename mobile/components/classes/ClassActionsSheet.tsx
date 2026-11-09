import React, { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft, Building2, Undo2, XCircle, ArrowLeftRight, type LucideIcon } from 'lucide-react-native'
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { HStack } from '@/components/ui/hstack'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { Notice, PickerField, TextField } from '@/components/signin/Fields'
import { api, ApiError, call, unwrap, unwrapWithMessage } from '@/lib/api'
import type { components } from '@/lib/api/generated'
import { actionLabel, availableActions, changeTarget, normaliseTime, validateMove, type ClassAction, type MoveForm } from '@/lib/classChanges'
import { classTitle, hhmm, shortDate, type ClassOccurrence } from '@/lib/schedule'

type Room = components['schemas']['RoomView']
type Mode = 'menu' | ClassAction | 'pick-room'

const actionIcon: Record<ClassAction, LucideIcon> = {
  cancel: XCircle,
  move: ArrowLeftRight,
  room: Building2,
  undo: Undo2,
}

function PrimaryButton({ text, onPress, busy, tone = 'primary' }: { text: string; onPress: () => void; busy: boolean; tone?: 'primary' | 'danger' }) {
  return (
    <Button
      onPress={onPress}
      isDisabled={busy}
      className={`w-full rounded-full h-14 ${tone === 'danger' ? 'bg-error-600 active:bg-error-700' : 'bg-primary-500 active:bg-primary-700'}`}
    >
      {busy ? <ButtonSpinner color="#fff" className="mr-2" /> : null}
      <ButtonText className="font-bold text-white text-lg">{text}</ButtonText>
    </Button>
  )
}

/**
 * Day-of-class actions (UX review decision 3) for one class: cancel, move,
 * change room, or undo. Every change notifies the section, so each form asks
 * for the reason students will read. The server checks who may change it and
 * any clash; its message is shown as is.
 */
export function ClassActionsSheet({
  cls,
  onClose,
  onChanged,
}: {
  cls: ClassOccurrence | null
  onClose: () => void
  /** Called with the server's confirmation after a change, so the screen can reload. */
  onChanged: (message: string) => void
}) {
  const insets = useSafeAreaInsets()
  const [mode, setMode] = useState<Mode>('menu')
  const [reason, setReason] = useState('')
  const [move, setMove] = useState<Omit<MoveForm, 'reason'>>({ date: '', start: '', end: '' })
  const [room, setRoom] = useState<Room>()
  const [rooms, setRooms] = useState<Room[]>()
  const [returnTo, setReturnTo] = useState<'move' | 'room'>('room')
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState<ApiError>()
  const [errors, setErrors] = useState<Record<string, string>>({})

  // A fresh sheet for each class.
  useEffect(() => {
    if (!cls) return
    setMode('menu')
    setReason('')
    setMove({ date: cls.date, start: hhmm(cls.start), end: hhmm(cls.end) })
    setRoom(undefined)
    setProblem(undefined)
    setErrors({})
  }, [cls])

  if (!cls) return null
  const target = changeTarget(cls)
  const path = { routineId: target.routineId, date: target.date }

  const openRooms = async (from: 'move' | 'room') => {
    setReturnTo(from)
    setMode('pick-room')
    if (rooms) return
    try {
      setRooms(await call(async () => unwrap(await api.GET('/api/v1/rooms'))))
    } catch (error) {
      setProblem(error as ApiError)
    }
  }

  const run = async (send: () => Promise<{ message: string }>) => {
    setBusy(true)
    setProblem(undefined)
    try {
      const { message } = await send()
      onChanged(message)
    } catch (error) {
      const e = error as ApiError
      setErrors(e.fieldErrors)
      setProblem(e)
    } finally {
      setBusy(false)
    }
  }

  const send = (request: () => Promise<Parameters<typeof unwrapWithMessage>[0]>) =>
    call(async () => {
      const { message } = unwrapWithMessage(await request())
      return { message: message || 'Done. The section has been notified.' }
    })

  const submit = () => {
    const why = reason.trim()
    if (mode === 'cancel') {
      if (!why) return setErrors({ reason: 'Tell students why.' })
      return run(() => send(() => api.POST('/api/v1/classes/{routineId}/{date}/cancel', { params: { path }, body: { reason: why } })))
    }
    if (mode === 'move') {
      const found = validateMove({ ...move, reason })
      if (Object.keys(found).length) return setErrors(found as Record<string, string>)
      return run(() =>
        send(() =>
          api.POST('/api/v1/classes/{routineId}/{date}/move', {
            params: { path },
            body: { date: move.date.trim(), start: normaliseTime(move.start)!, end: normaliseTime(move.end)!, roomId: room?.id ?? null, reason: why },
          })
        )
      )
    }
    if (mode === 'room') {
      const found: Record<string, string> = {}
      if (!room) found.roomId = 'Choose the new room.'
      if (!why) found.reason = 'Tell students why.'
      if (Object.keys(found).length) return setErrors(found)
      return run(() => send(() => api.POST('/api/v1/classes/{routineId}/{date}/room', { params: { path }, body: { roomId: room!.id, reason: why } })))
    }
    if (mode === 'undo') {
      return run(() => send(() => api.DELETE('/api/v1/classes/{routineId}/{date}', { params: { path } })))
    }
  }

  const title = mode === 'menu' ? classTitle(cls) : mode === 'pick-room' ? 'Choose a room' : actionLabel[mode]
  const reasonField = (
    <TextField
      label="Reason (students will see it)"
      value={reason}
      onChange={setReason}
      error={errors.reason}
      placeholder="e.g. Teacher unwell"
      autoCapitalize="none"
    />
  )

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose} accessibilityLabel="Close" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          className="bg-white dark:bg-background-900 rounded-t-xl px-5 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16), maxHeight: 640 }}
        >
          <View className="self-center w-10 h-1 rounded-full bg-outline-200 mb-4" />
          <HStack className="items-center mb-1">
            {mode !== 'menu' ? (
              <Pressable
                onPress={() => setMode(mode === 'pick-room' ? returnTo : 'menu')}
                accessibilityRole="button"
                accessibilityLabel="Back"
                className="mr-2 p-1"
              >
                <Icon as={ArrowLeft} size={22} className="text-typography-700" />
              </Pressable>
            ) : null}
            <Heading size="md" className="text-typography-900 flex-1" numberOfLines={1}>
              {title}
            </Heading>
          </HStack>
          <Text className="text-typography-500 mb-4">
            {shortDate(cls.date)}, {hhmm(cls.start)}–{hhmm(cls.end)} · Section {cls.section.name}
          </Text>

          <ScrollView keyboardShouldPersistTaps="handled">
            {mode === 'menu' ? (
              <VStack>
                {availableActions(cls).map((action) => (
                  <Pressable
                    key={action}
                    onPress={() => {
                      setErrors({})
                      setProblem(undefined)
                      setMode(action)
                    }}
                    accessibilityRole="button"
                    className="flex-row items-center min-h-[52px] border-b border-outline-100 dark:border-outline-800"
                  >
                    <Icon
                      as={actionIcon[action]}
                      size={22}
                      className={action === 'cancel' ? 'text-error-600 mr-3' : 'text-primary-600 mr-3'}
                    />
                    <Text className={`text-base font-semibold ${action === 'cancel' ? 'text-error-700' : 'text-typography-900'}`}>
                      {actionLabel[action]}
                    </Text>
                  </Pressable>
                ))}
                <Text className="text-typography-500 text-sm mt-4">Students in the section get a notice for every change.</Text>
              </VStack>
            ) : null}

            {mode === 'cancel' ? (
              <VStack space="lg">
                {reasonField}
                {problem ? <Notice message={problem.message} /> : null}
                <PrimaryButton text="Cancel class and notify" onPress={submit} busy={busy} tone="danger" />
              </VStack>
            ) : null}

            {mode === 'move' ? (
              <VStack space="lg">
                <TextField label="New date (YYYY-MM-DD)" value={move.date} onChange={(date) => setMove({ ...move, date })} error={errors.date} autoCapitalize="none" />
                <HStack space="md">
                  <View className="flex-1">
                    <TextField label="Starts" value={move.start} onChange={(start) => setMove({ ...move, start })} error={errors.start} placeholder="14:00" autoCapitalize="none" />
                  </View>
                  <View className="flex-1">
                    <TextField label="Ends" value={move.end} onChange={(end) => setMove({ ...move, end })} error={errors.end} placeholder="15:30" autoCapitalize="none" />
                  </View>
                </HStack>
                <PickerField
                  label="Room (optional)"
                  value={room?.label}
                  placeholder={cls.room ? `Keep ${cls.room}` : 'Keep the same room'}
                  onPress={() => openRooms('move')}
                  error={errors.roomId}
                />
                {reasonField}
                {problem ? <Notice message={problem.message} /> : null}
                <PrimaryButton text="Move class and notify" onPress={submit} busy={busy} />
              </VStack>
            ) : null}

            {mode === 'room' ? (
              <VStack space="lg">
                <PickerField label="New room" value={room?.label} placeholder="Choose a room" onPress={() => openRooms('room')} error={errors.roomId} />
                {reasonField}
                {problem ? <Notice message={problem.message} /> : null}
                <PrimaryButton text="Change room and notify" onPress={submit} busy={busy} />
              </VStack>
            ) : null}

            {mode === 'undo' ? (
              <VStack space="lg">
                <Text className="text-typography-700">
                  The class goes back to its usual time and room, and the section is told it&apos;s happening as normal.
                </Text>
                {problem ? <Notice message={problem.message} /> : null}
                <PrimaryButton text="Undo and notify" onPress={submit} busy={busy} />
              </VStack>
            ) : null}

            {mode === 'pick-room' ? (
              <VStack>
                {!rooms && !problem ? <Text className="text-typography-500">Loading rooms…</Text> : null}
                {problem ? <Notice message={problem.message} /> : null}
                {rooms?.length === 0 ? <Text className="text-typography-500">No rooms have been set up yet.</Text> : null}
                {/* A room change needs a different room; a move may keep the current one. */}
                {rooms?.filter((r) => returnTo === 'move' || r.id !== cls.roomId).map((r) => (
                  <Pressable
                    key={r.id}
                    onPress={() => {
                      setRoom(r)
                      setErrors({ ...errors, roomId: '' })
                      setMode(returnTo)
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: room?.id === r.id }}
                    className="min-h-[48px] justify-center border-b border-outline-100 dark:border-outline-800"
                  >
                    <Text className={room?.id === r.id ? 'font-bold text-primary-600' : 'text-typography-900'}>{r.label}</Text>
                  </Pressable>
                ))}
              </VStack>
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
