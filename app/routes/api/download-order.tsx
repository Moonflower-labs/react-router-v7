import { PassThrough } from "stream";
import { prisma } from "~/db.server";
import PDFDocument from "pdfkit";
import type { Route } from "./+types/download-order";
import { calculateOrderAmount } from "~/models/order.server";

export async function loader({ params }: Route.LoaderArgs) {
    const { orderId } = params;

    // Fetch order data
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { orderItems: { include: { product: true, price: true, } }, user: true, shippingRate: true }, // Include related data if needed
    });

    if (!order) {
        throw new Response("Order not found", { status: 404 });
    }
    const total = calculateOrderAmount(order.orderItems)
    const shippingCost = order?.shippingRate?.amount ? order?.shippingRate?.amount / 100 : 0

    // Create a PDF document
    const doc = new PDFDocument();
    const stream = new PassThrough();

    const imageWidth = 100
    const pageWidth = doc.page.width
    const xPosition = (pageWidth - imageWidth) / 2

    doc.pipe(stream);

    // Add content to the PDF
    doc.image('public/logo.jpeg', xPosition, 30, { fit: [100, 100], align: 'center', valign: 'center' })
    doc.moveDown(6)
    doc.fontSize(16).text(`Pedido ${order.id}`, { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Cliente: ${order.user?.username || "Unknown"}`);
    doc.text(`Date: ${order.createdAt.toLocaleDateString()}`);
    doc.moveDown();
    doc.text("Artículos:");
    doc.moveDown();
    order.orderItems.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.product.name} - ${item.quantity} x £${item.price.amount / 100}`);
    });
    doc.moveDown(6);
    doc.fontSize(14).text(`Subtotal £${total}`, { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Gasto Postal £${shippingCost}`, { align: "center" });
    doc.moveDown();
    doc.fontSize(20).text(`TOTAL £${total + shippingCost}`, { align: "center" });
    doc.end();

    // Set response headers for PDF download
    const headers = new Headers({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="order-${order.id}.pdf"`,
    });

    // Return the stream as a Response
    return new Response(stream as any, { headers });
};