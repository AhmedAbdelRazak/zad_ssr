import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import HeroCarousel from "../components/HeroCarousel";
import HotelGrid from "../components/HotelGrid";
import SearchPanel from "../components/SearchPanel";
import { getFeaturedHotels, getHotels, getRoomTypes, getWebsite } from "../lib/api";
import { BRAND_NAME } from "../lib/constants";
import { firstImage, stripHtml } from "../lib/format";

export default async function HomePage() {
	const [website, hotels, featuredHotels, roomTypes] = await Promise.all([
		getWebsite(),
		getHotels(),
		getFeaturedHotels(),
		getRoomTypes(),
	]);
	const aboutCopy = stripHtml(website?.aboutUsEnglish).slice(0, 260);

	return (
		<>
			<HeroCarousel website={website} />
			<section className="search-band">
				<div className="container">
					<SearchPanel hotels={hotels} roomTypes={roomTypes} />
				</div>
			</section>
			<section className="section intro-section">
				<div className="container intro-grid">
					<div>
						<p className="eyebrow">Selected stays</p>
						<h2 className="section-title">Hotels shaped around comfort, location, and clear room choices.</h2>
					</div>
					<div>
						<p className="section-copy">
							{aboutCopy ||
								`${BRAND_NAME} brings together a carefully selected hotel collection with a focus on comfort, service, and smooth booking experiences.`}
						</p>
						<div className="intro-points">
							<span>
								<CheckCircle2 size={18} /> Zad-only hotel collection
							</span>
							<span>
								<CheckCircle2 size={18} /> Room and date search
							</span>
							<span>
								<CheckCircle2 size={18} /> Direct support for booking questions
							</span>
						</div>
					</div>
				</div>
			</section>
			<section className="section hotels-section">
				<div className="container">
					<div className="section-head">
						<div>
							<p className="eyebrow">Featured hotels</p>
							<h2 className="section-title">Explore Zad hotels</h2>
						</div>
						<Link className="view-all" href="/our-hotels">
							All hotels <ArrowRight size={17} />
						</Link>
					</div>
					<HotelGrid hotels={featuredHotels.length ? featuredHotels : hotels} limit={6} />
				</div>
			</section>
			{website?.homeSecondBanner?.url ? (
				<section className="wide-image">
					<img src={firstImage(website.homeSecondBanner)} alt="ZAD Hotels feature" />
				</section>
			) : null}
		</>
	);
}
