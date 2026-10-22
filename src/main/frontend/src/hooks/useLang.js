/* ============================================================================
 * useLang — the React side of the language bridge (ARCHITECTURE.md §7).
 *
 * The plain-JS core (js/00-core.js) owns the language switcher; on every
 * applyLanguage() it dispatches a `supportal:lang` CustomEvent. This hook
 * reads the current language from window.Supportal.lang at mount and then
 * follows the events, so islands re-render in step with the Velocity-rendered
 * parts of the page. When the migration completes and the switcher itself
 * becomes a component, only this file changes.
 * ========================================================================== */
import { useEffect, useState } from 'react';

const LANGS = { EN: 1, ET: 1, RU: 1 };

export default function useLang() {
    const [lang, setLang] = useState(() => {
        const l = window.Supportal && window.Supportal.lang;
        return LANGS[l] ? l : 'EN';
    });

    useEffect(() => {
        const handler = (e) => {
            const l = e && e.detail && e.detail.lang;
            if (LANGS[l]) setLang(l);
        };
        document.addEventListener('supportal:lang', handler);
        return () => document.removeEventListener('supportal:lang', handler);
    }, []);

    return lang;
}
