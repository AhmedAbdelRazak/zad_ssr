import { getWebsite } from "../../lib/api";
import { BRAND_NAME, DEFAULT_HERO_IMAGE } from "../../lib/constants";
import { firstImage, stripHtml } from "../../lib/format";

export async function generateMetadata() {
	const website = await getWebsite();
	const description = stripHtml(website?.aboutUsEnglish).slice(0, 155);
	return {
		title: "About",
		description: description || `Learn more about ${BRAND_NAME}.`,
		openGraph: { images: [firstImage(website?.aboutUsBanner, DEFAULT_HERO_IMAGE)] },
	};
}

export default async function AboutPage() {
	const website = await getWebsite();
	const image = firstImage(website?.aboutUsBanner, DEFAULT_HERO_IMAGE);
	const html = website?.aboutUsEnglish || "<p>ZAD Hotels brings together selected hotel stays and responsive support.</p>";
	return (
		<>
			<section className="page-hero image-hero" style={{ backgroundImage: `url(${image})` }}>
				<div className="page-hero-shade" />
				<div className="container">
					<p className="eyebrow">About us</p>
					<h1>{BRAND_NAME}</h1>
					<p>Selected hotel stays, thoughtful support, and clearer booking decisions.</p>
				</div>
			</section>
			<section className="section">
				<div className="container content-prose" dangerouslySetInnerHTML={{ __html: html }} />
			</section>
		</>
	);
}
