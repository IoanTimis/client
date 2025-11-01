"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/ui/general/forms";
import { Div } from "@/components/ui/general/primitives";
import { register } from "@/lib/api/auth-api";
import { useDispatch } from "react-redux";
import { setError, clearError } from "@/store/features/error/error-slice";
import { useLanguage } from "@/context/language-context";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const { t } = useLanguage();

    const handleRegister = async (data) => {
    setLoading(true);
    dispatch(clearError());
        try {
            await register(data);
            router.push('/auth/login');
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                dispatch(setError(error.response.data.message));
            } else {
                dispatch(setError(t('common.genericError')));
            }
        } finally {
            setLoading(false);
        }
    }
    return (
        <Div bordered padding="lg" className="bg-stone-100">
            <AuthForm type="register" loading={loading} onSubmit={handleRegister} />
        </Div>
    );
}

        