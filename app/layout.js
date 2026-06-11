import "./globals.css";
import "antd/dist/reset.css";
import { headers } from "next/headers";
import { getHotels, getWebsite } from "../lib/api";
import { BRAND_NAME, BRAND_URL, DEFAULT_HERO_IMAGE } from "../lib/constants";
import { LANGUAGES } from "../lib/i18n";
import { normalizeLanguage } from "../lib/language";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SupportWidget from "../components/SupportWidget";
import { ZadAppProvider } from "../components/ZadAppProvider";
import { maskWebsiteEmails } from "../lib/email";

export const metadata = {
	metadataBase: new URL(BRAND_URL),
	title: {
		default: `${BRAND_NAME} | Makkah and Madinah Hotel Booking`,
		template: `%s | ${BRAND_NAME}`,
	},
	description:
		"Browse selected Makkah and Madinah hotels for Haj and Umrah. Compare rooms, dates, distance, and pricing through ZAD Hotels.",
	openGraph: {
		type: "website",
		siteName: BRAND_NAME,
		images: [DEFAULT_HERO_IMAGE],
	},
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "32x32" },
			{ url: "/icons/icon-32.png", type: "image/png", sizes: "32x32" },
			{ url: "/icons/icon-48.png", type: "image/png", sizes: "48x48" },
			{ url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
			{ url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
		],
		apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
	},
	manifest: "/site.webmanifest",
	twitter: {
		card: "summary_large_image",
		images: [DEFAULT_HERO_IMAGE],
	},
};

export default async function RootLayout({ children }) {
	const requestHeaders = await headers();
	const initialLanguage = normalizeLanguage(requestHeaders.get("x-zad-language")) || "en";
	const initialDirection = LANGUAGES[initialLanguage]?.dir || "ltr";
	const [website, hotels] = await Promise.all([getWebsite(), getHotels()]);
	const clientWebsite = maskWebsiteEmails(website);

	const jsonLd = [
		{
			"@context": "https://schema.org",
			"@type": "Organization",
			name: BRAND_NAME,
			url: BRAND_URL,
			logo: website?.janatLogo?.url,
			areaServed: ["Makkah", "Madinah", "Saudi Arabia"],
		},
		{
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: BRAND_NAME,
			url: BRAND_URL,
			potentialAction: {
				"@type": "SearchAction",
				target: `${BRAND_URL}/rooms?destination={search_term_string}`,
				"query-input": "required name=search_term_string",
			},
		},
	];

	return (
		<html lang={initialLanguage} dir={initialDirection} suppressHydrationWarning>
			<body>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
				<ZadAppProvider initialLanguage={initialLanguage}>
					<Header website={clientWebsite} />
					<main>{children}</main>
					<Footer website={clientWebsite} hotels={hotels} />
					<SupportWidget hotels={hotels} website={clientWebsite} />
				</ZadAppProvider>
			</body>
		</html>
	);
}
