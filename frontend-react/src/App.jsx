import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Layout } from './Layout';

const getUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
        return null;
    }
};

export function App() {
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