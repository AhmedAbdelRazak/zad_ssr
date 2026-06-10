import { Mail, MessageCircle, Phone } from "lucide-react";
import { getWebsite } from "../../lib/api";
import {
	BRAND_NAME,
	CONTACT_EMAIL,
	DEFAULT_HERO_IMAGE,
	PHONE_DISPLAY,
	WHATSAPP_NUMBER,
} from "../../lib/constants";
import { firstImage } from "../../lib/format";

export const metadata = {
	title: "Contact",
	description: `Contact ${BRAND_NAME} for hotel booking support.`,
	openGraph: { images: [DEFAULT_HERO_IMAGE] },
};

export default async function ContactPage() {
	const website = await getWebsite();
	const email = website?.contactEmail || CONTACT_EMAIL;
	const phone = website?.phone || PHONE_DISPLAY;
	const whatsapp = website?.whatsappNumber || WHATSAPP_NUMBER;
	const image = firstImage(website?.contactUsBanner, DEFAULT_HERO_IMAGE);
	return (
		<>
			<section className="page-hero image-hero" style={{ backgroundImage: `url(${image})` }}>
				<div className="page-hero-shade" />
				<div className="container">
					<p className="eyebrow">Contact</p>
					<h1>Talk to Zad support</h1>
					<p>Ask about availability, room choices, payments, or an existing reservation.</p>
				</div>
			</section>
			<section className="section">
				<div className="container contact-grid">
					<a href={`mailto:${email}`}>
						<Mail size={24} />
						<span>Email</span>
						<strong>{email}</strong>
					</a>
					<a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
						<Phone size={24} />
						<span>Phone</span>
						<strong>{phone}</strong>
					</a>
					<a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
						<MessageCircle size={24} />
						<span>WhatsApp</span>
						<strong>{phone}</strong>
					</a>
				</div>
			</section>
		</>
	);
}
