"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateOrderAction } from "@/app/admin/actions";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/types";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function OrderStatusForm({ orderId, orderStatus, paymentStatus }: { orderId: string; orderStatus: string; paymentStatus: string }) {
  const router = useRouter();
  const [o, setO] = useState(orderStatus);
  const [p, setP] = useState(paymentStatus);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const locked = orderStatus === "cancelled";
  return (
    <form className="card space-y-4 p-5" onSubmit={(e) => {
      e.preventDefault();
      start(async () => {
        const res = await updateOrderAction(orderId, o, p);
        setMsg(res.ok ? { ok: true, text: "Order updated." } : { ok: false, text: res.error });
        if (res.ok) router.refresh();
      });
    }}>
      <div><label htmlFor="os" className="label">Order status</label>
        <select id="os" value={o} disabled={locked} onChange={(e) => setO(e.target.value)} className="field">{ORDER_STATUSES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}</select>
        {o === "cancelled" && orderStatus !== "cancelled" && <p className="hint mt-1">Cancelling returns the items to stock. A cancelled order cannot be re-opened.</p>}
        {locked && <p className="hint mt-1">This order is cancelled and can no longer be changed.</p>}</div>
      <div><label htmlFor="ps" className="label">Payment status</label>
        <select id="ps" value={p} onChange={(e) => setP(e.target.value)} className="field">{PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}</select></div>
      <button type="submit" disabled={pending || (o === orderStatus && p === paymentStatus)} className="btn btn-dark w-full">{pending ? "Saving" : "Save changes"}</button>
      {msg && <p role="status" className={msg.ok ? "text-gold-text" : "err"}>{msg.text}</p>}
    </form>
  );
}
