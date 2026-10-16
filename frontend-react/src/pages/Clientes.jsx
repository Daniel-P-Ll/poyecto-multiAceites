import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Header } from '../components/Header';
import { Table } from '../components/Table';

export function Clientes() {
    const [list, setList] = useState([]);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ nombre: '', cedula: '', correo: '', telefono: '', direccion: '' });
    const [editingId, setEditingId] = useState(null);

    // Estado para controlar el modal con estilos del sistema
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });

    const load = (termOverride = '') => {
        const term = (termOverride ?? search ?? '').trim();
        return api.get('/clientes', { params: { q: term || undefined } }).then(r => setList(r.data));
    };

    useEffect(() => {
        load('');
    }, []);

    const save = async e => {
        e.preventDefault();
        if (!/^(?:\d{10}|\d{13})$/.test(form.cedula)) {
            e.currentTarget.elements.cedula.setCustomValidity('Ingrese una cédula de 10 dígitos o un RUC de 13 dígitos.');
            e.currentTarget.reportValidity();
            return;
        }
        if (form.telefono && !/^\d{10}$/.test(form.telefono)) {
            e.currentTarget.elements.telefono.setCustomValidity('El teléfono debe tener exactamente 10 dígitos.');
            e.currentTarget.reportValidity();
            return;
        }
        if (editingId) {
            await api.put(`/clientes/${editingId}`, form);
        } else {
            await api.post('/clientes', form);
        }
        setForm({ nombre: '', cedula: '', correo: '', telefono: '', direccion: '' });
        setEditingId(null);
        load();
    };

    const edit = c => {
        setEditingId(c.id);
        setForm({
            nombre: c.nombre || '',
            cedula: c.cedula || '',
            correo: c.correo || '',
            telefono: c.telefono || '',
            direccion: c.direccion || ''
        });
    };

    const confirmDelete = (id, name) => {
        setDeleteModal({ show: true, id, name });
    };

    const handleDelete = async () => {
        if (deleteModal.id) {
            await api.delete(`/clientes/${deleteModal.id}`);
            setDeleteModal({ show: false, id: null, name: '' });
            load();
        }
    };

    return (
        <section>
            <Header title="Gestión de Clientes" />
            <div className="toolbar" style={{ marginBottom: '12px' }}>
                <input
                    placeholder="Buscar por cédula o RUC"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            load(search);
                        }
                    }}
                />
                <button type="button" onClick={() => load(search)}>Buscar</button>
                {search && (
                    <button
                        type="button"
                        className="secondary-action"
                        onClick={() => {
                            setSearch('');
                            load('');
                        }}
                    >
                        Limpiar
                    </button>
                )}
            </div>
            <div className="card">
                <h3>{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
                <form className="form-grid" onSubmit={save}>
                    <input
                        placeholder="Nombre completo"
                        required
                        value={form.nombre}
                        onChange={e => setForm({ ...form, nombre: e.target.value })}
                    />
                    <input
                        name="cedula"
                        placeholder="Cédula / RUC"
                        required
                        inputMode="numeric"
                        maxLength={13}
                        pattern="([0-9]{10}|[0-9]{13})"
                        title="Ingrese una cédula de 10 dígitos o un RUC de 13 dígitos."
                        value={form.cedula}
                        onChange={e => {
                            e.target.setCustomValidity('');
                            setForm({ ...form, cedula: e.target.value.replace(/\D/g, '').slice(0, 13) });
                        }}
                    />
                    <input
                        placeholder="Correo electrónico"
                        value={form.correo}
                        onChange={e => setForm({ ...form, correo: e.target.value })}
                    />
                    <input
                        name="telefono"
                        placeholder="Teléfono"
                        inputMode="numeric"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        title="Si ingresa un teléfono, debe tener exactamente 10 dígitos."
                        value={form.telefono}
                        onChange={e => {
                            e.target.setCustomValidity('');
                            setForm({ ...form, telefono: e.target.value.replace(/\D/g, '').slice(0, 10) });
                        }}
                    />
                    <input
                        placeholder="Dirección del cliente"
                        value={form.direccion}
                        onChange={e => setForm({ ...form, direccion: e.target.value })}
                    />
                    <button type="submit">{editingId ? 'Actualizar' : 'Guardar Cliente'}</button>
                </form>
            </div>

            <Table
                headers={['Nombre', 'Cédula', 'Correo', 'Teléfono', 'Dirección', 'Acción']}
                rows={list.map(c => [
                    c.nombre,
                    c.cedula,
                    c.correo || '—',
                    c.telefono || '—',
                    c.direccion || '—',
                    <div key={c.id}>
                        <button className="mini" onClick={() => edit(c)}>Editar</button>
                        <button className="mini danger" onClick={() => confirmDelete(c.id, c.nombre)}>Eliminar</button>
                    </div>
                ])}
            />

            {/* --- MODAL CON ESTILOS MULTIACEITES --- */}
            {deleteModal.show && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <div style={styles.badgeWarning}>⚠️ Confirmetión de eliminación</div>
                        <h3 style={styles.title}>¿Eliminar cliente?</h3>
                        <p style={styles.text}>
                            ¿Estás seguro de que deseas eliminar a <strong>{deleteModal.name}</strong>? Se desactivará de la base de datos.
                        </p>
                        <div style={styles.actions}>
                            <button
                                type="button"
                                style={styles.cancelBtn}
                                onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
                            >
                                Cancelar
                            </button>
                            <button type="button" style={styles.confirmBtn} onClick={handleDelete}>
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

// Estilos alineados a la paleta institucional (Verde oscuro / Rojo peligro)
const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10, 25, 20, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(3px)'
    },
    modal: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '420px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        borderTop: '4px solid #b91c1c'
    },
    badgeWarning: {
        fontSize: '12px',
        fontWeight: '700',
        color: '#b91c1c',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '8px'
    },
    title: {
        margin: '0 0 8px 0',
        color: '#0f291e',
        fontSize: '18px'
    },
    text: {
        margin: '0 0 20px 0',
        color: '#475569',
        fontSize: '14px',
        lineHeight: '1.5'
    },
    actions: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end'
    },
    cancelBtn: {
        padding: '8px 16px',
        borderRadius: '6px',
        border: '1px solid #cbd5e1',
        backgroundColor: '#f8fafc',
        color: '#334155',
        fontWeight: '600',
        cursor: 'pointer'
    },
    confirmBtn: {
        padding: '8px 16px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: '#b91c1c',
        color: '#ffffff',
        fontWeight: '600',
        cursor: 'pointer'
    }
};