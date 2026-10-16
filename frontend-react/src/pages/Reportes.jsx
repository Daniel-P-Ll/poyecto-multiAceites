import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Header } from '../components/Header';
import { Field } from '../components/Field';
import { Table } from '../components/Table';
import {
    downloadFilteredSalesReportExcel,
    downloadFilteredSalesReportPDF
} from '../services/receiptGenerator';

export function Reportes() {
    const [top, setTop] = useState([]);
    const [sales, setSales] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({ vendedorId: '', desde: '', hasta: '', productoId: '' });
    const [appliedFilters, setAppliedFilters] = useState({
        vendedorId: '', desde: '', hasta: '', productoId: '', sellerName: 'Todos', productName: 'Todos'
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const load = async (userList = users) => {
        setError('');
        if (filters.desde && filters.hasta && filters.hasta < filters.desde) {
            setError('La fecha hasta no puede ser anterior a desde.');
            return false;
        }
        setLoading(true);
        try {
            const params = {};
            if (filters.vendedorId) params.vendedorId = filters.vendedorId;
            if (filters.desde) params.desde = filters.desde;
            if (filters.hasta) params.hasta = filters.hasta;
            if (filters.productoId) params.productoId = filters.productoId;
            const [r, t] = await Promise.all([
                api.get('/reportes/ventas-vendedor', { params }),
                api.get('/reportes/productos-mas-vendidos', { params })
            ]);
            setSales(r.data);
            setTop(t.data);
            const selectedSeller = userList.find(user => String(user.id) === filters.vendedorId);
            const selectedProduct = products.find(product => String(product.id) === filters.productoId);
            setAppliedFilters({
                ...filters,
                sellerName: selectedSeller?.nombre || (filters.vendedorId ? `Vendedor ${filters.vendedorId}` : 'Todos'),
                productName: selectedProduct?.nombre || 'Todos'
            });
            return true;
        } catch (e) {
            setError(e.response?.data?.error || e.response?.data?.message || 'No se pudo consultar el reporte');
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initialize = async () => {
            let userList = [];
            const loadingErrors = [];
            try {
                const usersResponse = await api.get('/usuarios');
                userList = usersResponse.data;
                setUsers(userList);
            } catch (e) {
                loadingErrors.push(e.response?.data?.error || e.response?.data?.message || 'No se pudo cargar la lista de vendedores');
            }
            try {
                const productsResponse = await api.get('/productos');
                setProducts(productsResponse.data);
            } catch (e) {
                loadingErrors.push(e.response?.data?.error || e.response?.data?.message || 'No se pudo cargar la lista de productos');
            }
            await load(userList);
            if (loadingErrors.length) setError(loadingErrors.join('. '));
        };
        initialize();
    }, []);

    const total = sales.reduce((a, x) => a + Number(x.total), 0);

    const maxTop = Math.max(1, ...top.map(x => Number(x.cantidad)));

    const downloadGlobal = async () => {
        try {
            const r = await api.get('/reportes/descarga-global', { responseType: 'blob' });
            const url = URL.createObjectURL(r.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'ventas-globales.csv';
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            setError('No se pudo descargar el reporte global.');
        }
    };

    return (
        <section>
            <Header title="Reportes" />
            <div className="card form-grid report-filter-card">
                <h3 style={{ gridColumn: '1 / -1' }}>Filtrar ventas por vendedor y fecha</h3>
                <div className="report-filter-controls">
                    <label>
                        <span>Vendedor</span>
                        <select value={filters.vendedorId} onChange={e => setFilters({ ...filters, vendedorId: e.target.value })}>
                            <option value="">Todos</option>
                            {users.filter(u => u.role === 'VENDEDOR').map(u => (
                                <option key={u.id} value={u.id}>{u.nombre}</option>
                            ))}
                        </select>
                    </label>
                    <div className="report-filter-actions">
                        <button className="primary-action" type="button" onClick={() => load()} disabled={loading}>
                            {loading ? 'Consultando…' : 'Consultar'}
                        </button>
                        <button
                            className="secondary-action"
                            type="button"
                            aria-expanded={showAdvancedFilters}
                            aria-controls="report-advanced-filters"
                            onClick={() => setShowAdvancedFilters(open => !open)}
                        >
                            Avanzado
                        </button>
                    </div>
                </div>
                {showAdvancedFilters && (
                    <div
                        className="report-advanced-backdrop"
                        onMouseDown={event => {
                            if (event.target === event.currentTarget) setShowAdvancedFilters(false);
                        }}
                    >
                        <div
                            className="report-advanced-dialog"
                            id="report-advanced-filters"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="report-advanced-title"
                        >
                            <div className="report-advanced-header">
                                <h3 id="report-advanced-title">Filtros avanzados</h3>
                                <button
                                    type="button"
                                    className="report-advanced-close"
                                    aria-label="Cerrar filtros avanzados"
                                    onClick={() => setShowAdvancedFilters(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="report-advanced-fields">
                                <Field label="Desde (opcional)" type="date" value={filters.desde} onChange={e => setFilters({ ...filters, desde: e.target.value })} />
                                <Field label="Hasta (opcional)" type="date" value={filters.hasta} onChange={e => setFilters({ ...filters, hasta: e.target.value })} />
                                <label>
                                    <span>Producto</span>
                                    <select value={filters.productoId} onChange={e => setFilters({ ...filters, productoId: e.target.value })}>
                                        <option value="">Todos</option>
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>{product.nombre}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <div className="report-advanced-actions">
                                <button
                                    className="secondary-action"
                                    type="button"
                                    onClick={() => setFilters(current => ({ ...current, desde: '', hasta: '', productoId: '' }))}
                                >
                                    Limpiar filtros
                                </button>
                                <button
                                    className="primary-action"
                                    type="button"
                                    disabled={loading}
                                    onClick={async () => {
                                        if (await load()) setShowAdvancedFilters(false);
                                    }}
                                >
                                    Aplicar filtros
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="report-download-actions">
                    <button
                        className="secondary-action"
                        type="button"
                        disabled={loading}
                        onClick={() => downloadFilteredSalesReportPDF(sales, appliedFilters)}
                    >
                        Descargar PDF
                    </button>
                    <button
                        className="secondary-action"
                        type="button"
                        disabled={loading}
                        onClick={() => downloadFilteredSalesReportExcel(sales, appliedFilters)}
                    >
                        Descargar Excel
                    </button>
                    <button className="secondary-action" type="button" onClick={downloadGlobal}>Descargar CSV global</button>
                </div>
                {error && <p className="alert-note-danger" style={{ gridColumn: '1 / -1' }}>{error}</p>}
            </div>
            <div className="report-results-grid">
                <div className="card report-top-card">
                    <h3>Productos más vendidos</h3>
                    {top.length ? (
                        <div className="report-chart-scroll">
                            <div
                                className="chart-bars report-chart-bars report-product-chart"
                                style={{ gridTemplateColumns: `repeat(${top.length}, minmax(0, 1fr))` }}
                            >
                                {top.map((product, index) => (
                                    <div className="chart-bar-column" key={product.producto} title={`${product.producto}: ${product.cantidad} unidades`}>
                                        <span>{product.cantidad} uds.</span>
                                        <div className="chart-bar-track">
                                            <div className="chart-bar" style={{ height: `${(Number(product.cantidad) / maxTop) * 100}%` }} />
                                        </div>
                                        <small>{product.producto}</small>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : <p>No hay productos vendidos para los filtros seleccionados.</p>}
                </div>
                <div className="card report-sales-card">
                    <h3>Ventas e ingresos</h3>
                    <p className="big">Total del resultado: ${total.toFixed(2)}</p>
                    <Table
                        headers={['Comprobante', 'Fecha', 'Cliente', 'Vendedor', 'Subtotal', 'Impuesto', 'Total']}
                        rows={sales.map(v => [
                            v.numeroComprobante,
                            new Date(v.fecha).toLocaleDateString(),
                            v.cliente?.nombre || '—',
                            v.usuario?.nombre || '—',
                            '$' + Number(v.subtotal ?? v.total).toFixed(2),
                            '$' + Number(v.impuesto || 0).toFixed(2),
                            '$' + Number(v.total).toFixed(2)
                        ])}
                    />
                </div>
            </div>
        </section>
    );
}