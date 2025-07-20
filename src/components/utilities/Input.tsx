'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input
      {...props}
      className={`w-full text-sm border border-gray-300 rounded px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#1773b0] focus:border-[#1773b0] transition-all duration-150 ${className}`}
    />
  );
};

export default Input;
