"use client";

import { XIcon } from "lucide-react";
import { KeyboardEvent, useState } from "react";
import { Input } from "./input";
import { Label } from "./label";

interface InputTagsProps {
  label?: string;
  placeholder?: string;
  errorMessage?: string;
  maxLength?: number;
  disabled?: boolean;
  isRequired?: boolean;
  value: string; // Comma-separated string
  onChange: (value: string) => void;
  onValidate?: () => void;
}

export const InputTags = ({
  label,
  placeholder = "Type and press Enter to add tag",
  errorMessage,
  maxLength = 30,
  disabled = false,
  isRequired = false,
  value,
  onChange,
  onValidate,
}: InputTagsProps) => {
  const [tagInput, setTagInput] = useState("");

  const tagsArray = value
    ? value.split(",").filter((tag) => tag.trim() !== "")
    : [];

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmedTag = tagInput.trim();

      if (trimmedTag && !tagsArray.includes(trimmedTag)) {
        const newTags = [...tagsArray, trimmedTag];
        onChange(newTags.join(","));
        onValidate?.();
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tagsArray.filter((tag) => tag !== tagToRemove);
    onChange(newTags.join(","));
    onValidate?.();
  };

  return (
    <div>
      {label && (
        <Label>
          {label} {isRequired && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className={label ? "mt-2" : ""}>
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          errorMessage={errorMessage}
          maxLength={maxLength}
          disabled={disabled}
        />
      </div>
      {tagsArray.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tagsArray.map((tag, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:bg-primary-foreground/20 rounded-full p-0.5 disabled:cursor-not-allowed"
                disabled={disabled}
              >
                <XIcon className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
