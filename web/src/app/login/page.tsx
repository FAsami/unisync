"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { PhoneInput } from "@/components/PhoneInput";
import { apiClient } from "@/lib/axios";
import AuthLayout from "@/components/AuthLayout";
import Link from "next/link";

const LoginPage = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onFinish = async (values: { phone: string; password: string }) => {
    startTransition(async () => {
      try {
        setErrorMessage(null);
        form.resetFields(["password"]);

        const { data } = await apiClient.post("/auth/login", values);
        if (data.success !== true) {
          throw new Error(data?.error?.message || "Something went wrong");
        }
        router.push("/");
      } catch (error: any) {
        setErrorMessage(error?.message || "Something went wrong!");
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
      footer={
        <p className='text-center text-gray-600 text-sm'>
          Don't have an account?{" "}
          <Link
            href='/register'
            className='text-blue-500 font-medium hover:underline'
          >
            Register
          </Link>
        </p>
      }
    >
      {errorMessage ? (
        <div
          role='status'
          aria-live='polite'
          className='bg-red-50 text-center border border-red-200 text-red-600 text-sm rounded px-4 py-3 mb-8'
        >
          {errorMessage}
        </div>
      ) : null}
      <Form
        form={form}
        name='login'
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

        <Form.Item
          label='Password'
          name='password'
          rules={[{ required: true, message: "Please enter your password" }]}
        >
          <Input.Password
            placeholder='Enter your password'
            prefix={<LockOutlined className='text-gray-400' />}
          />
        </Form.Item>

        <div className='text-right mb-6 -mt-2'>
          <Link
            href='/forgot-password'
            className='text-blue-500 text-sm hover:underline'
          >
            Forgot password ?
          </Link>
        </div>

        <Form.Item className='mb-4'>
          <Button
            type='primary'
            htmlType='submit'
            block
            loading={isPending}
            shape='round'
            size='large'
            className='text-base font-medium'
          >
            LOG IN
          </Button>
        </Form.Item>
      </Form>
    </AuthLayout>
  );
};
export default LoginPage;
