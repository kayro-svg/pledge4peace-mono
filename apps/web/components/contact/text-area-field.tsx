import { UseFormRegister } from "react-hook-form";

interface TextAreaFieldProps {
  id: string;
  label: string;
  placeholder: string;
  register: UseFormRegister<any>;
  fieldName: string;
  validation?: object;
  required?: boolean;
  minHeight?: string;
}

export function TextAreaField({
  id,
  label,
  placeholder,
  register,
  fieldName,
  validation = {},
  required = false,
  minHeight = "min-h-[150px]",
}: TextAreaFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        id={id}
        {...register(fieldName, { required, ...validation })}
        className={`${minHeight} w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
