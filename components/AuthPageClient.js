"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	ArrowRight,
	CheckCircle2,
	LockKeyhole,
	Mail,
	Phone,
	ShieldCheck,
	UserRound,
} from "lucide-react";
import {
	googleLoginZadClient,
	signinZadClient,
	signupZadClient,
} from "../lib/api";
import { BRAND_NAME } from "../lib/constants";
import { useZadApp } from "./ZadAppProvider";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

const labels = {
	en: {
		signinTitle: "Welcome back",
		signinCopy: "Sign in to continue your Zad booking requests with ease.",
		signupTitle: "Create your account",
		signupCopy: "Keep your booking requests, contact details, and stays ready for Zad support.",
		emailOrPhone: "Email or phone",
		email: "Email address",
		phone: "Phone number",
		name: "Full name",
		password: "Password",
		confirmPassword: "Confirm password",
		signin: "Sign in",
		signup: "Create account",
		withGoogle: "Continue with Google",
		googleSetup: "Google sign-in is being configured for this site.",
		needAccount: "New to Zad?",
		haveAccount: "Already have an account?",
		goSignup: "Create an account",
		goSignin: "Sign in instead",
		successSignin: "You are signed in.",
		successSignup: "Your account is ready.",
		passwordMismatch: "Passwords do not match.",
		accept: "I agree to use this account for Zad Hotels booking requests.",
		acceptError: "Please confirm the account agreement.",
		shortPassword: "Password must be at least 6 characters.",
		googleFailed: "Google sign-in failed. Please try again.",
	},
	ar: {
		signinTitle: "\u0645\u0631\u062d\u0628\u0627\u064b \u0628\u0639\u0648\u062f\u062a\u0643",
		signinCopy:
			"\u0633\u062c\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0645\u062a\u0627\u0628\u0639\u0629 \u0637\u0644\u0628\u0627\u062a \u062d\u062c\u0632\u0643 \u0645\u0639 \u0632\u0627\u062f \u0628\u0633\u0647\u0648\u0644\u0629.",
		signupTitle: "\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628 \u062c\u062f\u064a\u062f",
		signupCopy:
			"\u0627\u062d\u062a\u0641\u0638 \u0628\u0637\u0644\u0628\u0627\u062a \u062d\u062c\u0632\u0643 \u0648\u0628\u064a\u0627\u0646\u0627\u062a \u062a\u0648\u0627\u0635\u0644\u0643 \u0644\u062f\u0639\u0645 \u0632\u0627\u062f.",
		emailOrPhone: "\u0627\u0644\u0628\u0631\u064a\u062f \u0623\u0648 \u0631\u0642\u0645 \u0627\u0644\u062c\u0648\u0627\u0644",
		email: "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a",
		phone: "\u0631\u0642\u0645 \u0627\u0644\u062c\u0648\u0627\u0644",
		name: "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644",
		password: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
		confirmPassword: "\u062a\u0623\u0643\u064a\u062f \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
		signin: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
		signup: "\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628",
		withGoogle: "\u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629 \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 Google",
		googleSetup:
			"\u064a\u062a\u0645 \u062a\u062c\u0647\u064a\u0632 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0648\u0627\u0633\u0637\u0629 Google \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0642\u0639.",
		needAccount: "\u062c\u062f\u064a\u062f \u0639\u0644\u0649 \u0632\u0627\u062f\u061f",
		haveAccount: "\u0644\u062f\u064a\u0643 \u062d\u0633\u0627\u0628\u061f",
		goSignup: "\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628",
		goSignin: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
		successSignin: "\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u062f\u062e\u0648\u0644\u0643.",
		successSignup: "\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628\u0643.",
		passwordMismatch:
			"\u0643\u0644\u0645\u062a\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0645\u062a\u0637\u0627\u0628\u0642\u062a\u064a\u0646.",
		accept:
			"\u0623\u0648\u0627\u0641\u0642 \u0639\u0644\u0649 \u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0627\u0644\u062d\u0633\u0627\u0628 \u0644\u0637\u0644\u0628\u0627\u062a \u062d\u062c\u0632 \u0632\u0627\u062f.",
		acceptError: "\u064a\u0631\u062c\u0649 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629.",
		shortPassword:
			"\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064a\u062c\u0628 \u0623\u0646 \u062a\u0643\u0648\u0646 6 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.",
		googleFailed:
			"\u0641\u0634\u0644 \u062a\u0633\u062c\u064a\u0644 Google. \u064a\u0631\u062c\u0649 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.",
	},
};

const GoogleMark = () => (
	<span className="google-mark" aria-hidden="true">
		G
	</span>
);

export default function AuthPageClient({ mode = "signin" }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const googleButtonRef = useRef(null);
	const { language, isArabic, hrefWithLanguage, setAuthSession } = useZadApp();
	const copy = labels[language] || labels.en;
	const isSignup = mode === "signup";
	const [form, setForm] = useState({
		name: "",
		email: "",
		phone: "",
		emailOrPhone: "",
		password: "",
		confirmPassword: "",
		accepted: true,
	});
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [googleReady, setGoogleReady] = useState(false);

	const returnTo = useMemo(() => {
		const raw = String(searchParams.get("returnTo") || "").trim();
		if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
		return "/";
	}, [searchParams]);

	const handleAuthSuccess = useCallback(
		(data, successMessage) => {
			setAuthSession(data);
			setMessage(successMessage);
			window.setTimeout(() => {
				router.replace(hrefWithLanguage(returnTo));
			}, 450);
		},
		[hrefWithLanguage, returnTo, router, setAuthSession]
	);

	const handleGoogleCredential = useCallback(
		async (response = {}) => {
			const credential = response.credential;
			if (!credential) return;
			setBusy(true);
			setError("");
			setMessage("");
			try {
				const data = await googleLoginZadClient(credential);
				handleAuthSuccess(data, isSignup ? copy.successSignup : copy.successSignin);
			} catch (err) {
				setError(err.message || copy.googleFailed);
			} finally {
				setBusy(false);
			}
		},
		[copy.googleFailed, copy.successSignin, copy.successSignup, handleAuthSuccess, isSignup]
	);

	useEffect(() => {
		if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) return undefined;
		let cancelled = false;

		const mountGoogle = () => {
			if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) {
				return;
			}
			window.google.accounts.id.initialize({
				client_id: GOOGLE_CLIENT_ID,
				callback: handleGoogleCredential,
				ux_mode: "popup",
			});
			googleButtonRef.current.innerHTML = "";
			window.google.accounts.id.renderButton(googleButtonRef.current, {
				theme: "outline",
				size: "large",
				shape: "rectangular",
				text: isSignup ? "signup_with" : "signin_with",
				width: Math.min(360, googleButtonRef.current.offsetWidth || 360),
			});
			setGoogleReady(true);
		};

		if (window.google?.accounts?.id) {
			mountGoogle();
			return () => {
				cancelled = true;
			};
		}

		const script =
			document.querySelector('script[src="https://accounts.google.com/gsi/client"]') ||
			document.createElement("script");
		if (!script.parentNode) {
			script.src = "https://accounts.google.com/gsi/client";
			script.async = true;
			script.defer = true;
			document.head.appendChild(script);
		}
		script.addEventListener("load", mountGoogle);
		return () => {
			cancelled = true;
			script.removeEventListener("load", mountGoogle);
		};
	}, [handleGoogleCredential, isSignup]);

	const updateForm = (key, value) =>
		setForm((current) => ({
			...current,
			[key]: value,
		}));

	const submit = async (event) => {
		event.preventDefault();
		setError("");
		setMessage("");
		if (form.password.length < 6) {
			setError(copy.shortPassword);
			return;
		}
		if (isSignup) {
			if (form.password !== form.confirmPassword) {
				setError(copy.passwordMismatch);
				return;
			}
			if (!form.accepted) {
				setError(copy.acceptError);
				return;
			}
		}

		setBusy(true);
		try {
			const data = isSignup
				? await signupZadClient({
						name: form.name,
						email: form.email,
						phone: form.phone,
						password: form.password,
						acceptedTermsAndConditions: form.accepted,
				  })
				: await signinZadClient({
						emailOrPhone: form.emailOrPhone,
						password: form.password,
				  });
			handleAuthSuccess(data, isSignup ? copy.successSignup : copy.successSignin);
		} catch (err) {
			setError(err.message || (isSignup ? "Signup failed." : "Signin failed."));
		} finally {
			setBusy(false);
		}
	};

	return (
		<section className="auth-page" dir={isArabic ? "rtl" : "ltr"}>
			<div className="auth-shell container">
				<div className="auth-copy">
					<p className="eyebrow">{BRAND_NAME}</p>
					<h1>{isSignup ? copy.signupTitle : copy.signinTitle}</h1>
					<p>{isSignup ? copy.signupCopy : copy.signinCopy}</p>
					<div className="auth-benefits">
						<span>
							<ShieldCheck size={18} />
							{BRAND_NAME}
						</span>
						<span>
							<CheckCircle2 size={18} />
							{isArabic
								? "\u0637\u0644\u0628\u0627\u062a \u062d\u062c\u0632 \u0623\u0633\u0647\u0644"
								: "Smoother booking requests"}
						</span>
					</div>
				</div>

				<form className={`auth-card premium-card ${isSignup ? "signup-card" : ""}`} onSubmit={submit}>
					<div className="auth-card-head">
						<div className="auth-icon">
							{isSignup ? <UserRound size={23} /> : <LockKeyhole size={23} />}
						</div>
						<div>
							<h2>{isSignup ? copy.signup : copy.signin}</h2>
							<p>{isSignup ? copy.haveAccount : copy.needAccount}</p>
						</div>
					</div>

					<div className="google-auth-wrap">
						{GOOGLE_CLIENT_ID ? (
							<div
								ref={googleButtonRef}
								className={`google-auth-slot ${googleReady ? "ready" : ""}`}
								aria-label={copy.withGoogle}
							/>
						) : (
							<button className="google-fallback" type="button" disabled>
								<GoogleMark />
								{copy.withGoogle}
							</button>
						)}
						{!GOOGLE_CLIENT_ID ? <p className="auth-note">{copy.googleSetup}</p> : null}
					</div>

					<div className="auth-divider">
						<span />
					</div>

					{isSignup ? (
						<>
							<label className="auth-field">
								<span>{copy.name}</span>
								<div>
									<UserRound size={17} />
									<input
										value={form.name}
										onChange={(event) => updateForm("name", event.target.value)}
										required
										autoComplete="name"
									/>
								</div>
							</label>
							<label className="auth-field">
								<span>{copy.email}</span>
								<div>
									<Mail size={17} />
									<input
										type="email"
										dir="ltr"
										value={form.email}
										onChange={(event) => updateForm("email", event.target.value)}
										required
										autoComplete="email"
									/>
								</div>
							</label>
							<label className="auth-field">
								<span>{copy.phone}</span>
								<div>
									<Phone size={17} />
									<input
										type="tel"
										dir="ltr"
										value={form.phone}
										onChange={(event) => updateForm("phone", event.target.value)}
										required
										autoComplete="tel"
									/>
								</div>
							</label>
						</>
					) : (
						<label className="auth-field">
							<span>{copy.emailOrPhone}</span>
							<div>
								<Mail size={17} />
								<input
									dir="ltr"
									value={form.emailOrPhone}
									onChange={(event) => updateForm("emailOrPhone", event.target.value)}
									required
									autoComplete="username"
								/>
							</div>
						</label>
					)}

					<label className="auth-field">
						<span>{copy.password}</span>
						<div>
							<LockKeyhole size={17} />
							<input
								type="password"
								value={form.password}
								onChange={(event) => updateForm("password", event.target.value)}
								required
								minLength={6}
								autoComplete={isSignup ? "new-password" : "current-password"}
							/>
						</div>
					</label>

					{isSignup ? (
						<>
							<label className="auth-field">
								<span>{copy.confirmPassword}</span>
								<div>
									<LockKeyhole size={17} />
									<input
										type="password"
										value={form.confirmPassword}
										onChange={(event) =>
											updateForm("confirmPassword", event.target.value)
										}
										required
										minLength={6}
										autoComplete="new-password"
									/>
								</div>
							</label>
							<label className="auth-check">
								<input
									type="checkbox"
									checked={form.accepted}
									onChange={(event) => updateForm("accepted", event.target.checked)}
								/>
								<span>{copy.accept}</span>
							</label>
						</>
					) : null}

					{error ? <p className="auth-alert error">{error}</p> : null}
					{message ? <p className="auth-alert success">{message}</p> : null}

					<button className="btn btn-primary auth-submit" type="submit" disabled={busy}>
						{isSignup ? copy.signup : copy.signin}
						<ArrowRight size={18} />
					</button>

					<div className="auth-switch">
						<span>{isSignup ? copy.haveAccount : copy.needAccount}</span>
						<Link href={hrefWithLanguage(isSignup ? "/signin" : "/signup")}>
							{isSignup ? copy.goSignin : copy.goSignup}
						</Link>
					</div>
				</form>
			</div>
		</section>
	);
}
