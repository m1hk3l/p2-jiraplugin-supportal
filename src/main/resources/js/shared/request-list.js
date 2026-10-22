/* ============================================================================
 *  shared/request-list.js — JSM request-row rendering shared by the home
 *  My-requests widget and the user/approvals page: HTML escaper, summary
 *  extractor, and the list renderer for CustomerRequest DTOs.
 *  Exposed as S.requestList = { esc, summaryOf, renderList }.
 * ========================================================================== */
(function (S) {
    "use strict";

    function myReqEsc(s) {
        return String(s == null ? "" : s)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    function myReqSummaryOf(req) {
        var fields = req.requestFieldValues || [];
        for (var i = 0; i < fields.length; i++) {
            if (fields[i].fieldId === "summary") return fields[i].value;
        }
        return req.issueKey;
    }

    function myReqRenderList(listEl, values, t) {
        if (!values || values.length === 0) {
            listEl.innerHTML = '<div class="myreq-empty">' + t.empty + '</div>';
            return;
        }
        var html = "";
        values.forEach(function (req) {
            var web = (req._links && req._links.web) ? req._links.web : "#";
            var status = (req.currentStatus && req.currentStatus.status) ? req.currentStatus.status : "";
            var created = (req.createdDate && req.createdDate.friendly) ? req.createdDate.friendly : "";
            var summary = myReqSummaryOf(req);
            html +=
                '<a class="myreq-item" href="' + myReqEsc(web) + '">' +
                '<span class="myreq-item-summary">' + myReqEsc(summary) + '</span>' +
                '<span class="myreq-item-meta">' +
                '<span class="myreq-item-key">' + myReqEsc(req.issueKey) + '</span>' +
                (status ? '<span>' + myReqEsc(status) + '</span>' : '') +
                (created ? '<span>' + myReqEsc(created) + '</span>' : '') +
                '</span>' +
                '</a>';
        });
        listEl.innerHTML = html;
    }

    S.requestList = {
        esc: myReqEsc,
        summaryOf: myReqSummaryOf,
        renderList: myReqRenderList
    };
})(window.Supportal);
