"use client";

import { useState } from "react";

import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import { AuthDivider } from "./auth-divider";
import { AuthInput } from "./auth-input";
import { GoogleButton } from "./google-button";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    toast.success("Login successful", {
      description: `Welcome back, ${data.email}`,
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
          Welcome back
        </h1>
        <p className="mt-2 font-[var(--font-roboto)] text-muted-foreground text-sm">Sign in to continue to SeniorBob</p>
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
              placeholder="Enter your password"
              autoComplete="current-password"
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
        </motion.div>

        {/* Forgot password link */}
        <motion.div variants={staggerItem} className="flex justify-end">
          <Link
            href="/auth/v3/forgot-password"
            className="font-[var(--font-roboto)] text-muted-foreground text-xs transition-colors hover:text-foreground"
          >
            Forgot password?
          </Link>
        </motion.div>

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
              "Sign in"
            )}
          </motion.button>
        </motion.div>
      </form>

      {/* Sign up link */}
      <motion.p
        variants={staggerItem}
        className="mt-8 text-center font-[var(--font-roboto)] text-muted-foreground text-sm"
      >
        Don&apos;t have an account?{" "}
        <Link href="/auth/v3/signup" className="font-medium text-foreground transition-colors hover:text-primary">
          Sign up
        </Link>
      </motion.p>
    </motion.div>
  );
}
