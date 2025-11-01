"use client";

import React from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useLanguage } from "@/context/language-context";

export default function CommentInput({ value, setValue, onSubmit, disabled }) {
  const { t } = useLanguage();

  return (
    <div className="bg-stone-100 p-3 rounded-t-lg">
      <form
        className="flex items-center w-full border border-gray-300 rounded-lg p-2 bg-white"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.();
        }}
      >
        <textarea
          className="w-full text-black p-2 resize-none focus:outline-none focus:ring-0 overflow-hidden"
          placeholder="Scrie comentariul aici..."
          value={value}
          rows={1}
          maxLength={500}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.value.length <= 500) {
              setValue?.(e.target.value);
            }
          }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
        />

        <button
          type="submit"
          disabled={disabled || !value || value.trim() === ""}
          className={`ml-2 flex items-center justify-center p-2 rounded-full transition ${
            disabled || !value || value.trim() === ""
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-white hover:bg-blue-700 text-blue-700 hover:text-white border border-blue-800 cursor-pointer"
          }`}
          aria-label="Trimite comentariul"
          title="Trimite"
        >
          <PaperAirplaneIcon className="w-4 h-4 transform" />
        </button>
      </form>
      {value?.length === 500 && (
        <div>
          <p className="text-red-500 text-sm">{t('common.max_length_reached_500')}</p>
        </div>
      )}
    </div>
  );
}
