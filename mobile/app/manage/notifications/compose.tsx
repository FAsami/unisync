import React, { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Heading } from '@/components/ui/heading'
import { HStack } from '@/components/ui/hstack'
import { Icon } from '@/components/ui/icon'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { AuthSubmitButton } from '@/components/auth'
import { FieldError, Label, Notice, TextField } from '@/components/signin/Fields'
import { api, ApiError, call, unwrap, unwrapWithMessage } from '@/lib/api'
import type { components } from '@/lib/api/generated'

type Audience = components['schemas']['AudienceOption']

// The API's limits (NotificationEndpoints).
const MAX_TITLE = 100
const MAX_BODY = 1000

const audienceIcon: Record<string, string> = { section: 'people-outline', batch: 'school-outline', department: 'business-outline' }

/**
 * Send a notice to one audience the API says I may address (GET /notifications/audiences):
 * a teacher their sections, a CR their own section, a department admin the
 * department, its batches and sections. It lands in each inbox and as a push.
 */
export default function ComposeScreen() {
  const [audiences, setAudiences] = useState<Audience[]>()
  const [audience, setAudience] = useState<Audience>()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [problem, setProblem] = useState<ApiError>()
  const [sent, setSent] = useState<string>()
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const options = await call(async () => unwrap(await api.GET('/api/v1/notifications/audiences')))
        setAudiences(options)
        if (options.length === 1) setAudience(options[0])
      } catch (error) {
        setProblem(error as ApiError)
      }
    })()
  }, [])

  const submit = async () => {
    const found: Record<string, string> = {}
    if (!audience) found.audience = 'Choose who gets it.'
    if (!title.trim()) found.title = 'Give it a short title.'
    if (!body.trim()) found.body = 'Write the message.'
    setErrors(found)
    if (Object.keys(found).length) return

    setBusy(true)
    setProblem(undefined)
    try {
      const { data, message } = await call(async () =>
        unwrapWithMessage(
          await api.POST('/api/v1/notifications', {
            body: { title: title.trim(), body: body.trim(), audience: { type: audience!.type, id: audience!.id } },
          })
        )
      )
      const count = Number(data.recipients)
      setSent(message || `Sent to ${count} ${count === 1 ? 'person' : 'people'}.`)
      setTitle('')
      setBody('')
    } catch (error) {
      const e = error as ApiError
      setErrors(e.fieldErrors)
      setProblem(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
      <HStack className="items-center px-2 py-2">
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" className="p-3">
          <Icon as={Ionicons} name="arrow-back" size={22} className="text-typography-900" />
        </Pressable>
        <Heading size="md" className="text-typography-900">
          Send a notice
        </Heading>
      </HStack>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <VStack space="lg">
            {sent ? (
              <Notice message={sent} tone="success" action={{ label: 'See sent notices', onPress: () => router.replace('/manage/notifications/history') }} />
            ) : null}

            <View>
              <Label>Send to</Label>
              {!audiences && !problem ? <Spinner className="self-start my-2" /> : null}
              {audiences?.length === 0 ? (
                <Text className="text-typography-500">There&apos;s no one you can send to yet. Your department links you to sections on the web dashboard.</Text>
              ) : null}
              <VStack className="rounded-xl border border-outline-200 overflow-hidden">
                {audiences?.map((a, i) => {
                  const selected = audience?.type === a.type && audience.id === a.id
                  const count = Number(a.recipients)
                  return (
                    <Pressable
                      key={`${a.type}-${a.id}`}
                      onPress={() => setAudience(a)}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      accessibilityLabel={`${a.label}, ${count} ${count === 1 ? 'person' : 'people'}`}
                      className={`flex-row items-center px-3 min-h-[56px] ${i ? 'border-t border-outline-100 dark:border-outline-800' : ''} ${
                        selected ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                      }`}
                    >
                      <Icon as={Ionicons} name={audienceIcon[a.type] ?? 'people-outline'} size={20} className="text-typography-500 mr-3" />
                      <VStack className="flex-1">
                        <Text className="text-typography-900 font-semibold">{a.label}</Text>
                        <Text className="text-typography-500 text-xs">
                          {count} {count === 1 ? 'person' : 'people'}
                        </Text>
                      </VStack>
                      <Icon
                        as={Ionicons}
                        name={selected ? 'radio-button-on' : 'radio-button-off'}
                        size={22}
                        className={selected ? 'text-primary-600' : 'text-typography-300'}
                      />
                    </Pressable>
                  )
                })}
              </VStack>
              <FieldError message={errors.audience} />
            </View>

            <TextField
              label="Title"
              value={title}
              onChange={(t) => setTitle(t.slice(0, MAX_TITLE))}
              error={errors.title}
              placeholder="e.g. Quiz on Thursday"
              autoCapitalize="sentences"
              maxLength={MAX_TITLE}
            />
            <TextField
              label="Message"
              value={body}
              onChange={setBody}
              error={errors.body}
              placeholder="What do students need to know?"
              autoCapitalize="sentences"
              multiline
              maxLength={MAX_BODY}
            />

            {problem ? <Notice message={problem.message} /> : null}
            <AuthSubmitButton onPress={submit} isLoading={busy} text="Send" disabled={audiences?.length === 0} />
            <Text className="text-typography-500 text-center text-sm">It goes to their inbox and as a push notification.</Text>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
