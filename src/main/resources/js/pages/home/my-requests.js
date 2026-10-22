/* ============================================================================
 *  pages/home/my-requests.js — the My-requests widget on the home page
 *  (JSM-native open / closed lists). Row rendering comes from
 *  shared/request-list.js. Guarded by #myreq-open-list / #myreq-closed-list.
 * ========================================================================== */
(function (S) {
    "use strict";
    var byId = S.byId;
    var SUPPORTAL_BASE = S.base;
    var myReqRenderList = S.requestList.renderList;

    var myReqTexts = {
        EN: { loading: "Loading…", empty: "No requests to show.", error: "Could not load your requests." },
        ET: { loading: "Laadimine…", empty: "Pöördumisi pole.", error: "Pöördumiste laadimine ebaõnnestus." },
        RU: { loading: "Загрузка…", empty: "Обращений нет.", error: "Не удалось загрузить обращения." }
    };

    function myReqFetch(statusBucket, listEl, t) {
        listEl.innerHTML = '<div class="myreq-loading">' + t.loading + '</div>';
        fetch(SUPPORTAL_BASE + "/rest/servicedeskapi/request?requestOwnership=OWNED_REQUESTS&requestStatus=" + statusBucket + "&limit=10", {
            method: "GET", credentials: "include", headers: { "Accept": "application/json" }
        }).then(function (r) {
            if (!r.ok) throw new Error("http " + r.status);
            return r.json();
        }).then(function (data) {
            myReqRenderList(listEl, data.values, t);
        }).catch(function () {
            listEl.innerHTML = '<div class="myreq-error">' + t.error + '</div>';
        });
    }

    function renderMyRequests(lang) {
        var openList = byId("myreq-open-list");
        var closedList = byId("myreq-closed-list");
        if (!openList || !closedList) return;   // titles now swap via data-i18n
        var t = myReqTexts[lang] || myReqTexts.EN;
        myReqFetch("OPEN_REQUESTS", openList, t);
        myReqFetch("CLOSED_REQUESTS", closedList, t);
    }

    S.registerLocalizer(renderMyRequests);
})(window.Supportal);
