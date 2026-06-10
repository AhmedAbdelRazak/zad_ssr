import CheckoutClient from "../../components/CheckoutClient";
import PageHero from "../../components/PageHero";
import { getWebsite } from "../../lib/api";
import { BRAND_NAME, DEFAULT_HERO_IMAGE } from "../../lib/constants";

export const metadata = {
	title: "Checkout",
	description: `Review your ${BRAND_NAME} room cart and send a booking request.`,
	openGraph: { images: [DEFAULT_HERO_IMAGE] },
};

export default async function CheckoutPage() {
	const website = await getWebsite();
	return (
		<>
			<PageHero
				eyebrow="Checkout"
				title="Complete your booking request"
				copy="Review your rooms, add guest details, and send the request to Zad support for confirmation."
				eyebrowAr="إتمام الطلب"
				titleAr="إتمام طلب الحجز"
				copyAr="راجع الغرف، أضف بيانات الضيف، وأرسل الطلب إلى دعم زاد لتأكيد التوفر."
			/>
			<CheckoutClient website={website} />
		</>
	);
}
