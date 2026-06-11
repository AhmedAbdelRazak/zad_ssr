"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { apiUrl, closePublicSupportCase, socketBaseUrl } from "../lib/api";
import { BRAND_NAME, CONTACT_EMAIL } from "../lib/constants";
import { titleCase } from "../lib/format";
import { useZadApp } from "./ZadAppProvider";

const brandText = (value = "") =>
	String(value || "")
		.replace(/Jannat Booking/gi, BRAND_NAME)
		.replace(/support@jannatbooking\.com/gi, CONTACT_EMAIL);

const supportTopicOptions = (isArabic) => [
	{
		value: "reserve_room",
		label: isArabic ? "\u062d\u062c\u0632 \u063a\u0631\u0641\u0629 \u0623\u0648 \u0627\u0644\u062a\u0648\u0641\u0631" : "Room booking or availability",
	},
	{
		value: "reservation_inquiry",
		label: isArabic ? "\u0627\u0633\u062a\u0641\u0633\u0627\u0631 \u0639\u0646 \u062d\u062c\u0632" : "Existing reservation question",
	},
	{
		value: "payment_inquiry",
		label: isArabic ? "\u0627\u0644\u062f\u0641\u0639 \u0623\u0648 \u0627\u0644\u0641\u0627\u062a\u0648\u0631\u0629" : "Payment or invoice",
	},
	{
		value: "hotel_service",
		label: isArabic ? "\u062e\u062f\u0645\u0627\u062a \u0627\u0644\u0641\u0646\u062f\u0642" : "Hotel services",
	},
	{
		value: "hotel_complaint",
		label: isArabic ? "\u0634\u0643\u0648\u0649 \u0623\u0648 \u0645\u0633\u0627\u0639\u062f\u0629 \u0639\u0627\u062c\u0644\u0629" : "Complaint or urgent help",
	},
	{
		value: "other",
		label: isArabic ? "\u0645\u0648\u0636\u0648\u0639 \u0622\u062e\u0631" : "Something else",
	},
];

const quickRepliesForMessage = (message = {}) =>
	Array.isArray(message.quickReplies)
		? message.quickReplies
				.map((reply) => ({
					label: String(reply?.label || "").trim(),
					value: String(reply?.value || reply?.label || "").trim(),
					action: String(reply?.action || "").trim(),
				}))
				.filter((reply) => reply.label && reply.value)
				.slice(0, 4)
		: [];

export default function SupportWidget({ hotels = [], website = {} }) {
	const { t, isArabic } = useZadApp();
	const [open, setOpen] = useState(false);
	const [caseId, setCaseId] = useState("");
	const [messages, setMessages] = useState([]);
	const [form, setForm] = useState({
		name: "",
		contact: "",
		hotelId: "",
		topic: "reserve_room",
		message: "",
	});
	const [reply, setReply] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [typingStatus, setTypingStatus] = useState("");
	const socketRef = useRef(null);
	const typingTimerRef = useRef(null);
	const messagesContainerRef = useRef(null);
	const messagesEndRef = useRef(null);
	const replyInFlightRef = useRef(false);
	const languageName = isArabic ? "Arabic" : "English";
	const languageCode = isArabic ? "ar" : "en";
	const chatLabel = isArabic ? "تحدث مع زاد" : "Chat With Zad";
	const selectedHotel = useMemo(
		() => hotels.find((hotel) => String(hotel._id) === String(form.hotelId)),
		[form.hotelId, hotels]
	);
	const topics = useMemo(() => supportTopicOptions(isArabic), [isArabic]);
	const selectedTopic = useMemo(
		() => topics.find((topic) => topic.value === form.topic) || topics[0],
		[form.topic, topics]
	);

	const resetCaseState = useCallback(() => {
		window.clearTimeout(typingTimerRef.current);
		setCaseId("");
		setMessages([]);
		setReply("");
		setTypingStatus("");
	}, []);

	useEffect(() => {
		const openSelectedHotelChat = (event) => {
			const detail = event?.detail || {};
			const hotelId = String(detail.hotelId || "");
			setOpen(true);
			setError("");
			setNotice("");
			if (!caseId && (hotelId || detail.message)) {
				setForm((current) => ({
					...current,
					hotelId: hotelId || current.hotelId,
					topic: detail.topic || current.topic || "reserve_room",
					message: detail.message || current.message,
				}));
			}
		};
		window.addEventListener("zad:open-support", openSelectedHotelChat);
		return () => window.removeEventListener("zad:open-support", openSelectedHotelChat);
	}, [caseId]);

	useEffect(() => {
		if (!caseId || !open) return undefined;
		let cancelled = false;
		const load = async () => {
			try {
				const res = await fetch(apiUrl(`/support-cases/client/${caseId}`));
				const data = await res.json();
				if (!cancelled && data?.caseStatus === "closed") {
					resetCaseState();
					setNotice(t("chatClosed"));
					return;
				}
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
	}, [caseId, open, resetCaseState, t]);

	useEffect(() => {
		if (!caseId || !open) return undefined;
		let mounted = true;
		let socket = null;

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
		const onCloseCase = (payload = {}) => {
			const closedCaseId = String(payload?.case?._id || payload?.caseId || "");
			if (closedCaseId && closedCaseId !== String(caseId)) return;
			resetCaseState();
			setNotice(t("chatClosed"));
		};

		const connectSocket = async () => {
			const { io } = await import("socket.io-client");
			if (!mounted) return;
			socket = io(socketBaseUrl, {
				transports: ["websocket", "polling"],
				withCredentials: false,
			});
			socketRef.current = socket;
			socket.emit("joinRoom", { caseId });
			socket.on("receiveMessage", onReceiveMessage);
			socket.on("typing", onTyping);
			socket.on("stopTyping", onStopTyping);
			socket.on("closeCase", onCloseCase);
		};

		connectSocket().catch((err) => console.error(err));

		return () => {
			mounted = false;
			window.clearTimeout(typingTimerRef.current);
			if (socket) {
				socket.emit("leaveRoom", { caseId });
				socket.off("receiveMessage", onReceiveMessage);
				socket.off("typing", onTyping);
				socket.off("stopTyping", onStopTyping);
				socket.off("closeCase", onCloseCase);
				socket.disconnect();
			}
			socketRef.current = null;
		};
	}, [caseId, form.name, isArabic, open, resetCaseState, t]);

	const scrollToBottom = useCallback((behavior = "smooth") => {
		const container = messagesContainerRef.current;
		if (container) {
			container.scrollTo({ top: container.scrollHeight, behavior });
			return;
		}
		messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
	}, []);

	useEffect(() => {
		if (!open || !caseId) return;
		const frame = window.requestAnimationFrame(() => scrollToBottom("auto"));
		const timer = window.setTimeout(() => scrollToBottom("auto"), 180);
		const lateTimer = window.setTimeout(() => scrollToBottom("auto"), 650);
		return () => {
			window.cancelAnimationFrame(frame);
			window.clearTimeout(timer);
			window.clearTimeout(lateTimer);
		};
	}, [caseId, messages.length, open, scrollToBottom, typingStatus]);

	const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

	const startChat = async (event) => {
		event.preventDefault();
		setError("");
		setNotice("");
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
				inquiryAbout: selectedTopic?.value || "reserve_room",
				inquiryDetails: `[Preferred Language: ${languageName} (${languageCode})] [Topic: ${
					selectedTopic?.label || "Room booking or availability"
				}] ${form.message}`,
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

	const sendReply = async (event, overrideText = "") => {
		event?.preventDefault?.();
		const messageText = String(overrideText || reply || "").trim();
		if (!caseId || !messageText || replyInFlightRef.current) return;
		replyInFlightRef.current = true;
		setBusy(true);
		setError("");
		setNotice("");
		try {
			const conversation = {
				messageBy: {
					customerName: form.name || "Guest",
					customerEmail: form.contact || "guest@zadhotels.com",
				},
				message: messageText,
				inquiryAbout: "support",
				inquiryDetails: messageText,
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
			if (/closed/i.test(err.message || "")) {
				resetCaseState();
				setNotice(t("chatClosed"));
				return;
			}
			setError(err.message || "Message failed.");
		} finally {
			replyInFlightRef.current = false;
			setBusy(false);
		}
	};

	const handleQuickReply = (quickReply) => {
		const value = String(quickReply?.value || quickReply?.label || "").trim();
		if (!value || busy) return;
		setReply("");
		sendReply(null, value);
	};

	const endChat = async () => {
		if (!caseId || busy) return;
		setBusy(true);
		setError("");
		try {
			await closePublicSupportCase(caseId);
			socketRef.current?.emit("leaveRoom", { caseId });
			resetCaseState();
			setNotice(t("chatClosed"));
		} catch (err) {
			setError(err.message || "Unable to close chat.");
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
						<div className="support-head-actions">
							{caseId ? (
								<button className="support-end-chat" type="button" onClick={endChat} disabled={busy}>
									{t("endChat")}
								</button>
							) : null}
							<button className="support-close" type="button" onClick={() => setOpen(false)} aria-label="Close support">
								<X size={20} />
							</button>
						</div>
					</header>
					{notice ? <p className="notice">{notice}</p> : null}
					{caseId ? (
						<>
							<div className="messages" ref={messagesContainerRef} role="log" aria-live="polite">
								{messages.map((message, index) => {
									const sender = brandText(message?.messageBy?.customerName || "Support");
									const text = brandText(message?.message || "");
									const isGuest =
										message?.messageBy?.customerEmail &&
										form.contact &&
										message.messageBy.customerEmail === form.contact;
									const quickReplies = quickRepliesForMessage(message);
									const showQuickReplies =
										!isGuest &&
										quickReplies.length > 0 &&
										index === messages.length - 1;
									return (
										<div className={`bubble ${isGuest ? "guest" : "agent"}`} key={`${index}-${text}`}>
											<span>{sender}</span>
											<p>{text}</p>
											{showQuickReplies ? (
												<div className="quick-replies">
													{quickReplies.map((quickReply) => (
														<button
															key={`${quickReply.action || quickReply.label}-${quickReply.value}`}
															type="button"
															className="quick-reply"
															onClick={() => handleQuickReply(quickReply)}
															disabled={busy}
														>
															{brandText(quickReply.label)}
														</button>
													))}
												</div>
											) : null}
										</div>
									);
								})}
								{typingStatus ? <div className="typing-line">{typingStatus}</div> : null}
								<div ref={messagesEndRef} />
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
								<label>{isArabic ? "\u0646\u0648\u0639 \u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629" : "Support topic"}</label>
								<select value={form.topic} onChange={(event) => updateForm("topic", event.target.value)}>
									{topics.map((topic) => (
										<option key={topic.value} value={topic.value}>
											{topic.label}
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
					position: relative;
					width: 9px;
					height: 9px;
					border-radius: 999px;
					background: #32f07d;
					box-shadow: 0 0 12px rgba(50, 240, 125, 0.88);
					flex: 0 0 auto;
				}

				.support-status-dot::after {
					content: "";
					position: absolute;
					inset: -7px;
					border-radius: inherit;
					background: rgba(50, 240, 125, 0.32);
					animation: zadChatPulse 1.5s ease-out infinite;
					will-change: transform, opacity;
				}

				@keyframes zadChatPulse {
					0% {
						opacity: 0.55;
						transform: scale(0.7);
					}
					72% {
						opacity: 0;
						transform: scale(1.9);
					}
					100% {
						opacity: 0;
						transform: scale(1.9);
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

				.support-head-actions {
					display: inline-flex;
					align-items: center;
					gap: 8px;
					flex: 0 0 auto;
				}

				.support-end-chat {
					min-height: 34px;
					border-radius: 8px;
					border: 1px solid rgba(255, 255, 255, 0.18);
					padding: 0 10px;
					color: #fff;
					background: rgba(255, 255, 255, 0.1);
					font-size: 12px;
					font-weight: 950;
					cursor: pointer;
				}

				.support-end-chat:disabled {
					opacity: 0.58;
					cursor: not-allowed;
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
					flex: 1 1 auto;
					min-height: 260px;
					overflow-y: auto;
					display: flex;
					flex-direction: column;
					gap: 10px;
					scroll-behavior: smooth;
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

				.quick-replies {
					display: flex;
					flex-wrap: wrap;
					gap: 8px;
					margin-top: 10px;
				}

				.quick-reply {
					min-height: 36px;
					border: 1px solid rgba(15, 143, 112, 0.28);
					border-radius: 999px;
					padding: 0 13px;
					color: var(--zad-blue);
					background:
						linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(239, 250, 247, 0.98)),
						#fff;
					font-size: 13px;
					font-weight: 950;
					cursor: pointer;
					box-shadow: 0 7px 14px rgba(15, 23, 42, 0.07);
					transition:
						transform 160ms ease,
						border-color 160ms ease,
						box-shadow 160ms ease;
				}

				.quick-reply:hover {
					border-color: rgba(15, 143, 112, 0.46);
					transform: translateY(-1px);
					box-shadow: 0 10px 18px rgba(15, 23, 42, 0.1);
				}

				.quick-reply:disabled {
					cursor: not-allowed;
					opacity: 0.62;
					transform: none;
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

				.notice {
					margin: 0;
					padding: 12px 16px;
					color: #05603a;
					background: rgba(45, 212, 191, 0.1);
					border-bottom: 1px solid rgba(15, 143, 112, 0.14);
					font-size: 13px;
					font-weight: 900;
					line-height: 1.45;
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
