"use client";

import Link from "next/link";
import { Button } from "antd";
import { BedDouble, MessageCircle, ShoppingBag } from "lucide-react";
import { buildRoomPricing } from "../lib/booking";
import { firstImage, roomTypeLabel, sar, slugifyHotel, titleCase } from "../lib/format";
import { openZadSupport } from "../lib/support";
import OptimizedImage from "./OptimizedImage";
import { useZadApp } from "./ZadAppProvider";

const dateOffset = (days) => {
	const date = new Date();
	date.setDate(date.getDate() + days);
	return date.toISOString().slice(0, 10);
};

export default function RoomCard({
	hotel = {},
	room = {},
	checkIn,
	checkOut,
	adults = 1,
	children = 0,
}) {
	const { addToCart, t, isArabic, hrefWithLanguage } = useZadApp();
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
	const pricing = buildRoomPricing(room, selectedCheckIn, selectedCheckOut);
	const supportMessage = isArabic
		? `\u0645\u0631\u062d\u0628\u0627 \u0632\u0627\u062f \u0644\u0644\u0641\u0646\u0627\u062f\u0642\u060c \u0623\u0631\u063a\u0628 \u0628\u0627\u0644\u0627\u0633\u062a\u0641\u0633\u0627\u0631 \u0639\u0646 ${roomName} \u0641\u064a ${hotelName}.`
		: `Hello ZAD Hotels, I am interested in ${roomName} at ${hotelName}.`;

	const handleAdd = () => {
		addToCart({
			id: room._id || `${hotel._id}-${room.roomType}`,
			hotelId: hotel._id,
			hotelName,
			hotelSlug: slug,
			belongsTo: hotel?.belongsTo?._id || hotel?.belongsTo || "",
			hotelAddress: hotel.hotelAddress || "",
			hotelCity: hotel.hotelCity || "",
			hotelState: hotel.hotelState || "",
			hotelCountry: hotel.hotelCountry || "",
			guestPaymentAcceptance: hotel.guestPaymentAcceptance,
			roomId: room._id,
			roomType: room.roomType,
			roomName,
			roomNameOtherLanguage: room.displayName_OtherLanguage || "",
			roomColor: room.roomColor || "",
			defaultCost: room.defaultCost,
			roomCommission: room.roomCommission,
			pricingRate: Array.isArray(room.pricingRate) ? room.pricingRate : [],
			bedsCount: room.bedsCount,
			adults: Number(adults || 1),
			children: Number(children || 0),
			photos: Array.isArray(room.photos) ? room.photos : [],
			image,
			price,
			amount: 1,
			checkIn: selectedCheckIn,
			checkOut: selectedCheckOut,
			...pricing,
		});
	};

	const handleOpenChat = () => {
		openZadSupport({
			hotel,
			hotelName,
			message: supportMessage,
		});
	};

	return (
		<article className="room-card premium-card" dir={isArabic ? "rtl" : "ltr"}>
			{image ? (
				<div className="room-card-image">
					<OptimizedImage
						src={image}
						alt={`${roomName} at ${hotelName}`}
						fill
						sizes="(max-width: 760px) calc(100vw - 56px), 230px"
					/>
				</div>
			) : null}
			<div className="room-content">
				<span className="hotel-kicker">{hotelName}</span>
				<h3>{roomName}</h3>
				<p>
					{(isArabic && room.description_OtherLanguage) || room.description ||
						(isArabic
							? "\u062e\u064a\u0627\u0631 \u063a\u0631\u0641\u0629 \u0645\u0631\u064a\u062d \u0645\u0639 \u062f\u0639\u0645 \u0632\u0627\u062f \u0627\u0644\u0645\u062a\u0627\u062d \u0644\u0645\u0633\u0627\u0639\u062f\u062a\u0643 \u0641\u064a \u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u062d\u062c\u0632."
							: "Comfortable room option with Zad support available for booking details.")}
				</p>
				<div className="room-meta">
					<strong dir={price ? "ltr" : undefined} className={price ? "ltr-value" : undefined}>{price ? sar(price) : t("priceOnRequest")}</strong>
					{room.bedsCount ? (
						<small>
							<BedDouble size={14} />
							<bdi dir="ltr" className="ltr-value">{room.bedsCount}</bdi> {isArabic ? "\u0623\u0633\u0631\u0629" : "beds"}
						</small>
					) : null}
				</div>
				<div className="room-actions">
					<Link className="btn btn-ghost" href={hrefWithLanguage(`/single-hotel/${slug}`)}>
						{t("hotelDetails")}
					</Link>
					<Button type="primary" icon={<ShoppingBag size={17} />} onClick={handleAdd}>
						{t("addToCart")}
					</Button>
					<button type="button" className="btn btn-metal" onClick={handleOpenChat}>
						<MessageCircle size={17} />
						{t("askToBook")}
					</button>
				</div>
			</div>
		</article>
	);
}
