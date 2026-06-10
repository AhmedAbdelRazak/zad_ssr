"use client";

import { Mail, MessageCircle, Phone } from "lucide-react";
import { useZadApp } from "./ZadAppProvider";

export default function ContactCards({ email, phone, whatsapp }) {
	const { t, isArabic } = useZadApp();
	return (
		<div className="container contact-grid" dir={isArabic ? "rtl" : "ltr"}>
			<a href={`mailto:${email}`}>
				<Mail size={24} />
				<span>{t("emailAddress")}</span>
				<strong>{email}</strong>
			</a>
			<a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
				<Phone size={24} />
				<span>{t("phone")}</span>
				<strong>{phone}</strong>
			</a>
			<a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
				<MessageCircle size={24} />
				<span>{t("whatsapp")}</span>
				<strong>{phone}</strong>
			</a>
		</div>
	);
}
