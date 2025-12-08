import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
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
import { setToken, setRefreshToken } from '@/utils/token'

const verifySchema = z.object({
  otp: z
    .string()
    .length(6, { message: 'OTP must be exactly 6 digits' })
    .regex(/^\d+$/, { message: 'OTP must contain only numbers' }),
})

type VerifyFormValues = z.infer<typeof verifySchema>

const VerifyOTPScreen = () => {
  const router = useRouter()
  const theme = useTheme()
  const params = useLocalSearchParams<{ phone: string; purpose: string }>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormValues>({
    defaultValues: {
      otp: '',
    },
    resolver: zodResolver(verifySchema),
  })

  useEffect(() => {
    let interval: any
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    } else {
      setCanResend(true)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const onResend = async () => {
    if (!params.phone) return
    setApiError(null)
    setCanResend(false)
    setResendTimer(30)
    try {
      const response = await axiosClient.post('/otp/send', {
        identifier: params.phone,
        identifierType: 'PHONE',
        purpose: params.purpose || 'SIGNUP',
      })
      if (!response.data.success) {
        setApiError(response.data.error?.message || 'Failed to resend OTP')
        setCanResend(true)
        setResendTimer(0)
      }
    } catch (error: any) {
      setApiError(
        error?.response?.data?.error?.message ||
          error?.message ||
          'Failed to resend OTP'
      )
      setCanResend(true)
      setResendTimer(0)
    }
  }

  const onSubmit = async (data: VerifyFormValues) => {
    if (!params.phone) {
      setApiError('Phone number is missing')
      return
    }

    setIsSubmitting(true)
    setApiError(null)
    try {
      const response = await axiosClient.post('/auth/register/verify', {
        phone: params.phone,
        otp: data.otp,
      })

      console.log('Verify Response', response.data)

      if (response.data.success) {
        const { access_token, refresh_token } =
          response.data.data.insert_user_session_one
        await setToken(access_token)
        await setRefreshToken(refresh_token)

        // Navigate to tabs/home and reset stack
        router.replace('/(tabs)')
      } else {
        setApiError(response.data.error?.message || 'Verification failed')
      }
    } catch (error: any) {
      setApiError(
        error?.response?.data?.error?.message ||
          error?.message ||
          'Something went wrong during verification'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.innerContainer}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('@/assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text variant="headlineSmall" style={styles.title}>
                  Verify OTP
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                  Enter the code sent to {params.phone}
                </Text>
              </View>

              {apiError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{apiError}</Text>
                </View>
              )}

              <View style={styles.formContainer}>
                <Controller
                  control={control}
                  name="otp"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <TextInput
                        label="OTP Code"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        mode="outlined"
                        keyboardType="number-pad"
                        style={styles.input}
                        maxLength={6}
                        error={!!errors.otp}
                        left={<TextInput.Icon icon="message-processing" />}
                      />
                      <HelperText type="error" visible={!!errors.otp}>
                        {errors.otp?.message}
                      </HelperText>
                    </View>
                  )}
                />

                <Button
                  mode="contained"
                  onPress={handleSubmit(onSubmit)}
                  style={styles.verifyButton}
                  contentStyle={styles.verifyButtonContent}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Verify
                </Button>

                <View style={styles.resendContainer}>
                  <Text variant="bodyMedium">Didn't receive code? </Text>
                  <Button
                    mode="text"
                    onPress={onResend}
                    disabled={!canResend}
                    compact
                  >
                    Resend {resendTimer > 0 ? `(${resendTimer}s)` : ''}
                  </Button>
                </View>

                <Button
                  mode="text"
                  onPress={() => router.back()}
                  style={styles.backButton}
                >
                  Back
                </Button>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
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
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 4,
    backgroundColor: '#fff',
    letterSpacing: 4,
    fontSize: 20,
  },
  verifyButton: {
    borderRadius: 8,
    marginBottom: 24,
    marginTop: 10,
  },
  verifyButtonContent: {
    paddingVertical: 8,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
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
})

export default VerifyOTPScreen
