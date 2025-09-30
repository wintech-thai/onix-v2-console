"user client";

import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "./dropdown-menu";
import Cookie from "js-cookie";
import { Check, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "th", name: "ภาษาไทย", nativeName: "Thai", flag: "🇹🇭" },
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
];

export const SwitchLanguage = () => {
  const { i18n } = useTranslation();
  const currentLang = Cookie.get("i18next") || "en";

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    Cookie.set("i18next", langCode, { expires: 365 });
  };

  const currentLanguage = languages.find((lang) => lang.code === currentLang);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 px-3 h-12 bg-background/50 hover:bg-accent/50 border-border/50 backdrop-blur-sm transition-all"
          title="Change Language"
        >
          <span className="text-lg leading-none">{currentLanguage?.flag}</span>
          <span className="hidden sm:inline-block text-sm font-medium">
            {currentLanguage?.name}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => {
          const isActive = currentLang === lang.code;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`
                flex items-center gap-3 cursor-pointer py-2.5
                ${isActive ? 'bg-accent/50' : ''}
              `}
            >
              <span className="text-xl flex-shrink-0">{lang.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{lang.name}</div>
                <div className="text-xs text-muted-foreground">
                  {lang.nativeName}
                </div>
              </div>
              {isActive && (
                <Check className="size-4 text-primary flex-shrink-0" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
