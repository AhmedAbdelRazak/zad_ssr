import ContactCards from "../../components/ContactCards";
import PageHero from "../../components/PageHero";
import { getWebsite } from "../../lib/api";
import {
	BRAND_NAME,
	CONTACT_EMAIL,
	DEFAULT_HERO_IMAGE,
	PHONE_DISPLAY,
	WHATSAPP_NUMBER,
} from "../../lib/constants";
import { firstImage } from "../../lib/format";

export const metadata = {
	title: "Contact",
	description: `Contact ${BRAND_NAME} for hotel booking support.`,
	openGraph: { images: [DEFAULT_HERO_IMAGE] },
};

export default async function ContactPage() {
	const website = await getWebsite();
	const email = website?.contactEmail || CONTACT_EMAIL;
	const phone = website?.phone || PHONE_DISPLAY;
	const whatsapp = website?.whatsappNumber || WHATSAPP_NUMBER;
	const image = firstImage(website?.contactUsBanner, DEFAULT_HERO_IMAGE);
	return (
		<>
			<PageHero
				image={image}
				eyebrow="Contact"
				title="Talk to Zad support"
				copy="Ask about availability, room choices, payments, or an existing reservation."
				eyebrowAr="اتصل بنا"
				titleAr="تواصل مع دعم زاد"
				copyAr="اسأل عن التوفر أو خيارات الغرف أو الدفع أو حجز قائم."
			/>
			<section className="section">
				<ContactCards email={email} phone={phone} whatsapp={whatsapp} />
			</section>
		</>
	);
}
