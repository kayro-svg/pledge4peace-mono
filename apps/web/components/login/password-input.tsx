"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { UseFormRegister } from "react-hook-form";

interface PasswordInputProps {
  id: string;
  label: string;
  placeholder: string;
  register: UseFormRegister<any>;
  fieldName: string;
  validation?: object;
  required?: boolean;
  autoComplete?: string;
}

export function PasswordInput({
  id,
  label,
  placeholder,
  register,
  fieldName,
  validation = {},
  required = false,
  autoComplete,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          {...register(fieldName, { required, ...validation })}
          type={showPassword ? "text" : "password"}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full pr-10"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </button>
      </div>
    </div>
  );
}
