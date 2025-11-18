"use client";

import { useTransition, useState } from "react";
import { Form, Button } from "antd";
import Link from "next/link";
import { PhoneInput } from "@/components/PhoneInput";
import AuthLayout from "@/components/AuthLayout";
import { resetPasswordAction } from "../actions/auth/resetPassword";

const ForgotPasswordForm = () => {
  const [form] = Form.useForm();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onFinish = async (values: { phone: string }) => {
    startTransition(async () => {
      const { success, message } = await resetPasswordAction(values);
      if (!success) {
        setErrorMessage(message || "Failed to send OTP");
        form.setFields([
          { name: "phone", errors: [message || "Failed to send OTP"] },
        ]);
      }
    });
  };

  const onFinishFailed = ({ errorFields }: any) => {
    if (errorFields?.length) {
      form.scrollToField(errorFields[0].name);
    }
  };

  return (
    <AuthLayout
      title='Forgot password'
      subtitle='Enter your phone number to receive reset instructions.'
      footer={
        <p className='text-center text-gray-600 text-sm'>
          Remembered it?{" "}
          <Link
            href='/login'
            className='text-blue-500 font-medium hover:underline'
          >
            Back to login
          </Link>
        </p>
      }
    >
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
        name='forgot-password'
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        layout='vertical'
        requiredMark={false}
        size='large'
        variant='underlined'
        className='[&_.ant-form-item-explain-error]:mt-2'
      >
        <Form.Item
          label='Phone'
          name='phone'
          rules={[
            { required: true, message: "Please enter your phone number" },
            {
              pattern: /^\+8801\d{9}$/,
              message: "Please enter a valid Bangladeshi phone number",
            },
          ]}
        >
          <PhoneInput placeholder='1XXXXXXXXX' />
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
          >
            Send reset code
          </Button>
        </Form.Item>
      </Form>
    </AuthLayout>
  );
};

export default ForgotPasswordForm;
