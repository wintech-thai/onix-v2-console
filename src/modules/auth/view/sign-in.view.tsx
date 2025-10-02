"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/modules/auth/components/auth-layout";
import { Controller, useForm } from "react-hook-form";
import { loginSchema, LoginSchemaType } from "../schema/login.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { authApi } from "../api/auth.api";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RouteConfig } from "@/config/route.config";

const SignInView = () => {
  const { t } = useTranslation();
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
        "/api/OnlyUser/org/temp/action/GetUserAllowedOrg"
      );
      return r.data;
    },
  });

  const handleLogin = async (data: LoginSchemaType) => {
    try {
      const r = await authApi.login(data);

      if (r.status !== 200) {
        return toast.error(t("auth.error.invalidCredentials"));
      }

      handleCheckAuthOrg();
      return toast.success(t("auth.success.login"));
    } catch (error) {
      console.log("error", error);
      return toast.error(t("auth.error.invalidCredentials"));
    }
  };

  const handleCheckAuthOrg = async () => {
    const r = await organization.mutateAsync();
    if (r.length > 0) {
      return router.push(RouteConfig.DASHBOARD.OVERVIEW(r[0].orgCustomId));
    }
  };

  return (
    <AuthLayout header={t("auth.signInHeader")}>
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
                maxLength={20}
                placeholder={t("auth.username")}
                label={t("auth.username")}
                {...field}
                errorMessage={
                  errors.UserName?.message
                    ? t("auth.error.form.username")
                    : undefined
                }
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
                type="password"
                maxLength={20}
                placeholder={t("auth.password")}
                label={t("auth.password")}
                {...field}
                errorMessage={
                  errors.Password?.message
                    ? t("auth.error.form.password")
                    : undefined
                }
              />
            );
          }}
        />

        <Button type="submit" isPending={form.formState.isSubmitting}>
          {t("auth.signInLabel")}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default SignInView;
