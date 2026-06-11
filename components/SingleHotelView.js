"use client";

import { BedDouble, CalendarDays, Car, Footprints, MapPin, MessageCircle, ShieldCheck, Star } from "lucide-react";
import RoomCard from "./RoomCard";
import { DEFAULT_HERO_IMAGE } from "../lib/constants";
import { drivingDistance, firstImage, hotelLocation, stripHtml, titleCase, walkingDistanceOnly } from "../lib/format";
import { openZadSupport } from "../lib/support";
import OptimizedImage from "./OptimizedImage";
import { useZadApp } from "./ZadAppProvider";

const compactPhotos = (hotel = {}) => {
	const rows = [
		...(Array.isArray(hotel.hotelPhotos) ? hotel.hotelPhotos : []),
		...(hotel.roomCountDetails || []).flatMap((room) => (Array.isArray(room.photos) ? room.photos : [])),
	]
		.map((item) => item?.url || item)
		.filter(Boolean);
	return [...new Set(rows)].slice(0, 5);
};

const cleanPhone = (value = "") => String(value || "").replace(/[^\d+]/g, "");

export default function SingleHotelView({ hotel = {}, website = {} }) {
	const { t, isArabic } = useZadApp();
	const photos = compactPhotos(hotel);
	const heroImage = photos[0] || firstImage(hotel.hotelPhotos, hotel.roomCountDetails?.[0]?.photos, DEFAULT_HERO_IMAGE);
	const hotelName =
		isArabic && hotel.hotelName_OtherLanguage
			? hotel.hotelName_OtherLanguage
			: titleCase(hotel.hotelName);
	const walking = walkingDistanceOnly(hotel);
	const driving = drivingDistance(hotel);
	const showDrivingDistance = driving && driving !== walking;
	const phone = website?.phone || "+966 54 779 3608";
	const supportMessage = isArabic
		? `\u0645\u0631\u062d\u0628\u0627 \u0632\u0627\u062f \u0644\u0644\u0641\u0646\u0627\u062f\u0642\u060c \u0623\u0631\u063a\u0628 \u0628\u0627\u0644\u0627\u0633\u062a\u0641\u0633\u0627\u0631 \u0639\u0646 ${hotelName}.`
		: `Hello ZAD Hotels, I am interested in ${hotelName}.`;
	const about =
		stripHtml(isArabic ? hotel.aboutHotelArabic || hotel.aboutHotel : hotel.aboutHotel) ||
		(isArabic
			? "\u0641\u0646\u062f\u0642 \u0645\u0646 \u0645\u062c\u0645\u0648\u0639\u0629 \u0632\u0627\u062f \u064a\u0648\u0641\u0631 \u062e\u064a\u0627\u0631\u0627\u062a \u063a\u0631\u0641 \u0648\u0627\u0636\u062d\u0629 \u0648\u062e\u062f\u0645\u0629 \u062a\u0633\u0627\u0639\u062f\u0643 \u0639\u0644\u0649 \u0627\u062e\u062a\u064a\u0627\u0631 \u0627\u0644\u0625\u0642\u0627\u0645\u0629 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629."
			: "A Zad hotel with clear room choices, guest support, and a stay experience shaped around comfort.");
	const roomCount = (hotel.roomCountDetails || []).length;
	const handleOpenChat = () => {
		openZadSupport({
			hotel,
			hotelName,
			message: supportMessage,
		});
	};

	return (
		<>
			<section className="hotel-showcase ottoman-hero" dir={isArabic ? "rtl" : "ltr"}>
				<div className="container hotel-showcase-grid">
					<div className="hotel-showcase-copy">
						<div className="rating-pill">
							<Star size={16} fill="currentColor" />
							<bdi dir="ltr" className="ltr-value">{Number(hotel.hotelRating || 0).toFixed(1)}</bdi>
						</div>
						<h1>{hotelName}</h1>
						<p className="hotel-address">
							<MapPin size={19} />
							{hotelLocation(hotel) || hotel.hotelAddress || "Saudi Arabia"}
						</p>
						{walking || showDrivingDistance ? (
							<div className="hotel-distance hotel-distance-options">
								{walking ? (
									<span>
										<Footprints size={18} />
										<bdi dir="ltr" className="ltr-value">{walking}</bdi> {isArabic ? "\u0645\u0634\u064a\u0627\u064b \u0625\u0644\u0649 \u0627\u0644\u062d\u0631\u0645" : "walk to Al Haram"}
									</span>
								) : null}
								{showDrivingDistance ? (
									<span>
										<Car size={18} />
										<bdi dir="ltr" className="ltr-value">{driving}</bdi> {isArabic ? "\u0628\u0627\u0644\u0633\u064a\u0627\u0631\u0629 \u0625\u0644\u0649 \u0627\u0644\u062d\u0631\u0645" : "drive to Al Haram"}
									</span>
								) : null}
							</div>
						) : null}
						<div className="hotel-showcase-points">
							<span>
								<BedDouble size={17} />
								<bdi dir="ltr" className="ltr-value">{roomCount}</bdi> {roomCount === 1 ? t("room") : t("rooms")}
							</span>
							<span>
								<CalendarDays size={17} />
								{isArabic ? "\u062d\u062c\u0632 \u0645\u0631\u0646" : "Flexible booking"}
							</span>
							<span>
								<ShieldCheck size={17} />
								{isArabic ? "\u062f\u0639\u0645 \u0632\u0627\u062f \u0644\u0644\u0641\u0646\u0627\u062f\u0642" : "Zad hotel support"}
							</span>
						</div>
						<div className="hero-actions">
							<a className="btn btn-primary" href="#rooms">
								<BedDouble size={18} />
								{t("availableRoomTypes")}
							</a>
							<button className="btn btn-metal" type="button" onClick={handleOpenChat}>
								<MessageCircle size={18} />
								{t("askToBook")}
							</button>
						</div>
					</div>
					<div className="hotel-gallery" aria-label={`${hotelName} photos`}>
						<div className="gallery-image gallery-main">
							<OptimizedImage
								src={heroImage}
								alt={hotelName}
								fill
								priority
								sizes="(max-width: 760px) calc(100vw - 32px), 48vw"
							/>
						</div>
						{photos.slice(1, 5).map((photo, index) => (
							<div className="gallery-image" key={`${photo}-${index}`}>
								<OptimizedImage
									src={photo}
									alt={`${hotelName} ${index + 2}`}
									fill
									sizes="(max-width: 760px) 45vw, 220px"
									quality={72}
								/>
							</div>
						))}
					</div>
				</div>
			</section>

			<nav className="hotel-section-nav" dir={isArabic ? "rtl" : "ltr"} aria-label="Hotel sections">
				<div className="container">
					<a href="#overview">{isArabic ? "\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629" : "Overview"}</a>
					<a href="#rooms">{t("rooms")}</a>
					<a href="#location">{isArabic ? "\u0627\u0644\u0645\u0648\u0642\u0639" : "Location"}</a>
					<a href="#support">{t("support")}</a>
				</div>
			</nav>

			<section className="section hotel-overview-section" id="overview">
				<div className="container hotel-overview-grid" dir={isArabic ? "rtl" : "ltr"}>
					<article className="premium-card hotel-overview-card">
						<p className="eyebrow">{isArabic ? "\u0639\u0646 \u0627\u0644\u0641\u0646\u062f\u0642" : "About the hotel"}</p>
						<h2>{hotelName}</h2>
						<p>{about}</p>
					</article>
					<aside className="premium-card hotel-facts-card" id="location">
						<p className="eyebrow">{isArabic ? "\u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u062e\u062f\u0645\u0629" : "Location and service"}</p>
						<strong>{hotelLocation(hotel) || hotel.hotelAddress || "Saudi Arabia"}</strong>
						{walking ? <span><bdi dir="ltr" className="ltr-value">{walking}</bdi> {isArabic ? "\u0645\u0634\u064a\u0627\u064b \u0625\u0644\u0649 \u0627\u0644\u062d\u0631\u0645" : "walk to Al Haram"}</span> : null}
						{showDrivingDistance ? <span><bdi dir="ltr" className="ltr-value">{driving}</bdi> {isArabic ? "\u0628\u0627\u0644\u0633\u064a\u0627\u0631\u0629 \u0625\u0644\u0649 \u0627\u0644\u062d\u0631\u0645" : "drive to Al Haram"}</span> : null}
						<a href={`tel:${cleanPhone(phone)}`} dir="ltr" className="ltr-value">{phone}</a>
						<button className="btn btn-ghost" type="button" onClick={handleOpenChat}>
							<MessageCircle size={17} />
							{t("askToBook")}
						</button>
					</aside>
				</div>
			</section>

			<section className="section hotel-rooms-section" id="rooms">
				<div className="container hotel-rooms-layout" dir={isArabic ? "rtl" : "ltr"}>
					<div className="section-head">
						<div>
							<p className="eyebrow">{t("rooms")}</p>
							<h2 className="section-title">{t("availableRoomTypes")}</h2>
							<p className="section-copy">{t("availableRoomCopy")}</p>
						</div>
					</div>
					<div className="room-list jannat-room-list">
						{roomCount ? (
							hotel.roomCountDetails.map((room) => (
								<RoomCard key={room._id || room.roomType} hotel={hotel} room={room} />
							))
						) : (
							<div className="empty-state">
								{isArabic
									? "\u0644\u0627 \u062a\u0648\u062c\u062f \u063a\u0631\u0641 \u0646\u0634\u0637\u0629 \u0645\u062a\u0627\u062d\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0641\u0646\u062f\u0642 \u062d\u0627\u0644\u064a\u0627."
									: "No active rooms are available for this hotel yet."}
							</div>
						)}
					</div>
				</div>
			</section>

			<section className="section" id="support">
				<div className="container support-cta premium-card" dir={isArabic ? "rtl" : "ltr"}>
					<div>
						<p className="eyebrow">{t("support")}</p>
						<h2>{isArabic ? "\u062a\u062d\u062a\u0627\u062c \u0645\u0633\u0627\u0639\u062f\u0629 \u0641\u064a \u0627\u062e\u062a\u064a\u0627\u0631 \u0627\u0644\u063a\u0631\u0641\u0629\u061f" : "Need help choosing the right room?"}</h2>
						<p>{isArabic ? "\u0641\u0631\u064a\u0642 \u0632\u0627\u062f \u0644\u0644\u0641\u0646\u0627\u062f\u0642 \u064a\u0633\u0627\u0639\u062f\u0643 \u062d\u0633\u0628 \u0627\u0644\u0641\u0646\u062f\u0642 \u0648\u0627\u0644\u062a\u0648\u0627\u0631\u064a\u062e \u0648\u0646\u0648\u0639 \u0627\u0644\u063a\u0631\u0641\u0629 \u0627\u0644\u0645\u0646\u0627\u0633\u0628." : "Zad Hotels support can help with hotel-specific room, date, and booking questions."}</p>
					</div>
					<button className="btn btn-primary" type="button" onClick={handleOpenChat}>
						<MessageCircle size={18} />
						{t("askToBook")}
					</button>
				</div>
			</section>
		</>
	);
}
