"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, Menu, MessageCircle, Phone, Search, X } from "lucide-react";
import { DEFAULT_LOGO, PHONE_DISPLAY, WHATSAPP_NUMBER } from "../lib/constants";

const navItems = [
	{ href: "/", label: "Home" },
	{ href: "/our-hotels", label: "Hotels" },
	{ href: "/rooms", label: "Rooms" },
	{ href: "/about", label: "About" },
	{ href: "/contact", label: "Contact" },
];

export default function Header({ website = {} }) {
	const [open, setOpen] = useState(false);
	const logo = website?.janatLogo?.url || DEFAULT_LOGO;

	return (
		<header className="site-header">
			<div className="header-inner">
				<Link className="logo" href="/" aria-label="ZAD Hotels home">
					<img src={logo} alt="ZAD Hotels" />
				</Link>
				<nav className="desktop-nav" aria-label="Main navigation">
					{navItems.map((item) => (
						<Link href={item.href} key={item.href}>
							{item.label}
						</Link>
					))}
				</nav>
				<div className="header-actions">
					<Link className="icon-link" href="/rooms" aria-label="Search rooms">
						<Search size={18} />
					</Link>
					<a
						className="phone-link"
						href={`https://wa.me/${website?.whatsappNumber || WHATSAPP_NUMBER}`}
						target="_blank"
						rel="noreferrer"
					>
						<Phone size={17} />
						<span>{website?.phone || PHONE_DISPLAY}</span>
					</a>
					<button
						className="mobile-toggle"
						type="button"
						aria-label="Open menu"
						onClick={() => setOpen(true)}
					>
						<Menu size={22} />
					</button>
				</div>
			</div>
			{open ? (
				<div className="mobile-menu">
					<button
						className="mobile-close"
						type="button"
						aria-label="Close menu"
						onClick={() => setOpen(false)}
					>
						<X size={22} />
					</button>
					<img src={logo} alt="ZAD Hotels" />
					{navItems.map((item) => (
						<Link href={item.href} key={item.href} onClick={() => setOpen(false)}>
							{item.label}
						</Link>
					))}
					<div className="mobile-quick">
						<Link className="btn btn-primary" href="/rooms" onClick={() => setOpen(false)}>
							<CalendarDays size={18} />
							Check dates
						</Link>
						<a
							className="btn btn-ghost"
							href={`https://wa.me/${website?.whatsappNumber || WHATSAPP_NUMBER}`}
							target="_blank"
							rel="noreferrer"
						>
							<MessageCircle size={18} />
							WhatsApp
						</a>
					</div>
				</div>
			) : null}
			<style jsx>{`
				.site-header {
					position: sticky;
					top: 0;
					z-index: 40;
					background: rgba(8, 9, 13, 0.88);
					backdrop-filter: blur(18px);
					border-bottom: 1px solid rgba(255, 255, 255, 0.08);
				}

				.header-inner {
					width: min(1180px, calc(100% - 32px));
					height: 76px;
					margin: 0 auto;
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 24px;
				}

				.logo img {
					width: 158px;
					height: 52px;
					object-fit: contain;
				}

				.desktop-nav {
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 28px;
					color: #fff;
					font-size: 14px;
					font-weight: 850;
				}

				.desktop-nav a {
					opacity: 0.9;
				}

				.desktop-nav a:hover {
					opacity: 1;
					color: #c9fff7;
				}

				.header-actions {
					display: flex;
					align-items: center;
					gap: 10px;
				}

				.icon-link,
				.mobile-toggle {
					width: 42px;
					height: 42px;
					border-radius: 8px;
					border: 1px solid rgba(255, 255, 255, 0.14);
					color: #fff;
					background: rgba(255, 255, 255, 0.08);
					display: inline-flex;
					align-items: center;
					justify-content: center;
					cursor: pointer;
				}

				.phone-link {
					min-height: 42px;
					padding: 0 14px;
					border-radius: 8px;
					display: inline-flex;
					align-items: center;
					gap: 8px;
					color: #fff;
					font-weight: 900;
					background: linear-gradient(135deg, rgba(37, 87, 199, 0.94), rgba(10, 143, 130, 0.94));
				}

				.mobile-toggle,
				.mobile-menu {
					display: none;
				}

				.mobile-menu {
					position: fixed;
					inset: 0 0 auto auto;
					width: min(360px, 88vw);
					min-height: 100vh;
					background: var(--zad-black);
					color: #fff;
					padding: 22px;
					box-shadow: -18px 0 48px rgba(0, 0, 0, 0.36);
					z-index: 80;
				}

				.mobile-menu img {
					width: 150px;
					height: 54px;
					object-fit: contain;
					margin-bottom: 22px;
				}

				.mobile-menu a:not(.btn) {
					display: block;
					padding: 15px 0;
					font-weight: 900;
					border-bottom: 1px solid rgba(255, 255, 255, 0.08);
				}

				.mobile-close {
					position: absolute;
					top: 18px;
					right: 18px;
					width: 42px;
					height: 42px;
					border-radius: 8px;
					border: 1px solid rgba(255, 255, 255, 0.12);
					background: rgba(255, 255, 255, 0.08);
					color: #fff;
					display: inline-flex;
					align-items: center;
					justify-content: center;
				}

				.mobile-quick {
					display: grid;
					gap: 12px;
					margin-top: 22px;
				}

				@media (max-width: 860px) {
					.desktop-nav,
					.phone-link,
					.icon-link {
						display: none;
					}

					.mobile-toggle,
					.mobile-menu {
						display: flex;
					}

					.mobile-menu {
						flex-direction: column;
					}

					.header-inner {
						height: 66px;
						width: min(100% - 24px, 1180px);
					}

					.logo img {
						width: 130px;
						height: 45px;
					}
				}
			`}</style>
		</header>
	);
}
