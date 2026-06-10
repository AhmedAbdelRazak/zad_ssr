"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { apiUrl } from "../lib/api";
import { BRAND_NAME, CONTACT_EMAIL } from "../lib/constants";
import { titleCase } from "../lib/format";
import { useZadApp } from "./ZadAppProvider";

const brandText = (value = "") =>
	String(value || "")
		.replace(/Jannat Booking/gi, BRAND_NAME)
		.replace(/support@jannatbooking\.com/gi, CONTACT_EMAIL);

export default function SupportWidget({ hotels = [], website = {} }) {
	const { t, isArabic } = useZadApp();
	const [open, setOpen] = useState(false);
	const [caseId, setCaseId] = useState("");
	const [messages, setMessages] = useState([]);
	const [form, setForm] = useState({
		name: "",
		contact: "",
		hotelId: "",
		message: "",
	});
	const [reply, setReply] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const languageName = isArabic ? "Arabic" : "English";
	const languageCode = isArabic ? "ar" : "en";
	const selectedHotel = useMemo(
		() => hotels.find((hotel) => hotel._id === form.hotelId),
		[form.hotelId, hotels]
	);

	useEffect(() => {
		if (!caseId || !open) return undefined;
		let cancelled = false;
		const load = async () => {
			try {
				const res = await fetch(apiUrl(`/support-cases/client/${caseId}`));
				const data = await res.json();
				if (!cancelled && Array.isArray(data?.conversation)) {
					setMessages(data.conversation);
				}
			} catch (err) {
				console.error(err);
			}
		};
		load();
		const timer = setInterval(load, 3500);
		return () => {
			cancelled = true;
			clearInterval(timer);
		};
	}, [caseId, open]);

	const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

	const startChat = async (event) => {
		event.preventDefault();
		setError("");
		if (!form.name.trim() || !form.contact.trim() || !selectedHotel || !form.message.trim()) {
			setError(
				isArabic
					? "يرجى إضافة الاسم وبيانات التواصل والفندق والرسالة."
					: "Please add your name, contact, hotel, and message."
			);
			return;
		}
		const ownerId = String(selectedHotel?.belongsTo?._id || selectedHotel?.belongsTo || "").trim();
		if (!ownerId) {
			setError(isArabic ? "يرجى اختيار فندق من فنادق زاد." : "Please choose a listed ZAD hotel.");
			return;
		}
		setBusy(true);
		try {
			const payload = {
				customerName: form.name,
				displayName1: form.name,
				displayName2: selectedHotel.hotelName,
				role: 0,
				customerEmail: form.contact,
				hotelId: selectedHotel._id,
				inquiryAbout: "reserve_room",
				inquiryDetails: `[Preferred Language: ${languageName} (${languageCode})] ${form.message}`,
				supportScope: "hotel",
				supporterId: ownerId,
				ownerId,
				preferredLanguage: languageName,
				preferredLanguageCode: languageCode,
			};
			const res = await fetch(apiUrl("/support-cases/new"), {
				method: "POST",
				headers: { "Content-Type": "application/json", Accept: "application/json" },
				body: JSON.stringify(payload),
			});
			const data = await res.json();
			if (!res.ok || data?.error) throw new Error(data?.error || "Unable to start chat.");
			setCaseId(data._id);
			setMessages(Array.isArray(data.conversation) ? data.conversation : []);
		} catch (err) {
			setError(err.message || "Unable to start chat.");
		} finally {
			setBusy(false);
		}
	};

	const sendReply = async (event) => {
		event.preventDefault();
		if (!caseId || !reply.trim()) return;
		setBusy(true);
		try {
			const conversation = {
				messageBy: {
					customerName: form.name || "Guest",
					customerEmail: form.contact || "guest@zadhotels.com",
				},
				message: reply.trim(),
				inquiryAbout: "support",
				inquiryDetails: reply.trim(),
				preferredLanguage: languageName,
				preferredLanguageCode: languageCode,
			};
			const res = await fetch(apiUrl(`/support-cases/client/${caseId}`), {
				method: "PUT",
				headers: { "Content-Type": "application/json", Accept: "application/json" },
				body: JSON.stringify({ conversation }),
			});
			const data = await res.json();
			if (!res.ok || data?.error) throw new Error(data?.error || "Message failed.");
			setMessages(Array.isArray(data.conversation) ? data.conversation : []);
			setReply("");
		} catch (err) {
			setError(err.message || "Message failed.");
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="support-root" dir={isArabic ? "rtl" : "ltr"}>
			<button className="support-button" type="button" onClick={() => setOpen(true)} aria-label="Open ZAD Hotels support">
				<MessageCircle size={21} />
				<span>{t("support")}</span>
			</button>
			{open ? (
				<section className="support-panel" aria-label="ZAD Hotels support">
					<header>
						<div>
							<strong>{BRAND_NAME}</strong>
							<span>{isArabic ? "دعم الفنادق" : "Hotel support"}</span>
						</div>
						<button type="button" onClick={() => setOpen(false)} aria-label="Close support">
							<X size={20} />
						</button>
					</header>
					{caseId ? (
						<>
							<div className="messages">
								{messages.map((message, index) => {
									const sender = brandText(message?.messageBy?.customerName || "Support");
									const text = brandText(message?.message || "");
									const isGuest =
										message?.messageBy?.customerEmail &&
										form.contact &&
										message.messageBy.customerEmail === form.contact;
									return (
										<div className={`bubble ${isGuest ? "guest" : "agent"}`} key={`${index}-${text}`}>
											<span>{sender}</span>
											<p>{text}</p>
										</div>
									);
								})}
							</div>
							<form className="reply-form" onSubmit={sendReply}>
								<input value={reply} onChange={(event) => setReply(event.target.value)} placeholder={t("typeMessage")} />
								<button type="submit" disabled={busy || !reply.trim()} aria-label="Send message">
									<Send size={18} />
								</button>
							</form>
						</>
					) : (
						<form className="start-form" onSubmit={startChat}>
							<div className="field">
								<label>{t("name")}</label>
								<input value={form.name} onChange={(event) => updateForm("name", event.target.value)} />
							</div>
							<div className="field">
								<label>{t("contact")}</label>
								<input value={form.contact} onChange={(event) => updateForm("contact", event.target.value)} />
							</div>
							<div className="field">
								<label>{t("hotel")}</label>
								<select value={form.hotelId} onChange={(event) => updateForm("hotelId", event.target.value)}>
									<option value="">{isArabic ? "اختر فندق زاد" : "Choose a Zad hotel"}</option>
									{hotels.map((hotel) => (
										<option key={hotel._id} value={hotel._id}>
											{titleCase(hotel.hotelName)}
										</option>
									))}
								</select>
							</div>
							<div className="field">
								<label>{t("message")}</label>
								<textarea value={form.message} onChange={(event) => updateForm("message", event.target.value)} placeholder={isArabic ? "اكتب الغرفة أو التواريخ التي تبحث عنها." : "Tell us the room or dates you are looking for."} />
							</div>
							<button className="btn btn-primary" type="submit" disabled={busy}>
								{t("startChat")}
							</button>
						</form>
					)}
					{error ? <p className="error">{error}</p> : null}
				</section>
			) : null}
			<style jsx>{`
				.support-root {
					position: fixed;
					right: 18px;
					bottom: 18px;
					z-index: 70;
				}

				.support-button {
					min-height: 48px;
					border: 0;
					border-radius: 999px;
					padding: 0 17px;
					color: #fff;
					background: linear-gradient(135deg, var(--zad-purple), var(--zad-blue) 48%, var(--zad-green));
					box-shadow: 0 14px 32px rgba(8, 9, 13, 0.28);
					display: inline-flex;
					align-items: center;
					gap: 9px;
					font-weight: 950;
					cursor: pointer;
				}

				.support-panel {
					position: absolute;
					right: 0;
					bottom: 62px;
					width: min(380px, calc(100vw - 24px));
					max-height: min(680px, calc(100vh - 110px));
					display: flex;
					flex-direction: column;
					background: #fff;
					border: 1px solid var(--zad-border);
					border-radius: 8px;
					overflow: hidden;
					box-shadow: var(--zad-shadow);
				}

				header {
					color: #fff;
					padding: 14px;
					background: var(--zad-black);
					display: flex;
					justify-content: space-between;
					align-items: center;
				}

				header strong,
				header span {
					display: block;
				}

				header span {
					color: rgba(255, 255, 255, 0.68);
					font-size: 12px;
				}

				header button {
					width: 36px;
					height: 36px;
					border-radius: 8px;
					border: 1px solid rgba(255, 255, 255, 0.16);
					background: rgba(255, 255, 255, 0.08);
					color: #fff;
					display: inline-flex;
					align-items: center;
					justify-content: center;
					cursor: pointer;
				}

				.start-form,
				.messages {
					padding: 14px;
				}

				.start-form {
					display: grid;
					gap: 10px;
				}

				.messages {
					min-height: 260px;
					overflow-y: auto;
					display: flex;
					flex-direction: column;
					gap: 10px;
					background: #f7f8fb;
				}

				.bubble {
					max-width: 88%;
					border-radius: 8px;
					padding: 9px 10px;
					background: #fff;
					border: 1px solid var(--zad-border);
				}

				.bubble.guest {
					margin-left: auto;
					color: #fff;
					background: var(--zad-blue);
					border-color: var(--zad-blue);
				}

				.bubble span {
					display: block;
					font-size: 11px;
					font-weight: 950;
					margin-bottom: 4px;
				}

				.bubble p {
					margin: 0;
					white-space: pre-wrap;
					line-height: 1.45;
					font-size: 14px;
				}

				.reply-form {
					display: grid;
					grid-template-columns: 1fr 44px;
					gap: 8px;
					padding: 10px;
					border-top: 1px solid var(--zad-border);
				}

				.reply-form input {
					border: 1px solid var(--zad-border);
					border-radius: 8px;
					min-height: 42px;
					padding: 0 11px;
				}

				.reply-form button {
					border: 0;
					border-radius: 8px;
					color: #fff;
					background: var(--zad-green);
					display: inline-flex;
					align-items: center;
					justify-content: center;
				}

				.error {
					margin: 0;
					padding: 0 14px 14px;
					color: #b42318;
					font-weight: 800;
					font-size: 13px;
				}

				@media (max-width: 640px) {
					.support-root {
						right: 12px;
						top: auto;
						bottom: 14px;
					}

					.support-button {
						width: 54px;
						height: 54px;
						min-height: 54px;
						padding: 0;
						justify-content: center;
					}

					.support-button span {
						display: none;
					}

					.support-panel {
						right: -2px;
						top: auto;
						bottom: 66px;
						max-height: calc(100vh - 110px);
					}
				}
			`}</style>
		</div>
	);
}
