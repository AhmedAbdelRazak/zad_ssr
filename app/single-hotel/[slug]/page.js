import { notFound } from "next/navigation";
import { MessageCircle, MapPin, Star } from "lucide-react";
import RoomCard from "../../../components/RoomCard";
import { getHotelBySlug, getWebsite } from "../../../lib/api";
import { BRAND_NAME, DEFAULT_HERO_IMAGE, WHATSAPP_NUMBER } from "../../../lib/constants";
import { firstImage, hotelLocation, titleCase, walkingDistance } from "../../../lib/format";

export async function generateMetadata({ params }) {
	const { slug } = await params;
	const hotel = await getHotelBySlug(slug);
	if (!hotel?.hotelName) return { title: "Hotel" };
	const image = firstImage(hotel.hotelPhotos, DEFAULT_HERO_IMAGE);
	return {
		title: titleCase(hotel.hotelName),
		description: `View rooms, location, and booking support for ${titleCase(hotel.hotelName)} with ${BRAND_NAME}.`,
		openGraph: { images: [image] },
	};
}

export default async function SingleHotelPage({ params }) {
	const { slug } = await params;
	const [hotel, website] = await Promise.all([getHotelBySlug(slug), getWebsite()]);
	if (!hotel?.hotelName) notFound();
	const heroImage = firstImage(hotel.hotelPhotos, hotel.roomCountDetails?.[0]?.photos, DEFAULT_HERO_IMAGE);
	const whatsapp = website?.whatsappNumber || WHATSAPP_NUMBER;
	const message = encodeURIComponent(`Hello ZAD Hotels, I am interested in ${titleCase(hotel.hotelName)}.`);

	return (
		<>
			<section className="hotel-hero" style={{ backgroundImage: `url(${heroImage})` }}>
				<div className="hotel-hero-overlay" />
				<div className="container hotel-hero-content">
					<div className="rating-pill">
						<Star size={16} fill="currentColor" />
						{Number(hotel.hotelRating || 0).toFixed(1)}
					</div>
					<h1>{titleCase(hotel.hotelName)}</h1>
					<p>
						<MapPin size={18} />
						{hotelLocation(hotel) || "Saudi Arabia"}
					</p>
					{walkingDistance(hotel) ? <p>{walkingDistance(hotel)} to Al Haram</p> : null}
					<a className="btn btn-primary" href={`https://wa.me/${whatsapp}?text=${message}`} target="_blank" rel="noreferrer">
						<MessageCircle size={18} />
						Ask about this hotel
					</a>
				</div>
			</section>
			<section className="section">
				<div className="container hotel-layout">
					<div>
						<p className="eyebrow">Rooms</p>
						<h2 className="section-title">Available room types</h2>
						<p className="section-copy">
							Choose a room type and contact Zad support for exact availability, price confirmation, and booking next steps.
						</p>
					</div>
					<div className="room-list">
						{(hotel.roomCountDetails || []).length ? (
							hotel.roomCountDetails.map((room) => (
								<RoomCard key={room._id || room.roomType} hotel={hotel} room={room} whatsappNumber={whatsapp} />
							))
						) : (
							<div className="empty-state">No active rooms are available for this hotel yet.</div>
						)}
					</div>
				</div>
			</section>
		</>
	);
}
