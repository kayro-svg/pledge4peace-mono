"use client";

import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import Link from "next/link";
import { FormField } from "./form-field";
import { PasswordInput } from "./password-input";
import { OrDivider } from "./or-divider";
import { SocialButton } from "./social-button";
import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { register as registerUser } from "@/lib/api/register";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  userType: string;
  office?: string;
  organization?: string;
  institution?: string;
  otherRole?: string;
}

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  isModal?: boolean;
}

export default function RegisterForm({
  onSwitchToLogin,
  isModal,
}: RegisterFormProps) {
  const form = useForm<RegisterFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [userType, setUserType] = useState("");
  const userTypeRef = useRef<HTMLButtonElement>(null);

  // Handle form errors and focus
  useEffect(() => {
    if (form.formState.errors.userType) {
      toast.error("Please select your user type");
      if (userTypeRef.current) {
        userTypeRef.current.focus();
      }
    }
  }, [form.formState.errors.userType]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      if (data.password !== data.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      // Clear any existing errors - handled by react-hook-form

      setIsLoading(true);

      // Register the user usando la función reutilizable
      const registerResponse = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        userType: data.userType,
        office: data.office,
        organization: data.organization,
        institution: data.institution,
        otherRole: data.otherRole,
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerData.message || "Registration failed");
      }

      toast.success(
        "Registration successful! Please check your email to verify your account."
      );

      // Automatically sign in after registration
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Failed to sign in after registration");
        return;
      }

      // Redirigir a la ruta deseada tras login exitoso
      router.push("/"); // Cambia "/" por la ruta que desees
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Registration failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-1 text-center">
        Create Account
      </h1>
      <p className="text-sm text-gray-500 mb-6 text-center">
        Join us and start making a difference today
      </p>

      <p className="text-center text-sm text-gray-600 mb-6">
        Already have an account?{" "}
        <button
          onClick={onSwitchToLogin}
          className="font-medium text-[#698D8B] hover:text-[#548281]"
        >
          Sign In
        </button>
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6 justify-between w-full">
          <FormField
            id="name"
            label="Full Name"
            placeholder="Enter your full name"
            {...form.register("name", { required: true })}
            required
            className="w-full flex-1  mr-8"
          />

          <FormField
            id="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            {...form.register("email", { required: true })}
            required
            autoComplete="email"
            className="w-full flex-1 mr-8"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="userType"
            className="block text-sm font-medium text-gray-700"
          >
            I am a:
          </Label>
          <Select
            value={userType}
            onValueChange={(value) => {
              setUserType(value);
              form.setValue("userType", value);
              // Clear react-hook-form errors for this field
              form.clearErrors("userType");
            }}
          >
            <SelectTrigger
              ref={userTypeRef}
              className={`${form.formState.errors.userType ? "border-red-500 ring-red-500" : ""}`}
            >
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="citizen">Citizen/Advocate</SelectItem>
              <SelectItem value="politician">
                Politician/Elected Official
              </SelectItem>
              <SelectItem value="organization">
                Organization Representative
              </SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="other">Other (please specify)</SelectItem>
            </SelectContent>
          </Select>
          <input
            type="hidden"
            {...form.register("userType", {
              required: "Please select your user type",
            })}
          />
          {form.formState.errors.userType && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.userType?.message ||
                "Please select your user type"}
            </p>
          )}
        </div>

        {userType === "politician" && (
          <FormField
            id="office"
            label="Office/Position"
            placeholder="e.g., Mayor, City Council, State Representative"
            {...form.register("office")}
          />
        )}

        {userType === "organization" && (
          <FormField
            id="organization"
            label="Organization Name"
            placeholder="e.g., Red Cross, Amnesty International, Local NGO"
            {...form.register("organization")}
          />
        )}

        {userType === "student" && (
          <FormField
            id="institution"
            label="Educational Institution"
            placeholder="e.g., Harvard University, Local High School"
            {...form.register("institution")}
          />
        )}

        {userType === "other" && (
          <FormField
            id="otherRole"
            label="Please specify your role"
            placeholder="Describe your role or profession"
            {...form.register("otherRole")}
          />
        )}

        <PasswordInput
          id="password"
          label="Password"
          placeholder="Create a password"
          register={form.register}
          fieldName="password"
          required
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm your password"
          register={form.register}
          fieldName="confirmPassword"
          required
        />

        <div className="flex items-center">
          <input
            id="agree-terms"
            {...form.register("agreeTerms", { required: true })}
            type="checkbox"
            required
            className="h-4 w-4 rounded border-gray-300 text-[#2F4858] focus:ring-[#2F4858]"
          />
          <label
            htmlFor="agree-terms"
            className="ml-2 block text-sm text-gray-700"
          >
            I agree to the{" "}
            <Link href="/terms" className="text-[#698D8B] hover:text-[#548281]">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-[#698D8B] hover:text-[#548281]"
            >
              Privacy Policy
            </Link>
          </label>
        </div>

        <div>
          <Button
            type="submit"
            className="w-full bg-[#548281] hover:bg-[#2F4858] text-white font-medium py-2.5"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </div>
      </form>

      {/* <OrDivider text="Or continue with" />

      <div className="mt-6">
        <SocialButton provider="google">Sign up with Google</SocialButton>
      </div> */}
    </div>
  );
}
