import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import {
  Text,
  TextInput,
  Button,
  useTheme,
  HelperText,
} from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { axiosClient } from '@/lib/axios'

const resetSchema = z.object({
  otp: z.string(),

  newPassword: z
    .string()
    .min(8, { message: 'Must be at least 8 characters' })
    .max(128, { message: 'Must not exceed 128 characters' })
    .regex(/[A-Z]/, { message: 'Must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, {
      message: 'Must contain at least one special character',
    }),
})

type ResetFormValues = z.infer<typeof resetSchema>

const ResetPassword = () => {
  const router = useRouter()
  const { phone } = useLocalSearchParams<{ phone: string }>()
  const theme = useTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [apiSuccess, setApiSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    control: resetControl,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm<ResetFormValues>({
    defaultValues: { otp: '', newPassword: '' },
    resolver: zodResolver(resetSchema),
  })

  // Redirect if no phone number (sanity check)
  React.useEffect(() => {
    if (!phone) {
      setApiError('Missing phone number. Please try again.')
    }
  }, [phone])

  const onResetSubmit = async (data: ResetFormValues) => {
    if (!phone) return setIsSubmitting(false)

    setIsSubmitting(true)
    setApiError(null)
    setApiSuccess(null)
    try {
      await axiosClient.post('/auth/reset-password/verify', {
        phone: phone,
        otp: data.otp,
        newPassword: data.newPassword,
      })
      setApiSuccess('Password reset successfully! Redirecting to login...')
      setTimeout(() => {
        router.replace('/login')
      }, 2000)
    } catch (error: any) {
      setApiError(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Failed to reset password'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!phone) return
    setApiError(null)
    setIsSubmitting(true)
    try {
      await axiosClient.post('/auth/reset-password', {
        phone: phone,
      })
      setApiSuccess('OTP resent successfully.')
    } catch (error: any) {
      setApiError('Failed to resend OTP')
    } finally {
      setIsSubmitting(false)
    }
  }

  const otpIcon = React.useMemo(
    () => <TextInput.Icon icon="message-processing" />,
    []
  )
  const lockIcon = React.useMemo(() => <TextInput.Icon icon="lock" />, [])
  const eyeIcon = React.useMemo(
    () => (
      <TextInput.Icon
        icon={showPassword ? 'eye-off' : 'eye'}
        onPress={() => setShowPassword(!showPassword)}
      />
    ),
    [showPassword]
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.innerContainer}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text variant="headlineSmall" style={styles.title}>
                Reset Password
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Enter the 6-digit code sent to {phone} and your new password.
              </Text>
            </View>

            {apiError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{apiError}</Text>
              </View>
            )}
            {apiSuccess && (
              <View
                style={[
                  styles.errorContainer,
                  { backgroundColor: '#e8f5e9', borderColor: '#c8e6c9' },
                ]}
              >
                <Text style={[styles.errorText, { color: '#2e7d32' }]}>
                  {apiSuccess}
                </Text>
              </View>
            )}

            <View style={styles.formContainer}>
              <Controller
                control={resetControl}
                name="otp"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <TextInput
                      label="OTP Code"
                      value={value || ''}
                      onChangeText={(text) => onChange(text)}
                      onBlur={onBlur}
                      mode="outlined"
                      keyboardType="number-pad"
                      style={styles.input}
                      maxLength={6}
                      error={!!resetErrors.otp}
                      left={otpIcon}
                    />
                    <HelperText type="error" visible={!!resetErrors.otp}>
                      {resetErrors.otp?.message}
                    </HelperText>
                  </View>
                )}
              />
              <Controller
                control={resetControl}
                name="newPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <TextInput
                      label="New Password"
                      value={value || ''}
                      onChangeText={(text) => onChange(text)}
                      onBlur={onBlur}
                      mode="outlined"
                      secureTextEntry={!showPassword}
                      style={styles.input}
                      left={lockIcon}
                      right={eyeIcon}
                      error={!!resetErrors.newPassword}
                    />
                    <HelperText
                      type="error"
                      visible={!!resetErrors.newPassword}
                    >
                      {resetErrors.newPassword?.message}
                    </HelperText>
                  </View>
                )}
              />

              <Button
                mode="contained"
                onPress={handleResetSubmit(onResetSubmit)}
                style={styles.button}
                contentStyle={styles.buttonContent}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Reset Password
              </Button>

              <View style={styles.resendContainer}>
                <Text variant="bodyMedium">Didn't receive code? </Text>
                <Button mode="text" onPress={handleResend} compact>
                  Resend
                </Button>
              </View>

              <Button
                mode="text"
                onPress={() => router.back()}
                style={styles.backButton}
              >
                Change Phone Number
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  button: {
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 10,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  backButton: {
    marginTop: 10,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
})

export default ResetPassword
