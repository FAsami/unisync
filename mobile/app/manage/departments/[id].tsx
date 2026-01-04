import React, { useEffect, useState } from 'react'
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
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  GET_DEPARTMENT,
  GET_DEPARTMENTS,
  CREATE_DEPARTMENT,
  UPDATE_DEPARTMENT,
  DELETE_DEPARTMENT,
  GET_FACULTIES,
  GET_USERS_FOR_SELECT,
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
import {
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from '@/components/ui/toast'
import { useTheme } from '@/contexts/ThemeContext'
import { useHaptics } from '@/hooks/useHaptics'

const departmentSchema = z.object({
  name: z.string().min(1, { message: 'Department name is required' }),
  code: z
    .string()
    .min(1, { message: 'Code is required' })
    .max(10, { message: 'Code must be short' }),
  description: z.string().optional(),
  faculty_id: z.string().min(1, { message: 'Faculty is required' }),
  head_user_id: z.string().optional().nullable(),
})

type DepartmentFormValues = z.infer<typeof departmentSchema>

const DepartmentDetailsScreen = () => {
  const { id } = useLocalSearchParams()
  const isEditing = id !== 'new'
  const haptics = useHaptics()
  const toast = useToast()
  const { currentMode } = useTheme()

  const { data: deptData, loading: dataLoading } = useQuery(GET_DEPARTMENT, {
    variables: { id },
    skip: !isEditing,
  })

  const [createDepartment, { loading: createLoading }] =
    useMutation(CREATE_DEPARTMENT)
  const [updateDepartment, { loading: updateLoading }] =
    useMutation(UPDATE_DEPARTMENT)
  const [deleteDepartment, { loading: deleteLoading }] =
    useMutation(DELETE_DEPARTMENT)

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<DepartmentFormValues>({
    defaultValues: {
      name: '',
      code: '',
      description: '',
      faculty_id: '',
      head_user_id: null,
    },
    resolver: zodResolver(departmentSchema),
  })

  useEffect(() => {
    if (deptData?.academic_department_by_pk) {
      const dept = deptData.academic_department_by_pk
      reset({
        name: dept.name,
        code: dept.code,
        description: dept.description || '',
        faculty_id: dept.faculty_id || '',
        head_user_id: dept.head_user_id || null,
      })
    }
  }, [deptData, reset])

  // Faculty Selection Logic
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false)
  const { data: facultiesData, loading: facultiesLoading } =
    useQuery(GET_FACULTIES)

  // Head User Selection Logic
  const [isHeadModalOpen, setIsHeadModalOpen] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const { data: usersData, loading: usersLoading } = useQuery(
    GET_USERS_FOR_SELECT,
    {
      variables: { search: `%${userSearchQuery}%` },
      skip: !isHeadModalOpen,
    }
  )

  // Precompute fallback display names for editing state
  const selectedHeadDisplay = (() => {
    const currentId = control._formValues.head_user_id
    if (!currentId) return 'Select Head of Department'

    const inSearch = usersData?.user_account.find(
      (u: any) => u.id === currentId
    )
    if (inSearch) {
      const name = inSearch.profiles?.[0]
        ? `${inSearch.profiles[0].first_name} ${inSearch.profiles[0].last_name}`
        : inSearch.email
      return name
    }

    if (deptData?.academic_department_by_pk?.head_user_id === currentId) {
      return 'Selected User (ID: ' + currentId.substring(0, 8) + '...)'
    }
    return 'Selected User'
  })()

  // Watch form values for display updates
  const watchedFacultyId = watch('faculty_id')
  const watchedHeadUserId = watch('head_user_id')

  const getFacultyDisplayName = () => {
    if (!watchedFacultyId) return 'Select Faculty'
    const faculty = facultiesData?.academic_faculty.find(
      (f: any) => f.id === watchedFacultyId
    )
    return faculty ? faculty.name : 'Unknown Faculty'
  }

  const getHeadDisplayName = () => {
    if (!watchedHeadUserId) return 'Select Head of Department'

    // Try finding in search results
    const userInSearch = usersData?.user_account.find(
      (u: any) => u.id === watchedHeadUserId
    )
    if (userInSearch) {
      const p = userInSearch.profiles?.[0]
      return p ? `${p.first_name} ${p.last_name}` : userInSearch.email
    }

    // Fallback if not found in current search results but ID is set
    return deptData?.academic_department_by_pk?.head_user_id ===
      watchedHeadUserId &&
      deptData?.academic_department_by_pk?.head_of_department
      ? `${
          deptData.academic_department_by_pk.head_of_department.profiles?.[0]
            ?.first_name || ''
        } ${
          deptData.academic_department_by_pk.head_of_department.profiles?.[0]
            ?.last_name || ''
        }`.trim() || deptData.academic_department_by_pk.head_of_department.email
      : 'Selected User'
  }

  const showToast = (
    title: string,
    description: string,
    action: 'success' | 'error' = 'success'
  ) => {
    toast.show({
      placement: 'top',
      render: ({ id }) => {
        return (
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
        )
      },
    })
  }

  const handleDelete = () => {
    if (!isEditing) return
    haptics.medium()
    Alert.alert(
      'Delete Department',
      'Are you sure you want to delete this department? This action cannot be undone.',
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
              await deleteDepartment({
                variables: { id },
                refetchQueries: [{ query: GET_DEPARTMENTS }],
              })
              haptics.success()
              router.back()
            } catch (err) {
              haptics.error()
              console.error('Error deleting department:', err)
              Alert.alert('Error', 'Failed to delete department')
            }
          },
        },
      ]
    )
  }

  const onSubmit = async (data: DepartmentFormValues) => {
    haptics.medium()
    const loading = isEditing ? updateLoading : createLoading
    if (loading) return

    try {
      if (isEditing) {
        await updateDepartment({
          variables: {
            id,
            set: {
              name: data.name,
              code: data.code,
              description: data.description || null,
              faculty_id: data.faculty_id,
              head_user_id: data.head_user_id || null,
            },
          },
          refetchQueries: [
            { query: GET_DEPARTMENTS },
            { query: GET_DEPARTMENT, variables: { id } },
          ],
        })
        showToast('Success', 'Department updated')
      } else {
        await createDepartment({
          variables: {
            object: {
              name: data.name,
              code: data.code,
              description: data.description || null,
              faculty_id: data.faculty_id,
              head_user_id: data.head_user_id || null,
            },
          },
          refetchQueries: [{ query: GET_DEPARTMENTS }], // Refetch departments list
        })
        showToast('Success', 'Department created')
        router.back()
      }
      haptics.success()
    } catch (err: any) {
      haptics.error()
      console.error('Error saving department:', err)
      const errorMessage = err.message || 'Failed to save department'
      if (errorMessage.includes('Uniqueness violation')) {
        showToast('Error', 'Department code already exists', 'error')
      } else {
        // Show actual server error
        showToast('Error', errorMessage, 'error')
      }
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
              {isEditing ? 'Edit Department' : 'New Department'}
            </Heading>
          </VStack>
        </HStack>
        {isEditing && (
          <Button
            variant="link"
            onPress={handleSubmit(onSubmit)}
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
              {/* Name */}
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormControl isInvalid={!!errors.name}>
                    <FormControlLabel className="mb-1">
                      <FormControlLabelText className="text-typography-600 font-medium">
                        Department Name{' '}
                        <Text className="text-error-500">*</Text>
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Input className="rounded-xl border-outline-200 focus:border-primary-500 bg-transparent h-14">
                      <InputSlot className="pl-3">
                        <Ionicons
                          name="business-outline"
                          size={18}
                          color="#94A3B8"
                        />
                      </InputSlot>
                      <InputField
                        placeholder="e.g. Computer Science and Engineering"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
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

              {/* Code */}
              <Controller
                control={control}
                name="code"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormControl isInvalid={!!errors.code}>
                    <FormControlLabel className="mb-1">
                      <FormControlLabelText className="text-typography-600 font-medium">
                        Code <Text className="text-error-500">*</Text>
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
                        placeholder="e.g. CSE"
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

              {/* Faculty Selection */}
              <Controller
                control={control}
                name="faculty_id"
                render={({ field: { onChange, value } }) => (
                  <FormControl isInvalid={!!errors.faculty_id}>
                    <FormControlLabel className="mb-1">
                      <FormControlLabelText className="text-typography-600 font-medium">
                        Faculty <Text className="text-error-500">*</Text>
                      </FormControlLabelText>
                    </FormControlLabel>
                    <TouchableOpacity
                      onPress={() => setIsFacultyModalOpen(true)}
                      className="flex-row items-center justify-between rounded-xl border border-outline-200 h-14 px-3"
                    >
                      <HStack className="items-center">
                        <Ionicons
                          name="school-outline"
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
                          {getFacultyDisplayName()}
                        </Text>
                      </HStack>
                      <Ionicons name="chevron-down" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                    <FormControlError>
                      <FormControlErrorText>
                        {errors.faculty_id?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  </FormControl>
                )}
              />

              {/* Head of Department Selection */}
              <Controller
                control={control}
                name="head_user_id"
                render={({ field: { onChange, value } }) => (
                  <FormControl isInvalid={!!errors.head_user_id}>
                    <FormControlLabel className="mb-1">
                      <FormControlLabelText className="text-typography-600 font-medium">
                        Head of Department
                      </FormControlLabelText>
                    </FormControlLabel>
                    <TouchableOpacity
                      onPress={() => setIsHeadModalOpen(true)}
                      className="flex-row items-center justify-between rounded-xl border border-outline-200 h-14 px-3"
                    >
                      <HStack className="items-center">
                        <Ionicons
                          name="person-outline"
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
                          {getHeadDisplayName()}
                        </Text>
                      </HStack>
                      <Ionicons name="chevron-down" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                    <FormControlError>
                      <FormControlErrorText>
                        {errors.head_user_id?.message}
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
                        Description
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
                  onPress={handleSubmit(onSubmit)}
                  isDisabled={isLoading}
                >
                  {isLoading ? (
                    <ButtonSpinner color="white" />
                  ) : (
                    <ButtonText className="font-bold">
                      Create Department
                    </ButtonText>
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
                    Delete this department
                  </ButtonText>
                </Button>
              )}
            </VStack>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
      <SelectModal
        isOpen={isFacultyModalOpen}
        onClose={() => setIsFacultyModalOpen(false)}
        title="Select Faculty"
        items={facultiesData?.academic_faculty || []}
        loading={facultiesLoading}
        onSelect={(item: any) => {
          setValue('faculty_id', item.id, { shouldValidate: true })
        }}
        keyExtractor={(item) => item.id}
        renderItem={(item: any, isSelected) => (
          <Text
            className={`text-base ${
              isSelected ? 'font-bold text-primary-600' : 'text-typography-900'
            }`}
          >
            {item.name}
          </Text>
        )}
        selectedItem={watchedFacultyId ? { id: watchedFacultyId } : undefined}
      />

      <SelectModal
        isOpen={isHeadModalOpen}
        onClose={() => setIsHeadModalOpen(false)}
        title="Select Head of Department"
        items={usersData?.user_account || []}
        loading={usersLoading}
        onSelect={(item: any) => {
          setValue('head_user_id', item.id, { shouldValidate: true })
        }}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search by name, email or phone"
        onSearchChange={(text) => setUserSearchQuery(text)}
        renderItem={(item: any, isSelected) => {
          const name = item.profiles?.[0]
            ? `${item.profiles[0].first_name} ${item.profiles[0].last_name}`
            : item.email // Fallback

          return (
            <VStack>
              <Text
                className={`text-base ${
                  isSelected
                    ? 'font-bold text-primary-600'
                    : 'text-typography-900'
                }`}
              >
                {name}
              </Text>
              <Text className="text-xs text-typography-500">{item.email}</Text>
            </VStack>
          )
        }}
        selectedItem={watchedHeadUserId ? { id: watchedHeadUserId } : undefined}
      />
    </SafeAreaView>
  )
}

export default DepartmentDetailsScreen
