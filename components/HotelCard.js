"use client";

import Link from "next/link";
import { ArrowRight, BedDouble, MapPin, Star } from "lucide-react";
import { DEFAULT_HERO_IMAGE } from "../lib/constants";
import { firstImage, hotelLocation, sar, slugifyHotel, titleCase, walkingDistance } from "../lib/format";
import { useZadApp } from "./ZadAppProvider";

const minBasePrice = (hotel = {}) => {
	const prices = (hotel.roomCountDetails || [])
		.map((room) => Number(room?.price?.basePrice || 0))
		.filter((price) => price > 0);
	return prices.length ? Math.min(...prices) : 0;
};

export default function HotelCard({ hotel = {}, priority = false }) {
	const { t, language, isArabic, hrefWithLanguage } = useZadApp();
	const image = firstImage(hotel.hotelPhotos, hotel.roomCountDetails?.[0]?.photos, DEFAULT_HERO_IMAGE);
	const slug = slugifyHotel(hotel.hotelName);
	const price = minBasePrice(hotel);
	const roomsCount = (hotel.roomCountDetails || []).length;
	const distance = walkingDistance(hotel);
	const displayName =
		isArabic && hotel.hotelName_OtherLanguage
			? hotel.hotelName_OtherLanguage
			: titleCase(hotel.hotelName);

	return (
		<article className="hotel-card premium-card" dir={isArabic ? "rtl" : "ltr"}>
			<Link href={hrefWithLanguage(`/single-hotel/${slug}`)} className="image-wrap" aria-label={`View ${hotel.hotelName}`}>
				<img src={image} alt={displayName || "ZAD hotel"} loading={priority ? "eager" : "lazy"} />
				<span className="rating">
					<Star size={14} fill="currentColor" />
					<bdi dir="ltr" className="ltr-value">{Number(hotel.hotelRating || 0).toFixed(1)}</bdi>
				</span>
			</Link>
			<div className="content">
				<h3 lang={language === "ar" ? "ar" : "en"}>
					<Link href={hrefWithLanguage(`/single-hotel/${slug}`)}>{displayName}</Link>
				</h3>
				<p className="location">
					<MapPin size={15} />
					{hotelLocation(hotel) || "Saudi Arabia"}
				</p>
				{distance ? (
					<p className="distance">
						<bdi dir="ltr" className="ltr-value">{distance}</bdi> {isArabic ? "إلى الحرم" : "to Al Haram"}
					</p>
				) : null}
				<div className="hotel-meta">
					<span>
						<BedDouble size={15} />
						<bdi dir="ltr" className="ltr-value">{roomsCount}</bdi> {roomsCount === 1 ? t("room") : t("rooms")}
					</span>
				</div>
				<div className="card-bottom">
					<div>
						<span>{t("from")}</span>
						<strong dir={price ? "ltr" : undefined} className={price ? "ltr-value" : undefined}>{price ? sar(price) : t("contactForPrice")}</strong>
					</div>
					<Link href={hrefWithLanguage(`/single-hotel/${slug}`)} className="view-link">
						{t("viewHotel")}
						<ArrowRight size={16} />
					</Link>
				</div>
			</div>
		</article>
	);
}
