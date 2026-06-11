import HeroCarousel from "../components/HeroCarousel";
import HomeSections from "../components/HomeSections";
import OptimizedImage from "../components/OptimizedImage";
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
					<div className="wide-image-media">
						<OptimizedImage
							src={firstImage(website.homeSecondBanner)}
							alt="ZAD Hotels feature"
							fill
							sizes="(max-width: 760px) calc(100vw - 24px), 1180px"
						/>
					</div>
				</section>
			) : null}
		</>
	);
}
