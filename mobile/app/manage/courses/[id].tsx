import React, { useEffect, useMemo } from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useMutation, useQuery } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { useForm } from 'react-hook-form'
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

import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { useTheme } from '@/contexts/ThemeContext'
import { useHaptics } from '@/hooks/useHaptics'
import { useAlert } from '@/contexts/AlertContext'
import { FormFieldRenderer, type FormConfig } from '@/components/form'
import { AuthSubmitButton } from '@/components/auth'
import { Button, ButtonText } from '@/components/ui/button'

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
  const { showAlert } = useAlert()
  const { currentMode } = useTheme()

  const { data: deptData, loading: deptLoading } = useQuery(GET_DEPARTMENTS)
  const { data: courseData } = useQuery(GET_COURSE, {
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
    resolver: zodResolver(courseSchema) as any,
  })

  const watchedDeptId = watch('department_id')
  const watchedType = watch('course_type')

  const getDepartmentDisplayName = (items: any[]) => {
    if (!watchedDeptId) return 'Select Department'
    const dept = items.find((d: any) => d.id === watchedDeptId)
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

  const handleDelete = async () => {
    if (!isEditing) return
    haptics.medium()

    showAlert({
      title: 'Delete Course',
      description:
        'Are you sure you want to delete this course? This action cannot be undone.',
      type: 'warning',
      onConfirm: async () => {
        try {
          const { data: response } = await deleteCourse({
            variables: { id },
            refetchQueries: [{ query: GET_ALL_COURSES }],
          })

          if (response?.delete_academic_course_by_pk?.id) {
            haptics.success()
            showAlert({
              title: 'Success',
              description: 'Course deleted successfully',
              type: 'success',
              onConfirm: () => router.back(),
            })
          } else {
            haptics.error()
            showAlert({
              title: 'Failed to Delete',
              description: 'Something went wrong while deleting the course.',
              type: 'error',
            })
          }
        } catch (err: any) {
          haptics.error()
          console.error('Error deleting course:', err)
          showAlert({
            title: 'Failed to Delete',
            description:
              err?.graphQLErrors?.[0]?.message ||
              err?.message ||
              'An error occurred while deleting the course.',
            type: 'error',
          })
        }
      },
    })
  }

  const onSubmit = async (data: CourseFormValues) => {
    haptics.medium()
    const loading = isEditing ? updateLoading : createLoading
    if (loading) return

    try {
      if (isEditing) {
        const { data: response } = await updateCourse({
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

        if (response?.update_academic_course_by_pk?.id) {
          haptics.success()
          showAlert({
            title: 'Success',
            description: 'Course updated successfully',
            type: 'success',
            onConfirm: () => router.back(),
          })
        } else {
          haptics.error()
          showAlert({
            title: 'Failed to Update',
            description: 'Something went wrong while updating the course.',
            type: 'error',
          })
        }
      } else {
        const { data: response } = await createCourse({
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

        if (response?.insert_academic_course_one?.id) {
          haptics.success()
          showAlert({
            title: 'Success',
            description: 'Course created successfully',
            type: 'success',
            onConfirm: () => router.back(),
          })
        } else {
          haptics.error()
          showAlert({
            title: 'Failed to Create',
            description: 'Something went wrong while creating the course.',
            type: 'error',
          })
        }
      }
    } catch (err: any) {
      haptics.error()
      console.error('Error saving course:', err)
      const errorMessage =
        err?.graphQLErrors?.[0]?.message ||
        err?.message ||
        'Failed to save course'
      showAlert({
        title: 'Failed to Save',
        description: errorMessage.includes('unique constraint')
          ? 'Course code already exists'
          : errorMessage,
        type: 'error',
      })
    }
  }

  const fields: FormConfig<CourseFormValues>[] = [
    {
      type: 'select',
      name: 'department_id' as const,
      label: 'Department',
      placeholder: 'Select Department',
      icon: 'business-outline',
      required: true,
      getValue: (items: any[]) => getDepartmentDisplayName(items),
      modalTitle: 'Select Department',
      query: {
        query: GET_DEPARTMENTS,
        dataPath: 'academic_department',
      },
      keyExtractor: (item: any) => item.id,
      renderItem: (item: any, isSelected: boolean) => (
        <Text
          className={`text-base ${
            isSelected ? 'font-bold text-primary-600' : 'text-typography-900'
          }`}
        >
          {item.name} ({item.code})
        </Text>
      ),
      selectedItem: watchedDeptId ? { id: watchedDeptId } : undefined,
    },
    {
      type: 'input',
      name: 'code' as const,
      label: 'Course Code',
      placeholder: 'e.g. CSE101',
      icon: 'code-slash-outline',
      required: true,
    },
    {
      type: 'input',
      name: 'name' as const,
      label: 'Course Name',
      placeholder: 'e.g. Introduction to Programming',
      icon: 'book-outline',
      required: true,
    },
    {
      type: 'input',
      name: 'credit_hours' as const,
      label: 'Credits',
      placeholder: '3.0',
      keyboardType: 'numeric',
    },
    {
      type: 'select',
      name: 'course_type' as const,
      label: 'Type',
      placeholder: 'Select Type',
      items: COURSE_TYPES,
      getValue: () => watchedType || 'Select Type',
      modalTitle: 'Select Course Type',
      keyExtractor: (item: any) => item.id,
      renderItem: (item: any, isSelected: boolean) => (
        <Text
          className={`text-base ${
            isSelected ? 'font-bold text-primary-600' : 'text-typography-900'
          }`}
        >
          {item.name}
        </Text>
      ),
      selectedItem: watchedType ? { id: watchedType } : undefined,
    },
    {
      type: 'input',
      name: 'semester' as const,
      label: 'Semester',
      placeholder: 'e.g. 1',
      icon: 'calendar-outline',
      keyboardType: 'number-pad',
      required: true,
    },
    {
      type: 'input',
      name: 'syllabus_url' as const,
      label: 'Syllabus URL (Optional)',
      placeholder: 'https://example.com/syllabus.pdf',
      icon: 'link-outline',
    },
    {
      type: 'textarea',
      name: 'description' as const,
      label: 'Description (Optional)',
      placeholder: 'Optional description...',
      minHeight: 128,
    },
  ]

  const isLoading = createLoading || updateLoading || deleteLoading

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
          <Heading size="md" className="font-bold text-typography-900">
            {isEditing ? 'Edit Course' : 'New Course'}
          </Heading>
        </HStack>
      </HStack>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <VStack space="lg">
          <FormFieldRenderer
            fields={fields}
            control={control}
            errors={errors}
            setValue={setValue}
          />

          {/* Submit Button */}
          <AuthSubmitButton
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            text={isEditing ? 'Save Changes' : 'Create Course'}
          />

          {/* Delete Button */}
          {isEditing && (
            <Button
              variant="link"
              className="mt-4 rounded-full border-error-200 h-14 active:bg-error-50"
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
    </SafeAreaView>
  )
}

export default CourseDetailsScreen
