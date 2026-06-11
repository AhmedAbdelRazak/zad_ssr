"use client";

import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import {
	BRAND_NAME,
	CONTACT_EMAIL,
	DEFAULT_FOOTER_IMAGE,
	DEFAULT_LOGO,
	PHONE_DISPLAY,
	WHATSAPP_NUMBER,
} from "../lib/constants";
import { slugifyHotel, titleCase } from "../lib/format";
import EmailText, { mailtoHref } from "./EmailText";
import OptimizedImage from "./OptimizedImage";
import { useZadApp } from "./ZadAppProvider";

export default function Footer({ website = {}, hotels = [] }) {
	const { t, isArabic, hrefWithLanguage } = useZadApp();
	const logo = website?.janatLogo?.url || DEFAULT_LOGO;
	const footerImage = website?.footerBanner?.url || DEFAULT_FOOTER_IMAGE;
	const topHotels = Array.isArray(hotels) ? hotels.slice(0, 4) : [];
	const whatsapp = website?.whatsappNumber || WHATSAPP_NUMBER;
	const phone = website?.phone || PHONE_DISPLAY;
	const email = website?.officialEmail || website?.contactEmail || CONTACT_EMAIL;

	return (
		<footer className="footer" dir={isArabic ? "rtl" : "ltr"}>
			<OptimizedImage
				className="footer-bg"
				src={footerImage}
				alt=""
				fill
				sizes="100vw"
				quality={72}
				aria-hidden="true"
			/>
			<div className="footer-overlay" />
			<div className="container footer-grid">
				<div className="footer-column footer-brand">
					<p>{t("footerTagline")}</p>
					<h3>{t("elegance")}</h3>
					<div className="socials">
						<Link href={hrefWithLanguage("/")} aria-label="X">X</Link>
						<Link href={hrefWithLanguage("/")} aria-label="Instagram">IG</Link>
						<a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp">
							<MessageCircle size={24} />
						</a>
					</div>
					<span className="copyright">© {new Date().getFullYear()} Zad Group.</span>
				</div>

				<div className="footer-logo-wrap">
					<OptimizedImage src={logo} alt={BRAND_NAME} width={210} height={210} sizes="(max-width: 760px) 52vw, 210px" />
				</div>

				<div className="footer-column footer-service">
					<h3>{t("service")}</h3>
					<a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
						<Phone size={18} />
						<bdi dir="ltr" className="ltr-value">{phone}</bdi>
					</a>
					<a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
						<MessageCircle size={18} />
						<bdi dir="ltr" className="ltr-value">+966 54 260 8358</bdi>
					</a>
					<a href={mailtoHref(email)}>
						<Mail size={18} />
						<EmailText email={email} />
					</a>
					<div className="newsletter">
						<strong>{t("luxury")}</strong>
						<label>{t("newsletter")}</label>
						<input placeholder="your.email@example.com" />
						<button type="button">{t("newsletterButton")}</button>
					</div>
				</div>
			</div>
			<div className="container footer-links">
				<Link href={hrefWithLanguage("/rooms")}>{t("searchRooms")}</Link>
				<Link href={hrefWithLanguage("/zad-offers-monthly-reservations")}>{isArabic ? "العروض" : "Offers"}</Link>
				{topHotels.map((hotel) => (
					<Link key={hotel._id} href={hrefWithLanguage(`/single-hotel/${slugifyHotel(hotel.hotelName)}`)}>
						{isArabic && hotel.hotelName_OtherLanguage ? hotel.hotelName_OtherLanguage : titleCase(hotel.hotelName)}
					</Link>
				))}
			</div>
		</footer>
	);
}
