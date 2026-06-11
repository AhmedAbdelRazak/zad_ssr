"use client";

import { BedDouble, CalendarDays, MapPin, MessageCircle, Navigation, ShieldCheck, Star } from "lucide-react";
import RoomCard from "./RoomCard";
import { DEFAULT_HERO_IMAGE, WHATSAPP_NUMBER } from "../lib/constants";
import { firstImage, hotelLocation, stripHtml, titleCase, walkingDistance } from "../lib/format";
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

export default function SingleHotelView({ hotel = {}, website = {} }) {
	const { t, isArabic } = useZadApp();
	const photos = compactPhotos(hotel);
	const heroImage = photos[0] || firstImage(hotel.hotelPhotos, hotel.roomCountDetails?.[0]?.photos, DEFAULT_HERO_IMAGE);
	const whatsapp = website?.whatsappNumber || WHATSAPP_NUMBER;
	const hotelName =
		isArabic && hotel.hotelName_OtherLanguage
			? hotel.hotelName_OtherLanguage
			: titleCase(hotel.hotelName);
	const distance = walkingDistance(hotel);
	const about =
		stripHtml(isArabic ? hotel.aboutHotelArabic || hotel.aboutHotel : hotel.aboutHotel) ||
		(isArabic
			? "فندق من مجموعة زاد يوفر خيارات غرف واضحة وخدمة تساعدك على اختيار الإقامة المناسبة."
			: "A Zad hotel with clear room choices, guest support, and a stay experience shaped around comfort.");
	const message = encodeURIComponent(
		isArabic
			? `مرحبا زاد للفنادق، أرغب بالاستفسار عن ${hotelName}.`
			: `Hello ZAD Hotels, I am interested in ${hotelName}.`
	);

	const roomCount = (hotel.roomCountDetails || []).length;

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
						{distance ? (
							<p className="hotel-distance">
								<Navigation size={18} />
								<bdi dir="ltr" className="ltr-value">{distance}</bdi> {isArabic ? "إلى الحرم" : "to Al Haram"}
							</p>
						) : null}
						<div className="hotel-showcase-points">
							<span>
								<BedDouble size={17} />
								<bdi dir="ltr" className="ltr-value">{roomCount}</bdi> {roomCount === 1 ? t("room") : t("rooms")}
							</span>
							<span>
								<CalendarDays size={17} />
								{isArabic ? "حجز مرن" : "Flexible booking"}
							</span>
							<span>
								<ShieldCheck size={17} />
								{isArabic ? "دعم زاد للفنادق" : "Zad hotel support"}
							</span>
						</div>
						<div className="hero-actions">
							<a className="btn btn-primary" href="#rooms">
								<BedDouble size={18} />
								{t("availableRoomTypes")}
							</a>
							<a className="btn btn-metal" href={`https://wa.me/${whatsapp}?text=${message}`} target="_blank" rel="noreferrer">
								<MessageCircle size={18} />
								{t("askToBook")}
							</a>
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
					<a href="#overview">{isArabic ? "نظرة عامة" : "Overview"}</a>
					<a href="#rooms">{t("rooms")}</a>
					<a href="#location">{isArabic ? "الموقع" : "Location"}</a>
					<a href="#support">{t("support")}</a>
				</div>
			</nav>

			<section className="section hotel-overview-section" id="overview">
				<div className="container hotel-overview-grid" dir={isArabic ? "rtl" : "ltr"}>
					<article className="premium-card hotel-overview-card">
						<p className="eyebrow">{isArabic ? "عن الفندق" : "About the hotel"}</p>
						<h2>{hotelName}</h2>
						<p>{about}</p>
					</article>
					<aside className="premium-card hotel-facts-card" id="location">
						<p className="eyebrow">{isArabic ? "الموقع والخدمة" : "Location and service"}</p>
						<strong>{hotelLocation(hotel) || hotel.hotelAddress || "Saudi Arabia"}</strong>
						{distance ? <span><bdi dir="ltr" className="ltr-value">{distance}</bdi> {isArabic ? "إلى الحرم" : "to Al Haram"}</span> : null}
						<span dir="ltr" className="ltr-value">{website?.phone || "+966 54 779 3608"}</span>
						<a className="btn btn-ghost" href={`https://wa.me/${whatsapp}?text=${message}`} target="_blank" rel="noreferrer">
							<MessageCircle size={17} />
							{t("askToBook")}
						</a>
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

			<section className="section" id="support">
				<div className="container support-cta premium-card" dir={isArabic ? "rtl" : "ltr"}>
					<div>
						<p className="eyebrow">{t("support")}</p>
						<h2>{isArabic ? "تحتاج مساعدة في اختيار الغرفة؟" : "Need help choosing the right room?"}</h2>
						<p>{isArabic ? "فريق زاد للفنادق يساعدك حسب الفندق والتواريخ ونوع الغرفة المناسب." : "Zad Hotels support can help with hotel-specific room, date, and booking questions."}</p>
					</div>
					<a className="btn btn-primary" href={`https://wa.me/${whatsapp}?text=${message}`} target="_blank" rel="noreferrer">
						<MessageCircle size={18} />
						{t("askToBook")}
					</a>
				</div>
			</section>
		</>
	);
}
