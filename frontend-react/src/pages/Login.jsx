import React, { useState } from 'react';
import api from '../services/api';

export function Login({ onLogin }) {
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