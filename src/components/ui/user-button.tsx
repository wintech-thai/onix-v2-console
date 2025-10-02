import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/modules/auth/api/auth.api";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Hint } from "./hint";
import Cookie from "js-cookie";
import Image from "next/image";
import { useState } from "react";
import { ResetPasswordModal } from "@/modules/auth/components/modal/reset-password.modal";

export const UserButton = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const userName = Cookie.get("user_name") || "User";
  const params = useParams<{ orgId: string }>();

  const logoutMutation = useMutation({
    mutationKey: [authApi.logout.keys],
    mutationFn: (orgId: string) => authApi.logout.api(orgId),
  });

  const cleanCookies = useMutation({
    mutationKey: ["clean-cookies"],
    mutationFn: () => {
      return authApi.logout.clearCookies();
    },
  });

  return (
    <>
      <ResetPasswordModal
        open={open}
        onClose={() => setOpen(false)}
      />
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Hint message={userName}>
            <Image
              src="/default-user.jpg"
              width={40}
              height={40}
              alt="User"
              className="rounded-full cursor-pointer flex-shrink-0"
            />
          </Hint>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>{t("navbar.profile")}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>{t("navbar.updatePassword")}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () =>
              logoutMutation.mutateAsync(params.orgId, {
                onError: () => toast.error(t("common.error")),
                onSuccess: async () => {
                  await cleanCookies.mutateAsync();
                  window.location.href = "/auth/sign-in";
                },
              })
            }
            disabled={logoutMutation.isPending}
          >
            {t("navbar.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
