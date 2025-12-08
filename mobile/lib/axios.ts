import { getEnv } from '@/utils/getEnv'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'

const axiosClient = axios.create({
  baseURL: getEnv('SERVER_URL'),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: () => true,
})

axiosClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('iam_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export { axiosClient }
