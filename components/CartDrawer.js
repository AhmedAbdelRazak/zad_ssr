"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { Badge, Button, DatePicker, Divider, Drawer, Empty, InputNumber } from "antd";
import { BedDouble, CalendarDays, Moon, ShoppingBag, Trash2 } from "lucide-react";
import { itemTotal } from "../lib/booking";
import { sar } from "../lib/format";
import OptimizedImage from "./OptimizedImage";
import { useZadApp } from "./ZadAppProvider";

const DATE_FORMAT = "YYYY-MM-DD";

const cartDate = (value, fallbackDays = 1) => {
	const date = dayjs(value);
	return date.isValid() ? date : dayjs().add(fallbackDays, "day");
};

export default function CartDrawer() {
	const {
		cart,
		cartOpen,
		setCartOpen,
		t,
		isArabic,
		totals,
		hrefWithLanguage,
		updateCartItem,
		removeCartItem,
		nightsBetween,
	} = useZadApp();
	const today = dayjs().startOf("day");
	const stayDatesLabel = isArabic ? "\u062a\u0648\u0627\u0631\u064a\u062e \u0627\u0644\u0625\u0642\u0627\u0645\u0629" : "Stay dates";

	const updateScopedItem = (item, patch) =>
		updateCartItem(item.id, patch, {
			checkIn: item.checkIn,
			checkOut: item.checkOut,
		});

	const removeScopedItem = (item) =>
		removeCartItem(item.id, {
			checkIn: item.checkIn,
			checkOut: item.checkOut,
		});

	const handleCheckInChange = (item, date) => {
		if (!date) return;
		const currentNights = nightsBetween(item.checkIn, item.checkOut);
		const checkIn = date.format(DATE_FORMAT);
		let checkOutDate = cartDate(item.checkOut, 4);
		if (!checkOutDate.isAfter(date)) {
			checkOutDate = date.add(Math.max(1, currentNights), "day");
		}
		updateScopedItem(item, { checkIn, checkOut: checkOutDate.format(DATE_FORMAT) });
	};

	const handleCheckOutChange = (item, date) => {
		if (!date) return;
		const checkInDate = cartDate(item.checkIn, 1);
		const checkOut = date.isAfter(checkInDate)
			? date.format(DATE_FORMAT)
			: checkInDate.add(1, "day").format(DATE_FORMAT);
		updateScopedItem(item, { checkOut });
	};

	return (
		<Drawer
			title={
				<span className="cart-title">
					<ShoppingBag size={18} />
					{t("yourCart")}
					<Badge count={totals.rooms} color="#0f8f70" />
				</span>
			}
			open={cartOpen}
			onClose={() => setCartOpen(false)}
			width={440}
			className="zad-cart-drawer"
		>
			{cart.length ? (
				<div className="cart-drawer-body">
					<div className="cart-items">
						{cart.map((item) => {
							const nights = nightsBetween(item.checkIn, item.checkOut);
							const checkIn = cartDate(item.checkIn, 1);
							const checkOut = dayjs(item.checkOut).isAfter(checkIn)
								? cartDate(item.checkOut, 4)
								: checkIn.add(1, "day");
							return (
								<article className="cart-row" key={`${item.id}-${item.checkIn}-${item.checkOut}`}>
									{item.image ? (
										<OptimizedImage
											className="cart-row-image"
											src={item.image}
											alt={item.roomName}
											width={92}
											height={92}
											sizes="92px"
											quality={68}
										/>
									) : null}
									<div className="cart-row-content">
										<strong>{item.roomName}</strong>
										<span>{item.hotelName}</span>
										<small>
											<CalendarDays size={13} />
											<bdi dir="ltr" className="ltr-value">{item.checkIn} - {item.checkOut}</bdi>
											<span className="cart-date-dot" aria-hidden="true" />
											<span className="cart-nights-pill">
												<Moon size={13} />
												<bdi dir="ltr" className="ltr-value">{nights}</bdi>{" "}
												{nights > 1 ? t("nights") : t("night")}
											</span>
										</small>
										<div className="cart-date-editor">
											<label>
												<CalendarDays size={14} />
												{stayDatesLabel}
											</label>
											<div className="cart-date-picker-grid">
												<div className="cart-date-field">
													<span>{t("checkIn")}</span>
													<DatePicker
														className="cart-date-picker"
														value={checkIn}
														format={DATE_FORMAT}
														allowClear={false}
														disabledDate={(current) => current && current < today}
														onChange={(date) => handleCheckInChange(item, date)}
														placement={isArabic ? "bottomRight" : "bottomLeft"}
													/>
												</div>
												<div className="cart-date-field">
													<span>{t("checkOut")}</span>
													<DatePicker
														className="cart-date-picker"
														value={checkOut}
														format={DATE_FORMAT}
														allowClear={false}
														disabledDate={(current) => current && current <= checkIn.startOf("day")}
														onChange={(date) => handleCheckOutChange(item, date)}
														placement={isArabic ? "bottomRight" : "bottomLeft"}
													/>
												</div>
											</div>
										</div>
										<div className="cart-row-actions">
											<InputNumber
												min={1}
												max={20}
												size="small"
												value={item.amount}
												onChange={(value) =>
													updateScopedItem(item, { amount: Math.max(1, Number(value || 1)) })
												}
											/>
											<button type="button" onClick={() => removeScopedItem(item)}>
												<Trash2 size={15} />
												{t("remove")}
											</button>
										</div>
										<div className="cart-line-total">
											<span dir="ltr" className="ltr-value">{sar(item.price)}</span>
											<strong dir="ltr" className="ltr-value">{sar(itemTotal(item))}</strong>
										</div>
									</div>
								</article>
							);
						})}
					</div>
					<Divider />
					<div className="cart-total">
						<span>{t("subtotal")}</span>
						<strong dir="ltr" className="ltr-value">{sar(totals.amount)}</strong>
					</div>
					<Link href={hrefWithLanguage("/checkout")} onClick={() => setCartOpen(false)}>
						<Button type="primary" size="large" block icon={<BedDouble size={18} />}>
							{t("checkout")}
						</Button>
					</Link>
					<Button size="large" block onClick={() => setCartOpen(false)}>
						{t("continueShopping")}
					</Button>
				</div>
			) : (
				<div className="cart-empty">
					<Empty description={t("cartEmpty")} />
					<Link href={hrefWithLanguage("/our-hotels")} onClick={() => setCartOpen(false)}>
						<Button type="primary" block>
							{t("browseHotels")}
						</Button>
					</Link>
				</div>
			)}
		</Drawer>
	);
}
