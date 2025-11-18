"use client";

import { useTransition, useState } from "react";
import { Form, Button } from "antd";
import { PhoneInput } from "@/components/PhoneInput";
import { resetPasswordAction } from "@/actions/auth/resetPassword";

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
    <>
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
    </>
  );
};

export default ForgotPasswordForm;
