import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Header } from '../components/Header';

export function Dashboard() {
    const [d, setD] = useState({});
    const [low, setLow] = useState([]);
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);

    useEffect(() => {
        Promise.all([
            api.get('/reportes/dashboard'),
            api.get('/reportes/bajo-stock'),
            api.get('/productos'),
            api.get('/ventas')
        ])
            .then(([a, b, c, e]) => {
                setD(a.data || {});
                setLow(b.data || []);
                setProducts(c.data || []);
                setSales(e.data || []);
            })
            .catch(console.error);
    }, []);

    const daily = {};
    sales.forEach(v => {
        if (!v || !v.fecha) return;
        let day = '';
        if (Array.isArray(v.fecha)) {
            const [y, m, d] = v.fecha;
            day = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        } else {
            day = String(v.fecha).slice(0, 10);
        }
        if (day) {
            daily[day] = (daily[day] || 0) + Number(v.total || 0);
        }
    });

    const lastDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        return {
            key,
            label: date.toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit' }),
            total: daily[key] || 0
        };
    });

    const maxDaily = Math.max(1, ...lastDays.map(x => x.total));
    const maxStock = Math.max(1, ...products.map(p => Number(p.stock || 0)));

    return (
        <section>
            <Header title="Dashboard" />
            <div className="stats">
                <article className="stat-card">
                    <span className="stat-icon stat-icon-green" aria-hidden="true">↗</span>
                    <div className="stat-value"><b>{d.ventasHoy ?? 0}</b><span>Ventas de hoy</span></div>
                    <span className="stat-period">HOY</span>
                </article>
                <article className="stat-card">
                    <span className="stat-icon stat-icon-amber" aria-hidden="true">$</span>
                    <div className="stat-value"><b>${Number(d.ingresosHoy ?? 0).toFixed(2)}</b><span>Ingresos de hoy (con IVA)</span></div>
                    <span className="stat-period">HOY</span>
                </article>
                <article className="stat-card">
                    <span className="stat-icon stat-icon-blue" aria-hidden="true">▤</span>
                    <div className="stat-value"><b>{d.ventasTotales ?? 0}</b><span>Ventas totales</span></div>
                    <span className="stat-period">TOTAL</span>
                </article>
                <article className="stat-card">
                    <span className="stat-icon stat-icon-violet" aria-hidden="true">◆</span>
                    <div className="stat-value"><b>${Number(d.ingresosTotales ?? 0).toFixed(2)}</b><span>Facturación acumulada</span></div>
                    <span className="stat-period">TOTAL</span>
                </article>
            </div>
            <div className="dashboard-charts">
                <div className="card">
                    <h3>Ingresos diarios (últimos 7 días)</h3>
                    <div className="chart-bars">
                        {lastDays.map(x => (
                            <div className="chart-bar-column" key={x.key} title={`${x.key}: $${x.total.toFixed(2)}`}>
                                <span>${x.total.toFixed(2)}</span>
                                <div className="chart-bar-track">
                                    <div className="chart-bar" style={{ height: `${(x.total / maxDaily) * 100}%` }} />
                                </div>
                                <small>{x.label}</small>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="card">
                    <h3>Control de inventario y stock</h3>
                    <p><strong>{products.length}</strong> productos registrados · <strong>{low.length}</strong> con stock bajo</p>
                    <div className="inventory-bars">
                        {products.slice(0, 8).map(p => (
                            <div className="inventory-row" key={p.id}>
                                <span title={p.nombre}>{p.nombre}</span>
                                <div className="inventory-track">
                                    <div className={`inventory-fill ${Number(p.stock) <= Number(p.stockMinimo) ? 'low' : ''}`} style={{ width: `${Math.min(100, (Number(p.stock || 0) / maxStock) * 100)}%` }} />
                                </div>
                                <b>{p.stock}</b>
                            </div>
                        ))}
                        {!products.length && <p>No hay productos registrados.</p>}
                    </div>
                </div>
            </div>
            <div className="card">
                <h3>Alerta de bajo stock</h3>
                {low.length ? (
                    <table>
                        <thead>
                            <tr><th>Producto</th><th>Stock Actual</th><th>Stock Mínimo</th><th>Estado</th></tr>
                        </thead>
                        <tbody>
                            {low.map(p => (
                                <tr key={p.id}>
                                    <td>{p.nombre}</td>
                                    <td><span className="stock-badge stock-badge-warning">{p.stock}</span></td>
                                    <td>{p.stockMinimo}</td>
                                    <td><span className="stock-badge stock-badge-warning">⚠ Reabastecer</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No hay productos con stock bajo en este momento.</p>
                )}
            </div>
        </section>
    );
}