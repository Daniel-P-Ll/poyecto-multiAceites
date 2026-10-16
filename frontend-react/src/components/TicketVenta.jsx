import React from 'react';

const money = value => `$${Number(value || 0).toFixed(2)}`;

const formatDate = value => {
    const date = Array.isArray(value)
        ? new Date(value[0], value[1] - 1, value[2], value[3] || 0, value[4] || 0, value[5] || 0)
        : new Date(value || Date.now());

    if (Number.isNaN(date.getTime())) return { date: '—', time: '—' };

    return {
        date: date.toLocaleDateString('es-EC'),
        time: date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
};

export function TicketVenta({ sale, company, onClose, onDownload }) {
    const details = sale.detalles || [];
    const timestamp = formatDate(sale.fecha);
    const quantity = details.reduce((sum, item) => sum + Number(item.cantidad || 0), 0);
    const taxRate = details[0]?.tarifaIva ?? company.tarifaIva;
    const location = [company.ciudad, company.provincia].filter(Boolean).join(' - ');
    const client = sale.cliente || {};
    const seller = sale.usuario?.nombre || sale.usuario?.username || '—';

    return (
        <div className="ticket-modal-overlay" role="presentation">
            <div className="ticket-modal">
                <div className="ticket-modal-actions">
                    <button type="button" onClick={onClose}>Cerrar</button>
                    <button type="button" className="secondary-action" onClick={onDownload}>Descargar PDF</button>
                    <button type="button" className="primary-action" onClick={() => window.print()}>Imprimir ticket</button>
                </div>
                <article className="thermal-ticket ticket-print-root">
                    <header className="ticket-header">
                        <span className="ticket-logo">M</span>
                        <strong className="ticket-company-name">{company.nombre || 'Empresa sin configurar'}</strong>
                        <span>RUC / NIT: {company.ruc || 'No registrado'}</span>
                        {company.direccion && <span>{company.direccion}</span>}
                        {location && <span>{location}</span>}
                        {company.telefono && <span>Teléf: {company.telefono}</span>}
                    </header>

                    <div className="ticket-divider" />

                    <section className="ticket-sale-info">
                        <strong className="ticket-section-title">COMPROBANTE DE VENTA</strong>
                        <span className="ticket-receipt-number">No. {sale.numeroComprobante || '—'}</span>
                        <p><b>Fecha:</b> {timestamp.date}</p>
                        <p><b>Hora:</b> {timestamp.time}</p>
                        <p><b>Cliente:</b> {client.nombre || 'Consumidor General'}</p>
                        <p><b>CI/RUC:</b> {client.cedula || '—'}</p>
                        <p><b>Dirección:</b> {client.direccion || '—'}</p>
                        <p><b>Teléf:</b> {client.telefono || '—'}</p>
                        <p><b>Vendedor:</b> {seller}</p>
                    </section>

                    <div className="ticket-divider" />

                    <section className="ticket-items">
                        <div className="ticket-item-head">
                            <span>Cant</span><span>Detalle</span><span>IVA</span><span>Total</span>
                        </div>
                        {details.map((item, index) => (
                            <div className="ticket-item" key={item.id || `${item.producto?.id}-${index}`}>
                                <span>{item.cantidad || 0}</span>
                                <span className="ticket-product">
                                    {item.producto?.nombre || 'Producto'}
                                    {Number(item.cantidad) > 1 && (
                                        <small>P. Unitario: {money(item.precioUnitario)}</small>
                                    )}
                                </span>
                                <span>{item.tarifaIva ?? taxRate ?? '—'}%</span>
                                <span>{money(item.importe)}</span>
                            </div>
                        ))}
                    </section>

                    <div className="ticket-divider ticket-divider-strong" />

                    <section className="ticket-totals">
                        <p><span>Subtotal:</span><b>{money(sale.subtotal)}</b></p>
                        <p><span>IVA ({taxRate ?? '—'}%):</span><b>{money(sale.impuesto)}</b></p>
                        <div className="ticket-divider ticket-divider-strong" />
                        <p className="ticket-total"><strong>TOTAL:</strong><strong>{money(sale.total)}</strong></p>
                    </section>

                    <div className="ticket-divider" />

                    <footer className="ticket-footer">
                        <span>Cantidad de ítems: {quantity}</span>
                        <span>Forma de pago: Efectivo / Transferencia</span>
                        <strong>¡GRACIAS POR SU COMPRA!</strong>
                        <span>Conserve este ticket para cualquier reclamo.</span>
                        <span>www.multiaceites.com</span>
                    </footer>
                </article>
            </div>
        </div>
    );
}
