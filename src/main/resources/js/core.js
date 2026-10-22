/* ============================================================================
 *  core.js — Supportal shared core. LOADS FIRST.
 *  Owns the window.Supportal namespace: shared state (base URL, current
 *  language), the generic data-i18n engine, the language switcher, and the
 *  init/localizer registries that page modules attach to. Served (NOT
 *  Velocity-parsed); each page seeds window.SUPPORTAL_BASE before the batch.
 *
 *  Module contract (see docs/ARCHITECTURE.md §3): every other js/ file is an
 *  IIFE receiving this namespace, guards its root element, and no-ops on
 *  pages that lack it. Cross-file sharing goes through S — never globals —
 *  except handlers referenced by inline onclick=, which are re-exposed on
 *  window explicitly.
 * ========================================================================== */
window.Supportal = window.Supportal || {};
(function (S) {
    "use strict";

    S.base = window.SUPPORTAL_BASE || "";
    S.lang = "EN";
    var STORAGE_KEY = "supportal.lang";

    function byId(id) { return document.getElementById(id); }
    S.byId = byId;

    /* ---- registries: page modules attach behaviour here ---- */
    var localizers = [];   /* fn(lang): re-render a module's texts */
    var inits = [];        /* fn():     one-time page-module setup  */
    S.registerLocalizer = function (fn) { localizers.push(fn); };
    S.registerInit = function (fn) { inits.push(fn); };
    S.runInits = function () {
        inits.forEach(function (fn) {
            try { fn(); } catch (e) { if (window.console) console.error("[supportal] init failed", e); }
        });
    };

    /* ===================== Generic i18n carrier (page-agnostic) =====================
     * Three mechanisms; the markup picks which one each element uses:
     *   text  : <el data-i18n data-en="" data-et="" data-ru="">      -> textContent swap
     *   attr  : <el data-i18n-attr="placeholder,value"
     *               data-en-placeholder="" data-et-placeholder="" ...> -> setAttribute swap
     *   block : <div class="lang-block" data-lang="EN">rich markup</div> -> show active, hide rest
     * Adding a page = write markup with these conventions. No new JS. */
    var LANGS = { EN: 1, ET: 1, RU: 1 };

    function applyI18nText(root, lc) {
        root.querySelectorAll("[data-i18n]").forEach(function (el) {
            var v = el.getAttribute("data-" + lc);
            if (v != null) el.textContent = v;
        });
    }
    function applyI18nAttr(root, lc) {
        root.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
            el.getAttribute("data-i18n-attr").split(",").forEach(function (attr) {
                attr = attr.trim();
                if (!attr) return;
                var v = el.getAttribute("data-" + lc + "-" + attr);
                if (v != null) el.setAttribute(attr, v);
            });
        });
    }
    function applyLangBlocks(root, lang) {
        root.querySelectorAll(".lang-block").forEach(function (el) {
            if (el.getAttribute("data-lang") === lang) el.classList.add("is-active");
            else el.classList.remove("is-active");
        });
    }
    function applyI18n(lang) {
        var lc = lang.toLowerCase();
        applyI18nText(document, lc);
        applyI18nAttr(document, lc);
        applyLangBlocks(document, lang);
    }

    /* ===================== Language switcher (replaces Refined polling) ===================== */
    function applyLanguage(lang) {
        if (!LANGS[lang]) lang = "EN";
        S.lang = lang;
        document.documentElement.lang = lang.toLowerCase();
        applyI18n(lang);                    /* declarative markup: text + attr + lang-blocks */
        localizers.forEach(function (fn) {  /* page modules registered via S.registerLocalizer */
            try { fn(lang); } catch (e) { if (window.console) console.error("[supportal] localizer failed", e); }
        });
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage disabled */ }
        updateSwitcher(lang);
        /* Bridge to the React islands (docs/ARCHITECTURE.md §7): the useLang
         * hook listens for this event, so Velocity-rendered text and React
         * islands switch language together during the migration. */
        try {
            document.dispatchEvent(new CustomEvent("supportal:lang", { detail: { lang: lang } }));
        } catch (e) { /* CustomEvent unavailable: islands fall back to S.lang at mount */ }
    }
    S.applyLanguage = applyLanguage;

    function updateSwitcher(lang) {
        var btns = document.querySelectorAll("#supportal-lang-switcher button");
        btns.forEach(function (b) {
            if (b.dataset.lang === lang) b.classList.add("active");
            else b.classList.remove("active");
        });
    }

    function detectInitialLang() {
        var stored;
        try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { stored = null; }
        if (stored && LANGS[stored]) return stored;
        var nav = (navigator.language || "en").toLowerCase();
        if (nav.indexOf("et") === 0) return "ET";
        if (nav.indexOf("ru") === 0) return "RU";
        return "EN";
    }

    function initLangSwitcher() {
        document.querySelectorAll("#supportal-lang-switcher button").forEach(function (b) {
            b.addEventListener("click", function () { applyLanguage(b.dataset.lang); });
        });
    }

    S.detectInitialLang = detectInitialLang;
    S.initLangSwitcher = initLangSwitcher;


    function getCurrentUser() {
        return fetch(S.base + "/rest/api/2/myself", {
            method: "GET", credentials: "include", headers: { "Accept": "application/json" }
        }).then(function (response) {
            if (!response.ok) throw new Error("Failed to get user");
            return response.json();
        }).catch(function () { return null; });
    }

    S.getCurrentUser = getCurrentUser;

})(window.Supportal);
