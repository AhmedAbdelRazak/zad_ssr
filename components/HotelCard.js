"use client";

import Link from "next/link";
import {
	AirVent,
	ArrowRight,
	Bath,
	BedDouble,
	BookOpen,
	Car,
	CheckCircle2,
	Coffee,
	ConciergeBell,
	Eye,
	MapPin,
	MessageCircle,
	Mountain,
	ParkingCircle,
	Plane,
	Shirt,
	Snowflake,
	Star,
	Store,
	Tv,
	Utensils,
	Wifi,
} from "lucide-react";
import { DEFAULT_HERO_IMAGE } from "../lib/constants";
import { firstImage, hotelLocation, sar, slugifyHotel, titleCase, walkingDistance } from "../lib/format";
import { useZadApp } from "./ZadAppProvider";

const minBasePrice = (hotel = {}) => {
	const prices = (hotel.roomCountDetails || [])
		.map((room) => Number(room?.price?.basePrice || 0))
		.filter((price) => price > 0);
	return prices.length ? Math.min(...prices) : 0;
};

const hotelImages = (hotel = {}) => {
	const rows = [
		...(Array.isArray(hotel.hotelPhotos) ? hotel.hotelPhotos : []),
		...(hotel.roomCountDetails || []).flatMap((room) => (Array.isArray(room.photos) ? room.photos : [])),
	];
	const urls = [];
	rows.forEach((item) => {
		const url = typeof item === "string" ? item : item?.url;
		if (url && !urls.includes(url)) urls.push(url);
	});
	if (!urls.length) urls.push(firstImage(hotel.hotelPhotos, hotel.roomCountDetails?.[0]?.photos, DEFAULT_HERO_IMAGE));
	return urls.filter(Boolean).slice(0, 5);
};

const featureIcon = (feature = "") => {
	const text = String(feature).toLowerCase();
	if (text.includes("wifi") || text.includes("internet")) return Wifi;
	if (text.includes("tv") || text.includes("television")) return Tv;
	if (text.includes("air") || text.includes("a/c") || text.includes("conditioning")) return AirVent;
	if (text.includes("restaurant") || text.includes("halal")) return Utensils;
	if (text.includes("parking")) return ParkingCircle;
	if (text.includes("service") || text.includes("reception")) return ConciergeBell;
	if (text.includes("laundry")) return Shirt;
	if (text.includes("coffee") || text.includes("dates") || text.includes("mini bar")) return Coffee;
	if (text.includes("quran")) return BookOpen;
	if (text.includes("mountain")) return Mountain;
	if (text.includes("view")) return Eye;
	if (text.includes("shuttle") || text.includes("haram")) return Car;
	if (text.includes("pilgrimage")) return Plane;
	if (text.includes("bath")) return Bath;
	if (text.includes("souk") || text.includes("market")) return Store;
	if (text.includes("smoking")) return Snowflake;
	return CheckCircle2;
};

const hotelFeatures = (hotel = {}) => {
	const rows = (hotel.roomCountDetails || []).flatMap((room) => [
		...(Array.isArray(room?.amenities) ? room.amenities : []),
		...(Array.isArray(room?.views) ? room.views : []),
		...(Array.isArray(room?.extraAmenities) ? room.extraAmenities : []),
	]);
	return [...new Set(rows.filter(Boolean))];
};

const addressLine = (hotel = {}) =>
	hotel.hotelAddress
		? String(hotel.hotelAddress)
				.split(",")
				.slice(0, 2)
				.join(", ")
		: hotelLocation(hotel) || "Saudi Arabia";

export default function HotelCard({ hotel = {}, priority = false }) {
	const { t, language, isArabic, hrefWithLanguage } = useZadApp();
	const images = hotelImages(hotel);
	const image = images[0] || DEFAULT_HERO_IMAGE;
	const slug = slugifyHotel(hotel.hotelName);
	const price = minBasePrice(hotel);
	const oldPrice = price ? Math.ceil(price * 1.1) : 0;
	const roomsCount = (hotel.roomCountDetails || []).length;
	const distance = walkingDistance(hotel);
	const features = hotelFeatures(hotel);
	const visibleFeatures = features.slice(0, 15);
	const displayName =
		isArabic && hotel.hotelName_OtherLanguage
			? hotel.hotelName_OtherLanguage
			: titleCase(hotel.hotelName);
	const rating = Math.max(0, Math.min(5, Number(hotel.hotelRating || 0)));
	const labels = {
		perNight: isArabic ? "/ \u0644\u064a\u0644\u0629" : "/ night",
		freeCancellation: isArabic ? "\u0625\u0644\u063a\u0627\u0621 \u0645\u062c\u0627\u0646\u064a" : "Free cancellation",
		chat: isArabic ? "\u062a\u062d\u062f\u062b \u0645\u0639 \u0632\u0627\u062f" : "Chat With Zad",
		available: isArabic ? "\u0645\u062a\u0627\u062d" : "Available",
		showMore: isArabic ? "\u0639\u0631\u0636 \u0623\u0643\u062b\u0631" : "Show more",
		toHaram: isArabic ? "\u0625\u0644\u0649 \u0627\u0644\u062d\u0631\u0645" : "to Al Haram",
	};

	return (
		<article className="hotel-card premium-card" dir={isArabic ? "rtl" : "ltr"}>
			<div className="hotel-card-gallery">
				<Link href={hrefWithLanguage(`/single-hotel/${slug}`)} className="hotel-card-main-image" aria-label={`View ${hotel.hotelName}`}>
					<img src={image} alt={displayName || "ZAD hotel"} loading={priority ? "eager" : "lazy"} />
					<span className="hotel-card-image-dots" aria-hidden="true">
						{images.slice(0, 5).map((item, index) => (
							<i className={index === 0 ? "active" : ""} key={`${item}-${index}`} />
						))}
					</span>
				</Link>
				<div className="hotel-card-thumbs" aria-hidden="true">
					{images.slice(0, 4).map((item, index) => (
						<img src={item} alt="" loading="lazy" key={`${item}-thumb-${index}`} />
					))}
				</div>
			</div>

			<div className="hotel-card-details">
				<div className="hotel-card-title-row">
					<div>
						<h3 lang={language === "ar" ? "ar" : "en"}>
							<Link href={hrefWithLanguage(`/single-hotel/${slug}`)}>{displayName}</Link>
						</h3>
						<p className="hotel-card-address">
							<MapPin size={15} />
							{addressLine(hotel)}
						</p>
					</div>
					<span className="hotel-card-brand">ZAD</span>
				</div>

				<div className="hotel-card-rating" aria-label={`${rating.toFixed(1)} stars`}>
					<span>{isArabic ? "\u062a\u0642\u064a\u064a\u0645 \u0627\u0644\u0641\u0646\u062f\u0642" : "Hotel rating"}</span>
					<div>
						{[0, 1, 2, 3, 4].map((index) => (
							<Star
								key={index}
								size={16}
								fill={index < Math.round(rating) ? "currentColor" : "none"}
							/>
						))}
					</div>
				</div>

				<div className="hotel-card-price">
					{price ? (
						<>
							<strong dir="ltr" className="ltr-value">{sar(price)}</strong>
							<span>{labels.perNight}</span>
							{oldPrice ? <del dir="ltr" className="ltr-value">{sar(oldPrice)}</del> : null}
						</>
					) : (
						<strong>{t("contactForPrice")}</strong>
					)}
				</div>

				{visibleFeatures.length ? (
					<div className="hotel-card-amenities">
						{visibleFeatures.map((feature) => {
							const Icon = featureIcon(feature);
							return (
								<span key={feature}>
									<Icon size={14} />
									{titleCase(feature)}
								</span>
							);
						})}
					</div>
				) : null}

				{features.length > visibleFeatures.length ? (
					<Link href={hrefWithLanguage(`/single-hotel/${slug}`)} className="hotel-card-show-more">
						{labels.showMore}
					</Link>
				) : null}

				<div className="hotel-card-distance-row">
					{distance ? (
						<span>
							<Car size={15} />
							<bdi dir="ltr" className="ltr-value">{distance}</bdi> {labels.toHaram}
						</span>
					) : null}
					<span>
						<BedDouble size={15} />
						<bdi dir="ltr" className="ltr-value">{roomsCount}</bdi> {roomsCount === 1 ? t("room") : t("rooms")}
					</span>
				</div>
			</div>

			<aside className="hotel-card-actions">
				<div className="hotel-card-action-spacer" />
				<div className="hotel-card-action-stack">
					<span className="hotel-card-cancel">
						<CheckCircle2 size={15} />
						{labels.freeCancellation}
					</span>
					<Link href={hrefWithLanguage(`/single-hotel/${slug}#support`)} className="hotel-card-chat">
						<MessageCircle size={16} />
						<span>{labels.chat}</span>
						<i />
					</Link>
					<Link href={hrefWithLanguage(`/single-hotel/${slug}`)} className="hotel-card-details-link">
						{t("viewHotel")}
						<ArrowRight size={16} />
					</Link>
				</div>
			</aside>
		</article>
	);
}
