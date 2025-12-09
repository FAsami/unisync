import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
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
import AsyncStorage from '@react-native-async-storage/async-storage'

const loginSchema = z.object({
  phoneNumber: z
    .string()
    .min(14, { message: 'Please enter a valid phone number' })
    .refine((value) => value.startsWith('+880'), {
      message: 'Phone number must start with +880',
    }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

const Login = () => {
  const router = useRouter()
  const theme = useTheme()
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      phoneNumber: '+880',
      password: '',
    },
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setApiError(null)
    try {
      const response = await axiosClient.post('/auth/login', {
        phone: data.phoneNumber,
        password: data.password,
      })

      if (response.data?.data?.access_token) {
        await AsyncStorage.setItem(
          'iam_access_token',
          response.data.data.access_token
        )
        await AsyncStorage.setItem(
          'iam_refresh_token',
          response.data.data.refresh_token
        )
        router.replace('/(tabs)')
      } else {
        setApiError(
          response?.data?.error?.message ||
            'Something went wrong. Please try again.'
        )
      }
    } catch (error: any) {
      if (error.response?.data?.error?.code === 'INVALID_CREDENTIALS') {
        setApiError(error.response.data.error.message)
      } else {
        setApiError('Something went wrong. Please try again.')
      }
      console.log(error)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text variant="bodyLarge" style={styles.subtitle}>
                Sign in to continue
              </Text>
            </View>

            <View style={styles.formContainer}>
              <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <TextInput
                      label="Phone Number"
                      value={value}
                      onChangeText={(text) => {
                        onChange(text)
                        if (apiError) setApiError(null)
                      }}
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
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <TextInput
                      label="Password"
                      value={value}
                      onChangeText={(text) => {
                        onChange(text)
                        if (apiError) setApiError(null)
                      }}
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

              <View style={styles.forgotPasswordContainer}>
                <Button
                  mode="text"
                  onPress={() => router.replace('/forgot-password')}
                  compact
                >
                  Forgot Password?
                </Button>
              </View>

              {apiError && (
                <View style={styles.errorContainer}>
                  <HelperText
                    type="error"
                    visible={!!apiError}
                    style={styles.errorText}
                  >
                    {apiError}
                  </HelperText>
                </View>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                style={styles.loginButton}
                contentStyle={styles.loginButtonContent}
              >
                Login
              </Button>

              <View style={styles.registerContainer}>
                <Text variant="bodyMedium">Don't have an account? </Text>
                <Button
                  mode="text"
                  onPress={() => router.navigate('/register')}
                  compact
                >
                  Register
                </Button>
              </View>
            </View>
          </View>
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
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  loginButton: {
    borderRadius: 8,
    marginBottom: 24,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
  },
})

export default Login
