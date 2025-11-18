"use client";

import Image from "next/image";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  title?: string;
  subtitle?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  footer,
  children,
}: AuthLayoutProps) {
  const hasHeaderContent = Boolean(title || subtitle);

  return (
    <div className='min-h-screen flex items-center justify-center p-5 bg-linear-to-br from-blue-50 to-indigo-100'>
      <div className='w-full max-w-[450px] p-12 bg-white'>
        <div className='flex flex-col items-center justify-center mb-5'>
          <Image src='/logo.png' width={120} height={120} alt='Unisync' />
        </div>

        {title ? (
          <h1 className='text-3xl font-bold text-center text-gray-900 mb-2'>
            {title}
          </h1>
        ) : null}

        {subtitle ? (
          <div className='text-center text-gray-600 text-sm'>{subtitle}</div>
        ) : null}

        <div className={hasHeaderContent ? "mt-8" : ""}>{children}</div>

        {footer ? <div className='mt-8'>{footer}</div> : null}
      </div>
    </div>
  );
}




