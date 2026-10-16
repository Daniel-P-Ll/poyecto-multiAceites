import React from 'react';

export function Table({ headers, rows }) {
    return (
        <div className="card table-wrap">
            <table>
                <thead>
                    <tr>
                        {headers.map((h, i) => (
                            <th key={i}>{h}</th>
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