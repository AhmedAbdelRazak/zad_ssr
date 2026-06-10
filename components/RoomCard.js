"use client";

import Link from "next/link";
import { Button } from "antd";
import { BedDouble, MessageCircle, ShoppingBag } from "lucide-react";
import { WHATSAPP_NUMBER } from "../lib/constants";
import { firstImage, roomTypeLabel, sar, slugifyHotel, titleCase } from "../lib/format";
import { useZadApp } from "./ZadAppProvider";

const dateOffset = (days) => {
	const date = new Date();
	date.setDate(date.getDate() + days);
	return date.toISOString().slice(0, 10);
};

export default function RoomCard({
	hotel = {},
	room = {},
	whatsappNumber = WHATSAPP_NUMBER,
	checkIn,
	checkOut,
}) {
	const { addToCart, t, isArabic } = useZadApp();
	const image = firstImage(room.photos, hotel.hotelPhotos);
	const roomName =
		isArabic && room.displayName_OtherLanguage
			? room.displayName_OtherLanguage
			: room.displayName || roomTypeLabel(room.roomType);
	const hotelName =
		isArabic && hotel.hotelName_OtherLanguage
			? hotel.hotelName_OtherLanguage
			: titleCase(hotel.hotelName);
	const slug = slugifyHotel(hotel.hotelName);
	const price = Number(room?.price?.basePrice || 0);
	const selectedCheckIn = checkIn || dateOffset(1);
	const selectedCheckOut = checkOut || dateOffset(4);
	const message = encodeURIComponent(
		isArabic
			? `مرحبا زاد للفنادق، أرغب بالاستفسار عن ${roomName} في ${hotelName}.`
			: `Hello ZAD Hotels, I am interested in ${roomName} at ${hotelName}.`
	);

	const handleAdd = () => {
		addToCart({
			id: room._id || `${hotel._id}-${room.roomType}`,
			hotelId: hotel._id,
			hotelName,
			hotelSlug: slug,
			roomId: room._id,
			roomType: room.roomType,
			roomName,
			image,
			price,
			amount: 1,
			checkIn: selectedCheckIn,
			checkOut: selectedCheckOut,
		});
	};

	return (
		<article className="room-card premium-card" dir={isArabic ? "rtl" : "ltr"}>
			{image ? <img src={image} alt={`${roomName} at ${hotelName}`} loading="lazy" /> : null}
			<div className="room-content">
				<span className="hotel-kicker">{hotelName}</span>
				<h3>{roomName}</h3>
				<p>
					{(isArabic && room.description_OtherLanguage) || room.description ||
						(isArabic
							? "خيار غرفة مريح مع دعم زاد المتاح لمساعدتك في تفاصيل الحجز."
							: "Comfortable room option with Zad support available for booking details.")}
				</p>
				<div className="room-meta">
					<strong>{price ? sar(price) : t("priceOnRequest")}</strong>
					{room.bedsCount ? (
						<small>
							<BedDouble size={14} />
							{room.bedsCount} {isArabic ? "أسرة" : "beds"}
						</small>
					) : null}
				</div>
				<div className="room-actions">
					<Link className="btn btn-ghost" href={`/single-hotel/${slug}`}>
						{t("hotelDetails")}
					</Link>
					<Button type="primary" icon={<ShoppingBag size={17} />} onClick={handleAdd}>
						{t("addToCart")}
					</Button>
					<a className="btn btn-metal" href={`https://wa.me/${whatsappNumber}?text=${message}`} target="_blank" rel="noreferrer">
						<MessageCircle size={17} />
						{t("askToBook")}
					</a>
				</div>
			</div>
		</article>
	);
}
