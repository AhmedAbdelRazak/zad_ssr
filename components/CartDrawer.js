"use client";

import Link from "next/link";
import { Badge, Button, Divider, Drawer, Empty, InputNumber } from "antd";
import { BedDouble, CalendarDays, ShoppingBag, Trash2 } from "lucide-react";
import { useZadApp } from "./ZadAppProvider";
import { sar } from "../lib/format";

export default function CartDrawer() {
	const {
		cart,
		cartOpen,
		setCartOpen,
		t,
		totals,
		updateCartItem,
		removeCartItem,
		nightsBetween,
	} = useZadApp();

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
			width={420}
			className="zad-cart-drawer"
		>
			{cart.length ? (
				<div className="cart-drawer-body">
					<div className="cart-items">
						{cart.map((item) => {
							const nights = nightsBetween(item.checkIn, item.checkOut);
							return (
								<article className="cart-row" key={`${item.id}-${item.checkIn}-${item.checkOut}`}>
									{item.image ? <img src={item.image} alt={item.roomName} /> : null}
									<div className="cart-row-content">
										<strong>{item.roomName}</strong>
										<span>{item.hotelName}</span>
										<small>
											<CalendarDays size={13} />
											{item.checkIn} - {item.checkOut} · {nights}{" "}
											{nights > 1 ? t("nights") : t("night")}
										</small>
										<div className="cart-row-actions">
											<InputNumber
												min={1}
												max={20}
												size="small"
												value={item.amount}
												onChange={(value) =>
													updateCartItem(item.id, { amount: Math.max(1, Number(value || 1)) })
												}
											/>
											<button type="button" onClick={() => removeCartItem(item.id)}>
												<Trash2 size={15} />
												{t("remove")}
											</button>
										</div>
										<div className="cart-line-total">
											<span>{sar(item.price)}</span>
											<strong>{sar(Number(item.price || 0) * Number(item.amount || 1) * nights)}</strong>
										</div>
									</div>
								</article>
							);
						})}
					</div>
					<Divider />
					<div className="cart-total">
						<span>{t("subtotal")}</span>
						<strong>{sar(totals.amount)}</strong>
					</div>
					<Link href="/checkout" onClick={() => setCartOpen(false)}>
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
					<Link href="/our-hotels" onClick={() => setCartOpen(false)}>
						<Button type="primary" block>
							{t("browseHotels")}
						</Button>
					</Link>
				</div>
			)}
		</Drawer>
	);
}
