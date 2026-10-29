const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const nodemailer = require("nodemailer");

initializeApp();
const db = getFirestore();
const SMTP_USER = defineSecret("SMTP_USER");
const SMTP_PASS = defineSecret("SMTP_PASS");
const ADMIN_EMAIL = "arbazirfan14@gmail.com";
const FROM_EMAIL = "info@lampandglow.pk";

const esc = (v) => String(v ?? "—").replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));
const money = (v) => `Rs. ${(Number(v) || 0).toLocaleString("en-PK")}`;

exports.notifyAdminOnNewOrder = onDocumentCreated({
  document: "orders/{orderId}",
  region: "asia-south1",
  retry: true,
  secrets: [SMTP_USER, SMTP_PASS],
}, async (event) => {
  if (!event.data) return;

  const orderId = event.params.orderId;
  const ref = db.collection("orders").doc(orderId);
  const order = event.data.data() || {};

  // Skip events already handled successfully or currently being handled.
  const skip = await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) return true;
    const status = snap.get("adminEmailNotification.status");
    if (status === "sent" || status === "sending") return true;
    tx.update(ref, {
      adminEmailNotification: {
        status: "sending",
        startedAt: FieldValue.serverTimestamp(),
        eventId: event.id,
      },
    });
    return false;
  });
  if (skip) return;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: { user: SMTP_USER.value(), pass: SMTP_PASS.value() },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });

    const items = Array.isArray(order.items) ? order.items : [];
    const itemRows = items.map(item => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice ?? item.price) || 0;
      return `<tr>
        <td style="padding:10px;border-bottom:1px solid #eee">${esc(item.name || item.productName || "Product")}</td>
        <td style="padding:10px;text-align:center;border-bottom:1px solid #eee">${qty}</td>
        <td style="padding:10px;text-align:right;border-bottom:1px solid #eee">${esc(money(price * qty))}</td>
      </tr>`;
    }).join("");

    const details = [
      ["Order ID", orderId],
      ["Customer", order.fullName],
      ["Email", order.email],
      ["Phone", order.phone],
      ["Address", [order.addressLine1, order.addressLine2, order.city, order.state, order.postalCode].filter(Boolean).join(", ")],
      ["Payment method", order.paymentMethod],
      ["Order status", order.status || "pending"],
      ["Payment status", order.paymentStatus || "pending"],
    ].map(([label, value]) => `<tr>
      <td style="padding:9px;border-bottom:1px solid #eee;color:#6b4228">${esc(label)}</td>
      <td style="padding:9px;border-bottom:1px solid #eee">${esc(value)}</td>
    </tr>`).join("");

    const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f7f4ef;font-family:Arial,sans-serif;color:#281912">
      <main style="max-width:700px;margin:auto;background:#fffefc;border:1px solid #eadfd6;border-radius:12px;overflow:hidden">
        <header style="padding:22px;background:#3a2117;color:white"><h1 style="margin:0">New Order Received</h1><p>Lamp &amp; Glow · #${esc(orderId)}</p></header>
        <section style="padding:24px"><h2>Customer details</h2><table style="width:100%;border-collapse:collapse">${details}</table>
        <h2 style="margin-top:24px">Products</h2><table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:#f7f4ef"><th style="padding:10px;text-align:left">Product</th><th>Qty</th><th style="text-align:right">Line total</th></tr></thead>
        <tbody>${itemRows || '<tr><td colspan="3">No items saved</td></tr>'}</tbody></table>
        <table style="width:100%;margin-top:18px;border-collapse:collapse">
        <tr><td style="padding:8px">Subtotal</td><td style="text-align:right">${esc(money(order.subtotal))}</td></tr>
        <tr><td style="padding:8px">Discount</td><td style="text-align:right">${esc(money(order.discountAmount))}</td></tr>
        <tr><td style="padding:8px">Shipping</td><td style="text-align:right">${esc(money(order.shipping))}</td></tr>
        <tr><td style="padding:12px 8px;border-top:2px solid #3a2117;font-weight:bold">Total</td><td style="text-align:right;border-top:2px solid #3a2117;font-size:20px;font-weight:bold">${esc(money(order.total))}</td></tr>
        </table>${order.note ? `<h3>Customer note</h3><p>${esc(order.note)}</p>` : ""}</section>
      </main></body></html>`;

    await transporter.sendMail({
      from: `"Lamp & Glow" <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      replyTo: typeof order.email === "string" && order.email.includes("@") ? order.email : undefined,
      subject: `New Lamp & Glow order #${orderId}`,
      html,
      text: `New order #${orderId}\nCustomer: ${order.fullName || "—"}\nPhone: ${order.phone || "—"}\nEmail: ${order.email || "—"}\nTotal: ${money(order.total)}\nPayment: ${order.paymentMethod || "—"}`,
    });

    await ref.update({
      "adminEmailNotification.status": "sent",
      "adminEmailNotification.sentAt": FieldValue.serverTimestamp(),
      "adminEmailNotification.error": FieldValue.delete(),
    });
    console.log(`Order notification sent: ${orderId}`);
  } catch (error) {
    await ref.update({
      "adminEmailNotification.status": "failed",
      "adminEmailNotification.failedAt": FieldValue.serverTimestamp(),
      "adminEmailNotification.error": String(error?.message || error).slice(0, 500),
    }).catch(e => console.error("Could not save email error status", e));
    throw error;
  }
});
