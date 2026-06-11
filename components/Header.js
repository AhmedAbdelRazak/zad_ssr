"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge, Button, Drawer } from "antd";
import {
	BedDouble,
	Building2,
	CalendarDays,
	Globe2,
	Home,
	Info,
	Mail,
	Menu,
	MessageCircle,
	Phone,
	Search,
	ShoppingBag,
	Sparkles,
	X,
} from "lucide-react";
import { useState } from "react";
import { DEFAULT_LOGO, OFFICIAL_EMAIL, PHONE_DISPLAY, WHATSAPP_NUMBER } from "../lib/constants";
import { labelFor, navItems } from "../lib/i18n";
import { useZadApp } from "./ZadAppProvider";
import CartDrawer from "./CartDrawer";
import EmailText, { mailtoHref } from "./EmailText";
import OptimizedImage from "./OptimizedImage";

const iconMap = {
	home: Home,
	hotels: Building2,
	rooms: BedDouble,
	offers: Sparkles,
	about: Info,
	contact: Phone,
};

const cleanPhone = (value = "") => String(value || "").replace(/[^\d+]/g, "");

export default function Header({ website = {} }) {
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);
	const { language, isArabic, t, toggleLanguage, totals, setCartOpen, hrefWithLanguage } = useZadApp();
	const logo = website?.janatLogo?.url || DEFAULT_LOGO;
	const email = website?.officialEmail || OFFICIAL_EMAIL;
	const phone = website?.phone || PHONE_DISPLAY;
	const whatsapp = website?.whatsappNumber || WHATSAPP_NUMBER;

	const menu = (
		<nav className="main-nav" aria-label="Main navigation">
			{navItems.map((item) => {
				const Icon = iconMap[item.icon] || Home;
				const active =
					item.href === "/" ? pathname === "/" : String(pathname || "").startsWith(item.href);
				return (
					<Link className={active ? "active" : ""} href={hrefWithLanguage(item.href)} key={item.href}>
						<Icon size={16} />
						{labelFor(language, item.label)}
					</Link>
				);
			})}
		</nav>
	);

	return (
		<>
			<div className="top-strip" dir={isArabic ? "rtl" : "ltr"}>
				<div className="header-container top-strip-inner">
					<div className="top-contact">
						<a href={mailtoHref(email)}>
							<Mail size={15} />
							<EmailText email={email} />
						</a>
						<a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
							<MessageCircle size={16} />
							<bdi dir="ltr" className="ltr-value">{phone}</bdi>
						</a>
					</div>
					<div className="top-actions">
						<span className="service-pill">
							<Sparkles size={15} />
							{t("service")}
						</span>
						<button type="button" onClick={toggleLanguage} className="lang-toggle">
							<Globe2 size={15} />
							{t("language")}
						</button>
					</div>
				</div>
			</div>

			<header className="site-header" dir={isArabic ? "rtl" : "ltr"}>
				<div className="main-strip">
				<div className="header-container main-strip-inner">
					<Link className="logo" href={hrefWithLanguage("/")} aria-label="ZAD Hotels home">
						<OptimizedImage src={logo} alt="ZAD Hotels" width={132} height={58} sizes="132px" priority />
					</Link>
					{menu}
					<div className="header-actions">
						<Link className="icon-action" href={hrefWithLanguage("/rooms")} aria-label={t("searchRooms")}>
							<Search size={18} />
						</Link>
						<button className="icon-action" type="button" onClick={() => setCartOpen(true)} aria-label={t("cart")}>
							<Badge count={totals.rooms} size="small" offset={[5, -4]}>
								<ShoppingBag size={19} />
							</Badge>
						</button>
						<a className="phone-link" href={`tel:${cleanPhone(phone)}`}>
							<Phone size={17} />
							<span dir="ltr" className="ltr-value">{phone}</span>
						</a>
						<Button
							className="mobile-menu-button"
							type="text"
							icon={<Menu size={23} />}
							onClick={() => setMobileOpen(true)}
							aria-label="Open menu"
						/>
					</div>
				</div>
				</div>

			<Drawer
				open={mobileOpen}
				onClose={() => setMobileOpen(false)}
				placement={isArabic ? "left" : "right"}
				width={330}
				closeIcon={<X size={20} />}
				className="zad-mobile-drawer"
			>
				<div className="mobile-menu-content">
					<OptimizedImage src={logo} alt="ZAD Hotels" width={132} height={58} sizes="132px" />
					{navItems.map((item) => {
						const Icon = iconMap[item.icon] || Home;
						return (
							<Link href={hrefWithLanguage(item.href)} key={item.href} onClick={() => setMobileOpen(false)}>
								<Icon size={18} />
								{labelFor(language, item.label)}
							</Link>
						);
					})}
					<button type="button" onClick={toggleLanguage} className="mobile-line-button">
						<Globe2 size={18} />
						{t("language")}
					</button>
					<button
						type="button"
						onClick={() => {
							setMobileOpen(false);
							setCartOpen(true);
						}}
						className="mobile-line-button"
					>
						<ShoppingBag size={18} />
						{t("cart")} <span dir="ltr" className="ltr-value">({totals.rooms})</span>
					</button>
					<a className="mobile-cta" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
						<MessageCircle size={18} />
						{t("whatsapp")}
					</a>
					<Link className="mobile-cta secondary" href={hrefWithLanguage("/rooms")} onClick={() => setMobileOpen(false)}>
						<CalendarDays size={18} />
						{t("searchRooms")}
					</Link>
				</div>
			</Drawer>
			<CartDrawer />
			</header>
		</>
	);
}
