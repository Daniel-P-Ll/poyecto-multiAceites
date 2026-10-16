import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Header } from '../components/Header';
import { Field } from '../components/Field';
import { Table } from '../components/Table';

const formatSaleDate = value => {
    const date = Array.isArray(value)
        ? new Date(value[0], value[1] - 1, value[2], value[3] || 0, value[4] || 0, value[5] || 0)
        : new Date(value);

    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('es-EC');
};

const saleDateKey = value => {
    if (Array.isArray(value)) {
        const [year, month, day] = value;
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    return String(value || '').slice(0, 10);
};

export function Historial() {
    const [list, setList] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({ vendedorId: '', desde: '', hasta: '', productoId: '' });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([api.get('/ventas'), api.get('/usuarios'), api.get('/productos')])
            .then(([salesResponse, usersResponse, productsResponse]) => {
                setList(salesResponse.data);
                setUsers(usersResponse.data);
                setProducts(productsResponse.data);
            })
            .catch(e => {
                setError(e.response?.data?.error || e.response?.data?.message || 'No se pudo cargar el historial de ventas.');
            });
    }, []);

    const sellerOptions = users.filter(u =>
        u.activo !== false && (u.role === 'VENDEDOR' || u.role === 'ADMIN')
    );
    const filteredSales = list.filter(sale => {
        if (filters.vendedorId && String(sale.usuario?.id) !== filters.vendedorId) return false;

        const date = saleDateKey(sale.fecha);
        if (filters.desde && date < filters.desde) return false;
        if (filters.hasta && date > filters.hasta) return false;
        if (filters.productoId && !sale.detalles?.some(detail =>
            String(detail.producto?.id) === filters.productoId
        )) return false;

        return true;
    });

    const applyAdvancedFilters = () => {
        if (filters.desde && filters.hasta && filters.hasta < filters.desde) {
            setError('La fecha hasta no puede ser anterior a desde.');
            return;
        }
        setError('');
        setShowAdvancedFilters(false);
    };

    return (
        <section>
            <Header title="Historial de ventas" />

            <div className="card history-filter-card">
                <div className="history-filter-controls">
                    <label htmlFor="history-seller">Filtrar por vendedor</label>
                    <select
                        id="history-seller"
                        className="history-seller-select"
                        value={filters.vendedorId}
                        onChange={e => setFilters({ ...filters, vendedorId: e.target.value })}
                    >
                        <option value="">-- Todos los vendedores --</option>
                        {sellerOptions.map(user => (
                            <option key={user.id} value={user.id}>{user.nombre || user.username}</option>
                        ))}
                    </select>
                    <button
                        className="secondary-action"
                        type="button"
                        aria-expanded={showAdvancedFilters}
                        aria-controls="history-advanced-filters"
                        onClick={() => setShowAdvancedFilters(open => !open)}
                    >
                        Avanzado
                    </button>
                    <span className="history-result-count">
                        {filteredSales.length} {filteredSales.length === 1 ? 'venta' : 'ventas'}
                    </span>
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
                        id="history-advanced-filters"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="history-advanced-title"
                    >
                        <div className="report-advanced-header">
                            <h3 id="history-advanced-title">Filtros avanzados</h3>
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
                            <Field
                                label="Desde (opcional)"
                                type="date"
                                value={filters.desde}
                                onChange={e => setFilters({ ...filters, desde: e.target.value })}
                            />
                            <Field
                                label="Hasta (opcional)"
                                type="date"
                                value={filters.hasta}
                                onChange={e => setFilters({ ...filters, hasta: e.target.value })}
                            />
                            <label>
                                <span>Producto</span>
                                <select
                                    value={filters.productoId}
                                    onChange={e => setFilters({ ...filters, productoId: e.target.value })}
                                >
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
                                onClick={() => {
                                    setFilters(current => ({ ...current, desde: '', hasta: '', productoId: '' }));
                                    setError('');
                                }}
                            >
                                Limpiar filtros
                            </button>
                            <button className="primary-action" type="button" onClick={applyAdvancedFilters}>
                                Aplicar filtros
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && <p className="alert-note-danger history-error" role="alert">{error}</p>}

            <Table
                headers={['Comprobante', 'Fecha', 'Cliente', 'Vendedor', 'Total']}
                rows={filteredSales.map(sale => [
                    sale.numeroComprobante,
                    formatSaleDate(sale.fecha),
                    sale.cliente?.nombre || '—',
                    sale.usuario?.nombre || sale.usuario?.username || '—',
                    '$' + Number(sale.total).toFixed(2)
                ])}
            />
        </section>
    );
}
