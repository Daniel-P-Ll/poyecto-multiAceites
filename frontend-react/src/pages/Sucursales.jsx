import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Header } from '../components/Header';
import { Field } from '../components/Field';

const emptyForm = {
    nombre: '',
    ruc: '',
    provincia: '',
    ciudad: '',
    direccion: '',
    telefono: '',
    tarifaIva: '15.00'
};

const toForm = empresa => ({
    nombre: empresa.nombre || '',
    ruc: empresa.ruc || '',
    provincia: empresa.provincia || '',
    ciudad: empresa.ciudad || '',
    direccion: empresa.direccion || '',
    telefono: empresa.telefono || '',
    tarifaIva: empresa.tarifaIva != null ? Number(empresa.tarifaIva).toFixed(2) : '15.00'
});

export function Sucursales() {
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        api.get('/empresa')
            .then(response => setForm(toForm(response.data)))
            .catch(error => {
                setFormError(error.response?.data?.error || error.response?.data?.message || 'No se pudieron cargar los datos de la empresa.');
            })
            .finally(() => setLoading(false));
    }, []);

    const save = async event => {
        event.preventDefault();
        setFormError('');
        setSuccess('');

        if (!form.nombre.trim() || !form.provincia.trim() || !form.ciudad.trim()) {
            setFormError('El nombre del local, provincia y ciudad son obligatorios.');
            return;
        }

        const payload = {
            nombre: form.nombre.trim(),
            ruc: form.ruc.trim(),
            provincia: form.provincia.trim(),
            ciudad: form.ciudad.trim(),
            direccion: form.direccion.trim(),
            telefono: form.telefono.trim(),
            tarifaIva: Number(form.tarifaIva)
        };

        try {
            setSaving(true);
            const response = await api.put('/empresa', payload);
            setForm(toForm(response.data));
            setSuccess('Datos de la empresa y tarifa de IVA actualizados correctamente.');
        } catch (error) {
            setFormError(error.response?.data?.error || error.response?.data?.message || 'No se pudieron guardar los datos de la empresa.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <section>
            <Header title="Ajustes de la Empresa" />
            <form className="card form-grid company-settings-form" onSubmit={save}>
                <div className="company-settings-intro">
                    <span className="company-settings-icon" aria-hidden="true">◆</span>
                    <div>
                        <h3>Configuración del local</h3>
                        <p>Actualiza los datos de tu empresa y la tarifa aplicada a las ventas.</p>
                    </div>
                </div>

                <Field
                    label="Nombre del Local"
                    name="nombre"
                    value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Nombre de la empresa"
                    required
                />
                <Field
                    label="RUC / NIT"
                    name="ruc"
                    value={form.ruc}
                    onChange={e => setForm({ ...form, ruc: e.target.value })}
                    placeholder="Identificación tributaria"
                />
                <Field
                    label="Provincia"
                    name="provincia"
                    value={form.provincia}
                    onChange={e => setForm({ ...form, provincia: e.target.value })}
                    placeholder="Provincia"
                    required
                />
                <Field
                    label="Ciudad"
                    name="ciudad"
                    value={form.ciudad}
                    onChange={e => setForm({ ...form, ciudad: e.target.value })}
                    placeholder="Ciudad"
                    required
                />
                <Field
                    label="Dirección"
                    name="direccion"
                    value={form.direccion}
                    onChange={e => setForm({ ...form, direccion: e.target.value })}
                    placeholder="Calle principal y número"
                />
                <Field
                    label="Teléfono"
                    name="telefono"
                    value={form.telefono}
                    onChange={e => setForm({ ...form, telefono: e.target.value })}
                    placeholder="Número de contacto"
                />
                <label>
                    <span>Tarifa de IVA Vigente</span>
                    <select
                        value={form.tarifaIva}
                        onChange={e => setForm({ ...form, tarifaIva: e.target.value })}
                        required
                    >
                        <option value="15.00">15%</option>
                        <option value="8.00">8%</option>
                    </select>
                </label>

                {formError && (
                    <div className="alert-note-danger" role="alert">
                        <span>{formError}</span>
                    </div>
                )}

                {success && (
                    <div className="company-success-message" role="status">
                        <span aria-hidden="true">✓</span>{success}
                    </div>
                )}

                <div className="company-settings-actions">
                    <button className="primary-action" type="submit" disabled={loading || saving}>
                        {loading ? 'Cargando datos…' : saving ? 'Guardando…' : 'Guardar Datos'}
                    </button>
                    <span>La tarifa seleccionada se aplicará a las nuevas ventas.</span>
                </div>
            </form>
        </section>
    );
}
