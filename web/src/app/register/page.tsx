"use client";

import { useState, useTransition } from "react";
import { Form, Input, Button } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { PhoneInput } from "@/components/PhoneInput";
import { registerAction } from "../actions/auth/register";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";

export default function RegisterPage() {
  const [form] = Form.useForm();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onFinish = async (values: {
    phone: string;
    password: string;
    email?: string;
  }) => {
    startTransition(async () => {
      setErrorMessage(null);
      form.resetFields(["password"]);
      const { success, message } = await registerAction(values);
      if (!success) {
        setErrorMessage(message || "Failed to register");
        form.setFields([
          { name: "phone", errors: [message || "Failed to register"] },
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
      title='Create your account'
      footer={
        <p className='text-center text-gray-600 text-sm'>
          Already have an account?{" "}
          <Link
            href='/login'
            className='text-blue-500 font-medium hover:underline'
          >
            Login
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
        name='register'
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
          required
          rules={[
            { required: true, message: "Please enter your phone number" },
            {
              pattern: /^\+8801\d{9}$/,
              message: "Please enter a valid Bangladesh phone number",
            },
          ]}
        >
          <PhoneInput placeholder='1XXXXXXXXX' />
        </Form.Item>

        <Form.Item label='Email' name='email'>
          <Input
            type='email'
            placeholder='Enter your email (optional)'
            prefix={<MailOutlined className='text-gray-400' />}
          />
        </Form.Item>

        <Form.Item
          label='Password'
          name='password'
          required
          rules={[
            { required: true, message: "Please enter your password" },
            { min: 8, message: "Must be at least 8 characters" },
            { max: 128, message: "Must not exceed 128 characters" },
            {
              pattern: /[A-Z]/,
              message: "Must contain at least one uppercase letter",
            },
            {
              pattern: /[a-z]/,
              message: "Must contain at least one lowercase letter",
            },
            {
              pattern: /[0-9]/,
              message: "Must contain at least one number",
            },
            {
              pattern: /[^A-Za-z0-9]/,
              message: "Must contain at least one special character",
            },
          ]}
        >
          <Input.Password
            placeholder='Enter your password'
            prefix={<LockOutlined className='text-gray-400' />}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            block
            loading={isPending}
            shape='round'
            size='large'
            className='text-base font-medium mt-5'
          >
            Register
          </Button>
        </Form.Item>
      </Form>
    </AuthLayout>
  );
}
