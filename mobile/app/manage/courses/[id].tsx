import React, { useEffect, useState, useMemo } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useMutation, useQuery } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  GET_COURSE,
  GET_ALL_COURSES,
  CREATE_COURSE,
  UPDATE_COURSE,
  DELETE_COURSE,
  GET_DEPARTMENTS,
} from '@/lib/graphql-operations'

import { SelectModal } from '@/components/ui/SelectModal'
import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Input, InputField, InputSlot } from '@/components/ui/input'
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button'
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
} from '@/components/ui/form-control'
import { useTheme } from '@/contexts/ThemeContext'
import { useHaptics } from '@/hooks/useHaptics'

const courseSchema = z.object({
  name: z.string().min(1, { message: 'Course name is required' }),
  code: z.string().min(1, { message: 'Course code is required' }),
  description: z.string().optional(),
  department_id: z.string().min(1, { message: 'Department is required' }),
  credit_hours: z.coerce
    .number()
    .min(0.5, { message: 'Credits must be valid' }),
  semester: z.coerce
    .number()
    .int()
    .min(1, { message: 'Semester must be at least 1' })
    .max(12, { message: 'Semester cannot exceed 12' }),
  course_type: z.string().min(1, { message: 'Type is required' }),
  syllabus_url: z
    .union([z.string().url({ message: 'Must be a valid URL' }), z.literal('')])
    .optional(),
})

type CourseFormValues = z.infer<typeof courseSchema>

const COURSE_TYPES = [
  { id: 'Lecture', name: 'Lecture' },
  { id: 'Lab', name: 'Lab' },
]

const CourseDetailsScreen = () => {
  const { id } = useLocalSearchParams()
  const isEditing = id !== 'new'
  const haptics = useHaptics()
  const { currentMode } = useTheme()

  const { data: deptData, loading: deptLoading } = useQuery(GET_DEPARTMENTS)
  const { data: courseData, loading: dataLoading } = useQuery(GET_COURSE, {
    variables: { id },
    skip: !isEditing,
  })

  const departments = useMemo(
    () => deptData?.academic_department || [],
    [deptData]
  )

  const [createCourse, { loading: createLoading }] = useMutation(CREATE_COURSE)
  const [updateCourse, { loading: updateLoading }] = useMutation(UPDATE_COURSE)
  const [deleteCourse, { loading: deleteLoading }] = useMutation(DELETE_COURSE)

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CourseFormValues>({
    defaultValues: {
      name: '',
      code: '',
      description: '',
      department_id: '',
      credit_hours: 3.0,
      semester: 1,
      course_type: 'Lecture',
      syllabus_url: '',
    },
    resolver: zodResolver(courseSchema) as Resolver<CourseFormValues>,
  })

  // Modal States
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false)
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false)

  const watchedDeptId = watch('department_id')
  const watchedType = watch('course_type')

  const getDepartmentDisplayName = () => {
    if (!watchedDeptId) return 'Select Department'
    const dept = departments.find((d: any) => d.id === watchedDeptId)
    return dept ? `${dept.code} - ${dept.name}` : 'Unknown Department'
  }

  useEffect(() => {
    if (courseData?.academic_course_by_pk) {
      const course = courseData.academic_course_by_pk
      reset({
        name: course.name,
        code: course.code,
        description: course.description || '',
        department_id: course.department_id,
        credit_hours: course.credit_hours,
        semester: course.semester || 1,
        course_type: course.course_type,
        syllabus_url: course.syllabus_url || '',
      })
    }
  }, [courseData, reset])

  const handleDelete = () => {
    if (!isEditing) return
    haptics.medium()
    Alert.alert(
      'Delete Course',
      'Are you sure you want to delete this course? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: result } = await deleteCourse({
                variables: { id },
                refetchQueries: [{ query: GET_ALL_COURSES }],
              })

              // Validate response
              if (!result?.delete_academic_course_by_pk) {
                throw new Error('Failed to delete course - no data returned')
              }

              haptics.success()
              router.back()
            } catch (err: any) {
              haptics.error()
              console.error('Error deleting course:', err)

              // Extract error message
              let errorMessage = 'Failed to delete course'

              if (err.graphQLErrors && err.graphQLErrors.length > 0) {
                errorMessage = err.graphQLErrors[0].message
              } else if (err.networkError) {
                errorMessage = 'Network error. Please check your connection.'
              } else if (err.message) {
                errorMessage = err.message
              }

              Alert.alert('Error', errorMessage)
            }
          },
        },
      ]
    )
  }

  const onSubmit = async (data: CourseFormValues) => {
    haptics.medium()
    const loading = isEditing ? updateLoading : createLoading
    if (loading) return

    try {
      if (isEditing) {
        const { data: result } = await updateCourse({
          variables: {
            id,
            set: {
              name: data.name,
              code: data.code,
              description: data.description || null,
              department_id: data.department_id,
              credit_hours: data.credit_hours,
              semester: data.semester,
              course_type: data.course_type,
              syllabus_url: data.syllabus_url || null,
            },
          },
          refetchQueries: [
            { query: GET_ALL_COURSES },
            { query: GET_COURSE, variables: { id } },
          ],
        })

        // Validate response
        if (!result?.update_academic_course_by_pk) {
          throw new Error('Failed to update course - no data returned')
        }

        Alert.alert('Success', 'Course updated successfully')
        router.back()
      } else {
        const { data: result } = await createCourse({
          variables: {
            object: {
              name: data.name,
              code: data.code,
              description: data.description || null,
              department_id: data.department_id,
              credit_hours: data.credit_hours,
              semester: data.semester,
              course_type: data.course_type,
              syllabus_url: data.syllabus_url || null,
              is_active: true,
            },
          },
          refetchQueries: [{ query: GET_ALL_COURSES }],
        })

        // Validate response
        if (!result?.insert_academic_course_one) {
          throw new Error('Failed to create course - no data returned')
        }

        Alert.alert('Success', 'Course created successfully')
        router.back()
      }
      haptics.success()
    } catch (err: any) {
      haptics.error()
      console.error('Error saving course:', err)

      // Extract error message from different error formats
      let errorMessage = 'Failed to save course'

      // GraphQL error
      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        const graphqlError = err.graphQLErrors[0]
        errorMessage = graphqlError.message

        // Check for specific constraint violations
        if (
          graphqlError.message.includes('Uniqueness violation') ||
          graphqlError.message.includes('unique constraint')
        ) {
          errorMessage = 'Course code already exists'
        }
      }
      // Network error
      else if (err.networkError) {
        errorMessage = 'Network error. Please check your connection.'
      }
      // Generic error with message
      else if (err.message) {
        if (
          err.message.includes('Uniqueness violation') ||
          err.message.includes('unique constraint')
        ) {
          errorMessage = 'Course code already exists'
        } else {
          errorMessage = err.message
        }
      }

      Alert.alert('Error', errorMessage)
    }
  }

  const isLoading =
    dataLoading || createLoading || updateLoading || deleteLoading

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-950">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <HStack className="items-center justify-between px-4 py-3 bg-white dark:bg-background-900 border-b border-outline-100 dark:border-outline-800">
        <HStack className="items-center">
          <TouchableOpacity
            onPress={() => {
              haptics.light()
              router.back()
            }}
            className="p-2 rounded-full hover:bg-background-50 dark:hover:bg-background-800 mr-2"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={currentMode === 'dark' ? '#F1F5F9' : '#1E293B'}
            />
          </TouchableOpacity>
          <VStack>
            <Heading size="md" className="font-bold text-typography-900">
              {isEditing ? 'Edit Course' : 'New Course'}
            </Heading>
          </VStack>
        </HStack>
        {isEditing && (
          <Button
            variant="link"
            onPress={handleSubmit((data) =>
              onSubmit(data as unknown as CourseFormValues)
            )}
            isDisabled={isLoading}
          >
            {isLoading ? (
              <ButtonSpinner />
            ) : (
              <ButtonText className="text-primary-500 font-bold">
                Save
              </ButtonText>
            )}
          </Button>
        )}
      </HStack>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {dataLoading ? (
          <ActivityIndicator className="mt-20" size="large" color="#8B5CF6" />
        ) : (
          <ScrollView
            contentContainerStyle={{ padding: 16 }}
            keyboardShouldPersistTaps="handled"
          >
            <VStack space="xl" className="mt-2">
              {/* Department Selection */}
              <Controller
                control={control}
                name="department_id"
                render={({ field: { onChange, value } }) => (
                  <FormControl isInvalid={!!errors.department_id}>
                    <FormControlLabel className="mb-1">
                      <FormControlLabelText className="text-typography-600 font-medium">
                        Department <Text className="text-error-500">*</Text>
                      </FormControlLabelText>
                    </FormControlLabel>
                    <TouchableOpacity
                      onPress={() => setIsDeptModalOpen(true)}
                      className="flex-row items-center justify-between rounded-xl border border-outline-200 h-14 px-3"
                    >
                      <HStack className="items-center">
                        <Ionicons
                          name="business-outline"
                          size={18}
                          color="#94A3B8"
                        />
                        <Text
                          className={`ml-2 text-sm ${
                            value
                              ? 'text-typography-900'
                              : 'text-typography-400'
                          }`}
                        >
                          {getDepartmentDisplayName()}
                        </Text>
                      </HStack>
                      <Ionicons name="chevron-down" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                    <FormControlError>
                      <FormControlErrorText>
                        {errors.department_id?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}
              />

              {/* Code */}
              <Controller
                control={control}
                name="code"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormControl isInvalid={!!errors.code}>
                    <FormControlLabel className="mb-1">
                      <FormControlLabelText className="text-typography-600 font-medium">
                        Course Code <Text className="text-error-500">*</Text>
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Input className="rounded-xl border-outline-200 focus:border-primary-500 bg-transparent h-14">
                      <InputSlot className="pl-3">
                        <Ionicons
                          name="code-slash-outline"
                          size={18}
                          color="#94A3B8"
                        />
                      </InputSlot>
                      <InputField
                        placeholder="e.g. CSE101"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="characters"
                        className="text-sm"
                      />
                    </Input>
                    <FormControlError>
                      <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color="#EF4444"
                      />
                      <FormControlErrorText className="ml-1">
                        {errors.code?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}
              />

              {/* Name */}
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormControl isInvalid={!!errors.name}>
                    <FormControlLabel className="mb-1">
                      <FormControlLabelText className="text-typography-600 font-medium">
                        Course Name <Text className="text-error-500">*</Text>
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Input className="rounded-xl border-outline-200 focus:border-primary-500 bg-transparent h-14">
                      <InputSlot className="pl-3">
                        <Ionicons
                          name="book-outline"
                          size={18}
                          color="#94A3B8"
                        />
                      </InputSlot>
                      <InputField
                        placeholder="e.g. Introduction to Programming"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="words"
                        className="text-sm"
                      />
                    </Input>
                    <FormControlError>
                      <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color="#EF4444"
                      />
                      <FormControlErrorText className="ml-1">
                        {errors.name?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}
              />

              <HStack space="md">
                {/* Credits */}
                <Controller
                  control={control}
                  name="credit_hours"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormControl
                      isInvalid={!!errors.credit_hours}
                      className="flex-1"
                    >
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText className="text-typography-600 font-medium">
                          Credits
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input className="rounded-xl border-outline-200 focus:border-primary-500 bg-transparent h-14">
                        <InputField
                          placeholder="3.0"
                          value={String(value)}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="numeric"
                          className="text-sm"
                        />
                      </Input>
                      <FormControlError>
                        <FormControlErrorText>
                          {errors.credit_hours?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />

                {/* Type */}
                <Controller
                  control={control}
                  name="course_type"
                  render={({ field: { onChange, value } }) => (
                    <FormControl
                      isInvalid={!!errors.course_type}
                      className="flex-1"
                    >
                      <FormControlLabel className="mb-1">
                        <FormControlLabelText className="text-typography-600 font-medium">
                          Type
                        </FormControlLabelText>
                      </FormControlLabel>
                      <TouchableOpacity
                        onPress={() => setIsTypeModalOpen(true)}
                        className="flex-row items-center justify-between rounded-xl border border-outline-200 h-14 px-3"
                      >
                        <Text
                          className={`text-sm ${
                            value
                              ? 'text-typography-900'
                              : 'text-typography-400'
                          }`}
                        >
                          {value || 'Select Type'}
                        </Text>
                        <Ionicons
                          name="chevron-down"
                          size={18}
                          color="#94A3B8"
                        />
                      </TouchableOpacity>
                      <FormControlError>
                        <FormControlErrorText>
                          {errors.course_type?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </FormControl>
                  )}
                />
              </HStack>

              {/* Semester */}
              <Controller
                control={control}
                name="semester"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormControl isInvalid={!!errors.semester}>
                    <FormControlLabel className="mb-1">
                      <FormControlLabelText className="text-typography-600 font-medium">
                        Semester <Text className="text-error-500">*</Text>
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Input className="rounded-xl border-outline-200 focus:border-primary-500 bg-transparent h-14">
                      <InputSlot className="pl-3">
                        <Ionicons
                          name="calendar-outline"
                          size={18}
                          color="#94A3B8"
                        />
                      </InputSlot>
                      <InputField
                        placeholder="e.g. 1"
                        value={String(value)}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="number-pad"
                        className="text-sm"
                      />
                    </Input>
                    <FormControlError>
                      <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color="#EF4444"
                      />
                      <FormControlErrorText className="ml-1">
                        {errors.semester?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}
              />

              {/* Syllabus URL */}
              <Controller
                control={control}
                name="syllabus_url"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormControl isInvalid={!!errors.syllabus_url}>
                    <FormControlLabel className="mb-1">
                      <FormControlLabelText className="text-typography-600 font-medium">
                        Syllabus URL (Optional)
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Input className="rounded-xl border-outline-200 focus:border-primary-500 bg-transparent h-14">
                      <InputSlot className="pl-3">
                        <Ionicons
                          name="link-outline"
                          size={18}
                          color="#94A3B8"
                        />
                      </InputSlot>
                      <InputField
                        placeholder="https://example.com/syllabus.pdf"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="url"
                        autoCapitalize="none"
                        className="text-sm"
                      />
                    </Input>
                    <FormControlError>
                      <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color="#EF4444"
                      />
                      <FormControlErrorText className="ml-1">
                        {errors.syllabus_url?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}
              />

              {/* Description */}
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormControl isInvalid={!!errors.description}>
                    <FormControlLabel className="mb-1">
                      <FormControlLabelText className="text-typography-600 font-medium">
                        Description (Optional)
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Input className="rounded-xl border-outline-200 focus:border-primary-500 bg-transparent h-32 py-2">
                      <InputField
                        placeholder="Optional description..."
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        multiline
                        textAlignVertical="top"
                        className="text-sm"
                      />
                    </Input>
                    <FormControlError>
                      <FormControlErrorText>
                        {errors.description?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}
              />

              {!isEditing && (
                <Button
                  className="mt-4 rounded-full bg-primary-500 h-14"
                  onPress={handleSubmit((data) =>
                    onSubmit(data as unknown as CourseFormValues)
                  )}
                  isDisabled={isLoading}
                >
                  {isLoading ? (
                    <ButtonSpinner color="white" />
                  ) : (
                    <ButtonText className="font-bold">Create Course</ButtonText>
                  )}
                </Button>
              )}

              {isEditing && (
                <Button
                  variant="link"
                  className="mt-8 rounded-full border-error-200 h-14 active:bg-error-50"
                  onPress={handleDelete}
                  isDisabled={isLoading}
                >
                  <ButtonText className="text-error-500 font-bold">
                    Delete this course
                  </ButtonText>
                </Button>
              )}
            </VStack>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* Department Modal */}
      <SelectModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="Select Department"
        items={departments}
        loading={deptLoading}
        onSelect={(item: any) => {
          setValue('department_id', item.id, { shouldValidate: true })
        }}
        keyExtractor={(item) => item.id}
        renderItem={(item: any, isSelected) => (
          <Text
            className={`text-base ${
              isSelected ? 'font-bold text-primary-600' : 'text-typography-900'
            }`}
          >
            {item.name} ({item.code})
          </Text>
        )}
        selectedItem={watchedDeptId ? { id: watchedDeptId } : undefined}
      />

      {/* Type Modal */}
      <SelectModal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        title="Select Course Type"
        items={COURSE_TYPES}
        loading={false}
        onSelect={(item: any) => {
          setValue('course_type', item.id, { shouldValidate: true })
        }}
        keyExtractor={(item) => item.id}
        enableSearch={false}
        renderItem={(item: any, isSelected) => (
          <Text
            className={`text-base ${
              isSelected ? 'font-bold text-primary-600' : 'text-typography-900'
            }`}
          >
            {item.name}
          </Text>
        )}
        selectedItem={watchedType ? { id: watchedType } : undefined}
      />
    </SafeAreaView>
  )
}

export default CourseDetailsScreen
