"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import HotelGrid from "./HotelGrid";
import { BRAND_NAME } from "../lib/constants";
import { stripHtml } from "../lib/format";
import { useZadApp } from "./ZadAppProvider";

const plainSummary = (value = "") => {
	const text = String(value || "");
	const paragraph = text.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1];
	return stripHtml(paragraph || text);
};

export default function HomeSections({ website = {}, hotels = [], featuredHotels = [], aboutCopy = "" }) {
	const { t, isArabic, hrefWithLanguage } = useZadApp();
	const copy =
		plainSummary(
			(isArabic && website?.aboutUsArabic) ||
				(isArabic ? t("introCopy") : aboutCopy) ||
				t("introCopy") ||
				`${BRAND_NAME} brings together a carefully selected hotel collection.`
		) ||
		`${BRAND_NAME} brings together a carefully selected hotel collection.`;

	return (
		<>
			<section className="section intro-section" dir={isArabic ? "rtl" : "ltr"}>
				<div className="container intro-grid">
					<div>
						<p className="eyebrow">{t("selectedStays")}</p>
						<h2 className="section-title">{t("introTitle")}</h2>
					</div>
					<div>
						<p className="section-copy">{copy}</p>
						<div className="intro-points">
							<span>
								<CheckCircle2 size={18} /> {isArabic ? "مجموعة فنادق خاصة بزاد" : "Zad-only hotel collection"}
							</span>
							<span>
								<CheckCircle2 size={18} /> {isArabic ? "بحث بالغرف والتواريخ" : "Room and date search"}
							</span>
							<span>
								<CheckCircle2 size={18} /> {isArabic ? "دعم مباشر لأسئلة الحجز" : "Direct support for booking questions"}
							</span>
						</div>
					</div>
				</div>
			</section>
			<section className="section hotels-section" dir={isArabic ? "rtl" : "ltr"}>
				<div className="container">
					<div className="section-head">
						<div>
							<p className="eyebrow">{t("featuredHotels")}</p>
							<h2 className="section-title">{t("exploreZad")}</h2>
						</div>
						<Link className="view-all" href={hrefWithLanguage("/our-hotels")}>
							{t("allHotels")} <ArrowRight size={17} />
						</Link>
					</div>
					<HotelGrid hotels={featuredHotels.length ? featuredHotels : hotels} limit={6} />
				</div>
			</section>
		</>
	);
}
