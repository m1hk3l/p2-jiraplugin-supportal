/* ============================================================================
 *  pages/access-or-permissions/somewhere-else.js — the "Somewhere else" access request form
 *  (access-or-permissions/somewhere-else): user-picker autocomplete +
 *  Summary/Description form POSTing JSM request type 354 on desk 31.
 *  Guarded by #se-form.
 *  NOTE: the user picker is migration candidate #2 to a React island.
 * ========================================================================== */
(function (S) {
    "use strict";
    var byId = S.byId;
    var SUPPORTAL_BASE = S.base;
    var getCurrentUser = S.getCurrentUser;

    /* ===================== Access: "Somewhere else" request form =====================
     * Standalone page (access-or-permissions/somewhere-else): a Summary + Description
     * form that creates a JSM request type 354 (issue type "Access Request") on desk 31,
     * raised on behalf of the logged-in user. Replaces the old native JSM create screen.
     * All visible text is declarative (data-i18n); this only validates, POSTs, toggles views. */
    var seMyRequestsLabel = { EN: "My requests", ET: "Minu taotlused", RU: "Мои запросы" };

    /* User-picker autocomplete: query Jira's user search, render a listbox,
     * require the user to pick a result (sets a hidden username). We try
     * /rest/api/2/user/picker first; if it returns no results (a known DC
     * quirk tied to the global "Users" browse permission) we fall back to
     * /rest/api/2/user/search. Both return objects carrying `name`. */
    function seSearchUsers(query) {
        var q = encodeURIComponent(query);
        return fetch(SUPPORTAL_BASE + "/rest/api/2/user/picker?query=" + q + "&maxResults=8&showAvatar=false", {
            method: "GET", credentials: "include", headers: { "Accept": "application/json" }
        }).then(function (r) {
            if (!r.ok) throw new Error("picker failed");
            return r.json();
        }).then(function (data) {
            var users = (data && data.users) || [];
            return users.map(function (u) {
                return { name: u.name, label: u.displayName || u.name, sub: u.name };
            });
        }).then(function (list) {
            if (list.length) return list;
            return fetch(SUPPORTAL_BASE + "/rest/api/2/user/search?username=" + q + "&maxResults=8", {
                method: "GET", credentials: "include", headers: { "Accept": "application/json" }
            }).then(function (r) {
                if (!r.ok) throw new Error("search failed");
                return r.json();
            }).then(function (arr) {
                return (arr || []).map(function (u) {
                    return { name: u.name, label: u.displayName || u.name, sub: u.emailAddress || u.name };
                });
            });
        }).catch(function () { return []; });
    }

    function initSomewhereElseForm() {
        var form = byId("se-form");
        if (!form) return;   /* no-op unless on the somewhere-else page */

        var summaryEl = byId("se-summary");
        var descEl = byId("se-description");
        var userEl = byId("se-user");
        var userKeyEl = byId("se-user-key");
        var userResults = byId("se-user-results");

        function showView(name) {
            ["form", "loading", "success", "error"].forEach(function (k) {
                var v = byId("se-" + k + "-view");
                if (v) v.style.display = (k === name) ? "block" : "none";
            });
        }

        function setInvalid(el, on) {
            if (!el) return;
            el.classList.toggle("se-invalid", !!on);
            var err = byId(el.id + "-error");
            if (err) err.classList.toggle("show", !!on);
        }

        /* ---- user picker behaviour ---- */
        var seDebounceTimer = null;
        var seActiveIndex = -1;
        var seCurrentItems = [];

        function closeResults() {
            userResults.style.display = "none";
            userResults.innerHTML = "";
            userEl.setAttribute("aria-expanded", "false");
            seActiveIndex = -1;
            seCurrentItems = [];
        }

        function chooseItem(item) {
            userEl.value = item.label;
            userKeyEl.value = item.name;
            setInvalid(userEl, false);
            closeResults();
        }

        function renderResults(items) {
            seCurrentItems = items;
            seActiveIndex = -1;
            if (!items.length) { closeResults(); return; }
            userResults.innerHTML = "";
            items.forEach(function (item, idx) {
                var li = document.createElement("li");
                li.className = "se-user-result";
                li.setAttribute("role", "option");
                li.id = "se-user-opt-" + idx;
                var name = document.createElement("span");
                name.className = "se-user-result-name";
                name.textContent = item.label;
                var sub = document.createElement("span");
                sub.className = "se-user-result-sub";
                sub.textContent = item.sub;
                li.appendChild(name);
                li.appendChild(sub);
                li.addEventListener("mousedown", function (e) { e.preventDefault(); chooseItem(item); });
                userResults.appendChild(li);
            });
            userResults.style.display = "block";
            userEl.setAttribute("aria-expanded", "true");
        }

        function highlight(idx) {
            var opts = userResults.querySelectorAll(".se-user-result");
            opts.forEach(function (o, i) { o.classList.toggle("active", i === idx); });
            if (idx >= 0 && opts[idx]) {
                userEl.setAttribute("aria-activedescendant", opts[idx].id);
                opts[idx].scrollIntoView({ block: "nearest" });
            } else {
                userEl.removeAttribute("aria-activedescendant");
            }
        }

        userEl.addEventListener("input", function () {
            /* any edit invalidates a prior selection */
            userKeyEl.value = "";
            var term = userEl.value.trim();
            if (term) setInvalid(userEl, false);
            if (seDebounceTimer) clearTimeout(seDebounceTimer);
            if (term.length < 2) { closeResults(); return; }
            seDebounceTimer = setTimeout(function () {
                seSearchUsers(term).then(renderResults);
            }, 200);
        });

        userEl.addEventListener("keydown", function (e) {
            if (userResults.style.display === "none") return;
            if (e.key === "ArrowDown") {
                e.preventDefault();
                seActiveIndex = Math.min(seActiveIndex + 1, seCurrentItems.length - 1);
                highlight(seActiveIndex);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                seActiveIndex = Math.max(seActiveIndex - 1, 0);
                highlight(seActiveIndex);
            } else if (e.key === "Enter") {
                if (seActiveIndex >= 0 && seCurrentItems[seActiveIndex]) {
                    e.preventDefault();
                    chooseItem(seCurrentItems[seActiveIndex]);
                }
            } else if (e.key === "Escape") {
                closeResults();
            }
        });

        userEl.addEventListener("blur", function () { setTimeout(closeResults, 150); });

        function validate() {
            var sOk = !!summaryEl.value.trim();
            var dOk = !!descEl.value.trim();
            var uOk = !!userKeyEl.value;   /* must have a picked user, not just typed text */
            setInvalid(summaryEl, !sOk);
            setInvalid(descEl, !dOk);
            setInvalid(userEl, !uOk);
            return sOk && dOk && uOk;
        }

        function submit() {
            if (!validate()) return;
            var summary = summaryEl.value.trim();
            var description = descEl.value.trim();
            var selectedUser = userKeyEl.value;
            showView("loading");

            getCurrentUser().then(function (currentUser) {
                if (!currentUser) { showView("error"); return; }
                var requestData = {
                    serviceDeskId: "31",
                    requestTypeId: "354",
                    requestFieldValues: {
                        summary: summary,
                        description: description,
                        customfield_16038: { name: selectedUser }
                    },
                    requestParticipants: [],
                    raiseOnBehalfOf: currentUser.name
                };
                return fetch(SUPPORTAL_BASE + "/rest/servicedeskapi/request", {
                    method: "POST", credentials: "include",
                    headers: { "Accept": "application/json", "Content-Type": "application/json", "X-Atlassian-Token": "no-check" },
                    body: JSON.stringify(requestData)
                }).then(function (response) {
                    if (!response.ok) { showView("error"); return; }
                    return response.json().then(function (data) {
                        var link = byId("se-success-link");
                        if (link && data) {
                            var web = data._links && data._links.web;
                            if (web) link.href = web;
                            link.textContent = data.issueKey || (seMyRequestsLabel[S.lang] || seMyRequestsLabel.EN);
                        }
                        showView("success");
                        form.reset();
                        userKeyEl.value = "";
                    });
                });
            }).catch(function () { showView("error"); });
        }

        form.addEventListener("submit", function (e) { e.preventDefault(); submit(); });
        [summaryEl, descEl].forEach(function (el) {
            el.addEventListener("input", function () { if (el.value.trim()) setInvalid(el, false); });
        });
        var retry = byId("se-retry-btn");
        if (retry) retry.addEventListener("click", function (e) { e.preventDefault(); showView("form"); });
    }

    S.registerInit(initSomewhereElseForm);
})(window.Supportal);
