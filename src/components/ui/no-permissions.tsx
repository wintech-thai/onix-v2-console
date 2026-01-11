import { extractApiNameFromError } from "@/lib/utils";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

interface NoPermissionsPageProps {
  errors: AxiosError;
}

export const NoPermissionsPage = (props: NoPermissionsPageProps) => {
  const { t } = useTranslation("common");

  const apiName = extractApiNameFromError(props.errors);

  return (
    <div className="h-full flex flex-col items-center justify-center rounded-xl p-8 text-amber-600 shadow-md">
      <svg
        width="64"
        height="64"
        fill="none"
        viewBox="0 0 24 24"
        className="mb-4"
      >
        <circle cx="12" cy="12" r="10" fill="#fde68a" />
        <path
          d="M9.17 8.17a3 3 0 0 1 5.66 0"
          stroke="#d97706"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect
          x="9"
          y="11"
          width="6"
          height="5"
          rx="1.5"
          fill="#fff7ed"
          stroke="#d97706"
          strokeWidth="1.2"
        />
        <circle cx="12" cy="13.5" r=".7" fill="#d97706" />
      </svg>
      <h2 className="mb-2 text-2xl font-semibold">
        {apiName
          ? t("noPermissions.title", { apiName })
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            t("noPermissions.genericTitle" as any)}
      </h2>
      <p className="max-w-xs text-center text-base text-amber-800">
        {t("noPermissions.description")}
      </p>
    </div>
  );
};
