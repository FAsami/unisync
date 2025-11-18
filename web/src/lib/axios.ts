import axios from "axios";

const apiBase = process.env.NEXT_PUBLIC_API_URL;

if (!apiBase) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

export const apiClient = axios.create({
  baseURL: apiBase,
  withCredentials: true,
  validateStatus: () => true,
});
