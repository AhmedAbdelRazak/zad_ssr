"use client";

import { useZadApp } from "./ZadAppProvider";

export default function AboutContent({ englishHtml = "", arabicHtml = "" }) {
	const { isArabic } = useZadApp();
	const html =
		(isArabic && arabicHtml) ||
		(isArabic
			? "<h1>زاد للفنادق</h1><p>تجمع زاد للفنادق مجموعة مختارة بعناية مع تركيز على الراحة والخدمة وتجربة حجز واضحة وسلسة.</p>"
			: "") ||
		englishHtml ||
		"<p>ZAD Hotels brings together selected hotel stays and responsive support.</p>";
	return (
		<div
			className="container content-prose"
			dir={isArabic ? "rtl" : "ltr"}
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
