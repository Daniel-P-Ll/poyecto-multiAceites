import { jsPDF } from 'jspdf';

// 1. TICKET / FACTURA INDIVIDUAL
export function downloadReceipt(sale, company = {}) {
    const pageWidth = 80;
    const margin = 4;

    const detalles = sale.detalles || [];
    const estimatedHeight = 165 + detalles.length * 18;

    const doc = new jsPDF({
        unit: 'mm',
        format: [pageWidth, estimatedHeight],
    });

    let y = 5;

    const textCenter = (str, fontSize = 8, isBold = false) => {
        doc.setFontSize(fontSize);
        doc.setFont('courier', isBold ? 'bold' : 'normal');
        const textWidth = (doc.getStringUnitWidth(str) * fontSize) / doc.internal.scaleFactor;
        const x = (pageWidth - textWidth) / 2;
        doc.text(str, x, y);
        y += fontSize * 0.45 + 1.2;
    };

    const textCenterWrapped = (str, fontSize = 7, isBold = false) => {
        doc.setFontSize(fontSize);
        doc.setFont('courier', isBold ? 'bold' : 'normal');
        doc.splitTextToSize(String(str), pageWidth - margin * 2).forEach(line => textCenter(line, fontSize, isBold));
    };

    const drawDottedLine = () => {
        doc.setLineWidth(0.2);
        doc.setLineDashPattern([0.8, 0.8], 0);
        doc.line(margin, y, pageWidth - margin, y);
        doc.setLineDashPattern([], 0);
        y += 3;
    };

    const textLeft = (label, value, width = 60) => {
        doc.setFontSize(7.5);
        doc.setFont('courier', 'bold');
        doc.text(label, margin, y);
        doc.setFont('courier', 'normal');
        const lines = doc.splitTextToSize(String(value || '—'), width);
        doc.text(lines, margin + 15, y);
        y += Math.max(1, lines.length) * 3.5;
    };

    doc.setFillColor(12, 99, 81);
    doc.circle(pageWidth / 2, y + 4, 4, 'F');
    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('M', pageWidth / 2, y + 5.4, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y += 12;

    const businessName = doc.splitTextToSize(company.nombre || 'Empresa sin configurar', pageWidth - margin * 2);
    businessName.forEach(line => textCenter(line, 9, true));
    textCenter(`RUC / NIT: ${company.ruc || 'No registrado'}`, 7);
    if (company.direccion) textCenterWrapped(company.direccion);
    const location = [company.ciudad, company.provincia].filter(Boolean).join(' - ');
    if (location) textCenterWrapped(location);
    if (company.telefono) textCenter(`Teléf: ${company.telefono}`, 7);
    y += 1;

    drawDottedLine();

    // --- COMPROBANTE ---
    textCenter('COMPROBANTE DE VENTA', 9, true);
    textCenter(`No. ${sale.numeroComprobante || 'MA-0000'}`, 8.5, true);
    y += 1;

    const fechaObj = Array.isArray(sale.fecha)
        ? new Date(sale.fecha[0], sale.fecha[1] - 1, sale.fecha[2], sale.fecha[3] || 0, sale.fecha[4] || 0, sale.fecha[5] || 0)
        : new Date(sale.fecha || Date.now());
    const fechaValida = !Number.isNaN(fechaObj.getTime());
    textLeft('Fecha:', fechaValida ? fechaObj.toLocaleDateString('es-EC') : '—');
    textLeft('Hora:', fechaValida
        ? fechaObj.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : '—');

    // --- DATOS DEL CLIENTE ---
    const cliente = sale.cliente || {};
    textLeft('Cliente:', cliente.nombre || 'Consumidor General');
    textLeft('CI/RUC:', cliente.cedula || '—');
    textLeft('Dirección:', cliente.direccion || '—');
    textLeft('Teléf:', cliente.telefono || '—');
    textLeft('Vendedor:', sale.usuario?.nombre || sale.usuario?.username || '—');

    drawDottedLine();

    // --- DETALLES DE PRODUCTO ---
    doc.setFontSize(7);
    doc.setFont('courier', 'bold');
    doc.text('Cant', margin, y);
    doc.text('Detalle', margin + 8, y);
    doc.text('IVA', pageWidth - margin - 18, y, { align: 'right' });
    doc.text('Total', pageWidth - margin, y, { align: 'right' });
    y += 2.5;

    doc.setLineWidth(0.15);
    doc.line(margin, y, pageWidth - margin, y);
    y += 3;

    doc.setFont('courier', 'normal');

    detalles.forEach(d => {
        const cant = d.cantidad || 1;
        const prodNombre = d.producto?.nombre || 'Producto';
        const tarifaIva = d.tarifaIva ?? company.tarifaIva ?? '—';
        const importe = Number(d.importe || (d.precioUnitario || 0) * cant);
        const precioUnitario = Number(d.precioUnitario || (cant > 0 ? importe / cant : 0));

        doc.text(String(cant), margin, y);

        const splitName = doc.splitTextToSize(prodNombre, 29);
        doc.text(splitName[0], margin + 8, y);

        doc.text(`${tarifaIva}%`, pageWidth - margin - 18, y, { align: 'right' });
        doc.text(`$${importe.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });

        y += 3.5;

        for (let i = 1; i < splitName.length; i++) {
            doc.text(splitName[i], margin + 8, y);
            y += 3.5;
        }

        if (cant > 1) {
            doc.setFontSize(6.5);
            doc.setTextColor(80, 80, 80);
            doc.text(`P. Unitario: $${precioUnitario.toFixed(2)}`, margin + 8, y);
            doc.setFontSize(7);
            doc.setTextColor(0, 0, 0);
            y += 3.5;
        }
    });

    y += 1;
    drawDottedLine();

    // --- TOTALES ---
    const subtotal = Number(sale.subtotal ?? sale.total ?? 0);
    const impuesto = Number(sale.impuesto ?? 0);
    const total = Number(sale.total ?? 0);

    const tarifaAplicada = detalles[0]?.tarifaIva ?? company.tarifaIva ?? '—';

    doc.setFontSize(8);
    doc.setFont('courier', 'bold');

    doc.text('Subtotal:', pageWidth - margin - 26, y, { align: 'right' });
    doc.setFont('courier', 'normal');
    doc.text(`$${subtotal.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
    y += 3.8;

    doc.setFont('courier', 'bold');
    doc.text(`IVA (${tarifaAplicada}%):`, pageWidth - margin - 26, y, { align: 'right' });
    doc.setFont('courier', 'normal');
    doc.text(`$${impuesto.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
    y += 3.8;

    doc.setLineWidth(0.35);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;
    doc.setFontSize(9.5);
    doc.setFont('courier', 'bold');
    doc.text('TOTAL:', pageWidth - margin - 28, y, { align: 'right' });
    doc.text(`$${total.toFixed(2)}`, pageWidth - margin, y, { align: 'right' });
    y += 5;

    drawDottedLine();

    textCenter(`Cantidad de ítems: ${detalles.reduce((sum, d) => sum + Number(d.cantidad || 0), 0)}`, 7);
    textCenter('Forma de pago: Efectivo / Transferencia', 7);
    y += 2;

    textCenter('¡GRACIAS POR SU COMPRA!', 8.5, true);
    textCenter('Conserve este ticket para cualquier reclamo.', 6.5);
    textCenter('www.multiaceites.com', 6.5);

    doc.save(`${sale.numeroComprobante || 'Ticket'}.pdf`);
}

// 2. REPORTE FILTRADO POR VENDEDOR
export function downloadSellerReportPDF(sellerName, salesList) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let y = 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('MULTIACEITES S.A.S.', 14, y);
    y += 6;

    doc.setFontSize(11);
    doc.text(`Reporte de Ventas - Vendedor: ${sellerName || 'Todos'}`, 14, y);
    y += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de emisión: ${new Date().toLocaleString('es-EC')}`, 14, y);
    doc.text(`Total ventas: ${salesList.length}`, 140, y);
    y += 8;

    doc.setLineWidth(0.3);
    doc.line(14, y, 196, y);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.text('Comprobante', 14, y);
    doc.text('Fecha', 60, y);
    doc.text('Cliente', 110, y);
    doc.text('Total', 196, y, { align: 'right' });
    y += 3;

    doc.line(14, y, 196, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    let totalAcumulado = 0;

    salesList.forEach(s => {
        if (y > 270) {
            doc.addPage();
            y = 15;
        }

        const totalVenta = Number(s.total || 0);
        totalAcumulado += totalVenta;

        doc.text(s.numeroComprobante || '—', 14, y);
        doc.text(new Date(s.fecha).toLocaleString('es-EC'), 60, y);
        doc.text((s.cliente?.nombre || 'Consumidor Final').substring(0, 25), 110, y);
        doc.text(`$${totalVenta.toFixed(2)}`, 196, y, { align: 'right' });
        y += 5;
    });

    doc.line(14, y, 196, y);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`TOTAL VENDEDOR: $${totalAcumulado.toFixed(2)}`, 196, y, { align: 'right' });

    doc.save(`Reporte_Vendedor_${(sellerName || 'General').replace(/\s+/g, '_')}.pdf`);
}

// 3. REPORTE GLOBAL DE TODAS LAS VENTAS
export function downloadGlobalSalesReportPDF(salesList) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let y = 15;

    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('MULTIACEITES S.A.S.', 14, y);
    y += 6;

    doc.setFontSize(12);
    doc.text('REPORTE GLOBAL DE VENTAS', 14, y);
    y += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de emisión: ${new Date().toLocaleString('es-EC')}`, 14, y);
    doc.text(`Registros procesados: ${salesList.length}`, 140, y);
    y += 8;

    doc.setLineWidth(0.4);
    doc.line(14, y, 196, y);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.text('Comprobante', 14, y);
    doc.text('Fecha', 55, y);
    doc.text('Cliente', 95, y);
    doc.text('Vendedor', 145, y);
    doc.text('Total', 196, y, { align: 'right' });
    y += 3;

    doc.line(14, y, 196, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    let totalGlobal = 0;

    salesList.forEach(s => {
        if (y > 270) {
            doc.addPage();
            y = 15;
        }

        const totalVenta = Number(s.total || 0);
        totalGlobal += totalVenta;

        const vendedorNombre = s.usuario?.nombre || s.usuario?.username || '—';

        doc.text(s.numeroComprobante || '—', 14, y);
        doc.text(new Date(s.fecha).toLocaleDateString('es-EC'), 55, y);
        doc.text((s.cliente?.nombre || 'Consumidor Final').substring(0, 20), 95, y);
        doc.text(vendedorNombre.substring(0, 20), 145, y);
        doc.text(`$${totalVenta.toFixed(2)}`, 196, y, { align: 'right' });
        y += 5;
    });

    doc.line(14, y, 196, y);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`INGRESOS TOTALES GLOBALES: $${totalGlobal.toFixed(2)}`, 196, y, { align: 'right' });

    doc.save(`Reporte_Global_Ventas_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function downloadFilteredSalesReportPDF(salesList, filters = {}) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const left = 14;
    const right = 196;
    const columns = [left, 50, 86, 124, 151, 173, right];
    let y = 15;

    const drawTableHeader = () => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('Comprobante', columns[0], y);
        doc.text('Fecha', columns[1], y);
        doc.text('Cliente', columns[2], y);
        doc.text('Vendedor', columns[3], y);
        doc.text('Subtotal', columns[4], y, { align: 'right' });
        doc.text('IVA', columns[5], y, { align: 'right' });
        doc.text('Total', columns[6], y, { align: 'right' });
        y += 3;
        doc.line(left, y, right, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('MULTIACEITES', left, y);
    y += 7;
    doc.setFontSize(12);
    doc.text('REPORTE CONSOLIDADO DE VENTAS', left, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Vendedor: ${filters.sellerName || 'Todos'}`, left, y);
    y += 5;
    doc.text(`Producto: ${filters.productName || 'Todos'}`, left, y);
    y += 5;
    doc.text(`Periodo: ${filters.desde || 'Sin inicio'} al ${filters.hasta || 'Sin fin'}`, left, y);
    y += 5;
    doc.text(`Fecha de emisión: ${new Date().toLocaleString('es-EC')} · Ventas: ${salesList.length}`, left, y);
    y += 7;
    doc.line(left, y, right, y);
    y += 6;
    drawTableHeader();

    let subtotalTotal = 0;
    let taxTotal = 0;
    let grandTotal = 0;
    salesList.forEach(sale => {
        if (y > 270) {
            doc.addPage();
            y = 15;
            drawTableHeader();
        }

        const subtotal = Number(sale.subtotal ?? sale.total ?? 0);
        const tax = Number(sale.impuesto ?? 0);
        const total = Number(sale.total ?? 0);
        subtotalTotal += subtotal;
        taxTotal += tax;
        grandTotal += total;

        const date = new Date(sale.fecha);
        const dateText = Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('es-EC');
        doc.text(String(sale.numeroComprobante || '—').substring(0, 18), columns[0], y);
        doc.text(dateText, columns[1], y);
        doc.text(String(sale.cliente?.nombre || 'Consumidor General').substring(0, 19), columns[2], y);
        doc.text(String(sale.usuario?.nombre || sale.usuario?.username || '—').substring(0, 18), columns[3], y);
        doc.text(`$${subtotal.toFixed(2)}`, columns[4], y, { align: 'right' });
        doc.text(`$${tax.toFixed(2)}`, columns[5], y, { align: 'right' });
        doc.text(`$${total.toFixed(2)}`, columns[6], y, { align: 'right' });
        y += 5;
    });

    if (y > 265) {
        doc.addPage();
        y = 15;
    }
    doc.line(left, y, right, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`Subtotal: $${subtotalTotal.toFixed(2)}`, right, y, { align: 'right' });
    y += 5;
    doc.text(`IVA: $${taxTotal.toFixed(2)}`, right, y, { align: 'right' });
    y += 5;
    doc.setFontSize(11);
    doc.text(`TOTAL CONSOLIDADO: $${grandTotal.toFixed(2)}`, right, y, { align: 'right' });

    doc.save(`reporte-ventas-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function downloadFilteredSalesReportExcel(salesList, filters = {}) {
    const escapeXml = value => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    const cell = (value, type = 'String') =>
        `<Cell><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;
    const row = values => `<Row>${values.join('')}</Row>`;
    const rows = [
        row([cell('REPORTE CONSOLIDADO DE VENTAS')]),
        row([cell('Vendedor'), cell(filters.sellerName || 'Todos')]),
        row([cell('Producto'), cell(filters.productName || 'Todos')]),
        row([cell('Desde'), cell(filters.desde || 'Sin inicio')]),
        row([cell('Hasta'), cell(filters.hasta || 'Sin fin')]),
        row([]),
        row(['Comprobante', 'Fecha', 'Cliente', 'Vendedor', 'Subtotal', 'IVA', 'Total'].map(value => cell(value))),
        ...salesList.map(sale => row([
            cell(sale.numeroComprobante),
            cell(sale.fecha),
            cell(sale.cliente?.nombre || 'Consumidor General'),
            cell(sale.usuario?.nombre || sale.usuario?.username || ''),
            cell(Number(sale.subtotal ?? sale.total ?? 0).toFixed(2), 'Number'),
            cell(Number(sale.impuesto ?? 0).toFixed(2), 'Number'),
            cell(Number(sale.total ?? 0).toFixed(2), 'Number')
        ]))
    ];
    const subtotalTotal = salesList.reduce((sum, sale) => sum + Number(sale.subtotal ?? sale.total ?? 0), 0);
    const taxTotal = salesList.reduce((sum, sale) => sum + Number(sale.impuesto ?? 0), 0);
    const grandTotal = salesList.reduce((sum, sale) => sum + Number(sale.total ?? 0), 0);
    rows.push(
        row([]),
        row([cell('TOTAL CONSOLIDADO'), cell('Subtotal'), cell(subtotalTotal.toFixed(2), 'Number'),
            cell('IVA'), cell(taxTotal.toFixed(2), 'Number'), cell('Total'), cell(grandTotal.toFixed(2), 'Number')])
    );

    const workbook = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Ventas consultadas"><Table>${rows.join('')}</Table></Worksheet>
</Workbook>`;
    const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-ventas-${new Date().toISOString().slice(0, 10)}.xml`;
    link.click();
    URL.revokeObjectURL(url);
}