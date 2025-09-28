"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/modules/auth/components/auth-layout";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { loginSchema, LoginSchemaType } from "../schema/login.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { authApi } from "../api/auth.api";

const SignInView = () => {
  const router = useRouter();
  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      Password: "",
      UserName: "",
    },
    mode: "all",
  });
  const errors = form.formState.errors;

  const organization = useMutation({
    mutationKey: ["organization"],
    mutationFn: async () => {
      const r = await api.get(
        "/api/Organization/org/temp/action/GetUserAllowedOrg"
      );
      return r.data;
    },
  });

  const handleLogin = async (data: LoginSchemaType) => {
    try {
      const r = await authApi.login(data);

      if (r.status !== 200) {
        alert("Login failed");
      }

      handleCheckAuthOrg();
    } catch (error) {
      console.log("error", error);
      alert("An error occurred during login");
    }
  };

  const handleCheckAuthOrg = async () => {
    const r = await organization.mutateAsync();
    if (r.length > 0) {
      return router.push(`/dashboard/${r[0].orgCustomId}`);
    }
  };

  return (
    <AuthLayout header="Sign In to your account">
      <form
        className="flex flex-col space-y-4"
        onSubmit={form.handleSubmit(handleLogin)}
      >
        <Controller
          control={form.control}
          name="UserName"
          render={({ field }) => {
            return (
              <Input
                placeholder="username"
                label="Username"
                {...field}
                errorMessage={errors.UserName?.message}
              />
            );
          }}
        />
        <Controller
          control={form.control}
          name="Password"
          render={({ field }) => {
            return (
              <Input
                placeholder="Password"
                label="Password"
                {...field}
                errorMessage={errors.Password?.message}
              />
            );
          }}
        />

        <Button type="submit" isPending={form.formState.isSubmitting}>
          Sign In
        </Button>
      </form>

      <Link href="/auth/forgot-password" className="text-primary">
        Forgot your password?
      </Link>
    </AuthLayout>
  );
};

export default SignInView;
