"use client";

import { Sparkles, Rocket, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export const CommingSoon = () => {
  const { t } = useTranslation("common");

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center px-4 max-w-2xl">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="mb-8 inline-block"
        >
          <div className="relative">
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-20 blur-2xl"
            />
            <Rocket className="w-24 h-24 text-blue-600 dark:text-blue-400 relative z-10" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="w-full h-full text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t("comingSoon.title")}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-2">
            {t("comingSoon.description")}
          </p>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
            {t("comingSoon.subDescription")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-8 text-gray-500 dark:text-gray-400"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex flex-col items-center gap-2"
          >
            <Sparkles className="w-8 h-8" />
            <span className="text-sm">{t("comingSoon.newFeatures")}</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
            className="flex flex-col items-center gap-2"
          >
            <Clock className="w-8 h-8" />
            <span className="text-sm">{t("comingSoon.stayTuned")}</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-2 h-2 rounded-full bg-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("comingSoon.inDevelopment")}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
