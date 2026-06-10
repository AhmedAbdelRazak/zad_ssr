import HotelExplorer from "../../components/HotelExplorer";
import SearchPanel from "../../components/SearchPanel";
import { getHotels, getRoomTypes } from "../../lib/api";
import { BRAND_NAME, DEFAULT_HERO_IMAGE } from "../../lib/constants";

export const metadata = {
	title: "Our Hotels",
	description: `Browse the ${BRAND_NAME} hotel collection in Makkah and Madinah.`,
	openGraph: { images: [DEFAULT_HERO_IMAGE] },
};

export default async function OurHotelsPage() {
	const [hotels, roomTypes] = await Promise.all([getHotels(), getRoomTypes()]);
	return (
		<>
			<section className="page-hero">
				<div className="container">
					<p className="eyebrow">ZAD Hotels</p>
					<h1>Our hotel collection</h1>
					<p>Browse hotels assigned to the Zad group, compare locations, and choose the room type that fits your trip.</p>
				</div>
			</section>
			<section className="section">
				<div className="container page-stack">
					<SearchPanel hotels={hotels} roomTypes={roomTypes} compact />
					<HotelExplorer hotels={hotels} />
				</div>
			</section>
		</>
	);
}
