/* ============================================================================
 * islands.js — the only imperative glue of the React layer.
 *
 * Mounting convention (docs/ARCHITECTURE.md §5.4): a Velocity template
 * declares a mount point,
 *
 *     <div data-supportal-component="AppCatalog"
 *          data-props='{"schemaId": 11}'></div>
 *
 * and this entry point hydrates every such element on the page. Unknown
 * component names no-op, so one bundle loads safely on ALL Supportal pages —
 * the React equivalent of the guarded-module pattern used by the plain JS.
 *
 * Server-side data crosses into React exclusively through data-props (plain
 * JSON), keeping the Velocity/React seam explicit.
 * ========================================================================== */
import React from 'react';
import { createRoot } from 'react-dom/client';

import ReactSmokeTest from './components/ReactSmokeTest';
import FeedbackWizard from './pages/home/FeedbackWizard';

/* Register each new island here. */
const REGISTRY = {
    ReactSmokeTest,
    FeedbackWizard,      /* migration step 3 (ARCHITECTURE §7) — done first */
    /* AppCatalog,        <- migration step 1, next up */
    /* UserPicker,        <- migration step 2 */
    /* ApprovalsList,     <- migration step 4 */
};

function mountAll() {
    document.querySelectorAll('[data-supportal-component]').forEach((el) => {
        const name = el.dataset.supportalComponent;
        const Component = REGISTRY[name];
        if (!Component) {
            /* Unknown island: leave the element alone. Loud in dev tools,
             * silent for users. */
            // eslint-disable-next-line no-console
            console.warn('[supportal] no island registered for:', name);
            return;
        }
        let props = {};
        if (el.dataset.props) {
            try {
                props = JSON.parse(el.dataset.props);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('[supportal] bad data-props on island', name, e);
            }
        }
        createRoot(el).render(React.createElement(Component, props));
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAll);
} else {
    mountAll();
}
