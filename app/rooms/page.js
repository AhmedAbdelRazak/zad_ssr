import RoomCard from "../../components/RoomCard";
import SearchPanel from "../../components/SearchPanel";
import { getHotels, getRoomSearchResults, getRoomTypes, getWebsite } from "../../lib/api";
import { BRAND_NAME, DEFAULT_HERO_IMAGE } from "../../lib/constants";
import { hotelLocation, titleCase } from "../../lib/format";

export const metadata = {
	title: "Room Search",
	description: `Search room availability and prices across ${BRAND_NAME} hotels.`,
	openGraph: { images: [DEFAULT_HERO_IMAGE] },
};

const todayOffset = (days) => {
	const date = new Date();
	date.setDate(date.getDate() + days);
	return date.toISOString().slice(0, 10);
};

export default async function RoomsPage({ searchParams }) {
	const params = await searchParams;
	const destination = params?.destination || "All";
	const startDate = params?.startDate || todayOffset(1);
	const endDate = params?.endDate || todayOffset(4);
	const roomType = params?.roomType || "all";
	const adults = params?.adults || "1";
	const children = params?.children || "";
	const hasSearch = Boolean(params?.startDate || params?.endDate || params?.destination || params?.roomType);
	const query = `${startDate}_${endDate}_${roomType}_${adults}_${children}_${destination}`;
	const [hotels, roomTypes, website] = await Promise.all([getHotels(), getRoomTypes(), getWebsite()]);
	const results = hasSearch ? await getRoomSearchResults(query) : hotels;
	const roomRows = [];

	results.forEach((hotel) => {
		(hotel.roomCountDetails || []).forEach((room) => {
			roomRows.push({ hotel, room });
		});
	});

	return (
		<>
			<section className="page-hero">
				<div className="container">
					<p className="eyebrow">Room search</p>
					<h1>Find the right room for your dates</h1>
					<p>Search Zad hotels by destination, dates, room type, and guest count.</p>
				</div>
			</section>
			<section className="section">
				<div className="container page-stack">
					<SearchPanel
						hotels={hotels}
						roomTypes={roomTypes}
						compact
						defaults={{ destination, startDate, endDate, roomType, adults, children }}
					/>
					<div className="results-head">
						<div>
							<p className="eyebrow">{roomRows.length} room options</p>
							<h2>{titleCase(destination)} stays</h2>
						</div>
						<p>{startDate} to {endDate}</p>
					</div>
					{roomRows.length ? (
						<div className="room-list">
							{roomRows.map(({ hotel, room }) => (
								<RoomCard
									key={`${hotel._id}-${room._id || room.roomType}`}
									hotel={hotel}
									room={room}
									whatsappNumber={website?.whatsappNumber}
								/>
							))}
						</div>
					) : (
						<div className="empty-state">
							No room options matched this search yet. Try a wider date range or another destination.
						</div>
					)}
				</div>
			</section>
		</>
	);
}
