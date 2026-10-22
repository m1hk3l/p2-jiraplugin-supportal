/* ============================================================================
 *  shell/journey-nav.js — the site journey (chrome tier): breadcrumb on the access-or-permissions
 *  and i-need-something pages. Per-element guards inside renderJourneyNav make
 *  it inert elsewhere.
 * ========================================================================== */
(function (S) {
    "use strict";
    var byId = S.byId;
    var SUPPORTAL_BASE = S.base;

    /* ===================== Module A: journey breadcrumb ===================== */
    var journeyTexts = {
        EN: {
            step1_main: "Portal Homepage",
            step1_alt1: "Something is broken or not working",
            step1_alt2: "ITAK services",
            step2_main: "I need something",
            step2_alt1: "Hardware",
            step2_alt2: "Telecom",
            step2_alt3: "Software",
            step2_alt4: "New mailbox or mailing list",
            step2_alt5: "Presentation device or help",
            step2_alt6: "Something is wrong / I want to request a data change",
            step2_alt6_summary: "Something is wrong / I want to request a data change",
            step3_main: "Access or permissions",
            current_indicator: "You are here"
        },
        ET: {
            step1_main: "Portaali avaleht",
            step1_alt1: "Midagi on katki või ei tööta",
            step1_alt2: "ITAK teenused",
            step2_main: "Mul on midagi vaja",
            step2_alt1: "Riistvara",
            step2_alt2: "Telekommunikatsioon",
            step2_alt3: "Tarkvara",
            step2_alt4: "Uus postkast või meililist",
            step2_alt5: "Esitlusseade või abi",
            step2_alt6: "Midagi on valesti / soovin andmete muudatust",
            step2_alt6_summary: "Midagi on valesti / soovin andmete muudatust",
            step3_main: "Ligipääs või õigused",
            current_indicator: "Sa oled siin"
        },
        RU: {
            step1_main: "Главная страница портала",
            step1_alt1: "Что-то сломано или не работает",
            step1_alt2: "Услуги ITAK",
            step2_main: "Мне нужно что-то",
            step2_alt1: "Оборудование",
            step2_alt2: "Телекоммуникации",
            step2_alt3: "Программное обеспечение",
            step2_alt4: "Новая почта или общий адрес",
            step2_alt5: "Презентационное устройство или помощь",
            step2_alt6: "Что-то не так / хочу изменить данные",
            step2_alt6_summary: "Что-то не так / хочу изменить данные",
            step3_main: "Доступ или права",
            current_indicator: "Вы здесь"
        }
    };
    function renderJourneyNav(lang) {
        var t = journeyTexts[lang] || journeyTexts.EN;
        if (!byId("step1-main")) return;
        /* per-element guard: the i-need-something journey has no step2-alts/step3,
         * the access-or-permissions journey does. Set only what is present. */
        function setText(id, val) { var e = byId(id); if (e) e.textContent = val; }
        setText("step1-main", t.step1_main);
        setText("step1-alt1", t.step1_alt1);
        setText("step1-alt2", t.step1_alt2);
        setText("step2-main", t.step2_main);
        setText("step2-alt1", t.step2_alt1);
        setText("step2-alt2", t.step2_alt2);
        setText("step2-alt3", t.step2_alt3);
        setText("step2-alt4", t.step2_alt4);
        setText("step2-alt5", t.step2_alt5);
        var alt6 = byId("step2-alt6");
        if (alt6) {
            alt6.textContent = t.step2_alt6;
            if (alt6.parentElement) {
                alt6.parentElement.href = SUPPORTAL_BASE +
                    "/servicedesk/customer/portal/31/create/366?summary=" +
                    encodeURIComponent(t.step2_alt6_summary);
            }
        }
        setText("step3-main", t.step3_main);
        setText("current-indicator", t.current_indicator);
    }

    S.registerLocalizer(renderJourneyNav);
})(window.Supportal);
