"use client";

import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import {
	BRAND_NAME,
	CONTACT_EMAIL,
	DEFAULT_LOGO,
	PHONE_DISPLAY,
	WHATSAPP_NUMBER,
} from "../lib/constants";
import { slugifyHotel, titleCase } from "../lib/format";

export default function Footer({ website = {}, hotels = [] }) {
	const logo = website?.janatLogo?.url || DEFAULT_LOGO;
	const topHotels = Array.isArray(hotels) ? hotels.slice(0, 4) : [];
	const whatsapp = website?.whatsappNumber || WHATSAPP_NUMBER;

	return (
		<footer className="footer">
			<div className="container footer-grid">
				<div>
					<img className="footer-logo" src={logo} alt={BRAND_NAME} />
					<p>
						{BRAND_NAME} curates hotel stays with smooth booking, clear room
						choices, and responsive support for Makkah and Madinah trips.
					</p>
				</div>
				<div>
					<h3>Hotels</h3>
					{topHotels.map((hotel) => (
						<Link key={hotel._id} href={`/single-hotel/${slugifyHotel(hotel.hotelName)}`}>
							{titleCase(hotel.hotelName)}
						</Link>
					))}
					<Link href="/our-hotels">View all hotels</Link>
				</div>
				<div>
					<h3>Explore</h3>
					<Link href="/rooms">Room search</Link>
					<Link href="/zad-offers-monthly-reservations">Offers</Link>
					<Link href="/about">About us</Link>
					<Link href="/contact">Contact</Link>
				</div>
				<div>
					<h3>Contact</h3>
					<p className="contact-line">
						<MapPin size={17} /> Saudi Arabia
					</p>
					<a className="contact-line" href={`mailto:${website?.contactEmail || CONTACT_EMAIL}`}>
						<Mail size={17} /> {website?.contactEmail || CONTACT_EMAIL}
					</a>
					<a className="contact-line" href={`tel:${(website?.phone || PHONE_DISPLAY).replace(/[^\d+]/g, "")}`}>
						<Phone size={17} /> {website?.phone || PHONE_DISPLAY}
					</a>
					<a
						className="contact-line"
						href={`https://wa.me/${whatsapp}`}
						target="_blank"
						rel="noreferrer"
					>
						<MessageCircle size={17} /> WhatsApp
					</a>
				</div>
			</div>
			<div className="footer-bottom">
				<span>
					Copyright &copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
				</span>
			</div>
			<style jsx>{`
				.footer {
					color: #fff;
					background:
						linear-gradient(135deg, rgba(123, 63, 179, 0.18), rgba(10, 143, 130, 0.18)),
						var(--zad-black);
					padding-top: 64px;
				}

				.footer-grid {
					display: grid;
					grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
					gap: 34px;
				}

				.footer-logo {
					width: 170px;
					height: 58px;
					object-fit: contain;
					margin-bottom: 16px;
				}

				p {
					color: rgba(255, 255, 255, 0.72);
					line-height: 1.7;
					margin: 0;
				}

				h3 {
					margin: 0 0 18px;
					font-size: 15px;
					text-transform: uppercase;
					letter-spacing: 0;
				}

				a {
					display: flex;
					color: rgba(255, 255, 255, 0.78);
					font-weight: 750;
					margin-bottom: 12px;
				}

				a:hover {
					color: #c9fff7;
				}

				.contact-line {
					align-items: center;
					gap: 8px;
				}

				.footer-bottom {
					text-align: center;
					margin-top: 48px;
					padding: 20px;
					background: rgba(0, 0, 0, 0.26);
					color: rgba(255, 255, 255, 0.7);
					font-size: 14px;
				}

				@media (max-width: 860px) {
					.footer-grid {
						grid-template-columns: 1fr;
					}
				}
			`}</style>
		</footer>
	);
}
