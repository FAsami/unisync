export interface LoginInput {
  phone: string;
  password: string;
}

export interface RegisterInput {
  phone: string;
  password: string;
  email?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    session_id: string;
    access_token: string;
    refresh_token: string;
    role: string;
  };
}

export {
  loginAction as login,
  registerAction as register,
} from "@/app/actions/auth";
