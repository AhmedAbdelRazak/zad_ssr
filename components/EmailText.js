export const mailtoHref = (email = "") => {
	const value = String(email || "").trim();
	const [local, domain] = value.split("@");
	if (!local || !domain) return `mailto:${value}`;
	return `mailto:${local}%40${domain}`;
};

export default function EmailText({ email = "", as: Tag = "bdi", className = "ltr-value" }) {
	const value = String(email || "").trim();
	const [local, domain] = value.split("@");

	if (!local || !domain) {
		return (
			<Tag dir="ltr" className={className}>
				{value}
			</Tag>
		);
	}

	return (
		<Tag dir="ltr" className={className}>
			{local}
			<span aria-hidden="true">@</span>
			{domain}
		</Tag>
	);
}
