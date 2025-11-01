/**
 * ErrorDiv — reads error message from Redux and displays a dismissible alert.
 * - Closes when the X is clicked, dispatching clearError().
 */
import React from "react";
import { useLanguage } from "@/context/language-context";
import { useDispatch, useSelector } from "react-redux";
import { clearError } from "@/store/features/error/error-slice";
import { XMarkIcon } from "@heroicons/react/24/solid";

const ErrorDiv = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const errorMessage = useSelector((s) => s.error?.message);

  if (!errorMessage) return null;

  return (
    <div className="bg-red-100 text-red-800 p-4 rounded mb-4 text-center relative">
      <button aria-label={t('common.dismiss')}
        className="absolute top-1 right-2 text-lg text-red-700" onClick={() => dispatch(clearError())}>
        <XMarkIcon className="h-5 w-5 cursor-pointer" />
      </button>
      {errorMessage}
    </div>
  );
};

export default ErrorDiv;