/* ============================================================================
 *  boot.js — LOADS LAST. Runs the shared boot sequence once all modules
 *  have registered. Order preserved from the original monolith: language
 *  switcher wiring, initial language application (runs every registered
 *  localizer), then the one-time page-module inits.
 * ========================================================================== */
(function (S) {
    "use strict";
    S.initLangSwitcher();
    S.applyLanguage(S.detectInitialLang());
    S.runInits();   /* each init guards its root element - inert elsewhere */
})(window.Supportal);
