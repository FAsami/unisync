"use client";

import { Input } from "antd";
import { PhoneOutlined } from "@ant-design/icons";
import { InputProps } from "antd/es/input";

interface PhoneInputProps
  extends Omit<InputProps, "prefix" | "value" | "onChange"> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PhoneInput = ({
  value = "",
  onChange,
  ...props
}: PhoneInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, "");

    if (inputValue.length > 10) {
      inputValue = inputValue.slice(0, 10);
    }

    const formattedValue = inputValue.length > 0 ? `+880${inputValue}` : "";

    if (onChange) {
      const { name, id, placeholder, type } = e.target;

      const syntheticEvent = {
        target: {
          name,
          id,
          placeholder,
          type,
          value: formattedValue,
        } as HTMLInputElement,
        currentTarget: {
          name,
          id,
          placeholder,
          type,
          value: formattedValue,
        } as HTMLInputElement,
      } as React.ChangeEvent<HTMLInputElement>;

      onChange(syntheticEvent);
    }
  };

  const displayValue = value?.startsWith("+880")
    ? value.slice(4)
    : value?.replace(/^\+880/, "") || "";

  return (
    <Input
      {...props}
      prefix={
        <span className='flex items-center gap-1'>
          <PhoneOutlined className='text-gray-400' />
          <span className='text-gray-700 font-medium'>+880</span>
        </span>
      }
      value={displayValue}
      onChange={handleChange}
      placeholder='1XXXXXXXXX'
      maxLength={10}
    />
  );
};
