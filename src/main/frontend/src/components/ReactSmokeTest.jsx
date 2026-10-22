/* ============================================================================
 * ReactSmokeTest — permanent canary for the React pipeline.
 *
 * Renders NOTHING in normal use. Append  ?reactcheck  to any Supportal page
 * URL and it prints the React version actually supplied by the host — the
 * "verify, don't memorise" check from docs/learning/08, one query-string away.
 *
 * If this island renders and shows 18.3.x, the whole chain is proven:
 *   webpack build → generated web-resource → PageBuilderService tags →
 *   AMD loader → Jira's host React → island mounted by islands.js.
 * ========================================================================== */
import React from 'react';

export default function ReactSmokeTest() {
    const enabled = new URLSearchParams(window.location.search).has('reactcheck');
    if (!enabled) {
        return null;
    }
    return (
        <div
            style={{
                margin: '8px 24px',
                padding: '6px 12px',
                border: '1px dashed #008834',
                borderRadius: '4px',
                color: '#008834',
                fontSize: '13px',
                display: 'inline-block',
            }}
        >
            React island active — host React version: <strong>{React.version}</strong>
        </div>
    );
}
