import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Header } from '../components/Header';
import { downloadReceipt } from '../services/receiptGenerator';
import { TicketVenta } from '../components/TicketVenta';

export function Ventas() {
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [clientId, setClientId] = useState('');
    const [items, setItems] = useState([]);
    const [msg, setMsg] = useState('');
    const [saleError, setSaleError] = useState('');
    const [tarifaDia, setTarifaDia] = useState(null);
    const [tarifaError, setTarifaError] = useState('');
    const [company, setCompany] = useState(null);
    const [ticketSale, setTicketSale] = useState(null);
    const [ticketCompany, setTicketCompany] = useState(null);

    useEffect(() => {
        api.get('/clientes').then(r => setClients(r.data));
        api.get('/productos').then(r => setProducts(r.data));
        api.get('/empresa').then(r => {
            const tarifa = Number(r.data?.tarifaIva);
            if (tarifa === 15 || tarifa === 8) {
                setCompany(r.data);
                setTarifaDia(tarifa);
                return;
            }
            setTarifaError('La configuración de la empresa no contiene una tarifa de IVA válida.');
        }).catch(e => {
            setTarifaError(e.response?.data?.error || e.response?.data?.message || 'No se pudo cargar la tarifa de IVA vigente.');
        });
    }, []);

    const add = p => {
        setSaleError('');
        const old = items.find(x => x.id === p.id);
        if (old) {
            if (old.cantidad < p.stock) {
                setItems(items.map(x => (x.id === p.id ? { ...x, cantidad: x.cantidad + 1 } : x)));
            } else {
                alert(`⚠️ ALERTA: No se puede agregar más unidades. El stock máximo disponible es ${p.stock}.`);
            }
        } else {
            setItems([...items, { ...p, cantidad: 1 }]);
        }
    };

    const handleQuantityChange = (id, newRawVal, maxStock) => {
        setSaleError('');
        if (newRawVal === '') {
            setItems(items.map(i => (i.id === id ? { ...i, cantidad: '' } : i)));
            return;
        }

        const qty = parseInt(newRawVal, 10);
        if (isNaN(qty) || qty < 1) {
            alert('⚠️ ALERTA: La cantidad debe ser un número entero mayor o igual a 1.');
            setItems(items.map(i => (i.id === id ? { ...i, cantidad: 1 } : i)));
            return;
        }

        if (qty > maxStock) {
            alert(`⚠️ ALERTA DE STOCK: La cantidad ingresada (${qty}) supera el stock disponible (${maxStock} unidades).`);
            setItems(items.map(i => (i.id === id ? { ...i, cantidad: maxStock } : i)));
            return;
        }

        setItems(items.map(i => (i.id === id ? { ...i, cantidad: qty } : i)));
    };

    const removeItem = id => {
        setItems(items.filter(x => x.id !== id));
    };

    const subtotalVenta = items.reduce((sum, x) => sum + Number(x.precio) * (Number(x.cantidad) || 0), 0);
    const impuestoVenta = items.reduce((sum, x) => {
        const precio = Number(x.precio) || 0;
        const cantidad = Number(x.cantidad) || 0;
        const tarifa = Number(x.tarifaIva ?? tarifaDia ?? 15);
        return sum + Number(((precio * cantidad) * tarifa / 100).toFixed(2));
    }, 0);
    const total = subtotalVenta + impuestoVenta;

    const sell = async () => {
        setMsg('');
        setSaleError('');

        if (tarifaDia === null) {
            setSaleError(tarifaError || 'Espere a que se cargue la tarifa de IVA vigente.');
            return;
        }

        if (!clientId) {
            const err = 'Debe seleccionar un cliente antes de registrar la venta.';
            setSaleError(err);
            alert('⚠️ ALERTA: ' + err);
            return;
        }

        if (!items.length) {
            const err = 'Debe agregar al menos un producto a la venta.';
            setSaleError(err);
            alert('⚠️ ALERTA: ' + err);
            return;
        }

        try {
            const userInSession = JSON.parse(localStorage.getItem('user') || '{}');
            const companyResponse = await api.get('/empresa');
            const companyAtSale = companyResponse.data;
            const activeTax = Number(companyAtSale?.tarifaIva);
            if (activeTax !== 15 && activeTax !== 8) {
                throw new Error('La configuración de la empresa no contiene una tarifa de IVA válida.');
            }

            const r = await api.post('/ventas', {
                clienteId: Number(clientId),
                detalles: items.map(x => ({ productoId: Number(x.id), cantidad: parseInt(x.cantidad, 10) }))
            });

            const saleData = {
                ...r.data,
                usuario: {
                    ...r.data.usuario,
                    // Si el objeto de la API no trae el nombre real, usa el de la sesión
                    nombre: (r.data.usuario?.nombre && r.data.usuario.nombre.toLowerCase() !== 'vendedor')
                        ? r.data.usuario.nombre
                        : userInSession.nombre || userInSession.username || 'Vendedor'
                }
            };

            setMsg('Venta registrada con éxito: ' + r.data.numeroComprobante);
            setItems([]);
            setTicketSale(saleData);
            setTicketCompany(companyAtSale);
            setCompany(companyAtSale);
            setTarifaDia(activeTax);
            api.get('/productos').then(r => setProducts(r.data));
            downloadReceipt(saleData, companyAtSale);

        } catch (e) {
            const err = e.response?.data?.error || e.response?.data?.message || e.message || 'No se pudo registrar la venta';
            setSaleError(err);
            api.get('/productos').then(r => setProducts(r.data)).catch(() => { });
            alert('⚠️ Error al registrar venta: ' + err);
        }
    };

    return (
        <section>
            <Header title="Registro de ventas y facturación" />
            <div className="sale-grid">
                <div className="card">
                    <h3>1. Seleccionar Cliente</h3>
                    <select value={clientId} onChange={e => setClientId(e.target.value)}>
                        <option value="">-- Seleccione un cliente --</option>
                        {clients.map(c => (
                            <option value={c.id} key={c.id}>
                                {c.cedula} - {c.nombre}
                            </option>
                        ))}
                    </select>

                    <h3 style={{ marginTop: '20px' }}>2. Productos disponibles</h3>
                    <div className="product-grid">
                        {products.map(p => (
                            <button className="product" disabled={p.stock <= 0} key={p.id} onClick={() => add(p)}>
                                <b>{p.nombre}</b>
                                <span>
                                    ${Number(p.precio).toFixed(2)} · Stock: {p.stock}
                                    {p.stock <= p.stockMinimo && (
                                        <strong style={{ color: '#b54708', marginLeft: '6px' }}>(¡Bajo stock!)</strong>
                                    )}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3>3. Detalle de la venta</h3>
                    {items.length === 0 ? (
                        <p>Haga clic en los productos para agregarlos al comprobante.</p>
                    ) : (
                        items.map(x => (
                            <div className="line" key={x.id}>
                                <div>
                                    <strong>{x.nombre}</strong>
                                    <div style={{ fontSize: '11px', color: '#68756f' }}>
                                        Stock disp: {x.stock} | P.U.: ${Number(x.precio).toFixed(2)}
                                    </div>
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    max={x.stock}
                                    step="1"
                                    value={x.cantidad}
                                    onChange={e => handleQuantityChange(x.id, e.target.value, x.stock)}
                                />
                                <div style={{ textAlign: 'right' }}>
                                    <b>${(Number(x.precio) * (Number(x.cantidad) || 0)).toFixed(2)}</b>
                                    <button className="mini danger" style={{ marginLeft: '6px', padding: '2px 6px' }} onClick={() => removeItem(x.id)}>
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                    <hr />
                    <p>Subtotal: ${subtotalVenta.toFixed(2)}</p>
                    {tarifaError && <div className="alert-note-danger" role="alert">{tarifaError}</div>}
                    <p>IVA ({tarifaDia === null ? '—' : `${tarifaDia}%`}): ${impuestoVenta.toFixed(2)}</p>
                    <h2>Total a cobrar: ${total.toFixed(2)}</h2>

                    {saleError && (
                        <div className="alert-note-danger" style={{ marginBottom: '10px' }}>
                            <span>❌ {saleError}</span>
                        </div>
                    )}

                    <button disabled={!clientId || !items.length || tarifaDia === null} onClick={sell}>
                        Emitir comprobante y registrar venta
                    </button>
                    {msg && <p className="success">✓ {msg}</p>}
                </div>
            </div>
            {ticketSale && ticketCompany && (
                <TicketVenta
                    sale={ticketSale}
                    company={ticketCompany}
                    onClose={() => setTicketSale(null)}
                    onDownload={() => downloadReceipt(ticketSale, ticketCompany)}
                />
            )}
        </section>
    );
}