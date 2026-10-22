/* ============================================================================
 *  pages/user/approvals.js — the My-approvals list (user/approvals page).
 *  Row rendering comes from shared/request-list.js. Guarded by #approvals-list.
 * ========================================================================== */
(function (S) {
    "use strict";
    var byId = S.byId;
    var SUPPORTAL_BASE = S.base;
    var myReqRenderList = S.requestList.renderList;

    /* ===================== My approvals (native-styled list) =====================
     * Mirrors Refined's approvals page WITHOUT iframes or Refined /desk/ URLs.
     * Source of truth is the documented public endpoint (same one the My-requests
     * widget uses, just approver-scoped):
     *   GET /rest/servicedeskapi/request
     *        ?requestOwnership=APPROVER          (requests I'm an approver on)
     *        &approvalStatus=MY_PENDING_APPROVAL  (awaiting MY decision; vs MY_HISTORY_APPROVAL)
     *        &requestStatus=OPEN_REQUESTS         (the "open" in ?approvals=open)
     * Returns the same CustomerRequest DTO shape, so we reuse myReqRenderList /
     * myReqEsc / myReqSummaryOf for the rows. Each row links to the request's
     * native web view (_links.web) where the approve/decline happens. (Inline
     * approve would add the experimental approval POST; intentionally not here.)
     *
     * ?approvals=open|history on OUR url maps to MY_PENDING_APPROVAL vs MY_HISTORY. */
    var apprTexts = {
        EN: { loading: "Loading…", empty: "Nothing is waiting for your approval.", error: "Could not load your approvals." },
        ET: { loading: "Laadimine…", empty: "Midagi ei oota sinu kinnitust.", error: "Kinnituste laadimine ebaõnnestus." },
        RU: { loading: "Загрузка…", empty: "Ничего не ожидает вашего согласования.", error: "Не удалось загрузить согласования." }
    };

    function renderApprovals(lang) {
        var listEl = byId("approvals-list");
        if (!listEl) return;   // only on the approvals page
        var t = apprTexts[lang] || apprTexts.EN;
        var params = new URLSearchParams(window.location.search);
        var bucket = params.get("approvals");
        var approvalStatus = (bucket === "history") ? "MY_HISTORY_APPROVAL" : "MY_PENDING_APPROVAL";
        /* pending uses OPEN_REQUESTS; history spans all statuses */
        var statusFilter = (bucket === "history") ? "" : "&requestStatus=OPEN_REQUESTS";

        listEl.innerHTML = '<div class="myreq-loading">' + t.loading + '</div>';
        fetch(SUPPORTAL_BASE + "/rest/servicedeskapi/request?requestOwnership=APPROVER&approvalStatus="
            + approvalStatus + statusFilter + "&limit=50", {
            method: "GET", credentials: "include", headers: { "Accept": "application/json" }
        }).then(function (r) {
            if (!r.ok) throw new Error("http " + r.status);
            return r.json();
        }).then(function (data) {
            myReqRenderList(listEl, data.values, t);   // reuse My-requests row renderer
        }).catch(function () {
            listEl.innerHTML = '<div class="myreq-error">' + t.error + '</div>';
        });
    }

    S.registerLocalizer(renderApprovals);
})(window.Supportal);
