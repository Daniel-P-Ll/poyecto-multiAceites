import React from 'react';
import { useNavigate, useLocation, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Ventas } from './pages/Ventas';
import { Productos } from './pages/Productos';
import { Clientes } from './pages/Clientes';
import { Historial } from './pages/Historial';
import { Reportes } from './pages/Reportes';
import { Usuarios } from './pages/Usuarios';
import { Sucursales } from './pages/Sucursales';

const getUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
        return null;
    }
};

export function Layout({ user, onLogout }) {
    const nav = useNavigate();
    const loc = useLocation();
    const u = user || getUser();

    const logout = () => {
        onLogout();
        nav('/login');
    };

    // Rutas según el Rol
    const isAdmin = u?.role === 'ADMIN';

    // Si es ADMIN ve todo; si es VENDEDOR solo ve Ventas, Productos y Clientes
    const links = isAdmin
        ? [
            ['/', 'Dashboard'],
            ['/ventas', 'Ventas'],
            ['/productos', 'Productos'],
            ['/clientes', 'Clientes'],
            ['/historial', 'Historial'],
            ['/reportes', 'Reportes'],
            ['/usuarios', 'Usuarios'],
            ['/sucursales', 'Ajustes'],
        ]
        : [
            ['/ventas', 'Ventas'],
            ['/productos', 'Productos'],
            ['/clientes', 'Clientes'],
        ];

    // Ruta por defecto al iniciar sesión según rol
    const defaultRoute = isAdmin ? '/' : '/ventas';

    return (
        <div className="app">
            <aside className="app-sidebar">
                <div className="brand">
                    <span className="brand-mark" aria-hidden="true">MA</span>
                    <span className="brand-copy">
                        <strong>MultiAceites</strong>
                        <small>GESTIÓN COMERCIAL</small>
                    </span>
                </div>
                <div className="user">
                    <span className="user-avatar" aria-hidden="true">●</span>
                    <span className="user-details">
                        <strong>{u?.nombre || u?.username || 'Usuario'}</strong>
                        <small>{u?.role}</small>
                    </span>
                </div>
                <nav className="sidebar-nav">
                    {links.map(([p, t]) => (
                        <Link className={loc.pathname === p ? 'active' : ''} to={p} key={p}>
                            {t}
                        </Link>
                    ))}
                </nav>
                <button className="logout" onClick={logout}>
                    <span aria-hidden="true">↪</span>
                    Cerrar sesión
                </button>
            </aside>
            <main className="app-main">
                <Routes>
                    {/* Vistas exclusivas de ADMIN */}
                    <Route
                        path="/"
                        element={isAdmin ? <Dashboard /> : <Navigate to="/ventas" replace />}
                    />
                    <Route
                        path="/historial"
                        element={isAdmin ? <Historial /> : <Navigate to="/ventas" replace />}
                    />
                    <Route
                        path="/reportes"
                        element={isAdmin ? <Reportes /> : <Navigate to="/ventas" replace />}
                    />
                    <Route
                        path="/usuarios"
                        element={isAdmin ? <Usuarios /> : <Navigate to="/ventas" replace />}
                    />
                    <Route
                        path="/sucursales"
                        element={isAdmin ? <Sucursales /> : <Navigate to="/ventas" replace />}
                    />

                    {/* Vistas operativas (Disponibles para VENDEDOR y ADMIN) */}
                    <Route path="/ventas" element={<Ventas />} />
                    <Route path="/productos" element={<Productos />} />
                    <Route path="/clientes" element={<Clientes />} />

                    {/* Redirección automática si escribe una URL no permitida */}
                    <Route path="*" element={<Navigate to={defaultRoute} replace />} />
                </Routes>
            </main>
        </div>
    );
}