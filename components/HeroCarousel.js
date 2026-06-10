"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { DEFAULT_HERO_IMAGES } from "../lib/constants";

export default function HeroCarousel({ website = {} }) {
	const slides = useMemo(() => {
		const source =
			Array.isArray(website?.homeMainBanners) && website.homeMainBanners.length
				? website.homeMainBanners
				: DEFAULT_HERO_IMAGES.map((url) => ({ url }));
		const fallbackTitles = ["ZAD Hotels", "Stay With Confidence", "Designed Around Your Trip"];
		const fallbackCopy = [
			"Classy stays, thoughtful service, and hotels selected for comfort.",
			"Browse available rooms and book your next stay with ease.",
			"Find the room type and hotel setting that fits your plans.",
		];
		return source.map((slide, index) => ({
			image: slide.url || DEFAULT_HERO_IMAGES[index % DEFAULT_HERO_IMAGES.length],
			title: slide.title || fallbackTitles[index % fallbackTitles.length],
			subtitle: slide.subTitle || slide.subtitle || fallbackCopy[index % fallbackCopy.length],
			buttonTitle: slide.buttonTitle || "Explore hotels",
			href: slide.pageRedirectURL || "/our-hotels",
		}));
	}, [website]);
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
		<section className="hero" aria-label="ZAD Hotels featured stays">
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
						Check dates
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
			<style jsx>{`
				.hero {
					position: relative;
					min-height: min(780px, calc(100vh - 10px));
					overflow: hidden;
					color: #fff;
				}

				.hero-slide {
					position: absolute;
					inset: 0;
					background-size: cover;
					background-position: center;
					opacity: 0;
					transform: scale(1.035);
					transition:
						opacity 900ms ease,
						transform 5200ms ease;
				}

				.hero-slide.active {
					opacity: 1;
					transform: scale(1);
				}

				.hero-overlay {
					position: absolute;
					inset: 0;
					background:
						linear-gradient(110deg, rgba(8, 9, 13, 0.86) 0%, rgba(8, 9, 13, 0.54) 42%, rgba(10, 143, 130, 0.12) 100%),
						linear-gradient(0deg, rgba(8, 9, 13, 0.36), transparent 45%);
				}

				.hero-content {
					position: relative;
					z-index: 2;
					padding-top: clamp(130px, 20vh, 210px);
					padding-bottom: 120px;
				}

				.hero-kicker {
					margin: 0 0 14px;
					font-size: 14px;
					font-weight: 950;
					color: #c9fff7;
				}

				h1 {
					margin: 0;
					max-width: 760px;
					font-size: clamp(44px, 8vw, 86px);
					line-height: 0.98;
					letter-spacing: 0;
				}

				p {
					max-width: 600px;
					margin: 22px 0 0;
					color: rgba(255, 255, 255, 0.84);
					font-size: clamp(17px, 2vw, 22px);
					line-height: 1.55;
				}

				.hero-actions {
					display: flex;
					flex-wrap: wrap;
					gap: 12px;
					margin-top: 30px;
				}

				.hero-controls {
					position: absolute;
					right: 26px;
					bottom: 90px;
					z-index: 3;
					display: flex;
					gap: 10px;
				}

				.hero-controls button {
					width: 44px;
					height: 44px;
					border-radius: 8px;
					border: 1px solid rgba(255, 255, 255, 0.24);
					color: #fff;
					background: rgba(255, 255, 255, 0.12);
					display: inline-flex;
					align-items: center;
					justify-content: center;
					cursor: pointer;
				}

				.hero-dots {
					position: absolute;
					left: 50%;
					bottom: 34px;
					z-index: 4;
					display: flex;
					gap: 8px;
					transform: translateX(-50%);
				}

				.hero-dots span {
					width: 34px;
					height: 3px;
					border-radius: 99px;
					background: rgba(255, 255, 255, 0.35);
				}

				.hero-dots span.active {
					background: #fff;
				}

				@media (max-width: 720px) {
					.hero {
						min-height: 660px;
					}

					.hero-content {
						padding-top: 112px;
						padding-bottom: 140px;
					}

					.hero-controls {
						display: none;
					}
				}
			`}</style>
		</section>
	);
}
