import HeroCarousel from "../components/HeroCarousel";
import HomeSections from "../components/HomeSections";
import SearchPanel from "../components/SearchPanel";
import { getFeaturedHotels, getHotels, getRoomTypes, getWebsite } from "../lib/api";
import { firstImage, stripHtml } from "../lib/format";

export default async function HomePage() {
	const [website, hotels, featuredHotels, roomTypes] = await Promise.all([
		getWebsite(),
		getHotels(),
		getFeaturedHotels(),
		getRoomTypes(),
	]);
	const aboutCopy = stripHtml(website?.aboutUsEnglish)
		.replace(/^ZAD Hotels\s+ZAD Hotels\b/i, "ZAD Hotels")
		.slice(0, 260);

	return (
		<>
			<HeroCarousel website={website} />
			<section className="search-band">
				<div className="container">
					<SearchPanel hotels={hotels} roomTypes={roomTypes} />
				</div>
			</section>
			<HomeSections
				website={website}
				hotels={hotels}
				featuredHotels={featuredHotels}
				aboutCopy={aboutCopy}
			/>
			{website?.homeSecondBanner?.url ? (
				<section className="wide-image">
					<img src={firstImage(website.homeSecondBanner)} alt="ZAD Hotels feature" />
				</section>
			) : null}
		</>
	);
}
