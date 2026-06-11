"use client";

import { Mail, MessageCircle, Phone } from "lucide-react";
import { useZadApp } from "./ZadAppProvider";

export default function ContactCards({ email, phone, whatsapp }) {
	const { t, isArabic } = useZadApp();
	return (
		<div className="container contact-grid" dir={isArabic ? "rtl" : "ltr"}>
			<a className="contact-card premium-card" href={`mailto:${email}`}>
				<Mail size={24} />
				<span>{t("emailAddress")}</span>
				<strong dir="ltr" className="ltr-value">{email}</strong>
			</a>
			<a className="contact-card premium-card" href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
				<Phone size={24} />
				<span>{t("phone")}</span>
				<strong dir="ltr" className="ltr-value">{phone}</strong>
			</a>
			<a className="contact-card premium-card" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
				<MessageCircle size={24} />
				<span>{t("whatsapp")}</span>
				<strong dir="ltr" className="ltr-value">{phone}</strong>
			</a>
		</div>
	);
}
