import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateReceipt = (order) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Header / Branding ---
    doc.setFillColor(44, 24, 16); // Deep Brown
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("A1 CAFE", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Premium Coffee & Dine-In Experience", pageWidth / 2, 28, { align: "center" });

    // --- Order Overview ---
    doc.setTextColor(44, 24, 16);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE / RECEIPT", 14, 55);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Order ID: #${order._id.toUpperCase()}`, 14, 65);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 14, 70);
    doc.text(`Status: ${order.status}`, 14, 75);

    // --- Customer Details ---
    doc.setFont("helvetica", "bold");
    doc.text("BILLED TO:", pageWidth - 60, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`${order.address?.firstName} ${order.address?.lastName}`, pageWidth - 60, 60);
    doc.text(`Type: ${order.orderType === 'dine-in' ? 'Dine-in' : order.orderType}`, pageWidth - 60, 65);
    if (order.tableName) {
        doc.text(`Table: ${order.tableName}`, pageWidth - 60, 70);
    }

    // --- Items Table ---
    const tableColumn = ["Item Name", "Price (INR)", "Qty", "Total (INR)"];
    const tableRows = [];

    order.items.forEach(item => {
        const itemData = [
            item.name,
            `Rs. ${item.price.toFixed(2)}`,
            item.quantity,
            `Rs. ${(item.price * item.quantity).toFixed(2)}`
        ];
        tableRows.push(itemData);
    });

    autoTable(doc, {
        startY: 85,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [139, 69, 19], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [255, 250, 245] },
        margin: { top: 10 },
    });

    // --- Summary Section ---
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Subtotal:", pageWidth - 80, finalY);
    doc.text(`Rs. ${order.amount.toFixed(2)}`, pageWidth - 45, finalY);

    doc.text("Charges:", pageWidth - 80, finalY + 5);
    doc.text("Rs. 0.00", pageWidth - 45, finalY + 5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total Amount:", pageWidth - 80, finalY + 12);
    doc.setFontSize(14);
    doc.setTextColor(139, 69, 19);
    doc.text(`Rs. ${order.amount.toFixed(2)}`, pageWidth - 45, finalY + 12);

    // --- Footer ---
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for visiting A1 Cafe! We hope to see you again.", pageWidth / 2, footerY, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.text("www.a1cafe.com | Contact: +91 9685968315", pageWidth / 2, footerY + 5, { align: "center" });

    // --- Save PDF ---
    doc.save(`A1-Cafe-Receipt-${order._id.slice(-6)}.pdf`);
};

