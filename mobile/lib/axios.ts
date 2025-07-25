import { getEnv } from "@/utils/getEnv";
import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

interface RetryConfig extends InternalAxiosRequestConfig {
  __isRetryRequest?: boolean;
  __retryCount?: number;
}

const axiosClient = axios.create({
  baseURL: getEnv("SERVER_URL"),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const isRetryableError = (error: AxiosError): boolean => {
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  const networkErrors = [
    "ECONNABORTED",
    "ENOTFOUND",
    "ECONNRESET",
    "ETIMEDOUT",
  ];

  return !!(
    (error.code && networkErrors.includes(error.code)) ||
    (error.response && retryableStatusCodes.includes(error.response.status))
  );
};

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(
      `Making request to: ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error: AxiosError) => {
    console.error("Request error:", error.message);
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`Response received: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as RetryConfig;

    if (!config || config.__isRetryRequest) {
      console.error("Final request error:", error.message);
      return Promise.reject(error);
    }

    config.__isRetryRequest = true;
    config.__retryCount = config.__retryCount || 0;

    const maxRetries = 3;
    const shouldRetry =
      config.__retryCount < maxRetries && isRetryableError(error);

    if (shouldRetry) {
      config.__retryCount++;
      const backoffDelay = Math.min(
        1000 * Math.pow(2, config.__retryCount - 1),
        5000
      );

      console.log(
        `Retrying request (${config.__retryCount}/${maxRetries}) after ${backoffDelay}ms delay`
      );

      await delay(backoffDelay);
      return axiosClient(config);
    }

    console.error(
      `Request failed after ${config.__retryCount} retries:`,
      error.message
    );
    return Promise.reject(error);
  }
);

export { axiosClient };
