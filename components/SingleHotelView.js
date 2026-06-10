"use client";

import { MessageCircle, MapPin, Star } from "lucide-react";
import RoomCard from "./RoomCard";
import { DEFAULT_HERO_IMAGE, WHATSAPP_NUMBER } from "../lib/constants";
import { firstImage, hotelLocation, titleCase, walkingDistance } from "../lib/format";
import { useZadApp } from "./ZadAppProvider";

export default function SingleHotelView({ hotel = {}, website = {} }) {
	const { t, isArabic } = useZadApp();
	const heroImage = firstImage(hotel.hotelPhotos, hotel.roomCountDetails?.[0]?.photos, DEFAULT_HERO_IMAGE);
	const whatsapp = website?.whatsappNumber || WHATSAPP_NUMBER;
	const hotelName =
		isArabic && hotel.hotelName_OtherLanguage
			? hotel.hotelName_OtherLanguage
			: titleCase(hotel.hotelName);
	const distance = walkingDistance(hotel);
	const message = encodeURIComponent(
		isArabic
			? `مرحبا زاد للفنادق، أرغب بالاستفسار عن ${hotelName}.`
			: `Hello ZAD Hotels, I am interested in ${hotelName}.`
	);

	return (
		<>
			<section className="hotel-hero" style={{ backgroundImage: `url(${heroImage})` }} dir={isArabic ? "rtl" : "ltr"}>
				<div className="hotel-hero-overlay" />
				<div className="container hotel-hero-content">
					<div className="rating-pill">
						<Star size={16} fill="currentColor" />
						{Number(hotel.hotelRating || 0).toFixed(1)}
					</div>
					<h1>{hotelName}</h1>
					<p>
						<MapPin size={18} />
						{hotelLocation(hotel) || "Saudi Arabia"}
					</p>
					{distance ? <p>{distance} {isArabic ? "إلى الحرم" : "to Al Haram"}</p> : null}
					<a className="btn btn-primary" href={`https://wa.me/${whatsapp}?text=${message}`} target="_blank" rel="noreferrer">
						<MessageCircle size={18} />
						{t("askToBook")}
					</a>
				</div>
			</section>
			<section className="section">
				<div className="container hotel-layout" dir={isArabic ? "rtl" : "ltr"}>
					<div>
						<p className="eyebrow">{t("rooms")}</p>
						<h2 className="section-title">{t("availableRoomTypes")}</h2>
						<p className="section-copy">{t("availableRoomCopy")}</p>
					</div>
					<div className="room-list">
						{(hotel.roomCountDetails || []).length ? (
							hotel.roomCountDetails.map((room) => (
								<RoomCard key={room._id || room.roomType} hotel={hotel} room={room} whatsappNumber={whatsapp} />
							))
						) : (
							<div className="empty-state">
								{isArabic ? "لا توجد غرف نشطة متاحة لهذا الفندق حاليا." : "No active rooms are available for this hotel yet."}
							</div>
						)}
					</div>
				</div>
			</section>
		</>
	);
}
