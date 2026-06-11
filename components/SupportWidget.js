"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { MessageCircle, Send, X } from "lucide-react";
import { apiUrl, socketBaseUrl } from "../lib/api";
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
	const [typingStatus, setTypingStatus] = useState("");
	const socketRef = useRef(null);
	const typingTimerRef = useRef(null);
	const languageName = isArabic ? "Arabic" : "English";
	const languageCode = isArabic ? "ar" : "en";
	const chatLabel = isArabic ? "تحدث مع زاد" : "Chat With Zad";
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

	useEffect(() => {
		if (!caseId || !open) return undefined;
		const socket = io(socketBaseUrl, {
			transports: ["websocket", "polling"],
			withCredentials: false,
		});
		socketRef.current = socket;
		socket.emit("joinRoom", { caseId });

		const messageKey = (message = {}) =>
			message?._id ||
			`${message?.date || ""}:${message?.messageBy?.customerEmail || ""}:${message?.message || ""}`;
		const onReceiveMessage = (message = {}) => {
			if (message.caseId && String(message.caseId) !== String(caseId)) return;
			setTypingStatus("");
			setMessages((current) => {
				const key = messageKey(message);
				if (current.some((row) => messageKey(row) === key)) return current;
				return [...current, message];
			});
		};
		const onTyping = (data = {}) => {
			if (data.caseId && String(data.caseId) !== String(caseId)) return;
			if (data.name && data.name === form.name) return;
			setTypingStatus(
				isArabic
					? `${data.name || "Zad Hotels"} يكتب الآن...`
					: `${data.name || "Zad Hotels"} is typing...`
			);
			window.clearTimeout(typingTimerRef.current);
			typingTimerRef.current = window.setTimeout(() => setTypingStatus(""), 4500);
		};
		const onStopTyping = (data = {}) => {
			if (data.caseId && String(data.caseId) !== String(caseId)) return;
			setTypingStatus("");
		};

		socket.on("receiveMessage", onReceiveMessage);
		socket.on("typing", onTyping);
		socket.on("stopTyping", onStopTyping);

		return () => {
			window.clearTimeout(typingTimerRef.current);
			socket.emit("leaveRoom", { caseId });
			socket.off("receiveMessage", onReceiveMessage);
			socket.off("typing", onTyping);
			socket.off("stopTyping", onStopTyping);
			socket.disconnect();
			socketRef.current = null;
		};
	}, [caseId, form.name, isArabic, open]);

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
				sourceWebsite: "zad_ssr",
				sourcePage: "zadhotels_support_widget",
				sourceUrl: typeof window !== "undefined" ? window.location.href : "",
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

	const emitTyping = (value) => {
		const socket = socketRef.current;
		if (!socket || !caseId) return;
		if (value) {
			socket.emit("typing", { name: form.name || "Guest", caseId });
			window.clearTimeout(typingTimerRef.current);
			typingTimerRef.current = window.setTimeout(() => {
				socket.emit("stopTyping", { name: form.name || "Guest", caseId });
			}, 1600);
		} else {
			socket.emit("stopTyping", { name: form.name || "Guest", caseId });
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
			emitTyping("");
		} catch (err) {
			setError(err.message || "Message failed.");
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="support-root" dir={isArabic ? "rtl" : "ltr"}>
			<button className="support-button" type="button" onClick={() => setOpen(true)} aria-label={chatLabel}>
				<MessageCircle size={21} />
				<span className="support-status-dot" aria-hidden="true" />
				<span>{chatLabel}</span>
			</button>
			{open ? (
				<section className="support-panel" aria-label="ZAD Hotels support">
					<header className="support-head">
						<div className="support-head-copy">
							<strong>{BRAND_NAME}</strong>
							<span>{isArabic ? "دعم الفنادق" : "Hotel support"}</span>
						</div>
						<button className="support-close" type="button" onClick={() => setOpen(false)} aria-label="Close support">
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
								{typingStatus ? <div className="typing-line">{typingStatus}</div> : null}
							</div>
							<form className="reply-form" onSubmit={sendReply}>
								<input
									value={reply}
									onChange={(event) => {
										setReply(event.target.value);
										emitTyping(event.target.value);
									}}
									placeholder={t("typeMessage")}
								/>
								<button type="submit" disabled={busy || !reply.trim()} aria-label="Send message">
									<Send size={18} />
								</button>
							</form>
						</>
					) : (
						<form className="start-form support-form" onSubmit={startChat}>
							<div className="field support-field">
								<label>{t("name")}</label>
								<input value={form.name} onChange={(event) => updateForm("name", event.target.value)} />
							</div>
							<div className="field support-field">
								<label>{t("contact")}</label>
								<input dir="ltr" value={form.contact} onChange={(event) => updateForm("contact", event.target.value)} />
							</div>
							<div className="field support-field">
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
							<div className="field support-field">
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
					z-index: 90;
				}

				.support-button {
					min-height: 48px;
					border: 0;
					border-radius: 999px;
					padding: 0 18px;
					color: #fff;
					background: linear-gradient(135deg, var(--zad-purple), var(--zad-blue) 48%, var(--zad-green));
					box-shadow: 0 14px 32px rgba(8, 9, 13, 0.28);
					display: inline-flex;
					align-items: center;
					gap: 8px;
					font-weight: 950;
					cursor: pointer;
				}

				.support-status-dot {
					width: 9px;
					height: 9px;
					border-radius: 999px;
					background: #32f07d;
					box-shadow:
						0 0 0 0 rgba(50, 240, 125, 0.56),
						0 0 12px rgba(50, 240, 125, 0.88);
					animation: zadChatPulse 1.5s ease-out infinite;
					flex: 0 0 auto;
				}

				@keyframes zadChatPulse {
					0% {
						box-shadow:
							0 0 0 0 rgba(50, 240, 125, 0.56),
							0 0 12px rgba(50, 240, 125, 0.88);
					}
					72% {
						box-shadow:
							0 0 0 9px rgba(50, 240, 125, 0),
							0 0 12px rgba(50, 240, 125, 0.78);
					}
					100% {
						box-shadow:
							0 0 0 0 rgba(50, 240, 125, 0),
							0 0 12px rgba(50, 240, 125, 0.88);
					}
				}

				.support-panel {
					position: absolute;
					right: 0;
					bottom: 62px;
					width: min(410px, calc(100vw - 28px));
					max-height: min(720px, calc(100vh - 112px));
					display: flex;
					flex-direction: column;
					background:
						linear-gradient(180deg, #ffffff 0%, #fbfcff 100%),
						#ffffff;
					border: 1px solid rgba(36, 84, 125, 0.16);
					border-radius: 8px;
					overflow: hidden;
					box-shadow:
						0 24px 55px rgba(8, 9, 13, 0.26),
						0 0 0 1px rgba(255, 255, 255, 0.72);
				}

				.support-head {
					color: #fff;
					padding: 16px 18px;
					background:
						linear-gradient(135deg, rgba(100, 22, 110, 0.96), rgba(23, 57, 95, 0.98) 52%, rgba(15, 143, 112, 0.92)),
						var(--zad-black);
					display: flex;
					justify-content: space-between;
					align-items: center;
					gap: 12px;
				}

				.support-head-copy {
					display: grid;
					gap: 3px;
				}

				.support-head strong,
				.support-head span {
					display: block;
				}

				.support-head strong {
					font-size: 16px;
					line-height: 1.15;
				}

				.support-head span {
					color: rgba(255, 255, 255, 0.78);
					font-size: 12px;
					font-weight: 850;
				}

				.support-close {
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
					padding: 18px;
				}

				.start-form {
					display: grid;
					gap: 12px;
					background:
						radial-gradient(circle at top right, rgba(15, 143, 112, 0.08), transparent 34%),
						#ffffff;
				}

				.support-field {
					display: grid;
					gap: 6px;
				}

				.support-field label {
					color: var(--zad-blue);
					font-size: 12px;
					font-weight: 950;
					line-height: 1.2;
				}

				.support-field input,
				.support-field select,
				.support-field textarea {
					width: 100%;
					border: 1px solid rgba(36, 84, 125, 0.18);
					border-radius: 8px;
					background: rgba(255, 255, 255, 0.94);
					color: var(--zad-ink);
					box-shadow: 0 6px 14px rgba(15, 23, 42, 0.04);
					outline: none;
					transition:
						border-color 160ms ease,
						box-shadow 160ms ease,
						background 160ms ease;
				}

				.support-field input,
				.support-field select {
					min-height: 46px;
					padding: 0 13px;
				}

				.support-field textarea {
					min-height: 92px;
					padding: 12px 13px;
					line-height: 1.55;
					resize: vertical;
				}

				.support-field input:focus,
				.support-field select:focus,
				.support-field textarea:focus {
					border-color: rgba(15, 143, 112, 0.5);
					background: #fff;
					box-shadow:
						0 0 0 3px rgba(15, 143, 112, 0.1),
						0 10px 18px rgba(15, 23, 42, 0.06);
				}

				.support-form .btn {
					width: 100%;
					min-height: 48px;
					margin-top: 2px;
				}

				.messages {
					min-height: 260px;
					overflow-y: auto;
					display: flex;
					flex-direction: column;
					gap: 10px;
					background:
						linear-gradient(180deg, rgba(248, 251, 255, 0.96), rgba(255, 255, 255, 0.96)),
						#f7f8fb;
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

				.typing-line {
					width: fit-content;
					border-radius: 999px;
					padding: 7px 10px;
					color: #536173;
					background: #fff;
					border: 1px solid var(--zad-border);
					font-size: 12px;
					font-weight: 900;
				}

				.reply-form {
					display: grid;
					grid-template-columns: 1fr 44px;
					gap: 8px;
					padding: 12px;
					border-top: 1px solid var(--zad-border);
					background: #fff;
				}

				.reply-form input {
					border: 1px solid rgba(36, 84, 125, 0.18);
					border-radius: 8px;
					min-height: 44px;
					padding: 0 12px;
					outline: none;
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
						width: auto;
						max-width: calc(100vw - 24px);
						height: 54px;
						min-height: 54px;
						padding: 0 15px;
						justify-content: center;
					}

					.support-button span {
						display: inline-flex;
					}

					.support-panel {
						position: fixed;
						left: 12px;
						right: 12px;
						top: auto;
						bottom: 76px;
						width: auto;
						max-height: calc(100dvh - 96px);
						box-shadow:
							0 22px 50px rgba(8, 9, 13, 0.3),
							0 0 0 1px rgba(255, 255, 255, 0.76);
					}

					.start-form,
					.messages {
						padding: 14px;
					}

					.support-field input,
					.support-field select {
						min-height: 44px;
					}

					.support-field textarea {
						min-height: 84px;
					}
				}
			`}</style>
		</div>
	);
}
