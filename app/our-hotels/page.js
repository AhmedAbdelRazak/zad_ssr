import HotelExplorer from "../../components/HotelExplorer";
import PageHero from "../../components/PageHero";
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
			<PageHero
				eyebrow="ZAD Hotels"
				title="Our hotel collection"
				copy="Browse hotels assigned to the Zad group, compare locations, and choose the room type that fits your trip."
				eyebrowAr="زاد للفنادق"
				titleAr="مجموعة فنادقنا"
				copyAr="تصفح فنادق زاد، قارن المواقع، واختر نوع الغرفة الأنسب لرحلتك."
			/>
			<section className="search-band page-search-band">
				<div className="container">
					<SearchPanel hotels={hotels} roomTypes={roomTypes} compact />
				</div>
			</section>
			<section className="section">
				<div className="container page-stack">
					<HotelExplorer hotels={hotels} />
				</div>
			</section>
		</>
	);
}
