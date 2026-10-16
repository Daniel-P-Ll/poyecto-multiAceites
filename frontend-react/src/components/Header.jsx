import React from 'react';

export function Header({ title }) {
    return (
        <header className="page-header">
            <div>
                <span className="page-kicker">MULTIACEITES · GESTIÓN</span>
                <h1>{title}</h1>
            </div>
        </header>
    );
}