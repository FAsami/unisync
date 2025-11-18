"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button } from "antd";
import { KeyOutlined } from "@ant-design/icons";
import { apiClient } from "@/lib/axios";
import AuthLayout from "@/components/AuthLayout";
import {
  RESEND_INTERVAL_SECONDS,
  clearVerifyContext,
  loadVerifyContext,
  updateVerifyContext,
  VerifyContext,
} from "@/lib/verifyContext";

type VerifyFormValues = {
  otp: string;
};

const defaultRedirect: Partial<Record<VerifyContext["flow"], string>> = {
  register: "/",
  "phone-verify": "/",
};

export default function VerifyPage() {
  const router = useRouter();
  const [context, setContext] = useState<VerifyContext | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [form] = Form.useForm<VerifyFormValues>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(
    null
  );
  const [resendRemaining, setResendRemaining] = useState(0);
  const [initialSendTriggered, setInitialSendTriggered] = useState(false);

  useEffect(() => {
    const loadedContext = loadVerifyContext();
    if (loadedContext?.flow === "reset-password") {
      router.push("/forgot-password/verify");
      return;
    }
    setContext(loadedContext);
    setIsLoaded(true);
  }, [router]);

  useEffect(() => {
    if (context?.resendAvailableAt) {
      const diff = context.resendAvailableAt - Date.now();
      setResendAvailableAt(context.resendAvailableAt);
      setResendRemaining(diff > 0 ? Math.ceil(diff / 1000) : 0);
    } else {
      setResendAvailableAt(null);
      setResendRemaining(0);
    }
  }, [context]);

  const applyContextPatch = useCallback((patch: Partial<VerifyContext>) => {
    const next = updateVerifyContext(patch);
    if (next) {
      setContext(next);
    }
    return next;
  }, []);

  useEffect(() => {
    if (!resendAvailableAt) return;
    const interval = window.setInterval(() => {
      const diff = resendAvailableAt - Date.now();
      if (diff <= 0) {
        setResendAvailableAt(null);
        setResendRemaining(0);
        applyContextPatch({ resendAvailableAt: undefined });
        window.clearInterval(interval);
        return;
      }
      setResendRemaining(Math.ceil(diff / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [resendAvailableAt, applyContextPatch]);

  const sendOtp = useCallback(async () => {
    if (!context) {
      setErrorMessage("Verification session not found");
      return;
    }

    if (resendAvailableAt && resendAvailableAt > Date.now()) {
      return;
    }

    try {
      setIsSendingOtp(true);

      const response = await apiClient.post("/otp/send", {
        identifier: context.identifier,
        identifierType: context.identifierType,
        purpose: context.purpose,
      });

      const { status, data } = response;
      const payload =
        data && typeof data === "object" && "success" in data
          ? data
          : status < 400
          ? { success: true, data }
          : {
              success: false,
              message:
                (data as { message?: string })?.message || "OTP request failed",
            };

      if (!payload.success) {
        throw new Error(
          (payload as { message?: string }).message || "OTP request failed"
        );
      }

      const nextAvailableAt = Date.now() + RESEND_INTERVAL_SECONDS * 1000;
      setResendAvailableAt(nextAvailableAt);
      setResendRemaining(RESEND_INTERVAL_SECONDS);
      applyContextPatch({ resendAvailableAt: nextAvailableAt });
    } catch (error: any) {
      setErrorMessage(error?.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  }, [context, resendAvailableAt, applyContextPatch]);

  useEffect(() => {
    if (!isLoaded || !context || initialSendTriggered) {
      return;
    }

    setInitialSendTriggered(true);

    if (context.resendAvailableAt && context.resendAvailableAt > Date.now()) {
      return;
    }

    void sendOtp();
  }, [context, isLoaded, initialSendTriggered, sendOtp]);

  const subtitle = useMemo(() => {
    if (!context?.identifier) {
      return "Enter the verification code sent to your phone.";
    }

    const channel = context.identifierType === "EMAIL" ? "email" : "phone";

    return (
      <>
        We've sent an OTP to your{" "}
        <span className='font-medium text-gray-900'>{context.identifier}</span>{" "}
        {channel}.
      </>
    );
  }, [context]);

  const title = useMemo(() => {
    if (!context) return "Verify";
    if (context.flow === "phone-verify") return "Verify your phone";
    return "Verify your account";
  }, [context]);

  const onFinish = (values: VerifyFormValues) => {
    startTransition(async () => {
      try {
        if (!context?.identifier) {
          throw new Error("Verification session not found");
        }

        setErrorMessage(null);

        form.setFields([{ name: "otp", errors: [] }]);

        const identifierKey =
          context.identifierType === "EMAIL" ? "email" : "phone";

        const response = await apiClient.post("/auth/register/verify", {
          [identifierKey]: context.identifier,
          otp: values.otp,
        });

        const { status, data } = response;
        const payload =
          data && typeof data === "object" && "success" in data
            ? data
            : status < 400
            ? { success: true, data }
            : {
                success: false,
                message:
                  (data as { message?: string })?.message ||
                  "Verification failed",
              };

        if (!payload.success) {
          throw new Error(
            (payload as { message?: string }).message || "Verification failed"
          );
        }

        clearVerifyContext();
        setContext(null);
        setResendAvailableAt(null);
        setResendRemaining(0);
        router.push(context.redirectTo || defaultRedirect[context.flow] || "/");
      } catch (error: any) {
        const message = error?.message || "Verification failed";
        setErrorMessage(message);

        form.setFields([{ name: "otp", errors: [message] }]);
      }
    });
  };

  const onFinishFailed = ({ errorFields }: any) => {
    if (errorFields?.length) {
      form.scrollToField(errorFields[0].name);
    }
  };

  const footerContent = (
    <p className='text-sm text-gray-600 text-center'>
      Didn't receive the code?{" "}
      {resendRemaining > 0 ? (
        <span className='font-medium text-gray-500'>
          Resend available in {resendRemaining}s
        </span>
      ) : (
        <button
          type='button'
          onClick={() => void sendOtp()}
          disabled={!context || isSendingOtp}
          className='text-blue-500 font-medium hover:underline disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline'
        >
          {isSendingOtp ? "Sending..." : "Resend code"}
        </button>
      )}
    </p>
  );

  if (isLoaded && !context) {
    return (
      <AuthLayout
        title='Nothing to verify'
        subtitle='We could not find any verification request. Start over to receive a new code.'
      >
        <Button
          type='primary'
          block
          shape='round'
          size='large'
          className='text-base font-medium'
          onClick={() => router.push("/login")}
        >
          Go to login
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={title} subtitle={subtitle} footer={footerContent}>
      {errorMessage ? (
        <div
          role='status'
          aria-live='polite'
          className='bg-red-50 border border-red-200 text-red-600 text-sm rounded px-4 py-3 mb-8'
        >
          {errorMessage}
        </div>
      ) : null}
      <Form
        form={form}
        name='verify'
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        layout='vertical'
        requiredMark={false}
        size='large'
        variant='underlined'
        className='[&_.ant-form-item-explain-error]:mt-2'
      >
        <Form.Item
          label='Verification Code'
          name='otp'
          rules={[
            { required: true, message: "Please enter the verification code" },
            {
              pattern: /^\d{4,6}$/,
              message: "Please enter a valid OTP (4-6 digits)",
            },
          ]}
        >
          <Input
            placeholder='Enter verification code'
            prefix={<KeyOutlined className='text-gray-400' />}
            maxLength={6}
          />
        </Form.Item>

        <Form.Item className='mb-0'>
          <Button
            type='primary'
            htmlType='submit'
            block
            loading={isPending}
            shape='round'
            size='large'
            className='text-base font-medium'
            disabled={!context}
          >
            Verify
          </Button>
        </Form.Item>
      </Form>
    </AuthLayout>
  );
}
