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
import { useZadApp } from "./ZadAppProvider";

export default function Footer({ website = {}, hotels = [] }) {
	const { t, isArabic } = useZadApp();
	const logo = website?.janatLogo?.url || DEFAULT_LOGO;
	const footerImage = website?.footerBanner?.url || DEFAULT_FOOTER_IMAGE;
	const topHotels = Array.isArray(hotels) ? hotels.slice(0, 4) : [];
	const whatsapp = website?.whatsappNumber || WHATSAPP_NUMBER;
	const phone = website?.phone || PHONE_DISPLAY;
	const email = website?.officialEmail || website?.contactEmail || CONTACT_EMAIL;

	return (
		<footer className="footer" style={{ backgroundImage: `url(${footerImage})` }} dir={isArabic ? "rtl" : "ltr"}>
			<div className="footer-overlay" />
			<div className="container footer-grid">
				<div className="footer-column footer-brand">
					<p>{t("footerTagline")}</p>
					<h3>{t("elegance")}</h3>
					<div className="socials">
						<a href="/" aria-label="X">X</a>
						<a href="/" aria-label="Instagram">IG</a>
						<a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp">
							<MessageCircle size={24} />
						</a>
					</div>
					<span className="copyright">© {new Date().getFullYear()} Zad Group.</span>
				</div>

				<div className="footer-logo-wrap">
					<img src={logo} alt={BRAND_NAME} />
				</div>

				<div className="footer-column footer-service">
					<h3>{t("service")}</h3>
					<a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
						<Phone size={18} />
						{phone}
					</a>
					<a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
						<MessageCircle size={18} />
						+966 54 260 8358
					</a>
					<a href={`mailto:${email}`}>
						<Mail size={18} />
						{email}
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
				<Link href="/rooms">{t("searchRooms")}</Link>
				<Link href="/zad-offers-monthly-reservations">{isArabic ? "العروض" : "Offers"}</Link>
				{topHotels.map((hotel) => (
					<Link key={hotel._id} href={`/single-hotel/${slugifyHotel(hotel.hotelName)}`}>
						{isArabic && hotel.hotelName_OtherLanguage ? hotel.hotelName_OtherLanguage : titleCase(hotel.hotelName)}
					</Link>
				))}
			</div>
		</footer>
	);
}
