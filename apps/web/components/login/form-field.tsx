import { Input } from "@/components/ui/input";
import { UseFormRegister } from "react-hook-form";

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  register: UseFormRegister<any>;
  fieldName: string;
  validation?: object;
  required?: boolean;
  autoComplete?: string;
}

export function FormField({
  id,
  label,
  type = "text",
  placeholder,
  register,
  fieldName,
  validation = {},
  required = false,
  autoComplete,
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <Input
        id={id}
        type={type}
        {...register(fieldName, { required, ...validation })}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="w-full"
      />
    </div>
  );
}
