import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Header } from '../components/Header';
import { Field } from '../components/Field';
import { Table } from '../components/Table';

const getUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
        return null;
    }
};

export function Usuarios() {
    const [list, setList] = useState([]);
    const [editing, setEditing] = useState(null);
    const [togglingId, setTogglingId] = useState(null);
    const currentUser = getUser();

    const load = () => api.get('/usuarios').then(r => setList(r.data)).catch(console.error);

    useEffect(() => {
        load();
    }, []);

    const toggleActivo = async u => {
        if (u.username === currentUser?.username && u.activo) {
            alert('No puedes desactivar tu propia cuenta en sesión activa.');
            return;
        }
        try {
            setTogglingId(u.id);
            await api.patch('/usuarios/' + u.id + '/toggle-activo');
            await load();
        } catch (err) {
            alert('Error al cambiar estado: ' + (err.response?.data?.error || err.message));
        } finally {
            setTogglingId(null);
        }
    };

    const save = async e => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(e.target));
        const payload = {
            nombre: d.nombre,
            username: d.username,
            password: d.password || undefined,
            role: d.role,
            sucursalId: null
        };
        try {
            if (editing) {
                await api.put('/usuarios/' + editing.id, payload);
            } else {
                await api.post('/usuarios', payload);
            }
            setEditing(null);
            e.target.reset();
            load();
        } catch (err) {
            alert('Error al guardar usuario: ' + (err.response?.data?.error || err.response?.data?.message || err.message));
        }
    };

    return (
        <section>
            <Header title="Usuarios y roles" />
            <form key={editing?.id || 'new'} className="card form-grid" onSubmit={save}>
                <Field label="Nombre" name="nombre" defaultValue={editing?.nombre || ''} required />
                <Field label="Usuario" name="username" defaultValue={editing?.username || ''} required />
                <Field label="Contraseña" name="password" type="password" required={!editing} />
                <label>
                    <span>Rol</span>
                    <select name="role" defaultValue={editing?.role || 'VENDEDOR'}>
                        <option value="VENDEDOR">VENDEDOR</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </label>
                <div style={{ display: 'flex', gap: '8px', gridColumn: '1 / -1', marginTop: '6px' }}>
                    <button type="submit">{editing ? 'Actualizar' : 'Crear usuario'}</button>
                    {editing && (
                        <button type="button" style={{ background: '#66736d' }} onClick={() => setEditing(null)}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
            <Table
                headers={['Nombre', 'Usuario', 'Rol', 'Estado', 'Acciones']}
                rows={list.map(u => [
                    u.nombre,
                    u.username,
                    u.role,
                    <div key={'estado-user-' + u.id} className="switch-cell">
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={u.activo}
                                disabled={togglingId === u.id || (u.username === currentUser?.username && u.activo)}
                                onChange={() => toggleActivo(u)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                        <span className={`status-badge ${u.activo ? 'status-active' : 'status-inactive'}`}>
                            <span className="status-badge-dot"></span>
                            {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>,
                    <React.Fragment key={u.id}>
                        <button className="mini" onClick={() => setEditing(u)}>Editar</button>
                        <button className="mini danger" onClick={async () => {
                            if (confirm('¿Eliminar usuario ' + u.username + '?')) {
                                await api.delete('/usuarios/' + u.id);
                                load();
                            }
                        }}>Eliminar</button>
                    </React.Fragment>
                ])}
            />
        </section>
    );
}