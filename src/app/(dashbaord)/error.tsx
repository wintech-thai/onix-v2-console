"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronDown, ChevronUp, Home, RefreshCcw } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log error to an error reporting service
    console.error("Error caught by error boundary:", error);
  }, [error]);

  const handleReset = () => {
    reset();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-20 animate-pulse" />
              <div className="relative bg-red-100 dark:bg-red-900/30 p-6 rounded-full">
                <AlertTriangle className="w-16 h-16 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
            {t("error.title")}
          </h1>

          {/* Description */}
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 text-lg">
            {t("error.description")}
          </p>

          {/* Error Details Toggle */}
          <div className="mb-8">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("error.errorDetails")}
              </span>
              {showDetails ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {showDetails && (
              <div className="mt-4 p-4 bg-gray-900 dark:bg-gray-950 rounded-lg overflow-auto max-h-64">
                <pre className="text-xs text-red-400 font-mono whitespace-pre-wrap break-words">
                  {error.message}
                  {error.digest && `\n\nDigest: ${error.digest}`}
                  {error.stack && `\n\nStack Trace:\n${error.stack}`}
                </pre>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleReset}
              className="flex-1 h-12"
              size="lg"
            >
              <RefreshCcw className="w-5 h-5 mr-2" />
              {t("error.retry")}
            </Button>
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="flex-1 h-12"
              size="lg"
            >
              <Home className="w-5 h-5 mr-2" />
              {t("error.goHome")}
            </Button>
          </div>

          {/* Go Back Link */}
          <div className="mt-6 text-center">
            <button
              onClick={handleGoBack}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline transition-colors"
            >
              {t("error.goBack")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
