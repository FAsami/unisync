import React, { useState, useMemo } from 'react'
import {
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useMutation, useQuery } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  GET_ROUTINES_BY_SECTION,
  GET_COURSE_OFFERINGS_BY_SECTION,
  CREATE_ROUTINE,
  UPDATE_ROUTINE,
  DELETE_ROUTINE,
  GET_SECTION,
  Routine,
  GetRoutinesBySectionData,
  GetCourseOfferingsBySectionData,
} from '@/lib/graphql-operations'

import { SelectModal } from '@/components/ui/SelectModal'
import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { Input, InputField, InputSlot } from '@/components/ui/input'
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button'
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
} from '@/components/ui/form-control'
import {
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from '@/components/ui/toast'
import { Modal, ModalBackdrop, ModalContent } from '@/components/ui/modal'
import { useTheme } from '@/contexts/ThemeContext'
import { useHaptics } from '@/hooks/useHaptics'

const routineSchema = z.object({
  course_offering_id: z.string().min(1, { message: 'Course is required' }),
  day_of_week: z.coerce.number().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, {
    message: 'Format should be HH:MM (e.g., 09:00)',
  }),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, {
    message: 'Format should be HH:MM (e.g., 10:30)',
  }),
  event_type: z.string().min(1, { message: 'Event type is required' }),
  room_number: z.string().optional(),
})

type RoutineFormValues = z.infer<typeof routineSchema>

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
const EVENT_TYPES = ['lecture', 'lab', 'tutorial', 'seminar', 'exam']
const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
]

const ClassRoutineScreen = () => {
  const { id: sectionId } = useLocalSearchParams()
  const haptics = useHaptics()
  const toast = useToast()
  const { currentMode } = useTheme()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null)
  const [selectedDay, setSelectedDay] = useState<number>(1) // Default to Monday
  const [isOfferingModalOpen, setIsOfferingModalOpen] = useState(false)
  const [isEventTypeModalOpen, setIsEventTypeModalOpen] = useState(false)

  const { data: sectionData } = useQuery(GET_SECTION, {
    variables: { id: sectionId },
  })

  const {
    data: routinesData,
    loading: routinesLoading,
    refetch,
  } = useQuery<GetRoutinesBySectionData>(GET_ROUTINES_BY_SECTION, {
    variables: { sectionId },
    skip: !sectionId,
  })

  const { data: offeringsData } = useQuery<GetCourseOfferingsBySectionData>(
    GET_COURSE_OFFERINGS_BY_SECTION,
    {
      variables: { sectionId },
      skip: !sectionId,
    }
  )

  const [createRoutine, { loading: createLoading }] =
    useMutation(CREATE_ROUTINE)
  const [updateRoutine, { loading: updateLoading }] =
    useMutation(UPDATE_ROUTINE)
  const [deleteRoutine, { loading: deleteLoading }] =
    useMutation(DELETE_ROUTINE)

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<RoutineFormValues>({
    defaultValues: {
      course_offering_id: '',
      day_of_week: 1,
      start_time: '09:00',
      end_time: '10:30',
      event_type: 'lecture',
      room_number: '',
    },
    resolver: zodResolver(routineSchema) as any,
  })

  const watchedOfferingId = watch('course_offering_id')
  const watchedEventType = watch('event_type')

  const routines = routinesData?.event_routine || []
  const offerings = offeringsData?.academic_course_offering || []
  const section = sectionData?.academic_section_by_pk

  // Group routines by day
  const routinesByDay = useMemo(() => {
    const grouped: { [key: number]: Routine[] } = {}
    routines.forEach((routine) => {
      if (!grouped[routine.day_of_week]) {
        grouped[routine.day_of_week] = []
      }
      grouped[routine.day_of_week].push(routine)
    })
    // Sort by start time
    Object.keys(grouped).forEach((day) => {
      grouped[parseInt(day)].sort((a, b) =>
        a.start_time.localeCompare(b.start_time)
      )
    })
    return grouped
  }, [routines])

  const getOfferingDisplayName = () => {
    if (!watchedOfferingId) return 'Select Course'
    const offering = offerings.find((o) => o.id === watchedOfferingId)
    return offering
      ? `${offering.course?.code} - ${offering.course?.name}`
      : 'Unknown Course'
  }

  const getColorForCourse = (courseId?: string) => {
    if (!courseId) return COLORS[0]
    const index =
      offerings.findIndex((o) => o.course_id === courseId) % COLORS.length
    return COLORS[index]
  }

  const showToast = (
    title: string,
    description: string,
    action: 'success' | 'error' = 'success'
  ) => {
    toast.show({
      placement: 'top',
      render: ({ id }) => (
        <Toast
          nativeID={id}
          action={action}
          variant="outline"
          className="mt-12 bg-white dark:bg-background-50 rounded-xl border-outline-100"
        >
          <VStack space="xs">
            <ToastTitle className="font-semibold text-typography-900">
              {title}
            </ToastTitle>
            <ToastDescription className="text-typography-600">
              {description}
            </ToastDescription>
          </VStack>
        </Toast>
      ),
    })
  }

  const openCreateModal = (dayOfWeek?: number) => {
    setEditingRoutine(null)
    const currentDay = dayOfWeek ?? new Date().getDay()
    setSelectedDay(currentDay)
    reset({
      course_offering_id: '',
      day_of_week: currentDay,
      start_time: '09:00',
      end_time: '10:30',
      event_type: 'lecture',
      room_number: '',
    })
    setIsModalOpen(true)
    haptics.light()
  }

  const openEditModal = (routine: Routine) => {
    setEditingRoutine(routine)
    reset({
      course_offering_id: routine.course_offering_id || '',
      day_of_week: routine.day_of_week,
      start_time: routine.start_time.substring(0, 5),
      end_time: routine.end_time.substring(0, 5),
      event_type: routine.event_type,
      room_number: (routine.metadata as any)?.room_number || '',
    })
    setIsModalOpen(true)
    haptics.light()
  }

  const handleDelete = (routine: Routine) => {
    haptics.medium()
    Alert.alert('Delete Time Slot', `Remove ${routine.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRoutine({
              variables: { id: routine.id },
              refetchQueries: [
                {
                  query: GET_ROUTINES_BY_SECTION,
                  variables: { sectionId },
                },
              ],
            })
            haptics.success()
            showToast('Success', 'Time slot deleted')
          } catch (err) {
            haptics.error()
            console.error('Error deleting routine:', err)
            showToast('Error', 'Failed to delete time slot', 'error')
          }
        },
      },
    ])
  }

  const onSubmit = async (data: RoutineFormValues) => {
    haptics.medium()
    try {
      const offering = offerings.find((o) => o.id === data.course_offering_id)
      const courseName = offering?.course?.name || 'Class'

      // Get current semester dates (you may want to make this configurable)
      const today = new Date()
      const effectiveFrom = new Date(today.getFullYear(), 0, 1)
        .toISOString()
        .split('T')[0]
      const effectiveTo = new Date(today.getFullYear(), 11, 31)
        .toISOString()
        .split('T')[0]

      if (editingRoutine) {
        await updateRoutine({
          variables: {
            id: editingRoutine.id,
            set: {
              course_offering_id: data.course_offering_id,
              day_of_week: data.day_of_week,
              start_time: data.start_time + ':00+06',
              end_time: data.end_time + ':00+06',
              event_type: data.event_type,
              name: `${courseName} - ${data.event_type}`,
              metadata: data.room_number
                ? { room_number: data.room_number }
                : null,
            },
          },
          refetchQueries: [
            {
              query: GET_ROUTINES_BY_SECTION,
              variables: { sectionId },
            },
          ],
        })
        showToast('Success', 'Time slot updated')
      } else {
        await createRoutine({
          variables: {
            object: {
              course_offering_id: data.course_offering_id,
              day_of_week: data.day_of_week,
              start_time: data.start_time + ':00+06',
              end_time: data.end_time + ':00+06',
              event_type: data.event_type,
              name: `${courseName} - ${data.event_type}`,
              effective_from: effectiveFrom,
              effective_to: effectiveTo,
              is_active: true,
              metadata: data.room_number
                ? { room_number: data.room_number }
                : null,
            },
          },
          refetchQueries: [
            {
              query: GET_ROUTINES_BY_SECTION,
              variables: { sectionId },
            },
          ],
        })
        showToast('Success', 'Time slot created')
      }
      haptics.success()
      setIsModalOpen(false)
    } catch (err: any) {
      haptics.error()
      console.error('Error saving routine:', err)
      showToast('Error', err.message || 'Failed to save time slot', 'error')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <HStack className="items-center justify-between px-4 py-3 bg-white dark:bg-background-900 border-b border-outline-100 dark:border-outline-800">
        <HStack className="items-center flex-1">
          <TouchableOpacity
            onPress={() => {
              haptics.light()
              router.back()
            }}
            className="p-2 rounded-full mr-2"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={currentMode === 'dark' ? '#F1F5F9' : '#1E293B'}
            />
          </TouchableOpacity>
          <VStack className="flex-1">
            <Heading size="md" className="font-bold text-typography-900">
              Class Schedule
            </Heading>
            {section && (
              <Text className="text-xs text-typography-500">
                {section.name} • {routines.length} time slot
                {routines.length !== 1 ? 's' : ''}
              </Text>
            )}
          </VStack>
        </HStack>
        <Button
          variant="link"
          onPress={() => openCreateModal()}
          className="flex-row items-center"
        >
          <Ionicons name="add" size={20} color="#8B5CF6" />
          <ButtonText className="text-primary-500 font-bold ml-1">
            Add
          </ButtonText>
        </Button>
      </HStack>

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={routinesLoading}
            onRefresh={refetch}
            tintColor={currentMode === 'dark' ? '#fff' : '#000'}
          />
        }
      >
        {routinesLoading && routines.length === 0 ? (
          <ActivityIndicator className="mt-20" size="large" color="#8B5CF6" />
        ) : offerings.length === 0 ? (
          <Box className="items-center justify-center py-20">
            <Box className="bg-warning-500/10 p-4 rounded-full mb-4">
              <Ionicons name="alert-circle-outline" size={32} color="#F59E0B" />
            </Box>
            <Heading size="sm" className="text-typography-900 mb-2">
              No Course Offerings
            </Heading>
            <Text className="text-typography-500 text-center mb-6">
              Add course offerings first before creating a schedule
            </Text>
            <Button
              className="rounded-full bg-primary-500"
              onPress={() => {
                haptics.light()
                router.push(`/manage/sections/offerings?id=${sectionId}`)
              }}
            >
              <ButtonText>Manage Offerings</ButtonText>
            </Button>
          </Box>
        ) : (
          <VStack space="lg">
            {/* Day-by-day schedule */}
            {[6, 0, 1, 2, 3, 4, 5].map((dayIndex) => {
              const day = DAYS[dayIndex]
              const dayRoutines = routinesByDay[dayIndex] || []

              return (
                <VStack key={day} space="sm">
                  <HStack className="justify-between items-center mb-2">
                    <Text className="text-sm font-bold uppercase tracking-widest text-typography-500">
                      {day}
                    </Text>
                  </HStack>

                  {dayRoutines.length === 0 ? (
                    <Box className="bg-background-50 dark:bg-background-900 rounded-xl p-6 border border-dashed border-outline-200 dark:border-outline-800">
                      <Text className="text-typography-400 text-center text-sm">
                        No classes scheduled
                      </Text>
                    </Box>
                  ) : (
                    <VStack space="sm">
                      {dayRoutines.map((routine) => {
                        const color = getColorForCourse(
                          routine.course_offering?.course?.id
                        )
                        return (
                          <TouchableOpacity
                            key={routine.id}
                            onPress={() => openEditModal(routine)}
                            className="bg-white dark:bg-background-900 rounded-xl overflow-hidden border border-outline-100 dark:border-outline-800"
                            style={{
                              borderLeftWidth: 4,
                              borderLeftColor: color,
                            }}
                          >
                            <HStack className="p-3 justify-between items-start">
                              <VStack className="flex-1 pr-3">
                                <HStack className="items-center mb-1">
                                  <Text
                                    className="font-bold text-sm mr-2"
                                    style={{ color }}
                                  >
                                    {routine.course_offering?.course?.code}
                                  </Text>
                                  <Box
                                    className="px-2 py-0.5 rounded-md"
                                    style={{ backgroundColor: color + '20' }}
                                  >
                                    <Text
                                      className="text-xs font-medium uppercase"
                                      style={{ color }}
                                    >
                                      {routine.event_type}
                                    </Text>
                                  </Box>
                                </HStack>
                                <Text className="text-typography-900 font-semibold text-sm mb-1">
                                  {routine.course_offering?.course?.name}
                                </Text>
                                <HStack className="items-center">
                                  <Ionicons
                                    name="time-outline"
                                    size={14}
                                    color="#64748B"
                                  />
                                  <Text className="text-typography-600 text-xs ml-1">
                                    {routine.start_time.substring(0, 5)} -{' '}
                                    {routine.end_time.substring(0, 5)}
                                  </Text>
                                  {(routine.metadata as any)?.room_number && (
                                    <>
                                      <Text className="text-typography-400 text-xs mx-1">
                                        •
                                      </Text>
                                      <Ionicons
                                        name="location-outline"
                                        size={14}
                                        color="#64748B"
                                      />
                                      <Text className="text-typography-600 text-xs ml-1">
                                        {(routine.metadata as any).room_number}
                                      </Text>
                                    </>
                                  )}
                                </HStack>
                              </VStack>
                              <TouchableOpacity
                                onPress={() => handleDelete(routine)}
                                className="p-2"
                              >
                                <Ionicons
                                  name="trash-outline"
                                  size={18}
                                  color="#EF4444"
                                />
                              </TouchableOpacity>
                            </HStack>
                          </TouchableOpacity>
                        )
                      })}
                    </VStack>
                  )}
                </VStack>
              )
            })}
          </VStack>
        )}
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalBackdrop />
        <ModalContent className="bg-white dark:bg-background-900 rounded-t-3xl max-h-[90%]">
          <VStack className="p-6" space="xl">
            <HStack className="justify-between items-center">
              <Heading size="lg" className="text-typography-900">
                {editingRoutine ? 'Edit Time Slot' : 'New Time Slot'}
              </Heading>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={currentMode === 'dark' ? '#F1F5F9' : '#1E293B'}
                />
              </TouchableOpacity>
            </HStack>

            <ScrollView>
              <VStack space="lg">
                {/* Course Offering Selection */}
                <Controller
                  control={control}
                  name="course_offering_id"
                  render={({ field: { value } }) => (
                    <FormControl isInvalid={!!errors.course_offering_id}>
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText className="text-typography-600 font-medium">
                          Course <Text className="text-error-500">*</Text>
                        </FormControlLabelText>
                      </FormControlLabel>
                      <TouchableOpacity
                        onPress={() => setIsOfferingModalOpen(true)}
                        className="flex-row items-center justify-between rounded-xl border border-outline-200 h-14 px-3"
                      >
                        <HStack className="items-center flex-1">
                          <Ionicons
                            name="book-outline"
                            size={18}
                            color="#94A3B8"
                          />
                          <Text
                            className={`ml-2 text-sm flex-1 ${
                              value
                                ? 'text-typography-900'
                                : 'text-typography-400'
                            }`}
                            numberOfLines={1}
                          >
                            {getOfferingDisplayName()}
                          </Text>
                        </HStack>
                        <Ionicons
                          name="chevron-down"
                          size={18}
                          color="#94A3B8"
                        />
                      </TouchableOpacity>
                      <FormControlError>
                        <FormControlErrorText>
                          {errors.course_offering_id?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />

                {/* Day of Week */}
                <Controller
                  control={control}
                  name="day_of_week"
                  render={({ field: { onChange, value } }) => (
                    <FormControl>
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText className="text-typography-600 font-medium">
                          Day
                        </FormControlLabelText>
                      </FormControlLabel>
                      <HStack space="xs" className="flex-wrap">
                        {[6, 0, 1, 2, 3, 4, 5].map((dayIndex) => {
                          const day = DAYS[dayIndex]
                          const dayValue = dayIndex // Value matches index
                          const isSelected = value === dayValue
                          return (
                            <TouchableOpacity
                              key={day}
                              onPress={() => onChange(dayValue)}
                              className={`px-4 py-2 rounded-lg border mb-2 ${
                                isSelected
                                  ? 'bg-primary-500 border-primary-500'
                                  : 'bg-white dark:bg-background-900 border-outline-200'
                              }`}
                            >
                              <Text
                                className={`text-sm font-semibold ${
                                  isSelected
                                    ? 'text-white'
                                    : 'text-typography-900'
                                }`}
                              >
                                {day.substring(0, 3)}
                              </Text>
                            </TouchableOpacity>
                          )
                        })}
                      </HStack>
                    </FormControl>
                  )}
                />

                {/* Time Range */}
                <HStack space="md">
                  <Controller
                    control={control}
                    name="start_time"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <FormControl
                        isInvalid={!!errors.start_time}
                        className="flex-1"
                      >
                        <FormControlLabel className="mb-1">
                          <FormControlLabelText className="text-typography-600 font-medium">
                            Start Time <Text className="text-error-500">*</Text>
                          </FormControlLabelText>
                        </FormControlLabel>
                        <Input className="rounded-xl border-outline-200 bg-transparent h-14">
                          <InputSlot className="pl-3">
                            <Ionicons
                              name="time-outline"
                              size={18}
                              color="#94A3B8"
                            />
                          </InputSlot>
                          <InputField
                            placeholder="09:00"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            className="text-sm"
                          />
                        </Input>
                        <FormControlError>
                          <FormControlErrorText>
                            {errors.start_time?.message}
                          </FormControlErrorText>
                        </FormControlError>
                      </FormControl>
                    )}
                  />

                  <Controller
                    control={control}
                    name="end_time"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <FormControl
                        isInvalid={!!errors.end_time}
                        className="flex-1"
                      >
                        <FormControlLabel className="mb-1">
                          <FormControlLabelText className="text-typography-600 font-medium">
                            End Time <Text className="text-error-500">*</Text>
                          </FormControlLabelText>
                        </FormControlLabel>
                        <Input className="rounded-xl border-outline-200 bg-transparent h-14">
                          <InputSlot className="pl-3">
                            <Ionicons
                              name="time-outline"
                              size={18}
                              color="#94A3B8"
                            />
                          </InputSlot>
                          <InputField
                            placeholder="10:30"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            className="text-sm"
                          />
                        </Input>
                        <FormControlError>
                          <FormControlErrorText>
                            {errors.end_time?.message}
                          </FormControlErrorText>
                        </FormControlError>
                      </FormControl>
                    )}
                  />
                </HStack>

                {/* Event Type */}
                <Controller
                  control={control}
                  name="event_type"
                  render={({ field: { value } }) => (
                    <FormControl isInvalid={!!errors.event_type}>
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText className="text-typography-600 font-medium">
                          Event Type <Text className="text-error-500">*</Text>
                        </FormControlLabelText>
                      </FormControlLabel>
                      <TouchableOpacity
                        onPress={() => setIsEventTypeModalOpen(true)}
                        className="flex-row items-center justify-between rounded-xl border border-outline-200 h-14 px-3"
                      >
                        <HStack className="items-center">
                          <Ionicons
                            name="pricetag-outline"
                            size={18}
                            color="#94A3B8"
                          />
                          <Text
                            className={`ml-2 text-sm capitalize ${
                              value
                                ? 'text-typography-900'
                                : 'text-typography-400'
                            }`}
                          >
                            {value || 'Select Type'}
                          </Text>
                        </HStack>
                        <Ionicons
                          name="chevron-down"
                          size={18}
                          color="#94A3B8"
                        />
                      </TouchableOpacity>
                      <FormControlError>
                        <FormControlErrorText>
                          {errors.event_type?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />

                {/* Room Number */}
                <Controller
                  control={control}
                  name="room_number"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl>
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText className="text-typography-600 font-medium">
                          Room Number (Optional)
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input className="rounded-xl border-outline-200 bg-transparent h-14">
                        <InputSlot className="pl-3">
                          <Ionicons
                            name="location-outline"
                            size={18}
                            color="#94A3B8"
                          />
                        </InputSlot>
                        <InputField
                          placeholder="e.g., Room 301"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          className="text-sm"
                        />
                      </Input>
                    </FormControl>
                  )}
                />

                <Button
                  className="mt-4 rounded-full bg-primary-500 h-14"
                  onPress={handleSubmit(onSubmit)}
                  isDisabled={createLoading || updateLoading}
                >
                  {createLoading || updateLoading ? (
                    <ButtonSpinner color="white" />
                  ) : (
                    <ButtonText className="font-bold">
                      {editingRoutine ? 'Update Time Slot' : 'Create Time Slot'}
                    </ButtonText>
                  )}
                </Button>
              </VStack>
            </ScrollView>
          </VStack>
        </ModalContent>
      </Modal>

      {/* Course Offering Selection Modal */}
      <SelectModal
        isOpen={isOfferingModalOpen}
        onClose={() => setIsOfferingModalOpen(false)}
        title="Select Course"
        items={offerings}
        loading={false}
        onSelect={(item: any) => {
          setValue('course_offering_id', item.id, { shouldValidate: true })
        }}
        keyExtractor={(item) => item.id}
        renderItem={(item: any, isSelected) => (
          <VStack>
            <Text
              className={`text-base ${
                isSelected
                  ? 'font-bold text-primary-600'
                  : 'text-typography-900'
              }`}
            >
              {item.course?.code} - {item.course?.name}
            </Text>
            <Text className="text-xs text-typography-500">
              {item.account?.faculties?.[0]
                ? `${item.account.faculties[0].first_name} ${item.account.faculties[0].last_name}`
                : item.account?.email}
            </Text>
          </VStack>
        )}
        selectedItem={watchedOfferingId ? { id: watchedOfferingId } : undefined}
      />

      {/* Event Type Selection Modal */}
      <SelectModal
        isOpen={isEventTypeModalOpen}
        onClose={() => setIsEventTypeModalOpen(false)}
        title="Select Event Type"
        items={EVENT_TYPES.map((type) => ({ id: type, name: type }))}
        loading={false}
        onSelect={(item: any) => {
          setValue('event_type', item.id, { shouldValidate: true })
        }}
        keyExtractor={(item) => item.id}
        renderItem={(item: any, isSelected) => (
          <Text
            className={`text-base capitalize ${
              isSelected ? 'font-bold text-primary-600' : 'text-typography-900'
            }`}
          >
            {item.name}
          </Text>
        )}
        selectedItem={watchedEventType ? { id: watchedEventType } : undefined}
      />
    </SafeAreaView>
  )
}

export default ClassRoutineScreen
