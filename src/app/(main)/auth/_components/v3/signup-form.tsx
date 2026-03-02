"use client";

import { useState } from "react";

import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Check, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import { AuthDivider } from "./auth-divider";
import { AuthInput } from "./auth-input";
import { GoogleButton } from "./google-button";

const signupSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[0-9]/, {
        message: "Password must contain at least one number.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const passwordRequirements = [
  { regex: /.{8,}/, label: "At least 8 characters" },
  { regex: /[A-Z]/, label: "One uppercase letter" },
  { regex: /[0-9]/, label: "One number" },
];

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    toast.success("Account created!", {
      description: `Welcome to SeniorBob, ${data.name}`,
    });
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      toast.error("Google sign in failed", { description: error.message });
      setIsLoading(false);
    }
    // On success the browser redirects — keep loading state
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="w-full">
      {/* Header */}
      <motion.div variants={staggerItem} className="mb-8 text-center">
        <h1 className="font-[var(--font-cormorant-garamond)] font-semibold text-3xl text-foreground tracking-tight sm:text-4xl">
          Create account
        </h1>
        <p className="mt-2 font-[var(--font-roboto)] text-muted-foreground text-sm">
          Start designing your systems today
        </p>
      </motion.div>

      {/* Google OAuth Button */}
      <motion.div variants={staggerItem}>
        <GoogleButton onClick={handleGoogleAuth} isLoading={isLoading} />
      </motion.div>

      {/* Divider */}
      <motion.div variants={staggerItem}>
        <AuthDivider text="or continue with email" />
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <motion.div variants={staggerItem}>
          <AuthInput
            label="Full name"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            error={errors.name?.message}
            {...register("name")}
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <AuthInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <div className="relative">
            <AuthInput
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              autoComplete="new-password"
              error={errors.password?.message}
              className="pr-12"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-[38px] right-4 text-muted-foreground/50 transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {/* Password strength indicators */}
          {password && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 space-y-1.5"
            >
              {passwordRequirements.map((req) => {
                const isValid = req.regex.test(password);
                return (
                  <motion.div
                    key={req.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-full transition-colors",
                        isValid ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {isValid && <Check className="size-2.5" />}
                    </div>
                    <span
                      className={cn(
                        "font-[var(--font-roboto)] text-xs transition-colors",
                        isValid ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {req.label}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>

        <motion.div variants={staggerItem}>
          <div className="relative">
            <AuthInput
              label="Confirm password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              className="pr-12"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-[38px] right-4 text-muted-foreground/50 transition-colors hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </motion.div>

        {/* Terms agreement */}
        <motion.p variants={staggerItem} className="font-[var(--font-roboto)] text-muted-foreground text-xs">
          By creating an account, you agree to our{" "}
          <Link
            href="/terms"
            className="text-foreground underline underline-offset-2 transition-colors hover:text-primary"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-foreground underline underline-offset-2 transition-colors hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </motion.p>

        {/* Submit button */}
        <motion.div variants={staggerItem}>
          <motion.button
            type="submit"
            disabled={isLoading}
            className={cn(
              "relative w-full rounded-lg px-4 py-3.5",
              "bg-foreground text-background",
              "font-[var(--font-roboto)] font-medium text-sm",
              "transition-all duration-300",
              "hover:opacity-90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {isLoading ? (
              <motion.div
                className="mx-auto size-5 rounded-full border-2 border-background/20 border-t-background"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              "Create account"
            )}
          </motion.button>
        </motion.div>
      </form>

      {/* Sign in link */}
      <motion.p
        variants={staggerItem}
        className="mt-8 text-center font-[var(--font-roboto)] text-muted-foreground text-sm"
      >
        Already have an account?{" "}
        <Link href="/auth/v3/login" className="font-medium text-foreground transition-colors hover:text-primary">
          Sign in
        </Link>
      </motion.p>
    </motion.div>
  );
}
