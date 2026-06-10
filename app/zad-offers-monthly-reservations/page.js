import HotelGrid from "../../components/HotelGrid";
import { getDealHotels } from "../../lib/api";
import { BRAND_NAME, DEFAULT_HERO_IMAGE } from "../../lib/constants";

export const metadata = {
	title: "Offers",
	description: `Monthly and special offers from ${BRAND_NAME}.`,
	openGraph: { images: [DEFAULT_HERO_IMAGE] },
};

export default async function OffersPage() {
	const hotels = await getDealHotels();
	return (
		<>
			<section className="page-hero">
				<div className="container">
					<p className="eyebrow">Offers</p>
					<h1>Monthly and special stays</h1>
					<p>Hotels with active monthly pricing or special room offers appear here when available.</p>
				</div>
			</section>
			<section className="section">
				<div className="container">
					<HotelGrid hotels={hotels} emptyText="There are no active Zad offers yet." />
				</div>
			</section>
		</>
	);
}
