import { Suspense } from "react";
import AuthPageClient from "../../components/AuthPageClient";
import { BRAND_NAME } from "../../lib/constants";

export const metadata = {
	title: `Create account | ${BRAND_NAME}`,
	description: "Create a Zad Hotels guest account.",
};

export default function SignupPage() {
	return (
		<Suspense fallback={null}>
			<AuthPageClient mode="signup" />
		</Suspense>
	);
}
