import AboutContent from "../../components/AboutContent";
import PageHero from "../../components/PageHero";
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
	return (
		<>
			<PageHero
				image={image}
				eyebrow="About us"
				title={BRAND_NAME}
				copy="Selected hotel stays, thoughtful support, and clearer booking decisions."
				eyebrowAr="من نحن"
				titleAr="زاد للفنادق"
				copyAr="إقامات مختارة، دعم مدروس، وقرارات حجز أكثر وضوحاً."
			/>
			<section className="section">
				<AboutContent
					englishHtml={website?.aboutUsEnglish}
					arabicHtml={website?.aboutUsArabic}
				/>
			</section>
		</>
	);
}
