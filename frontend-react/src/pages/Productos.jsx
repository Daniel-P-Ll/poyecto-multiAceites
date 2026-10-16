import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Header } from '../components/Header';
import { Field } from '../components/Field';
import { Table } from '../components/Table';

const initialProductState = {
    nombre: '',
    descripcion: '',
    precio: '',
    stock: 0,
    stockMinimo: 5,
    tarifaIva: '15'
};

export function Productos() {
    const [list, setList] = useState([]);
    const [q, setQ] = useState('');
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(initialProductState);
    const [stockMinimoAlert, setStockMinimoAlert] = useState(false);
    const [formError, setFormError] = useState('');
    const [tarifaGlobal, setTarifaGlobal] = useState(null);
    const [tarifaError, setTarifaError] = useState('');

    const load = () =>
        api
            .get('/productos', { params: { q } })
            .then(r => setList(r.data))
            .catch(console.error);

    useEffect(() => {
        load();
        api.get('/empresa')
            .then(r => {
                const tarifa = Number(r.data?.tarifaIva);
                if (tarifa === 15 || tarifa === 8) {
                    setTarifaGlobal(tarifa);
                } else {
                    setTarifaError('La configuración de empresa no contiene una tarifa de IVA válida.');
                }
            })
            .catch(e => {
                setTarifaError(e.response?.data?.error || e.response?.data?.message || 'No se pudo cargar la tarifa de IVA vigente.');
            });
    }, []);

    useEffect(() => {
        if (editing) {
            setForm({
                nombre: editing.nombre || '',
                descripcion: editing.descripcion || '',
                precio: editing.precio ?? '',
                stock: editing.stock ?? 0,
                stockMinimo: editing.stockMinimo ?? 5,
                tarifaIva: editing.tarifaIva != null ? String(editing.tarifaIva) : String(tarifaGlobal ?? 15)
            });
            setStockMinimoAlert(Number(editing.stockMinimo) < 5);
            setFormError('');
        } else {
            setForm({ ...initialProductState, tarifaIva: String(tarifaGlobal ?? 15) });
            setStockMinimoAlert(false);
            setFormError('');
        }
    }, [editing, tarifaGlobal]);

    const handleStockMinimoChange = e => {
        const rawVal = e.target.value;
        setForm(prev => ({ ...prev, stockMinimo: rawVal }));
        const num = Number(rawVal);
        setStockMinimoAlert(rawVal === '' || isNaN(num) || num < 5);
    };

    const save = async e => {
        e.preventDefault();
        setFormError('');

        if (!form.nombre.trim()) {
            setFormError('El nombre del producto es obligatorio.');
            return;
        }

        const precioNum = parseFloat(form.precio);
        if (isNaN(precioNum) || precioNum <= 0) {
            setFormError('El precio debe ser un número válido mayor a 0.00.');
            alert('⚠️ ALERTA: El precio debe ser un valor numérico superior a 0.00.');
            return;
        }

        const stockNum = parseInt(form.stock, 10);
        if (isNaN(stockNum) || stockNum < 0) {
            setFormError('El stock debe ser un número entero mayor o igual a 0.');
            alert('⚠️ ALERTA: El stock debe ser un valor numérico entero no negativo (0 o más).');
            return;
        }

        const stockMinimoNum = parseInt(form.stockMinimo, 10);
        if (isNaN(stockMinimoNum) || stockMinimoNum < 5) {
            setStockMinimoAlert(true);
            setFormError('El stock mínimo no puede ser menor a 5 unidades.');
            alert(`⚠️ NOTA DE ALERTA: El stock mínimo debe ser de al menos 5 unidades.`);
            return;
        }

        const payload = {
            nombre: form.nombre.trim(),
            descripcion: form.descripcion,
            precio: precioNum,
            stock: stockNum,
            stockMinimo: stockMinimoNum,
            tarifaIva: Number(form.tarifaIva)
        };

        try {
            if (editing) {
                await api.put('/productos/' + editing.id, payload);
            } else {
                await api.post('/productos', payload);
            }
            setEditing(null);
            setForm({ ...initialProductState, tarifaIva: String(tarifaGlobal ?? 15) });
            setStockMinimoAlert(false);
            setFormError('');
            load();
        } catch (err) {
            setFormError(err.response?.data?.error || 'Error al guardar el producto');
        }
    };

    return (
        <section>
            <Header title="Productos e inventario" />
            <div className="toolbar product-toolbar">
                <input placeholder="Buscar producto" value={q} onChange={e => setQ(e.target.value)} />
                <button onClick={load}>Buscar</button>
            </div>

            <form className="card form-grid" onSubmit={save} key={editing?.id || 'new'}>
                <Field label="Nombre" name="nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
                <Field label="Descripción" name="descripcion" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
                <Field label="Precio ($)" name="precio" type="number" step="0.01" min="0.01" placeholder="Ej: 15.50" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} required />
                <div className="global-tax-field">
                    <span>IVA vigente · Configuración de empresa</span>
                    <strong>{tarifaGlobal === null ? 'Cargando…' : `${tarifaGlobal}%`}</strong>
                    {tarifaError && <small role="alert">{tarifaError}</small>}
                </div>
                <div className="form-group">
                    <label htmlFor="product-tarifa-iva">IVA del producto</label>
                    <select
                        id="product-tarifa-iva"
                        value={form.tarifaIva}
                        onChange={e => setForm({ ...form, tarifaIva: e.target.value })}
                    >
                        <option value="15">15%</option>
                        <option value="8">8%</option>
                    </select>
                </div>
                <Field label="Stock" name="stock" type="number" step="1" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
                <Field label="Stock mínimo" name="stockMinimo" type="number" step="1" min="5" value={form.stockMinimo} onChange={handleStockMinimoChange} warning={stockMinimoAlert ? 'Mínimo requerido: 5 unidades' : null} required />

                {stockMinimoAlert && (
                    <div className="alert-note-warning">
                        <span>⚠️ <strong>Nota de alerta:</strong> El stock mínimo debe ser de al menos 5 unidades.</span>
                    </div>
                )}

                {formError && (
                    <div className="alert-note-danger">
                        <span>❌ <strong>Error de validación:</strong> {formError}</span>
                    </div>
                )}

                <div className="product-form-actions" style={{ display: 'flex', gap: '8px', gridColumn: '1 / -1', marginTop: '6px' }}>
                    <button className="primary-action" type="submit">{editing ? 'Actualizar Producto' : 'Guardar Producto'}</button>
                    {editing && (
                        <button className="secondary-action" type="button" style={{ background: '#66736d' }} onClick={() => { setEditing(null); setForm({ ...initialProductState, tarifaIva: String(tarifaGlobal ?? 15) }); setStockMinimoAlert(false); setFormError(''); }}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            <Table
                headers={['Nombre', 'Precio', 'Stock', 'Mínimo', 'Estado', 'Acciones']}
                rows={list.map(p => [
                    p.nombre,
                    '$' + Number(p.precio).toFixed(2),
                    p.stock,
                    p.stockMinimo,
                    p.stock <= p.stockMinimo ? (
                        <span className="stock-badge stock-badge-warning">⚠ Stock Bajo ({p.stock}/{p.stockMinimo})</span>
                    ) : (
                        <span className="stock-badge stock-badge-normal">✓ Normal</span>
                    ),
                    <React.Fragment key={p.id}>
                        <button className="mini edit-action" onClick={() => setEditing(p)}>Editar</button>
                        <button className="mini danger delete-action" onClick={async () => {
                            if (confirm('¿Eliminar producto ' + p.nombre + '?')) {
                                await api.delete('/productos/' + p.id);
                                load();
                            }
                        }}>Eliminar</button>
                    </React.Fragment>
                ])}
            />
        </section>
    );
}