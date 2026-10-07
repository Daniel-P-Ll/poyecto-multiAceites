import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useNavigate, useLocation, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import './styles.css';

const api = axios.create({ baseURL: 'http://localhost:8081/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      onLogin(data);
    } catch (e) {
      setErr(e.response?.data?.error || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card-container">
        {/* Panel Izquierdo: Presentación visual elegante con imagen */}
        <div className="login-hero-side">
          <div className="login-hero-overlay" />
          <div className="login-hero-content">
            <div className="hero-brand-badge">
              <span className="badge-dot" />
              <span>MultiAceites Enterprise</span>
            </div>
            <h2>Máxima potencia y protección para cada motor</h2>
            <p>
              Plataforma profesional para la gestión de inventario, ventas y facturación de lubricantes y aceites automotrices.
            </p>
            <div className="hero-features">
              <div className="hero-feature-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Control de stock y alertas automáticas</span>
              </div>
              <div className="hero-feature-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Emisión y descarga de comprobantes PDF</span>
              </div>
              <div className="hero-feature-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Reportes de facturación y productos top</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Formulario de Login limpio y profesional */}
        <div className="login-form-side">
          <div className="login-form-header">
            <div className="login-logo-badge">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <h1>MultiAceites</h1>
            <p>Ingresa tus credenciales para acceder al sistema</p>
          </div>

          <form onSubmit={submit} className="login-form-body">
            <div className="form-group">
              <label htmlFor="login-username">Usuario</label>
              <div className="input-field-wrapper">
                <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="login-username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Contraseña</label>
              <div className="input-field-wrapper">
                <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {err && (
              <div className="login-error-alert" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{err}</span>
              </div>
            )}

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading-content">
                  <span className="spinner-dot" />
                  Iniciando sesión...
                </span>
              ) : (
                <span>Iniciar sesión</span>
              )}
            </button>
          </form>

          <div className="login-footer">
            <span>MultiAceites © 2026 • Sistema de Control Operativo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Layout({ user, onLogout }) {
  const nav = useNavigate();
  const loc = useLocation();
  const u = user || getUser();

  const logout = () => {
    onLogout();
    nav('/login');
  };

  const links = [
    ['/', 'Dashboard'],
    ['/ventas', 'Ventas'],
    ['/productos', 'Productos'],
    ['/clientes', 'Clientes'],
    ['/historial', 'Historial'],
    ['/reportes', 'Reportes']
  ];

  if (u?.role === 'ADMIN') {
    links.push(['/usuarios', 'Usuarios']);
  }

  return (
    <div className="app">
      <aside>
        <h2>MultiAceites</h2>
        <div className="user">
          {u?.nombre || u?.username || 'Usuario'}
          <br />
          <span>{u?.role}</span>
        </div>
        <nav>
          {links.map(([p, t]) => (
            <Link className={loc.pathname === p ? 'active' : ''} to={p} key={p}>
              {t}
            </Link>
          ))}
        </nav>
        <button className="logout" onClick={logout}>
          Cerrar sesión
        </button>
      </aside>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

const Field = ({ label, warning, error, className = '', ...p }) => (
  <label>
    <span>{label}</span>
    <input
      {...p}
      className={`${className} ${warning ? 'input-warning' : ''} ${error ? 'input-danger' : ''}`.trim()}
    />
    {warning && <span className="field-msg-warning">{warning}</span>}
    {error && <span className="field-msg-error">{error}</span>}
  </label>
);

function Header({ title }) {
  return (
    <header>
      <h1>{title}</h1>
    </header>
  );
}

function Dashboard() {
  const [d, setD] = useState({});
  const [low, setLow] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/reportes/dashboard'), api.get('/reportes/bajo-stock')])
      .then(([a, b]) => {
        setD(a.data);
        setLow(b.data);
      })
      .catch(console.error);
  }, []);

  return (
    <section>
      <Header title="Dashboard" />
      <div className="stats">
        <div>
          <b>{d.ventasHoy || 0}</b>
          <span>Ventas de hoy</span>
        </div>
        <div>
          <b>${d.ingresosHoy || '0.00'}</b>
          <span>Ingresos de hoy</span>
        </div>
        <div>
          <b>{d.ventasTotales || 0}</b>
          <span>Ventas totales</span>
        </div>
        <div>
          <b>${d.ingresosTotales || '0.00'}</b>
          <span>Facturación acumulada</span>
        </div>
      </div>
      <div className="card">
        <h3>Alerta de bajo stock</h3>
        {low.length ? (
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {low.map(p => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td className="warning">{p.stock}</td>
                  <td>{p.stockMinimo}</td>
                  <td className="warning">⚠️ Reabastecer</td>
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

const initialProductState = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: 0,
  stockMinimo: 5
};

function Productos() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialProductState);
  const [stockMinimoAlert, setStockMinimoAlert] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () =>
    api
      .get('/productos', { params: { q } })
      .then(r => setList(r.data))
      .catch(console.error);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (editing) {
      setForm({
        nombre: editing.nombre || '',
        descripcion: editing.descripcion || '',
        precio: editing.precio ?? '',
        stock: editing.stock ?? 0,
        stockMinimo: editing.stockMinimo ?? 5
      });
      setStockMinimoAlert(Number(editing.stockMinimo) < 5);
      setFormError('');
    } else {
      setForm(initialProductState);
      setStockMinimoAlert(false);
      setFormError('');
    }
  }, [editing]);

  // Manejador del campo Stock Mínimo con validación y alerta inmediata
  const handleStockMinimoChange = e => {
    const rawVal = e.target.value;
    setForm(prev => ({ ...prev, stockMinimo: rawVal }));

    const num = Number(rawVal);
    if (rawVal === '' || isNaN(num) || num < 5) {
      setStockMinimoAlert(true);
    } else {
      setStockMinimoAlert(false);
    }
  };

  const save = async e => {
    e.preventDefault();
    setFormError('');

    // Validar nombre
    if (!form.nombre.trim()) {
      setFormError('El nombre del producto es obligatorio.');
      return;
    }

    // Validar campo numérico: Precio (> 0)
    const precioNum = parseFloat(form.precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      setFormError('El precio debe ser un número válido mayor a 0.00.');
      alert('⚠️ ALERTA: El precio debe ser un valor numérico superior a 0.00.');
      return;
    }

    // Validar campo numérico: Stock (>= 0 entero)
    const stockNum = parseInt(form.stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setFormError('El stock debe ser un número entero mayor o igual a 0.');
      alert('⚠️ ALERTA: El stock debe ser un valor numérico entero no negativo (0 o más).');
      return;
    }

    // Validar campo numérico: Stock Mínimo (debe ser de al menos 5)
    const stockMinimoNum = parseInt(form.stockMinimo, 10);
    if (isNaN(stockMinimoNum) || stockMinimoNum < 5) {
      setStockMinimoAlert(true);
      const msg = `⚠️ NOTA DE ALERTA: El stock mínimo debe ser de al menos 5 unidades. Ha ingresado un valor inferior (${isNaN(stockMinimoNum) ? 'vacío' : stockMinimoNum}). Por favor ingrese un valor de 5 o superior.`;
      setFormError('El stock mínimo no puede ser menor a 5 unidades.');
      alert(msg);
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion,
      precio: precioNum,
      stock: stockNum,
      stockMinimo: stockMinimoNum
    };

    try {
      if (editing) {
        await api.put('/productos/' + editing.id, payload);
      } else {
        await api.post('/productos', payload);
      }
      setEditing(null);
      setForm(initialProductState);
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
      <div className="toolbar">
        <input placeholder="Buscar producto" value={q} onChange={e => setQ(e.target.value)} />
        <button onClick={load}>Buscar</button>
      </div>

      <form className="card form-grid" onSubmit={save} key={editing?.id || 'new'}>
        <Field
          label="Nombre"
          name="nombre"
          value={form.nombre}
          onChange={e => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <Field
          label="Descripción"
          name="descripcion"
          value={form.descripcion}
          onChange={e => setForm({ ...form, descripcion: e.target.value })}
        />
        <Field
          label="Precio ($)"
          name="precio"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Ej: 15.50"
          value={form.precio}
          onChange={e => setForm({ ...form, precio: e.target.value })}
          required
        />
        <Field
          label="Stock"
          name="stock"
          type="number"
          step="1"
          min="0"
          value={form.stock}
          onChange={e => setForm({ ...form, stock: e.target.value })}
          required
        />
        <Field
          label="Stock mínimo"
          name="stockMinimo"
          type="number"
          step="1"
          min="5"
          value={form.stockMinimo}
          onChange={handleStockMinimoChange}
          warning={stockMinimoAlert ? 'Mínimo requerido: 5 unidades' : null}
          required
        />

        {/* Nota de alerta visual cuando el stock mínimo es inferior a 5 */}
        {stockMinimoAlert && (
          <div className="alert-note-warning">
            <span>
              ⚠️ <strong>Nota de alerta:</strong> El stock mínimo debe ser de al menos 5 unidades. Ha ingresado{' '}
              <strong>{form.stockMinimo === '' ? 'un campo vacío' : form.stockMinimo}</strong>. Ingrese un valor igual o
              superior a 5.
            </span>
          </div>
        )}

        {/* Mensaje de error general de validación */}
        {formError && (
          <div className="alert-note-danger">
            <span>
              ❌ <strong>Error de validación:</strong> {formError}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', gridColumn: '1 / -1', marginTop: '6px' }}>
          <button type="submit">{editing ? 'Actualizar Producto' : 'Guardar Producto'}</button>
          {editing && (
            <button
              type="button"
              style={{ background: '#66736d' }}
              onClick={() => {
                setEditing(null);
                setForm(initialProductState);
                setStockMinimoAlert(false);
                setFormError('');
              }}
            >
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
            <span className="warning">⚠️ Stock Bajo ({p.stock}/{p.stockMinimo})</span>
          ) : (
            <span style={{ color: '#146b4d', fontWeight: 600 }}>✓ Normal</span>
          ),
          <React.Fragment key={p.id}>
            <button className="mini" onClick={() => setEditing(p)}>
              Editar
            </button>
            <button
              className="mini danger"
              onClick={async () => {
                if (confirm('¿Eliminar producto ' + p.nombre + '?')) {
                  await api.delete('/productos/' + p.id);
                  load();
                }
              }}
            >
              Eliminar
            </button>
          </React.Fragment>
        ])}
      />
    </section>
  );
}

function Clientes() {
  const [list, setList] = useState([]);
  const [ced, setCed] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', cedula: '', correo: '', telefono: '' });
  const [cedulaError, setCedulaError] = useState('');
  const [formError, setFormError] = useState('');

  const load = () =>
    api
      .get('/clientes', { params: { cedula: ced } })
      .then(r => setList(r.data))
      .catch(console.error);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (editing) {
      setForm({
        nombre: editing.nombre || '',
        cedula: editing.cedula || '',
        correo: editing.correo || '',
        telefono: editing.telefono || ''
      });
      setCedulaError('');
      setFormError('');
    } else {
      setForm({ nombre: '', cedula: '', correo: '', telefono: '' });
      setCedulaError('');
      setFormError('');
    }
  }, [editing]);

  // Validación numérica de cédula en tiempo real
  const handleCedulaChange = e => {
    const val = e.target.value;
    // Solo permitir caracteres numéricos
    if (val !== '' && !/^\d+$/.test(val)) {
      setCedulaError('⚠️ La cédula solo debe contener números.');
    } else {
      setCedulaError('');
    }
    setForm(prev => ({ ...prev, cedula: val }));
  };

  // Validación numérica de teléfono
  const handleTelefonoChange = e => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, telefono: val }));
  };

  const save = async e => {
    e.preventDefault();
    setFormError('');

    if (!form.nombre.trim()) {
      setFormError('El nombre del cliente es obligatorio.');
      return;
    }

    // Validar cédula: estrictamente números
    if (!form.cedula.trim() || !/^\d+$/.test(form.cedula.trim())) {
      setCedulaError('La cédula debe ser numérica.');
      setFormError('La cédula debe ser un valor numérico válido (solo números).');
      alert('⚠️ ALERTA: El campo Cédula debe contener un valor numérico válido (solo dígitos).');
      return;
    }

    // Validar teléfono: si se ingresa, debe ser numérico
    if (form.telefono && !/^[\d\s+\-]+$/.test(form.telefono.trim())) {
      setFormError('El teléfono debe contener valores numéricos válidos.');
      alert('⚠️ ALERTA: El teléfono debe ser un valor numérico.');
      return;
    }

    try {
      if (editing) {
        await api.put('/clientes/' + editing.id, form);
      } else {
        await api.post('/clientes', form);
      }
      setEditing(null);
      setForm({ nombre: '', cedula: '', correo: '', telefono: '' });
      setCedulaError('');
      setFormError('');
      load();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al guardar el cliente');
    }
  };

  return (
    <section>
      <Header title="Clientes" />
      <div className="toolbar">
        <input
          placeholder="Buscar por cédula (solo números)"
          value={ced}
          onChange={e => setCed(e.target.value)}
        />
        <button onClick={load}>Buscar</button>
      </div>

      <form className="card form-grid" onSubmit={save} key={editing?.id || 'new'}>
        <Field
          label="Nombre"
          name="nombre"
          value={form.nombre}
          onChange={e => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <Field
          label="Cédula (numérica)"
          name="cedula"
          type="text"
          inputMode="numeric"
          pattern="[0-9]+"
          title="Ingrese solo números"
          placeholder="Ej: 0912345678"
          value={form.cedula}
          onChange={handleCedulaChange}
          error={cedulaError}
          required
        />
        <Field
          label="Correo"
          name="correo"
          type="email"
          value={form.correo}
          onChange={e => setForm({ ...form, correo: e.target.value })}
        />
        <Field
          label="Teléfono (numérico)"
          name="telefono"
          type="tel"
          placeholder="Ej: 0987654321"
          value={form.telefono}
          onChange={handleTelefonoChange}
        />

        {formError && (
          <div className="alert-note-danger">
            <span>
              ❌ <strong>Error:</strong> {formError}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', gridColumn: '1 / -1', marginTop: '6px' }}>
          <button type="submit">{editing ? 'Actualizar Cliente' : 'Guardar Cliente'}</button>
          {editing && (
            <button
              type="button"
              style={{ background: '#66736d' }}
              onClick={() => {
                setEditing(null);
                setForm({ nombre: '', cedula: '', correo: '', telefono: '' });
                setCedulaError('');
                setFormError('');
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <Table
        headers={['Nombre', 'Cédula', 'Correo', 'Teléfono', 'Acciones']}
        rows={list.map(c => [
          c.nombre,
          c.cedula,
          c.correo || '-',
          c.telefono || '-',
          <React.Fragment key={c.id}>
            <button className="mini" onClick={() => setEditing(c)}>
              Editar
            </button>
            <button
              className="mini danger"
              onClick={async () => {
                if (confirm('¿Eliminar cliente ' + c.nombre + '?')) {
                  await api.delete('/clientes/' + c.id);
                  load();
                }
              }}
            >
              Eliminar
            </button>
          </React.Fragment>
        ])}
      />
    </section>
  );
}

function Ventas() {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState('');
  const [saleError, setSaleError] = useState('');

  useEffect(() => {
    api.get('/clientes').then(r => setClients(r.data));
    api.get('/productos').then(r => setProducts(r.data));
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

  // Validación numérica de la cantidad en el carrito
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
      alert(`⚠️ ALERTA DE STOCK: La cantidad ingresada (${qty}) supera el stock disponible (${maxStock} unidades). Se ajustó al stock máximo.`);
      setItems(items.map(i => (i.id === id ? { ...i, cantidad: maxStock } : i)));
      return;
    }

    setItems(items.map(i => (i.id === id ? { ...i, cantidad: qty } : i)));
  };

  const removeItem = id => {
    setItems(items.filter(x => x.id !== id));
  };

  const total = items.reduce((s, x) => s + (Number(x.precio) * (Number(x.cantidad) || 0)), 0);

  const sell = async () => {
    setMsg('');
    setSaleError('');

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

    // Validar numéricamente todas las cantidades
    for (const item of items) {
      const qty = parseInt(item.cantidad, 10);
      if (isNaN(qty) || qty < 1) {
        const err = `La cantidad para el producto "${item.nombre}" debe ser un número válido mayor o igual a 1.`;
        setSaleError(err);
        alert('⚠️ ALERTA: ' + err);
        return;
      }
      if (qty > item.stock) {
        const err = `La cantidad para "${item.nombre}" (${qty}) supera el stock actual disponible (${item.stock}).`;
        setSaleError(err);
        alert('⚠️ ALERTA: ' + err);
        return;
      }
    }

    try {
      const r = await api.post('/ventas', {
        clienteId: +clientId,
        detalles: items.map(x => ({ productoId: x.id, cantidad: parseInt(x.cantidad, 10) }))
      });
      setMsg('Venta registrada con éxito: ' + r.data.numeroComprobante);
      setItems([]);
      api.get('/productos').then(r => setProducts(r.data));
      downloadReceipt(r.data);
    } catch (e) {
      const err = e.response?.data?.error || 'No se pudo registrar la venta';
      setSaleError(err);
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
                  title={`Cantidad válida: 1 a ${x.stock}`}
                />
                <div style={{ textAlign: 'right' }}>
                  <b>${(Number(x.precio) * (Number(x.cantidad) || 0)).toFixed(2)}</b>
                  <button
                    className="mini danger"
                    style={{ marginLeft: '6px', padding: '2px 6px' }}
                    onClick={() => removeItem(x.id)}
                    title="Quitar producto"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
          <hr />
          <h2>Total a cobrar: ${total.toFixed(2)}</h2>

          {saleError && (
            <div className="alert-note-danger" style={{ marginBottom: '10px' }}>
              <span>❌ {saleError}</span>
            </div>
          )}

          <button disabled={!clientId || !items.length} onClick={sell}>
            Emitir comprobante y registrar venta
          </button>
          {msg && <p className="success">✓ {msg}</p>}
        </div>
      </div>
    </section>
  );
}

function downloadReceipt(sale) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('MULTIACEITES - Comprobante de Venta', 20, 20);
  doc.setFontSize(11);
  doc.text('Comprobante: ' + sale.numeroComprobante, 20, 32);
  doc.text('Fecha: ' + new Date(sale.fecha).toLocaleString(), 20, 40);
  doc.text('Cliente: ' + sale.cliente.nombre + ' (' + sale.cliente.cedula + ')', 20, 48);
  doc.text('Vendedor: ' + sale.usuario.nombre, 20, 56);
  doc.line(20, 60, 190, 60);

  let y = 70;
  sale.detalles.forEach(d => {
    doc.text(
      `${d.producto.nombre} x${d.cantidad} (c/u $${Number(d.precioUnitario).toFixed(2)}) = $${Number(d.importe).toFixed(2)}`,
      20,
      y
    );
    y += 8;
  });

  doc.line(20, y + 2, 190, y + 2);
  doc.setFontSize(13);
  doc.text('TOTAL: $' + Number(sale.total).toFixed(2), 20, y + 12);
  doc.save(sale.numeroComprobante + '.pdf');
}

function Historial() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get('/ventas').then(r => setList(r.data));
  }, []);

  return (
    <section>
      <Header title="Historial de ventas" />
      <Table
        headers={['Comprobante', 'Fecha', 'Cliente', 'Vendedor', 'Total', 'Comprobante']}
        rows={list.map(s => [
          s.numeroComprobante,
          new Date(s.fecha).toLocaleString(),
          s.cliente.nombre,
          s.usuario.nombre,
          '$' + Number(s.total).toFixed(2),
          <button className="mini" key={s.id} onClick={() => downloadReceipt(s)}>
            Exportar PDF
          </button>
        ])}
      />
    </section>
  );
}

function Reportes() {
  const [top, setTop] = useState([]);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    api.get('/reportes/productos-mas-vendidos').then(r => setTop(r.data));
    api.get('/reportes/ingresos-facturacion').then(r => setSales(r.data));
  }, []);

  const total = sales.reduce((a, s) => a + Number(s.total), 0);

  return (
    <section>
      <Header title="Reportes" />
      <div className="card">
        <h3>Productos más vendidos</h3>
        <Table
          headers={['Producto', 'Cantidad Vendida', 'Ingresos']}
          rows={top.map(x => [x.producto, x.cantidad, '$' + Number(x.ingresos).toFixed(2)])}
        />
      </div>
      <div className="card">
        <h3>Ingresos y facturación</h3>
        <p className="big">Facturación total acumulada: ${total.toFixed(2)}</p>
        <Table
          headers={['Comprobante', 'Fecha', 'Total']}
          rows={sales.map(s => [s.numeroComprobante, new Date(s.fecha).toLocaleDateString(), '$' + Number(s.total).toFixed(2)])}
        />
      </div>
    </section>
  );
}

function Usuarios() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/usuarios').then(r => setList(r.data));

  useEffect(() => {
    load();
  }, []);

  const save = async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    if (editing) {
      await api.put('/usuarios/' + editing.id, { ...d, role: d.role });
    } else {
      await api.post('/usuarios', { ...d, role: d.role });
    }
    setEditing(null);
    e.target.reset();
    load();
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
        <button type="submit">{editing ? 'Actualizar' : 'Crear usuario'}</button>
      </form>
      <Table
        headers={['Nombre', 'Usuario', 'Rol', 'Estado', 'Acciones']}
        rows={list.map(u => [
          u.nombre,
          u.username,
          u.role,
          u.activo ? 'Activo' : 'Inactivo',
          <React.Fragment key={u.id}>
            <button className="mini" onClick={() => setEditing(u)}>
              Editar
            </button>
            <button
              className="mini danger"
              onClick={async () => {
                if (confirm('¿Eliminar usuario ' + u.username + '?')) {
                  await api.delete('/usuarios/' + u.id);
                  load();
                }
              }}
            >
              Eliminar
            </button>
          </React.Fragment>
        ])}
      />
    </section>
  );
}

function Table({ headers, rows }) {
  return (
    <div className="card table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((x, j) => (
                <td key={j}>{x}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <p>No hay registros disponibles.</p>}
    </div>
  );
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => getUser());

  const handleLogin = data => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setToken(data.token);
    setUser(data);
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  return token ? (
    <Layout user={user} onLogout={handleLogout} />
  ) : (
    <Routes>
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
