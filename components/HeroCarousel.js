"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { DEFAULT_HERO_IMAGES } from "../lib/constants";
import { useZadApp } from "./ZadAppProvider";

export default function HeroCarousel({ website = {} }) {
	const { isArabic } = useZadApp();
	const slides = useMemo(() => {
		const source =
			Array.isArray(website?.homeMainBanners) && website.homeMainBanners.length
				? website.homeMainBanners
				: DEFAULT_HERO_IMAGES.map((url) => ({ url }));
		const fallbackTitles = isArabic
			? ["زاد للفنادق", "إقامة بثقة", "مصممة حول رحلتك"]
			: ["ZAD Hotels", "Stay With Confidence", "Designed Around Your Trip"];
		const fallbackCopy = isArabic
			? [
					"إقامات راقية وخدمة مدروسة وفنادق مختارة للراحة.",
					"تصفح الغرف المتاحة واجعل خطوتك القادمة أكثر وضوحاً.",
					"اعثر على نوع الغرفة والفندق المناسب لخطتك.",
				]
			: [
					"Classy stays, thoughtful service, and hotels selected for comfort.",
					"Browse available rooms and book your next stay with ease.",
					"Find the room type and hotel setting that fits your plans.",
		];
		return source.map((slide, index) => ({
			image: slide.url || DEFAULT_HERO_IMAGES[index % DEFAULT_HERO_IMAGES.length],
			title: isArabic
				? slide.titleArabic || slide.titleAr || fallbackTitles[index % fallbackTitles.length]
				: slide.title || fallbackTitles[index % fallbackTitles.length],
			subtitle: isArabic
				? slide.subTitleArabic ||
					slide.subtitleArabic ||
					slide.subTitleAr ||
					fallbackCopy[index % fallbackCopy.length]
				: slide.subTitle || slide.subtitle || fallbackCopy[index % fallbackCopy.length],
			buttonTitle:
				(isArabic && (slide.buttonTitleArabic || slide.buttonTitleAr)) ||
				(!isArabic && slide.buttonTitle) ||
				(isArabic ? "استكشف الفنادق" : "Explore hotels"),
			href: slide.pageRedirectURL || "/our-hotels",
		}));
	}, [isArabic, website]);
	const [active, setActive] = useState(0);
	const current = slides[active] || slides[0];

	useEffect(() => {
		const timer = setInterval(() => {
			setActive((value) => (value + 1) % slides.length);
		}, 5200);
		return () => clearInterval(timer);
	}, [slides.length]);

	const go = (direction) => {
		setActive((value) => (value + direction + slides.length) % slides.length);
	};

	return (
		<section className="hero" aria-label="ZAD Hotels featured stays" dir={isArabic ? "rtl" : "ltr"}>
			{slides.map((slide, index) => (
				<div
					key={`${slide.image}-${index}`}
					className={`hero-slide ${index === active ? "active" : ""}`}
					style={{ backgroundImage: `url(${slide.image})` }}
				/>
			))}
			<div className="hero-overlay" />
			<div className="container hero-content">
				<p className="hero-kicker">ZAD Hotels</p>
				<h1>{current.title}</h1>
				<p>{current.subtitle}</p>
				<div className="hero-actions">
					<Link className="btn btn-primary" href={current.href}>
						{current.buttonTitle}
						<ArrowRight size={18} />
					</Link>
					<Link className="btn btn-ghost" href="/rooms">
						{isArabic ? "تحقق من التواريخ" : "Check dates"}
					</Link>
				</div>
			</div>
			<div className="hero-controls">
				<button type="button" aria-label="Previous slide" onClick={() => go(-1)}>
					<ChevronLeft size={20} />
				</button>
				<button type="button" aria-label="Next slide" onClick={() => go(1)}>
					<ChevronRight size={20} />
				</button>
			</div>
			<div className="hero-dots" aria-hidden="true">
				{slides.map((_, index) => (
					<span key={index} className={index === active ? "active" : ""} />
				))}
			</div>
		</section>
	);
}
