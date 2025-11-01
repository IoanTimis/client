"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import AxiosInstance from "@/lib/api/api";
import { Section, Input, Button } from "@/components/ui/general/primitives";
import { setError } from "@/store/features/error/error-slice";
import  { useState, useEffect } from "react";
import { useLanguage } from "@/context/language-context";
import { setUser } from "@/store/features/user/user-slice";

export default function ProfilePage() {
    const { t } = useLanguage();
	const dispatch = useDispatch();
	const userInfo = useSelector((s) => s.user?.info || {});
	console.log("User Info:", userInfo);
	const [saving, setSaving] = useState(false);
	const [changingPass, setChangingPass] = useState(false);
	const [message, setMessage] = useState("");
	const [pwdMsg, setPwdMsg] = useState("");
	const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });

	// Only allow editing first_name and name; prefill from Redux info if available
	const [form, setForm] = useState({
		first_name: userInfo?.first_name || "",
		name: userInfo?.name || "",
	});

	useEffect(() => {
		setForm({
			first_name: userInfo?.first_name || "",
			name: userInfo?.name || "",
		});
	}, [userInfo?.first_name, userInfo?.name]);

	const onChangeField = (e) => {
		const { name, value } = e.target;
		setForm((f) => ({ ...f, [name]: value }));
	};

	const handleSave = async (e) => {
		e?.preventDefault?.();
		setMessage("");
		setSaving(true);
		try {
				await AxiosInstance.patch("/users/me", { first_name: form.first_name, name: form.name });
				dispatch(setUser({ ...userInfo, first_name: form.first_name, name: form.name }));
			setMessage(t('profile.updated'));
			setTimeout(() => {
				setMessage("");
		}, 5000);
		} catch (err) {
			dispatch(setError(t('profile.updateFailed')));
		} finally {
			setSaving(false);
		}
	};

	const handleChangePassword = async (e) => {
		e?.preventDefault?.();
		setPwdMsg("");
		if (!pwd.currentPassword || !pwd.newPassword) {
			setPwdMsg(t('profile.fillAll'));
			return;
		}
		if (pwd.newPassword !== pwd.confirmNewPassword) {
			setPwdMsg(t('auth.errors.passwordsMismatch'));
			return;
		}
		if (pwd.newPassword.length < 8) {
			setPwdMsg(t('auth.errors.passwordMin'));
			return;
		}
		setChangingPass(true);
		try {
			await AxiosInstance.post("/auth/change-password", {
				currentPassword: pwd.currentPassword,
				newPassword: pwd.newPassword,
			});
			setPwd({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
			setPwdMsg(t('profile.passwordChanged'));
			setTimeout(() => {
				setPwdMsg("");
		}, 5000);
		} catch (err) {
			dispatch(setError(t('profile.changePasswordFailed')));
		} finally {
			setChangingPass(false);
		}
	};

		const role = userInfo?.role;
		const email = userInfo?.email;

	return (
		<div className="min-h-screen">
			<Section className={"py-0 md:py-6"}>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="md:col-span-2">
						<h1 className="text-2xl font-semibold tracking-tight">{t('profile.title')}</h1>
									<form onSubmit={handleSave} className="mt-4 space-y-4">
										{/* read-only */}
										{role ? (
											<div>
												<label className="block text-sm font-medium mb-1">{t('auth.role')}</label>
												<Input value={String(role)} disabled />
											</div>
										) : null}
										{email ? (
											<div>
												<label className="block text-sm font-medium mb-1">{t('auth.email')}</label>
												<Input value={String(email)} disabled />
											</div>
										) : null}

										{/* editable */}
										<div>
											<label htmlFor="first_name" className="block text-sm font-medium mb-1">{t('auth.firstName')}</label>
											<Input id="first_name" name="first_name" value={form.first_name} onChange={onChangeField} />
										</div>
										<div>
											<label htmlFor="name" className="block text-sm font-medium mb-1">{t('auth.lastName')}</label>
											<Input id="name" name="name" value={form.name} onChange={onChangeField} />
										</div>

										<div className="pt-2">
											<Button type="submit" variant="empty-blue" disabled={saving}>{saving ? t('common.saving') : t('common.save')}</Button>
										</div>
										{message ? <p className="text-sm text-emerald-600">{message}</p> : null}
									</form>
					</div>

					<div className="md:col-span-1">
						<div className="rounded-lg bg-stone-100 p-4 shadow-sm">
							<h2 className="text-base font-semibold">{t('profile.changePassword')}</h2>
							<form onSubmit={handleChangePassword} className="mt-3 space-y-3">
								<div>
									<label htmlFor="currentPassword" className="block text-sm font-medium mb-1">{t('profile.currentPassword')}</label>
									<Input id="currentPassword" name="currentPassword" type="password" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} required />
								</div>
								<div>
									<label htmlFor="newPassword" className="block text-sm font-medium mb-1">{t('auth.password')}</label>
									<Input id="newPassword" name="newPassword" type="password" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} required />
								</div>
								<div>
									<label htmlFor="confirmNewPassword" className="block text-sm font-medium mb-1">{t('auth.confirmPassword')}</label>
									<Input id="confirmNewPassword" name="confirmNewPassword" type="password" value={pwd.confirmNewPassword} onChange={(e) => setPwd({ ...pwd, confirmNewPassword: e.target.value })} required />
								</div>
								<div className="pt-1">
									<Button type="submit" className="" variant="empty-blue" disabled={changingPass}>{changingPass ? t('profile.changing') : t('profile.changePassword')}</Button>
								</div>
								{pwdMsg ? <p className="text-sm text-emerald-600">{pwdMsg}</p> : null}
							</form>
						</div>
					</div>
				</div>
			</Section>
		</div>
	);
}

function isEditableKey(key) {
	return !["id", "_id", "role", "password", "createdAt", "updatedAt"].includes(key);
}

function labelize(key) {
	return key
		.replace(/_/g, " ")
		.replace(/\b\w/g, (m) => m.toUpperCase());
}

function toNumber(val) {
	const n = Number(val);
	return Number.isNaN(n) ? 0 : n;
}

function computeDiff(orig, next) {
	const diff = {};
	for (const k of Object.keys(next)) {
		if (orig[k] !== next[k]) diff[k] = next[k];
	}
	return diff;
}

function normalizeProfile(apiData, reduxInfo) {
	// merge server response with redux info, giving precedence to server
	const merged = { ...reduxInfo, ...apiData };
	// Whitelist likely user fields; extend as needed
	const allowed = ["first_name", "name", "email", "role", "age", "phone", "bio"];
	const out = {};
	for (const k of allowed) {
		if (merged[k] !== undefined && merged[k] !== null) out[k] = merged[k];
	}
	return out;
}

