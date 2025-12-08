import React, { useState } from 'react'
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
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { axiosClient } from '@/lib/axios'

const registerSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, { message: 'Please enter your phone number' })
    .regex(/^\+8801\d{9}$/, {
      message: 'Please enter a valid Bangladesh phone number (+8801XXXXXXXXX)',
    }),
  email: z
    .string()
    .email({ message: 'Please enter a valid email' })
    .optional()
    .or(z.literal('')),
  password: z
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

type RegisterFormValues = z.infer<typeof registerSchema>

const Register = () => {
  const router = useRouter()
  const theme = useTheme()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      phoneNumber: '+880',
      email: '',
      password: '',
    },
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true)
    setApiError(null)
    try {
      const registerResponse = await axiosClient.post('/auth/register', {
        phone: data.phoneNumber,
        password: data.password,
        email: data.email || undefined,
      })

      if (registerResponse.data.success) {
        try {
          await axiosClient.post('/otp/send', {
            identifier: data.phoneNumber,
            identifierType: 'PHONE',
            purpose: 'SIGNUP',
          })

          console.log('Registration successful, OTP sent')

          router.push({
            pathname: '/verify-otp',
            params: { phone: data.phoneNumber, purpose: 'SIGNUP' },
          })
        } catch (otpError: any) {
          setApiError(
            otpError?.response?.data?.message ||
              otpError?.message ||
              'Failed to send OTP'
          )
        }
      } else {
        setApiError(
          registerResponse.data.error.message || 'Registration failed'
        )
      }
    } catch (error: any) {
      setApiError(
        error?.response?.data?.error?.message ||
          error?.message ||
          'Something went wrong during registration'
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
                <Text variant="bodyLarge" style={styles.subtitle}>
                  Create an account
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
                  name="phoneNumber"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <TextInput
                        label="Phone Number"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        mode="outlined"
                        keyboardType="phone-pad"
                        style={styles.input}
                        left={<TextInput.Icon icon="phone" />}
                        error={!!errors.phoneNumber}
                      />
                      <HelperText type="error" visible={!!errors.phoneNumber}>
                        {errors.phoneNumber?.message}
                      </HelperText>
                    </View>
                  )}
                />

                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <TextInput
                        label="Email (Optional)"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        mode="outlined"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.input}
                        left={<TextInput.Icon icon="email" />}
                        error={!!errors.email}
                      />
                      <HelperText type="error" visible={!!errors.email}>
                        {errors.email?.message}
                      </HelperText>
                    </View>
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <TextInput
                        label="Password"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        mode="outlined"
                        secureTextEntry={!showPassword}
                        style={styles.input}
                        left={<TextInput.Icon icon="lock" />}
                        right={
                          <TextInput.Icon
                            icon={showPassword ? 'eye-off' : 'eye'}
                            onPress={() => setShowPassword(!showPassword)}
                          />
                        }
                        error={!!errors.password}
                      />
                      <HelperText type="error" visible={!!errors.password}>
                        {errors.password?.message}
                      </HelperText>
                    </View>
                  )}
                />

                <Button
                  mode="contained"
                  onPress={handleSubmit(onSubmit)}
                  style={styles.registerButton}
                  contentStyle={styles.registerButtonContent}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Register
                </Button>

                <View style={styles.loginContainer}>
                  <Text variant="bodyMedium">Already have an account? </Text>
                  <Button
                    mode="text"
                    onPress={() => router.push('/login')}
                    compact
                  >
                    Login
                  </Button>
                </View>
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
    marginBottom: 10,
    marginTop: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  subtitle: {
    color: '#666',
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  registerButton: {
    borderRadius: 8,
    marginBottom: 24,
    marginTop: 10,
  },
  registerButtonContent: {
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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

export default Register
