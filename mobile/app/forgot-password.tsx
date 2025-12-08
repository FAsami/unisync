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
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { axiosClient } from '@/lib/axios'

const requestSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, { message: 'Please enter your phone number' })
    .regex(/^\+8801\d{9}$/, {
      message: 'Please enter a valid Bangladesh phone number (+8801XXXXXXXXX)',
    }),
})

type RequestFormValues = z.infer<typeof requestSchema>

const ForgotPassword = () => {
  const router = useRouter()
  const theme = useTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // Form for Step 1
  const {
    control: requestControl,
    handleSubmit: handleRequestSubmit,
    formState: { errors: requestErrors },
  } = useForm<RequestFormValues>({
    defaultValues: { phoneNumber: '+880' },
    resolver: zodResolver(requestSchema),
  })

  const onRequestSubmit = async (data: RequestFormValues) => {
    setIsSubmitting(true)
    setApiError(null)
    try {
      await axiosClient.post('/auth/reset-password', {
        phone: data.phoneNumber,
      })
      // Navigate to the reset page with the phone number
      router.push({
        pathname: '/reset-password',
        params: { phone: data.phoneNumber },
      })
    } catch (error: any) {
      setApiError(
        error?.response?.data?.message || error?.message || 'Failed to send OTP'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const phoneIcon = React.useMemo(() => <TextInput.Icon icon="phone" />, [])

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
                Forgot Password?
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Enter your phone number to receive a reset code.
              </Text>
            </View>

            {apiError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{apiError}</Text>
              </View>
            )}

            <View style={styles.formContainer}>
              <Controller
                control={requestControl}
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
                      left={phoneIcon}
                      error={!!requestErrors.phoneNumber}
                    />
                    <HelperText
                      type="error"
                      visible={!!requestErrors.phoneNumber}
                    >
                      {requestErrors.phoneNumber?.message}
                    </HelperText>
                  </View>
                )}
              />
              <Button
                mode="contained"
                onPress={handleRequestSubmit(onRequestSubmit)}
                style={styles.button}
                contentStyle={styles.buttonContent}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Send Code
              </Button>

              <Button
                mode="text"
                onPress={() => router.back()}
                style={styles.backButton}
              >
                Back to Login
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
})

export default ForgotPassword
