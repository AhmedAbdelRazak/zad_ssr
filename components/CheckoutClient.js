"use client";

import Link from "next/link";
import { Alert, Button, Form, Input, InputNumber } from "antd";
import { MessageCircle, ShoppingBag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { WHATSAPP_NUMBER } from "../lib/constants";
import { sar } from "../lib/format";
import { useZadApp } from "./ZadAppProvider";

export default function CheckoutClient({ website = {} }) {
	const {
		cart,
		t,
		totals,
		isArabic,
		updateCartItem,
		removeCartItem,
		nightsBetween,
	} = useZadApp();
	const [sent, setSent] = useState(false);
	const whatsapp = website?.whatsappNumber || WHATSAPP_NUMBER;
	const [form] = Form.useForm();

	const summary = useMemo(() => {
		return cart
			.map((item, index) => {
				const nights = nightsBetween(item.checkIn, item.checkOut);
				const total = Number(item.price || 0) * Number(item.amount || 1) * nights;
				return isArabic
					? `${index + 1}. ${item.hotelName} - ${item.roomName} ×${item.amount}، من ${item.checkIn} إلى ${item.checkOut}، ${sar(total)}`
					: `${index + 1}. ${item.hotelName} - ${item.roomName} x${item.amount}, ${item.checkIn} to ${item.checkOut}, ${sar(total)}`;
			})
			.join("\n");
	}, [cart, isArabic, nightsBetween]);

	const submit = (values) => {
		const lines = isArabic
			? [
					"مرحبا زاد للفنادق، أرغب بتأكيد طلب الحجز التالي:",
					"",
					summary,
					"",
					`الإجمالي: ${sar(totals.amount)}`,
					"",
					`الضيف: ${values.fullName}`,
					`الجوال: ${values.phone}`,
					values.email ? `البريد الإلكتروني: ${values.email}` : "",
					values.notes ? `ملاحظات: ${values.notes}` : "",
				].filter(Boolean)
			: [
					"Hello ZAD Hotels, I would like to confirm this booking request:",
					"",
					summary,
					"",
					`Total: ${sar(totals.amount)}`,
					"",
					`Guest: ${values.fullName}`,
					`Phone: ${values.phone}`,
					values.email ? `Email: ${values.email}` : "",
					values.notes ? `Notes: ${values.notes}` : "",
				].filter(Boolean);
		setSent(true);
		window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
	};

	if (!cart.length) {
		return (
			<section className="section checkout-shell" dir={isArabic ? "rtl" : "ltr"}>
				<div className="container checkout-empty premium-card">
					<ShoppingBag size={36} />
					<h1>{t("cartEmpty")}</h1>
					<Link className="btn btn-primary" href="/our-hotels">
						{t("browseHotels")}
					</Link>
				</div>
			</section>
		);
	}

	return (
		<section className="section checkout-shell" dir={isArabic ? "rtl" : "ltr"}>
			<div className="container checkout-layout">
				<div className="checkout-summary premium-card">
					<p className="eyebrow">{t("cart")}</p>
					<h2>{t("yourCart")}</h2>
					<div className="checkout-items">
						{cart.map((item) => {
							const nights = nightsBetween(item.checkIn, item.checkOut);
							return (
								<article key={`${item.id}-${item.checkIn}-${item.checkOut}`}>
									{item.image ? <img src={item.image} alt={item.roomName} /> : null}
									<div>
										<strong>{item.roomName}</strong>
										<span>{item.hotelName}</span>
										<small>{item.checkIn} - {item.checkOut} · {nights} {nights > 1 ? t("nights") : t("night")}</small>
										<div className="checkout-item-actions">
											<InputNumber
												min={1}
												max={20}
												value={item.amount}
												onChange={(value) => updateCartItem(item.id, { amount: Number(value || 1) })}
											/>
											<button type="button" onClick={() => removeCartItem(item.id)}>
												<Trash2 size={15} />
												{t("remove")}
											</button>
										</div>
									</div>
									<b>{sar(Number(item.price || 0) * Number(item.amount || 1) * nights)}</b>
								</article>
							);
						})}
					</div>
					<div className="checkout-total">
						<span>{t("total")}</span>
						<strong>{sar(totals.amount)}</strong>
					</div>
				</div>
				<div className="checkout-form premium-card">
					<p className="eyebrow">{t("guestDetails")}</p>
					<h1>{t("checkoutTitle")}</h1>
					<p>{t("checkoutCopy")}</p>
					{sent ? <Alert type="success" showIcon message={t("requestSent")} /> : null}
					<Form form={form} layout="vertical" onFinish={submit} requiredMark={false}>
						<Form.Item name="fullName" label={t("fullName")} rules={[{ required: true, message: t("fullName") }]}>
							<Input size="large" />
						</Form.Item>
						<Form.Item name="phone" label={t("phone")} rules={[{ required: true, message: t("phone") }]}>
							<Input size="large" />
						</Form.Item>
						<Form.Item name="email" label={t("emailAddress")}>
							<Input size="large" type="email" />
						</Form.Item>
						<Form.Item name="notes" label={t("notes")}>
							<Input.TextArea rows={4} placeholder={t("notesPlaceholder")} />
						</Form.Item>
						<Button type="primary" htmlType="submit" size="large" block icon={<MessageCircle size={18} />}>
							{t("sendRequest")}
						</Button>
					</Form>
				</div>
			</div>
		</section>
	);
}
