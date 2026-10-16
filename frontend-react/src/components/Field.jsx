import React from 'react';

export const Field = ({ label, warning, error, className = '', ...p }) => (
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