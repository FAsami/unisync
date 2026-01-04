import React, { useState } from 'react'
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
  GET_COURSE_OFFERINGS_BY_SECTION,
  GET_ALL_COURSES,
  GET_ALL_FACULTIES_LIST,
  CREATE_COURSE_OFFERING,
  UPDATE_COURSE_OFFERING,
  DELETE_COURSE_OFFERING,
  GET_SECTION,
  CourseOffering,
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

const offeringSchema = z.object({
  course_id: z.string().min(1, { message: 'Course is required' }),
  teacher_id: z.string().min(1, { message: 'Teacher is required' }),
  academic_year: z
    .string()
    .min(1, { message: 'Academic year is required' })
    .regex(/^\d{4}-\d{4}$/, {
      message: 'Format should be YYYY-YYYY (e.g., 2024-2025)',
    }),
})

type OfferingFormValues = z.infer<typeof offeringSchema>

const CourseOfferingsScreen = () => {
  const { id: sectionId } = useLocalSearchParams()
  const haptics = useHaptics()
  const toast = useToast()
  const { currentMode } = useTheme()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOffering, setEditingOffering] = useState<CourseOffering | null>(
    null
  )
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false)
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false)

  const { data: sectionData } = useQuery(GET_SECTION, {
    variables: { id: sectionId },
  })

  const {
    data: offeringsData,
    loading: offeringsLoading,
    refetch,
    error,
  } = useQuery<GetCourseOfferingsBySectionData>(
    GET_COURSE_OFFERINGS_BY_SECTION,
    {
      variables: { sectionId },
      skip: !sectionId,
    }
  )
  console.log('====>', offeringsData, error)

  const { data: coursesData, loading: coursesLoading } =
    useQuery(GET_ALL_COURSES)

  const { data: facultiesData, loading: facultiesLoading } = useQuery(
    GET_ALL_FACULTIES_LIST
  )

  const [createOffering, { loading: createLoading }] = useMutation(
    CREATE_COURSE_OFFERING
  )
  const [updateOffering, { loading: updateLoading }] = useMutation(
    UPDATE_COURSE_OFFERING
  )
  const [deleteOffering, { loading: deleteLoading }] = useMutation(
    DELETE_COURSE_OFFERING
  )

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<OfferingFormValues>({
    defaultValues: {
      course_id: '',
      teacher_id: '',
      academic_year: '',
    },
    resolver: zodResolver(offeringSchema) as any,
  })

  const watchedCourseId = watch('course_id')
  const watchedTeacherId = watch('teacher_id')

  const getCourseDisplayName = () => {
    if (!watchedCourseId) return 'Select Course'
    const course = coursesData?.academic_course.find(
      (c: any) => c.id === watchedCourseId
    )
    return course ? `${course.code} - ${course.name}` : 'Unknown Course'
  }

  const getTeacherDisplayName = () => {
    if (!watchedTeacherId) return 'Select Teacher'
    const faculty = facultiesData?.user_faculty.find(
      (f: any) => f.user_id === watchedTeacherId
    )
    if (faculty) {
      return `${faculty.first_name} ${faculty.last_name}`
    }
    return editingOffering?.teacher?.faculties?.[0]
      ? `${editingOffering.teacher.faculties[0].first_name} ${editingOffering.teacher.faculties[0].last_name}`
      : 'Selected Teacher'
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

  const openCreateModal = () => {
    setEditingOffering(null)
    reset({
      course_id: '',
      teacher_id: '',
      academic_year:
        new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    })
    setIsModalOpen(true)
    haptics.light()
  }

  const openEditModal = (offering: CourseOffering) => {
    setEditingOffering(offering)
    reset({
      course_id: offering.course_id,
      teacher_id: offering.teacher_id,
      academic_year: offering.academic_year,
    })
    setIsModalOpen(true)
    haptics.light()
  }

  const handleDelete = (offering: CourseOffering) => {
    haptics.medium()
    Alert.alert(
      'Delete Course Offering',
      `Remove ${offering.course?.code} from this section?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteOffering({
                variables: { id: offering.id },
                refetchQueries: [
                  {
                    query: GET_COURSE_OFFERINGS_BY_SECTION,
                    variables: { sectionId },
                  },
                ],
              })
              haptics.success()
              showToast('Success', 'Course offering deleted')
            } catch (err) {
              haptics.error()
              console.error('Error deleting offering:', err)
              showToast('Error', 'Failed to delete offering', 'error')
            }
          },
        },
      ]
    )
  }

  const onSubmit = async (data: OfferingFormValues) => {
    haptics.medium()
    try {
      if (editingOffering) {
        await updateOffering({
          variables: {
            id: editingOffering.id,
            set: {
              course_id: data.course_id,
              teacher_id: data.teacher_id,
              academic_year: data.academic_year,
            },
          },
          refetchQueries: [
            {
              query: GET_COURSE_OFFERINGS_BY_SECTION,
              variables: { sectionId },
            },
          ],
        })
        showToast('Success', 'Course offering updated')
      } else {
        const section = sectionData?.academic_section_by_pk
        const offeringResult = await createOffering({
          variables: {
            object: {
              course_id: data.course_id,
              teacher_id: data.teacher_id,
              academic_year: data.academic_year,
              section_id: sectionId,
              batch_id: section?.batch_id,
              is_active: true,
            },
          },
          refetchQueries: [
            {
              query: GET_COURSE_OFFERINGS_BY_SECTION,
              variables: { sectionId },
            },
          ],
        })
        if (
          offeringResult?.data?.create_academic_course_offering?.returning?.[0]
        ) {
          Alert.alert('Success', 'Course offering created')
        }
      }
      haptics.success()
      setIsModalOpen(false)
    } catch (err: any) {
      haptics.error()
      console.error('Error saving offering:', err)
      showToast('Error', err.message || 'Failed to save offering', 'error')
    }
  }

  const offerings = offeringsData?.academic_course_offering || []
  const section = sectionData?.academic_section_by_pk

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
              Course Offerings
            </Heading>
            {section && (
              <Text className="text-xs text-typography-500">
                {section.name} • {offerings.length} course
                {offerings.length !== 1 ? 's' : ''}
              </Text>
            )}
          </VStack>
        </HStack>
        <Button
          variant="link"
          onPress={openCreateModal}
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
            refreshing={offeringsLoading}
            onRefresh={refetch}
            tintColor={currentMode === 'dark' ? '#fff' : '#000'}
          />
        }
      >
        {offeringsLoading && offerings.length === 0 ? (
          <ActivityIndicator className="mt-20" size="large" color="#8B5CF6" />
        ) : offerings.length === 0 ? (
          <Box className="items-center justify-center py-20">
            <Box className="bg-primary-500/10 p-4 rounded-full mb-4">
              <Ionicons name="book-outline" size={32} color="#8B5CF6" />
            </Box>
            <Heading size="sm" className="text-typography-900 mb-2">
              No Course Offerings
            </Heading>
            <Text className="text-typography-500 text-center mb-6">
              Add courses to this section to get started
            </Text>
            <Button
              className="rounded-full bg-primary-500"
              onPress={openCreateModal}
            >
              <ButtonText>Add First Course</ButtonText>
            </Button>
          </Box>
        ) : (
          <VStack space="md">
            {offerings.map((offering) => (
              <TouchableOpacity
                key={offering.id}
                onPress={() => openEditModal(offering)}
                className="bg-white dark:bg-background-900 rounded-xl p-4 border border-outline-100 dark:border-outline-800"
              >
                <HStack className="justify-between items-start">
                  <VStack className="flex-1 pr-3">
                    <HStack className="items-center mb-1">
                      <Text className="text-primary-600 dark:text-primary-400 font-bold text-sm mr-2">
                        {offering.course?.code}
                      </Text>
                      <Box className="bg-primary-500/10 px-2 py-0.5 rounded-md">
                        <Text className="text-primary-600 text-xs font-medium">
                          {offering.course?.credit_hours} credits
                        </Text>
                      </Box>
                    </HStack>
                    <Text className="text-typography-900 font-semibold mb-2">
                      {offering.course?.name}
                    </Text>
                    <HStack className="items-center mb-1">
                      <Ionicons
                        name="person-outline"
                        size={14}
                        color="#64748B"
                      />
                      <Text className="text-typography-600 text-xs ml-1">
                        {offering.teacher?.faculties?.[0]
                          ? `${offering.teacher.faculties[0].first_name} ${offering.teacher.faculties[0].last_name}`
                          : offering.teacher?.email}
                      </Text>
                    </HStack>
                    <HStack className="items-center">
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color="#64748B"
                      />
                      <Text className="text-typography-600 text-xs ml-1">
                        {offering.academic_year}
                      </Text>
                    </HStack>
                  </VStack>
                  <TouchableOpacity
                    onPress={() => handleDelete(offering)}
                    className="p-2"
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </HStack>
              </TouchableOpacity>
            ))}
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
                {editingOffering ? 'Edit Offering' : 'New Offering'}
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
                {/* Course Selection */}
                <Controller
                  control={control}
                  name="course_id"
                  render={({ field: { value } }) => (
                    <FormControl isInvalid={!!errors.course_id}>
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText className="text-typography-600 font-medium">
                          Course <Text className="text-error-500">*</Text>
                        </FormControlLabelText>
                      </FormControlLabel>
                      <TouchableOpacity
                        onPress={() => setIsCourseModalOpen(true)}
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
                            {getCourseDisplayName()}
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
                          {errors.course_id?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />

                {/* Teacher Selection */}
                <Controller
                  control={control}
                  name="teacher_id"
                  render={({ field: { value } }) => (
                    <FormControl isInvalid={!!errors.teacher_id}>
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText className="text-typography-600 font-medium">
                          Teacher <Text className="text-error-500">*</Text>
                        </FormControlLabelText>
                      </FormControlLabel>
                      <TouchableOpacity
                        onPress={() => setIsTeacherModalOpen(true)}
                        className="flex-row items-center justify-between rounded-xl border border-outline-200 h-14 px-3"
                      >
                        <HStack className="items-center flex-1">
                          <Ionicons
                            name="person-outline"
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
                            {getTeacherDisplayName()}
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
                          {errors.teacher_id?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />

                {/* Academic Year */}
                <Controller
                  control={control}
                  name="academic_year"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl isInvalid={!!errors.academic_year}>
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText className="text-typography-600 font-medium">
                          Academic Year{' '}
                          <Text className="text-error-500">*</Text>
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input className="rounded-xl border-outline-200 bg-transparent h-14">
                        <InputSlot className="pl-3">
                          <Ionicons
                            name="calendar-outline"
                            size={18}
                            color="#94A3B8"
                          />
                        </InputSlot>
                        <InputField
                          placeholder="e.g., 2024-2025"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          className="text-sm"
                        />
                      </Input>
                      <FormControlError>
                        <FormControlErrorText>
                          {errors.academic_year?.message}
                        </FormControlErrorText>
                      </FormControlError>
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
                      {editingOffering ? 'Update Offering' : 'Create Offering'}
                    </ButtonText>
                  )}
                </Button>
              </VStack>
            </ScrollView>
          </VStack>
        </ModalContent>
      </Modal>

      {/* Course Selection Modal */}
      <SelectModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title="Select Course"
        items={coursesData?.academic_course || []}
        loading={coursesLoading}
        onSelect={(item: any) => {
          setValue('course_id', item.id, { shouldValidate: true })
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
              {item.code} - {item.name}
            </Text>
            <Text className="text-xs text-typography-500">
              {item.department?.name} • {item.credit_hours} credits
            </Text>
          </VStack>
        )}
        selectedItem={watchedCourseId ? { id: watchedCourseId } : undefined}
        searchPlaceholder="Search courses..."
      />

      {/* Teacher Selection Modal */}
      <SelectModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        title="Select Teacher"
        items={facultiesData?.user_faculty || []}
        loading={facultiesLoading}
        onSelect={(item: any) => {
          setValue('teacher_id', item.user_id, { shouldValidate: true })
        }}
        keyExtractor={(item) => item.user_id}
        searchPlaceholder="Search by name or designation"
        renderItem={(item: any, isSelected) => (
          <VStack>
            <Text
              className={`text-base ${
                isSelected
                  ? 'font-bold text-primary-600'
                  : 'text-typography-900'
              }`}
            >
              {item.first_name} {item.last_name}
            </Text>
            <Text className="text-xs text-typography-500">
              {item.designation} • {item.department?.name || 'No Department'}
            </Text>
          </VStack>
        )}
        selectedItem={
          watchedTeacherId ? { user_id: watchedTeacherId } : undefined
        }
      />
    </SafeAreaView>
  )
}

export default CourseOfferingsScreen
