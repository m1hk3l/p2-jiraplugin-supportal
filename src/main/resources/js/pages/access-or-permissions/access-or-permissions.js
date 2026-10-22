/* ============================================================================
 *  pages/access-or-permissions/access-or-permissions.js — access-or-permissions page: intro + warning box and the
 *  granting-access timeline animation. Guarded by their root elements; the
 *  journey breadcrumb and modal links come from the shared modules.
 * ========================================================================== */
(function (S) {
    "use strict";
    var byId = S.byId;

    /* ===================== Module B: intro + warning ===================== */
    var accessIntroTexts = {
        EN: `<div class="access-or-permissions-intro-section"><div class="access-or-permissions-intro-content">
            <p class="access-or-permissions-intro-text line-default">Use the options below to request <strong class="highlight">access to applications, network folders, databases, USB rights, external user accounts,</strong> or <strong class="highlight">email and distribution lists</strong>. Please make sure to select the type of access you need and provide all required information to avoid delays.</p>
            <div class="access-or-permissions-warning-box"><p class="access-or-permissions-warning-text label-small">If you are requesting the <strong style="font-weight:600;">removal of access or permissions</strong>, please clearly indicate in the <strong style="font-weight:600;">Description field</strong> whether the request is for <strong style="font-weight:600;">adding or removing access</strong>, to ensure correct processing of the request.</p></div>
        </div></div>`,
        ET: `<div class="access-or-permissions-intro-section"><div class="access-or-permissions-intro-content">
            <p class="access-or-permissions-intro-text line-default">Kasuta allolevaid valikuid, et taotleda <strong class="highlight">ligipääsu rakendustele, võrgukataloogidele, andmebaasidele, USB-õigustele, väliskasutajate kontodele</strong> või <strong class="highlight">e-postile ja meililistidele</strong>. Veendu, et valiksid vajaliku ligipääsu tüübi ja esitad kõik nõutud andmed, et vältida viivitusi.</p>
            <div class="access-or-permissions-warning-box"><p class="access-or-permissions-warning-text label-small">Õiguste <strong style="font-weight:600;">eemaldamise soovi korral</strong> palume <strong style="font-weight:600;">Description väljas</strong> selgelt märkida, kas tegemist on <strong style="font-weight:600;">õiguste lisamise või eemaldamisega</strong>, et tagada päringu korrektne käsitlemine.</p></div>
        </div></div>`,
        RU: `<div class="access-or-permissions-intro-section"><div class="access-or-permissions-intro-content">
            <p class="access-or-permissions-intro-text line-default">Используйте приведённые ниже варианты, чтобы запросить <strong class="highlight">доступ к приложениям, сетевым папкам, базам данных, USB-права, учетные записи внешних пользователей</strong> или <strong class="highlight">электронную почту и списки рассылки</strong>. Пожалуйста, убедитесь, что вы выбрали нужный тип доступа и предоставили всю необходимую информацию, чтобы избежать задержек.</p>
            <div class="access-or-permissions-warning-box"><p class="access-or-permissions-warning-text label-small">В случае запроса на <strong style="font-weight:600;">удаление прав доступа</strong>, пожалуйста, чётко укажите в <strong style="font-weight:600;">поле Description</strong>, идёт ли речь о <strong style="font-weight:600;">добавлении или удалении прав</strong>, чтобы обеспечить корректную обработку запроса.</p></div>
        </div></div>`
    };
    function renderAccessIntro(lang) {
        var el = byId("access-or-permissions-intro-section");
        if (!el) return;
        el.innerHTML = accessIntroTexts[lang] || accessIntroTexts.EN;
    }

    /* ===================== Module C: need cards ===================== */
    /* hrefs built off SUPPORTAL_BASE: full create-form URLs open the JSM portal;
     * bare slugs are future deeper sub-pages under .../access-or-permissions/. */
    /* need-cards are now declarative in access-or-permissions.vm
     * (self-describing markup + data-i18n / data-i18n-attr). No filler JS. */

    /* ===================== Inline network-folder request ===================== */
    var networkFolderTexts = {
        EN: {
            userPlaceholder: "Select user...",
            userSearchPlaceholder: "Search user...",
            usersLoading: "Loading users...",
            usersLoadFailed: "Failed to load users.",
            usersNotFound: "No users found",
            usersTypeToSearch: "Type to search users...",
            pathsLoading: "Loading network folders...",
            noPaths: "No matching path. You can submit the path you entered.",
            pathsFailed: "The folder catalogue could not be loaded. Enter the complete path.",
            accessFailed: "Access levels could not be loaded. Please try again later.",
            missingUser: "Choose a user.",
            missingPath: "Enter a network folder path.",
            missingAccess: "Choose Read or Write access.",
            submitFailed: "The request could not be submitted. Please try again."
        },
        ET: {
            userPlaceholder: "Vali kasutaja...",
            userSearchPlaceholder: "Otsi kasutajat...",
            usersLoading: "Laadin kasutajaid...",
            usersLoadFailed: "Kasutajate laadimine ebaõnnestus.",
            usersNotFound: "Kasutajaid ei leitud",
            usersTypeToSearch: "Alusta kasutaja otsingut...",
            pathsLoading: "Laadin võrgukatalooge...",
            noPaths: "Sobivat teed ei leitud. Saate sisestatud tee siiski esitada.",
            pathsFailed: "Võrgukataloogide loendit ei õnnestunud laadida. Sisestage täielik tee.",
            accessFailed: "Ligipääsutasemeid ei õnnestunud laadida. Proovige hiljem uuesti.",
            missingUser: "Valige kasutaja.",
            missingPath: "Sisestage võrgukataloogi tee.",
            missingAccess: "Valige lugemis- või kirjutamisõigus.",
            submitFailed: "Pöördumise esitamine ebaõnnestus. Palun proovige uuesti."
        },
        RU: {
            userPlaceholder: "Выберите пользователя...",
            userSearchPlaceholder: "Поиск пользователя...",
            usersLoading: "Загрузка пользователей...",
            usersLoadFailed: "Не удалось загрузить пользователей.",
            usersNotFound: "Пользователи не найдены",
            usersTypeToSearch: "Начните вводить имя пользователя...",
            pathsLoading: "Загрузка сетевых папок...",
            noPaths: "Подходящий путь не найден. Можно отправить введённый путь.",
            pathsFailed: "Не удалось загрузить каталог папок. Введите полный путь.",
            accessFailed: "Не удалось загрузить уровни доступа. Повторите попытку позже.",
            missingUser: "Выберите пользователя.",
            missingPath: "Введите путь к сетевой папке.",
            missingAccess: "Выберите доступ на чтение или запись.",
            submitFailed: "Не удалось отправить запрос. Повторите попытку."
        }
    };

    function initNetworkFolderRequest() {
        var card = byId("need-card-network-folder");
        var panel = byId("network-folder-panel");
        if (!panel) return;

        var form = byId("network-folder-form");
        var formView = byId("network-folder-form-view");
        var loadingView = byId("network-folder-loading-view");
        var successView = byId("network-folder-success-view");
        var userSelect = byId("network-folder-user-select");
        var userPicker = byId("network-folder-user-picker");
        var userPickerTrigger = byId("network-folder-user-picker-trigger");
        var userPickerSearch = byId("network-folder-user-picker-search");
        var userPickerList = byId("network-folder-user-picker-list");
        var userPickerValue = byId("network-folder-user-picker-value");
        var userPickerArrow = byId("network-folder-user-picker-arrow");
        var userPickerClearSearch = byId("network-folder-user-picker-clear-search");
        var pathInput = byId("network-folder-path");
        var pathResults = byId("network-folder-path-results");
        var accessStep = byId("network-folder-access-step");
        var descriptionStep = byId("network-folder-description-step");
        var description = byId("network-folder-description");
        var error = byId("network-folder-form-error");
        var accessCards = Array.from(panel.querySelectorAll(".network-folder-access-card"));
        var USER_SEARCH_MIN = 2;
        var selectedUser = null;
        var selectedPath = null;
        var selectedAccess = null;
        var cataloguePaths = [];
        var accessLevels = [];
        var insightUsers = [];
        var accessLevelFallbacks = {
            read: { key: "LS-44105", label: "READ" },
            write: { key: "LS-44106", label: "WRITE" }
        };
        var cataloguePromise = null;
        var accessLevelsPromise = null;
        var userInsightPromise = null;
        var catalogueLoaded = false;
        var userPickerOpen = false;
        var listedUsers = [];
        var userReqToken = 0;
        var userSearchTimer = null;

        function text() {
            return networkFolderTexts[S.lang] || networkFolderTexts.EN;
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
        }

        function insightObjects(typeName, perPage) {
            var quote = function (value) { return String(value).replace(/[\\"]/g, "\\$&"); };
            var iql = 'objectSchema = "Public schema" AND objectType = "' + quote(typeName) + '"';
            var url = S.base + "/rest/insight/1.0/iql/objects"
                + "?iql=" + encodeURIComponent(iql)
                + "&resultPerPage=" + perPage
                + "&includeAttributes=false";
            return fetch(url, {
                method: "GET",
                credentials: "include",
                headers: { "Accept": "application/json" }
            }).then(function (response) {
                if (!response.ok) throw new Error("Insight query failed: " + response.status);
                return response.json();
            }).then(function (data) {
                return ((data && data.objectEntries) || []).map(function (object) {
                    return {
                        key: object.objectKey,
                        label: object.label || object.objectKey
                    };
                }).filter(function (object) { return object.key && object.label; });
            });
        }

        function fetchInsight(typeName, perPage, includeAttributes) {
            var quote = function (value) { return String(value).replace(/[\\"]/g, "\\$&"); };
            var iql = 'objectSchema = "Public schema" AND objectType = "' + quote(typeName) + '"';
            var url = S.base + "/rest/insight/1.0/iql/objects"
                + "?iql=" + encodeURIComponent(iql)
                + "&resultPerPage=" + perPage
                + "&includeAttributes=" + (includeAttributes ? "true" : "false");
            if (includeAttributes) {
                url += "&includeTypeAttributes=true";
            }
            return fetch(url, {
                method: "GET",
                credentials: "include",
                headers: { "Accept": "application/json" }
            }).then(function (response) {
                if (!response.ok) throw new Error("Insight query failed: " + response.status);
                return response.json();
            });
        }

        function searchJiraUsers(query) {
            return fetch(
                S.base + "/plugins/servlet/supportal/api/users?query=" + encodeURIComponent(query),
                {
                    method: "GET",
                    credentials: "include",
                    headers: { "Accept": "application/json" }
                }
            ).then(function (response) {
                if (!response.ok) throw new Error("Supportal user search failed: " + response.status);
                return response.json();
            }).then(function (data) {
                return (Array.isArray(data) ? data : []).map(function (user) {
                    var name = user && user.name;
                    if (!name) return null;
                    return {
                        value: name,
                        label: user.displayName || name,
                        sub: user.emailAddress || name
                    };
                }).filter(Boolean);
            });
        }

        function attrIdMap(data) {
            var map = {};
            ((data && data.objectTypeAttributes) || []).forEach(function (attribute) {
                map[attribute.name] = attribute.id;
            });
            return map;
        }

        function getAllAttributeValues(object, attributeId) {
            if (!object || !object.attributes) return "";
            var attribute = object.attributes.find(function (item) {
                return item.objectTypeAttributeId === attributeId;
            });
            if (!attribute || !attribute.objectAttributeValues) return "";
            return attribute.objectAttributeValues.map(function (value) {
                return value.value || value.displayValue || "";
            }).filter(Boolean).join(", ");
        }

        function getAttrByName(object, idMap, attributeName) {
            return getAllAttributeValues(object, idMap[attributeName]);
        }

        function loadInsightUsers() {
            if (userInsightPromise) return userInsightPromise;
            userInsightPromise = fetchInsight("User", 8000, true).then(function (data) {
                var userAttrIds = attrIdMap(data);
                insightUsers = ((data && data.objectEntries) || []).map(function (user) {
                    var email = getAttrByName(user, userAttrIds, "E-mail");
                    if (!email) return null;
                    return {
                        value: email.split("@")[0],
                        label: user.label || email,
                        sub: email
                    };
                }).filter(Boolean);
                return insightUsers;
            }).catch(function () {
                insightUsers = [];
                return [];
            });
            return userInsightPromise;
        }

        function searchAllUsers(query) {
            return loadInsightUsers().then(function () {
                var jiraError = null;
                return searchJiraUsers(query).catch(function (error) {
                    jiraError = error;
                    return [];
                }).then(function (jiraUsers) {
                    var term = normalizePathText(query);
                    var matchingInsightUsers = insightUsers.filter(function (user) {
                        return normalizePathText(user.value).indexOf(term) !== -1
                            || normalizePathText(user.label).indexOf(term) !== -1
                            || normalizePathText(user.sub).indexOf(term) !== -1;
                    });
                    if (jiraError && !matchingInsightUsers.length) throw jiraError;
                    var byUsername = new Map();
                    matchingInsightUsers.forEach(function (user) {
                        byUsername.set(user.value.toLowerCase(), user);
                    });
                    jiraUsers.forEach(function (user) {
                        byUsername.set(user.value.toLowerCase(), user);
                    });
                    return Array.from(byUsername.values()).sort(function (a, b) {
                        return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
                    });
                });
            });
        }

        function firstAvailableInsightType(typeNames, perPage) {
            var index = 0;
            function next() {
                if (index >= typeNames.length) return Promise.resolve([]);
                return insightObjects(typeNames[index++], perPage).then(function (objects) {
                    return objects.length ? objects : next();
                }).catch(next);
            }
            return next();
        }

        function normalizePathText(value) {
            return String(value || "").toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[üÜ]/g, "u").replace(/[öÖ]/g, "o").replace(/[äÄ]/g, "a")
                .replace(/[õÕ]/g, "o").replace(/[šŠ]/g, "s").replace(/[žŽ]/g, "z");
        }

        function normalizeLookup(value) {
            return normalizePathText(value).replace(/[^a-z0-9]+/g, "");
        }

        function accessAliases(kind) {
            if (kind === "read") {
                return ["read", "readonly", "read only", "ro", "lugemine", "loetav", "chtenie", "chtenie", "чтение"];
            }
            if (kind === "write") {
                return ["write", "readwrite", "read write", "rw", "modify", "change", "edit", "kirjutamine", "muutmine", "zapis", "запись"];
            }
            return [kind];
        }

        function matchesAccessLevel(label, kind) {
            var normalizedLabel = normalizeLookup(label);
            return accessAliases(kind).some(function (alias) {
                return normalizedLabel.indexOf(normalizeLookup(alias)) !== -1;
            });
        }

        function syncAccessCardMappings() {
            accessCards.forEach(function (button) {
                var match = accessLevels.find(function (level) {
                    return matchesAccessLevel(level.label, button.dataset.access);
                });
                var fallback = accessLevelFallbacks[button.dataset.access] || null;
                button.dataset.objectKey = match && match.key ? match.key : (fallback ? fallback.key : "");
                button.dataset.objectLabel = match && match.label ? match.label : (fallback ? fallback.label : "");
                button.disabled = false;
            });
        }

        function resolveAccessLevel(selection) {
            if (!selection || !selection.value) return null;
            return accessLevels.find(function (level) {
                return matchesAccessLevel(level.label, selection.value);
            }) || null;
        }

        function showUserPickerMessage(html) {
            if (userPickerList) userPickerList.innerHTML = html;
        }

        function showUserPrompt() {
            showUserPickerMessage('<div class="user-picker-empty"><i class="pi pi-search" style="font-size:20px;opacity:0.3;margin-bottom:8px;display:block;"></i>'
                + text().usersTypeToSearch + "</div>");
        }

        function showUserLoading() {
            showUserPickerMessage('<div class="user-picker-loading"><div class="user-picker-spinner"></div><span>'
                + text().usersLoading + "</span></div>");
        }

        function closeUserPicker() {
            if (!userPicker) return;
            userPickerOpen = false;
            userPicker.classList.remove("open");
            if (userPickerArrow) userPickerArrow.style.transform = "";
        }

        function openUserPicker() {
            if (!userPicker) return;
            userPickerOpen = true;
            userPicker.classList.add("open");
            if (userPickerArrow) userPickerArrow.style.transform = "rotate(180deg)";
            userPickerSearch.value = "";
            userPickerClearSearch.style.display = "none";
            listedUsers = [];
            if (userSearchTimer) clearTimeout(userSearchTimer);
            ++userReqToken;
            showUserPrompt();
            setTimeout(function () { userPickerSearch.focus(); }, 50);
        }

        function clearUser() {
            selectedUser = null;
            if (userSelect) userSelect.value = "";
            if (userPickerValue) {
                userPickerValue.textContent = text().userPlaceholder;
                userPickerValue.classList.remove("selected");
            }
            if (userPickerTrigger) userPickerTrigger.classList.remove("has-value");
        }

        function selectUser(user) {
            selectedUser = user;
            if (userSelect) userSelect.value = user.value;
            if (userPickerValue) {
                userPickerValue.textContent = user.label;
                userPickerValue.classList.add("selected");
            }
            if (userPickerTrigger) userPickerTrigger.classList.add("has-value");
            closeUserPicker();
        }

        function highlightMatch(value, term) {
            var textValue = String(value || "");
            if (!term) return escapeHtml(textValue);
            var normalizedValue = normalizePathText(textValue);
            var normalizedTerm = normalizePathText(term);
            var index = normalizedValue.indexOf(normalizedTerm);
            if (index === -1) return escapeHtml(textValue);
            return escapeHtml(textValue.slice(0, index))
                + "<mark>" + escapeHtml(textValue.slice(index, index + term.length)) + "</mark>"
                + escapeHtml(textValue.slice(index + term.length));
        }

        function renderUserList(term) {
            if (!listedUsers.length) {
                showUserPickerMessage('<div class="user-picker-empty"><i class="pi pi-search" style="font-size:20px;opacity:0.3;margin-bottom:8px;display:block;"></i>'
                    + text().usersNotFound + "</div>");
                return;
            }
            userPickerList.innerHTML = listedUsers.map(function (user) {
                var active = selectedUser && selectedUser.value === user.value;
                return '<div class="user-picker-item ' + (active ? "active" : "") + '" data-value="'
                    + escapeHtml(user.value) + '" data-label="' + escapeHtml(user.label) + '" data-sub="'
                    + escapeHtml(user.sub || user.value) + '">'
                    + '<span class="user-picker-item-avatar">' + escapeHtml((user.label || user.value).charAt(0).toUpperCase()) + "</span>"
                    + '<span class="user-picker-item-text">'
                    + '<span class="user-picker-item-name">' + highlightMatch(user.label, term) + "</span>"
                    + '<span class="user-picker-item-sub">' + highlightMatch(user.sub || user.value, term) + "</span>"
                    + "</span>"
                    + (active ? '<i class="pi pi-check user-picker-item-check"></i>' : "")
                    + "</div>";
            }).join("");
            userPickerList.querySelectorAll(".user-picker-item").forEach(function (element) {
                element.addEventListener("mousedown", function (event) {
                    event.preventDefault();
                    selectUser({
                        value: element.dataset.value,
                        label: element.dataset.label,
                        sub: element.dataset.sub
                    });
                });
            });
        }

        function queryUsers(term) {
            var query = (term || "").trim();
            if (userSearchTimer) clearTimeout(userSearchTimer);
            if (query.length < USER_SEARCH_MIN) {
                listedUsers = [];
                ++userReqToken;
                showUserPrompt();
                return;
            }
            var token = ++userReqToken;
            showUserLoading();
            userSearchTimer = setTimeout(function () {
                searchAllUsers(query).then(function (users) {
                    if (token !== userReqToken) return;
                    listedUsers = users;
                    renderUserList(query);
                }).catch(function () {
                    if (token !== userReqToken) return;
                    listedUsers = [];
                    showUserPickerMessage('<div class="user-picker-empty" style="color:#8d575a;">'
                        + text().usersLoadFailed + "</div>");
                });
            }, 200);
        }

        function showPathMessage(message) {
            pathResults.innerHTML = "";
            var empty = document.createElement("div");
            empty.className = "network-folder-path-empty";
            empty.textContent = message;
            pathResults.appendChild(empty);
            pathResults.hidden = false;
        }

        function loadData() {
            if (cataloguePromise) return cataloguePromise;
            accessCards.forEach(function (button) { button.disabled = false; });
            showPathMessage(text().pathsLoading);
            cataloguePromise = firstAvailableInsightType(
                ["Catalogue", "NWF path", "NWF Path", "Network folder", "Network Folder"],
                8000
            ).then(function (paths) {
                cataloguePaths = paths || [];
                catalogueLoaded = true;
                renderPathResults();
                return paths;
            }).catch(function () {
                catalogueLoaded = true;
                cataloguePaths = [];
                renderPathResults();
                return [];
            });
            accessLevelsPromise = firstAvailableInsightType(
                ["Access level", "Access Level", "Network folder access level"],
                50
            ).then(function (levels) {
                accessLevels = levels || [];
                syncAccessCardMappings();
                return levels;
            }).catch(function () {
                accessLevels = [];
                syncAccessCardMappings();
                return [];
            });
            return cataloguePromise;
        }

        function showError(message) {
            error.textContent = message;
            error.hidden = false;
        }

        function clearError() {
            error.textContent = "";
            error.hidden = true;
        }

        function reveal(element) {
            if (!element.hidden) return;
            element.hidden = false;
            requestAnimationFrame(function () { element.classList.add("revealed"); });
        }

        function hide(element) {
            element.classList.remove("revealed");
            element.hidden = true;
        }

        function collapsePathList() {
            pathResults.hidden = true;
        }

        function choosePath(path) {
            selectedPath = path;
            pathInput.value = path.label;
            collapsePathList();
            reveal(accessStep);
            clearError();
        }

        function renderPathResults() {
            if (!catalogueLoaded) {
                showPathMessage(text().pathsLoading);
                return;
            }
            var rawTerm = pathInput.value.trim();
            var term = normalizePathText(rawTerm);
            pathResults.innerHTML = "";
            var matches = (term
                ? cataloguePaths.filter(function (path) {
                    return normalizePathText(path.label).indexOf(term) !== -1;
                })
                : cataloguePaths).slice(0, 60);
            if (!matches.length) {
                showPathMessage(cataloguePaths.length ? text().noPaths : text().pathsFailed);
                return;
            } else {
                matches.forEach(function (path) {
                    var option = document.createElement("button");
                    option.type = "button";
                    option.className = "network-folder-path-result";
                    if (selectedPath && selectedPath.key === path.key) {
                        option.classList.add("selected");
                    }
                    option.innerHTML = '<i class="pi pi-folder"></i><span></span>';
                    option.querySelector("span").textContent = path.label;
                    option.addEventListener("mousedown", function (event) {
                        event.preventDefault();
                        choosePath(path);
                    });
                    pathResults.appendChild(option);
                });
            }
            pathResults.hidden = false;
        }

        function resetForm() {
            form.reset();
            clearUser();
            closeUserPicker();
            selectedPath = null;
            selectedAccess = null;
            collapsePathList();
            accessCards.forEach(function (button) { button.classList.remove("selected"); });
            hide(accessStep);
            hide(descriptionStep);
            clearError();
            formView.hidden = false;
            loadingView.hidden = true;
            successView.hidden = true;
        }

        function openPanel(event) {
            if (event) event.preventDefault();
            resetForm();
            if (card) card.classList.add("selected");
            panel.hidden = false;
            requestAnimationFrame(function () {
                panel.classList.add("active");
                panel.scrollIntoView({ behavior: "smooth", block: "start" });
            });
            loadData();
            setTimeout(function () { pathInput.focus(); }, 350);
        }

        function closePanel() {
            if (!card) return;  /* standalone page: the close control is a link */
            panel.classList.remove("active");
            card.classList.remove("selected");
            setTimeout(function () {
                panel.hidden = true;
                resetForm();
            }, 280);
        }

        function lastFolderName(path) {
            var normalized = path.replace(/\\/g, "/").replace(/\/+$/, "");
            var pieces = normalized.split("/").filter(Boolean);
            return pieces.length ? pieces[pieces.length - 1] : path;
        }

        function createServiceDeskRequest(fields, currentUserName) {
            return fetch(S.base + "/rest/servicedeskapi/request", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "X-Atlassian-Token": "no-check"
                },
                body: JSON.stringify({
                    serviceDeskId: "31",
                    requestTypeId: "350",
                    requestFieldValues: fields,
                    requestParticipants: [],
                    raiseOnBehalfOf: currentUserName
                })
            }).then(function (response) {
                if (response && response.ok) return response.json();
                return response.text().catch(function () { return ""; }).then(function (body) {
                    var error = new Error("Request submission failed");
                    error.status = response ? response.status : 0;
                    error.body = body;
                    throw error;
                });
            });
        }

        function buildAccessFieldCandidates(selection, matchedAccess) {
            var label = matchedAccess && matchedAccess.label ? matchedAccess.label : (selection && selection.label);
            var candidates = [];
            function pushCandidate(value) {
                if (value == null) return;
                var key = JSON.stringify(value);
                if (!candidates.some(function (candidate) { return JSON.stringify(candidate) === key; })) {
                    candidates.push(value);
                }
            }
            if (matchedAccess && matchedAccess.key) pushCandidate([{ key: matchedAccess.key }]);
            if (label) {
                pushCandidate(label);
                pushCandidate({ value: label });
                pushCandidate([{ value: label }]);
            }
            return candidates;
        }

        function submitWithAccessFallback(baseFields, currentUserName, candidates, index) {
            if (index >= candidates.length) {
                return Promise.reject(new Error("No valid access field payload"));
            }
            var fields = Object.assign({}, baseFields, {
                customfield_18315: candidates[index]
            });
            return createServiceDeskRequest(fields, currentUserName).catch(function (error) {
                if (error && error.status === 400 && index + 1 < candidates.length) {
                    return submitWithAccessFallback(baseFields, currentUserName, candidates, index + 1);
                }
                throw error;
            });
        }

        function submitRequest(event) {
            event.preventDefault();
            clearError();
            if (!selectedUser || !selectedUser.value) {
                showError(text().missingUser);
                if (userPickerTrigger) userPickerTrigger.focus();
                return;
            }
            var folderPath = pathInput.value.trim();
            if (!folderPath) {
                showError(text().missingPath);
                pathInput.focus();
                return;
            }
            if (!selectedAccess || !selectedAccess.value) {
                showError(text().missingAccess);
                return;
            }
            if (!selectedPath) {
                var exact = cataloguePaths.find(function (path) {
                    return normalizePathText(path.label) === normalizePathText(folderPath);
                });
                if (exact) selectedPath = exact;
            }

            formView.hidden = true;
            loadingView.hidden = false;
            fetch(S.base + "/plugins/servlet/supportal/api/network-folder-request", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "X-Atlassian-Token": "no-check"
                },
                body: JSON.stringify({
                    requestedForUserName: selectedUser.value,
                    requestedForDisplayName: selectedUser.label || selectedUser.value,
                    folderPath: folderPath,
                    access: selectedAccess.value,
                    selectedAccessObjectKey: selectedAccess.objectKey || "",
                    selectedAccessObjectLabel: selectedAccess.objectLabel || selectedAccess.label || selectedAccess.value,
                    description: description.value.trim(),
                    selectedPathKey: selectedPath && selectedPath.key ? selectedPath.key : ""
                })
            }).then(function (response) {
                if (!response || !response.ok) throw new Error("Network-folder submit failed");
                return response.json();
            }).then(function (created) {
                loadingView.hidden = true;
                successView.hidden = false;
                var link = byId("network-folder-success-link");
                var web = created && created._links && created._links.web;
                if (web) link.href = web;
                if (created && created.issueKey) link.textContent = created.issueKey;
            }).catch(function () {
                loadingView.hidden = true;
                formView.hidden = false;
                showError(text().submitFailed);
            });
        }

        if (card) {
            card.addEventListener("click", openPanel);
            byId("network-folder-close").addEventListener("click", closePanel);
        } else {
            panel.classList.add("active");
            loadData().then(function () {
                setTimeout(function () { pathInput.focus(); renderPathResults(); }, 250);
            });
        }
        if (userPickerTrigger) {
            clearUser();
            userPickerSearch.placeholder = text().userSearchPlaceholder;
            userPickerTrigger.addEventListener("click", function () {
                userPickerOpen ? closeUserPicker() : openUserPicker();
            });
            userPickerTrigger.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    userPickerOpen ? closeUserPicker() : openUserPicker();
                }
                if (event.key === "Escape") closeUserPicker();
            });
            userPickerSearch.addEventListener("input", function (event) {
                var term = event.target.value;
                userPickerClearSearch.style.display = term ? "flex" : "none";
                queryUsers(term);
            });
            userPickerClearSearch.addEventListener("mousedown", function (event) {
                event.preventDefault();
                userPickerSearch.value = "";
                userPickerClearSearch.style.display = "none";
                queryUsers("");
                userPickerSearch.focus();
            });
        }
        pathInput.addEventListener("input", function () {
            if (selectedPath && pathInput.value !== selectedPath.label) selectedPath = null;
            renderPathResults();
            if (pathInput.value.trim()) reveal(accessStep);
            else {
                selectedAccess = null;
                accessCards.forEach(function (button) { button.classList.remove("selected"); });
                hide(accessStep);
                hide(descriptionStep);
            }
            clearError();
        });
        pathInput.addEventListener("focus", renderPathResults);
        pathInput.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                collapsePathList();
            } else if (event.key === "Enter" && !pathResults.hidden) {
                var first = pathResults.querySelector(".network-folder-path-result");
                if (first) {
                    event.preventDefault();
                    first.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
                }
            }
        });
        accessCards.forEach(function (button) {
            button.addEventListener("click", function () {
                selectedAccess = {
                    value: button.dataset.access,
                    label: button.dataset.access === "read" ? "Read" : "Write",
                    objectKey: button.dataset.objectKey || "",
                    objectLabel: button.dataset.objectLabel || ""
                };
                accessCards.forEach(function (candidate) {
                    candidate.classList.toggle("selected", candidate === button);
                });
                reveal(descriptionStep);
                clearError();
                setTimeout(function () {
                    descriptionStep.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }, 50);
            });
        });
        document.addEventListener("mousedown", function (event) {
            if (userPickerOpen && userPicker && !userPicker.contains(event.target)) {
                closeUserPicker();
            }
            if (!pathResults.contains(event.target) && event.target !== pathInput) {
                pathResults.hidden = true;
            }
        });
        form.addEventListener("submit", submitRequest);
    }

    /* ===================== Shared mailbox / distribution list request ===================== */
    var sharedMailboxTexts = {
        EN: {
            userPlaceholder: "Select user...",
            userSearchPlaceholder: "Search user...",
            usersLoading: "Loading users...",
            usersLoadFailed: "Failed to load users.",
            usersNotFound: "No users found",
            usersTypeToSearch: "Type to search users...",
            mailboxesLoading: "Loading shared mailboxes and distribution lists...",
            noMailboxes: "No matching shared mailbox or distribution list found.",
            mailboxesFailed: "The shared mailbox catalogue could not be loaded.",
            missingUser: "Choose a user.",
            missingMailbox: "Choose a shared mailbox or distribution list.",
            missingRole: "Choose a shared mailbox role.",
            submitFailed: "The request could not be submitted. Please try again."
        },
        ET: {
            userPlaceholder: "Vali kasutaja...",
            userSearchPlaceholder: "Otsi kasutajat...",
            usersLoading: "Laadin kasutajaid...",
            usersLoadFailed: "Kasutajate laadimine ebaõnnestus.",
            usersNotFound: "Kasutajaid ei leitud",
            usersTypeToSearch: "Alusta kasutaja otsingut...",
            mailboxesLoading: "Laadin jagatud postkaste ja meililiste...",
            noMailboxes: "Sobivat jagatud postkasti või meililisti ei leitud.",
            mailboxesFailed: "Jagatud postkastide kataloogi ei õnnestunud laadida.",
            missingUser: "Valige kasutaja.",
            missingMailbox: "Valige jagatud postkast või meililist.",
            missingRole: "Valige jagatud postkasti roll.",
            submitFailed: "Pöördumise esitamine ebaõnnestus. Palun proovige uuesti."
        },
        RU: {
            userPlaceholder: "Выберите пользователя...",
            userSearchPlaceholder: "Поиск пользователя...",
            usersLoading: "Загрузка пользователей...",
            usersLoadFailed: "Не удалось загрузить пользователей.",
            usersNotFound: "Пользователи не найдены",
            usersTypeToSearch: "Начните вводить имя пользователя...",
            mailboxesLoading: "Загрузка общих почтовых ящиков и списков рассылки...",
            noMailboxes: "Подходящая общая почта или список рассылки не найдены.",
            mailboxesFailed: "Не удалось загрузить каталог общих почтовых ящиков.",
            missingUser: "Выберите пользователя.",
            missingMailbox: "Выберите общую почту или список рассылки.",
            missingRole: "Выберите роль для общей почты.",
            submitFailed: "Не удалось отправить запрос. Повторите попытку."
        }
    };

    function initSharedMailboxRequest() {
        var panel = byId("shared-mailbox-panel");
        if (!panel) return;

        var form = byId("shared-mailbox-form");
        var formView = byId("shared-mailbox-form-view");
        var loadingView = byId("shared-mailbox-loading-view");
        var successView = byId("shared-mailbox-success-view");
        var userSelect = byId("shared-mailbox-user-select");
        var userPicker = byId("shared-mailbox-user-picker");
        var userPickerTrigger = byId("shared-mailbox-user-picker-trigger");
        var userPickerSearch = byId("shared-mailbox-user-picker-search");
        var userPickerList = byId("shared-mailbox-user-picker-list");
        var userPickerValue = byId("shared-mailbox-user-picker-value");
        var userPickerArrow = byId("shared-mailbox-user-picker-arrow");
        var userPickerClearSearch = byId("shared-mailbox-user-picker-clear-search");
        var mailboxInput = byId("shared-mailbox-name");
        var mailboxResults = byId("shared-mailbox-results");
        var roleStep = byId("shared-mailbox-role-step");
        var descriptionStep = byId("shared-mailbox-description-step");
        var description = byId("shared-mailbox-description");
        var error = byId("shared-mailbox-form-error");
        var roleCards = Array.from(panel.querySelectorAll(".network-folder-access-card"));
        var USER_SEARCH_MIN = 2;
        var selectedUser = null;
        var selectedMailbox = null;
        var selectedRole = null;
        var mailboxObjects = [];
        var insightUsers = [];
        var mailboxesPromise = null;
        var userInsightPromise = null;
        var mailboxesLoaded = false;
        var userPickerOpen = false;
        var listedUsers = [];
        var userReqToken = 0;
        var userSearchTimer = null;

        function text() {
            return sharedMailboxTexts[S.lang] || sharedMailboxTexts.EN;
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
        }

        function normalizeText(value) {
            return String(value || "").toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[üÜ]/g, "u").replace(/[öÖ]/g, "o").replace(/[äÄ]/g, "a")
                .replace(/[õÕ]/g, "o").replace(/[šŠ]/g, "s").replace(/[žŽ]/g, "z");
        }

        function fetchInsight(typeName, perPage, includeAttributes) {
            var quote = function (value) { return String(value).replace(/[\\"]/g, "\\$&"); };
            var iql = 'objectSchema = "Public schema" AND objectType = "' + quote(typeName) + '"';
            var url = S.base + "/rest/insight/1.0/iql/objects"
                + "?iql=" + encodeURIComponent(iql)
                + "&resultPerPage=" + perPage
                + "&includeAttributes=" + (includeAttributes ? "true" : "false");
            if (includeAttributes) {
                url += "&includeTypeAttributes=true";
            }
            return fetch(url, {
                method: "GET",
                credentials: "include",
                headers: { "Accept": "application/json" }
            }).then(function (response) {
                if (!response.ok) throw new Error("Insight query failed: " + response.status);
                return response.json();
            });
        }

        function fetchMailboxObjects(perPage) {
            var iql = 'objectSchema = "Public schema" AND objectTypeId in (341,342)';
            var url = S.base + "/rest/insight/1.0/iql/objects"
                + "?iql=" + encodeURIComponent(iql)
                + "&resultPerPage=" + perPage
                + "&includeAttributes=false";
            return fetch(url, {
                method: "GET",
                credentials: "include",
                headers: { "Accept": "application/json" }
            }).then(function (response) {
                if (!response.ok) throw new Error("Insight query failed: " + response.status);
                return response.json();
            }).then(function (data) {
                return ((data && data.objectEntries) || []).map(function (object) {
                    return {
                        key: object.objectKey,
                        label: object.label || object.objectKey
                    };
                }).filter(function (object) { return object.key && object.label; });
            });
        }

        function searchJiraUsers(query) {
            return fetch(
                S.base + "/plugins/servlet/supportal/api/users?query=" + encodeURIComponent(query),
                {
                    method: "GET",
                    credentials: "include",
                    headers: { "Accept": "application/json" }
                }
            ).then(function (response) {
                if (!response.ok) throw new Error("Supportal user search failed: " + response.status);
                return response.json();
            }).then(function (data) {
                return (Array.isArray(data) ? data : []).map(function (user) {
                    var name = user && user.name;
                    if (!name) return null;
                    return {
                        value: name,
                        label: user.displayName || name,
                        sub: user.emailAddress || name
                    };
                }).filter(Boolean);
            });
        }

        function attrIdMap(data) {
            var map = {};
            ((data && data.objectTypeAttributes) || []).forEach(function (attribute) {
                map[attribute.name] = attribute.id;
            });
            return map;
        }

        function getAllAttributeValues(object, attributeId) {
            if (!object || !object.attributes) return "";
            var attribute = object.attributes.find(function (item) {
                return item.objectTypeAttributeId === attributeId;
            });
            if (!attribute || !attribute.objectAttributeValues) return "";
            return attribute.objectAttributeValues.map(function (value) {
                return value.value || value.displayValue || "";
            }).filter(Boolean).join(", ");
        }

        function getAttrByName(object, idMap, attributeName) {
            return getAllAttributeValues(object, idMap[attributeName]);
        }

        function loadInsightUsers() {
            if (userInsightPromise) return userInsightPromise;
            userInsightPromise = fetchInsight("User", 8000, true).then(function (data) {
                var userAttrIds = attrIdMap(data);
                insightUsers = ((data && data.objectEntries) || []).map(function (user) {
                    var email = getAttrByName(user, userAttrIds, "E-mail");
                    if (!email) return null;
                    return {
                        value: email.split("@")[0],
                        label: user.label || email,
                        sub: email
                    };
                }).filter(Boolean);
                return insightUsers;
            }).catch(function () {
                insightUsers = [];
                return [];
            });
            return userInsightPromise;
        }

        function searchAllUsers(query) {
            return loadInsightUsers().then(function () {
                var jiraError = null;
                return searchJiraUsers(query).catch(function (error) {
                    jiraError = error;
                    return [];
                }).then(function (jiraUsers) {
                    var term = normalizeText(query);
                    var matchingInsightUsers = insightUsers.filter(function (user) {
                        return normalizeText(user.value).indexOf(term) !== -1
                            || normalizeText(user.label).indexOf(term) !== -1
                            || normalizeText(user.sub).indexOf(term) !== -1;
                    });
                    if (jiraError && !matchingInsightUsers.length) throw jiraError;
                    var byUsername = new Map();
                    matchingInsightUsers.forEach(function (user) {
                        byUsername.set(user.value.toLowerCase(), user);
                    });
                    jiraUsers.forEach(function (user) {
                        byUsername.set(user.value.toLowerCase(), user);
                    });
                    return Array.from(byUsername.values()).sort(function (a, b) {
                        return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
                    });
                });
            });
        }

        function showUserPickerMessage(html) {
            if (userPickerList) userPickerList.innerHTML = html;
        }

        function showUserPrompt() {
            showUserPickerMessage('<div class="user-picker-empty"><i class="pi pi-search" style="font-size:20px;opacity:0.3;margin-bottom:8px;display:block;"></i>'
                + text().usersTypeToSearch + "</div>");
        }

        function showUserLoading() {
            showUserPickerMessage('<div class="user-picker-loading"><div class="user-picker-spinner"></div><span>'
                + text().usersLoading + "</span></div>");
        }

        function closeUserPicker() {
            if (!userPicker) return;
            userPickerOpen = false;
            userPicker.classList.remove("open");
            if (userPickerArrow) userPickerArrow.style.transform = "";
        }

        function openUserPicker() {
            if (!userPicker) return;
            userPickerOpen = true;
            userPicker.classList.add("open");
            if (userPickerArrow) userPickerArrow.style.transform = "rotate(180deg)";
            userPickerSearch.value = "";
            userPickerClearSearch.style.display = "none";
            listedUsers = [];
            if (userSearchTimer) clearTimeout(userSearchTimer);
            ++userReqToken;
            showUserPrompt();
            setTimeout(function () { userPickerSearch.focus(); }, 50);
        }

        function clearUser() {
            selectedUser = null;
            if (userSelect) userSelect.value = "";
            if (userPickerValue) {
                userPickerValue.textContent = text().userPlaceholder;
                userPickerValue.classList.remove("selected");
            }
            if (userPickerTrigger) userPickerTrigger.classList.remove("has-value");
        }

        function selectUser(user) {
            selectedUser = user;
            if (userSelect) userSelect.value = user.value;
            if (userPickerValue) {
                userPickerValue.textContent = user.label;
                userPickerValue.classList.add("selected");
            }
            if (userPickerTrigger) userPickerTrigger.classList.add("has-value");
            closeUserPicker();
        }

        function highlightMatch(value, term) {
            var textValue = String(value || "");
            if (!term) return escapeHtml(textValue);
            var normalizedValue = normalizeText(textValue);
            var normalizedTerm = normalizeText(term);
            var index = normalizedValue.indexOf(normalizedTerm);
            if (index === -1) return escapeHtml(textValue);
            return escapeHtml(textValue.slice(0, index))
                + "<mark>" + escapeHtml(textValue.slice(index, index + term.length)) + "</mark>"
                + escapeHtml(textValue.slice(index + term.length));
        }

        function renderUserList(term) {
            if (!listedUsers.length) {
                showUserPickerMessage('<div class="user-picker-empty"><i class="pi pi-search" style="font-size:20px;opacity:0.3;margin-bottom:8px;display:block;"></i>'
                    + text().usersNotFound + "</div>");
                return;
            }
            userPickerList.innerHTML = listedUsers.map(function (user) {
                var active = selectedUser && selectedUser.value === user.value;
                return '<div class="user-picker-item ' + (active ? "active" : "") + '" data-value="'
                    + escapeHtml(user.value) + '" data-label="' + escapeHtml(user.label) + '" data-sub="'
                    + escapeHtml(user.sub || user.value) + '">'
                    + '<span class="user-picker-item-avatar">' + escapeHtml((user.label || user.value).charAt(0).toUpperCase()) + "</span>"
                    + '<span class="user-picker-item-text">'
                    + '<span class="user-picker-item-name">' + highlightMatch(user.label, term) + "</span>"
                    + '<span class="user-picker-item-sub">' + highlightMatch(user.sub || user.value, term) + "</span>"
                    + "</span>"
                    + (active ? '<i class="pi pi-check user-picker-item-check"></i>' : "")
                    + "</div>";
            }).join("");
            userPickerList.querySelectorAll(".user-picker-item").forEach(function (element) {
                element.addEventListener("mousedown", function (event) {
                    event.preventDefault();
                    selectUser({
                        value: element.dataset.value,
                        label: element.dataset.label,
                        sub: element.dataset.sub
                    });
                });
            });
        }

        function queryUsers(term) {
            var query = (term || "").trim();
            if (userSearchTimer) clearTimeout(userSearchTimer);
            if (query.length < USER_SEARCH_MIN) {
                listedUsers = [];
                ++userReqToken;
                showUserPrompt();
                return;
            }
            var token = ++userReqToken;
            showUserLoading();
            userSearchTimer = setTimeout(function () {
                searchAllUsers(query).then(function (users) {
                    if (token !== userReqToken) return;
                    listedUsers = users;
                    renderUserList(query);
                }).catch(function () {
                    if (token !== userReqToken) return;
                    listedUsers = [];
                    showUserPickerMessage('<div class="user-picker-empty" style="color:#8d575a;">'
                        + text().usersLoadFailed + "</div>");
                });
            }, 200);
        }

        function showMailboxMessage(message) {
            mailboxResults.innerHTML = "";
            var empty = document.createElement("div");
            empty.className = "network-folder-path-empty";
            empty.textContent = message;
            mailboxResults.appendChild(empty);
            mailboxResults.hidden = false;
        }

        function loadData() {
            if (mailboxesPromise) return mailboxesPromise;
            showMailboxMessage(text().mailboxesLoading);
            mailboxesPromise = fetchMailboxObjects(8000).then(function (objects) {
                mailboxObjects = objects || [];
                mailboxesLoaded = true;
                renderMailboxResults();
                return objects;
            }).catch(function () {
                mailboxObjects = [];
                mailboxesLoaded = true;
                renderMailboxResults();
                return [];
            });
            return mailboxesPromise;
        }

        function showError(message) {
            error.textContent = message;
            error.hidden = false;
        }

        function clearError() {
            error.textContent = "";
            error.hidden = true;
        }

        function reveal(element) {
            if (!element.hidden) return;
            element.hidden = false;
            requestAnimationFrame(function () { element.classList.add("revealed"); });
        }

        function hide(element) {
            element.classList.remove("revealed");
            element.hidden = true;
        }

        function collapseMailboxList() {
            mailboxResults.hidden = true;
        }

        function chooseMailbox(mailbox) {
            selectedMailbox = mailbox;
            mailboxInput.value = mailbox.label;
            collapseMailboxList();
            reveal(roleStep);
            clearError();
        }

        function renderMailboxResults() {
            if (!mailboxesLoaded) {
                showMailboxMessage(text().mailboxesLoading);
                return;
            }
            var rawTerm = mailboxInput.value.trim();
            var term = normalizeText(rawTerm);
            mailboxResults.innerHTML = "";
            var matches = (term
                ? mailboxObjects.filter(function (mailbox) {
                    return normalizeText(mailbox.label).indexOf(term) !== -1;
                })
                : mailboxObjects).slice(0, 60);
            if (!matches.length) {
                showMailboxMessage(mailboxObjects.length ? text().noMailboxes : text().mailboxesFailed);
                return;
            }
            matches.forEach(function (mailbox) {
                var option = document.createElement("button");
                option.type = "button";
                option.className = "network-folder-path-result";
                if (selectedMailbox && selectedMailbox.key === mailbox.key) {
                    option.classList.add("selected");
                }
                option.innerHTML = '<i class="pi pi-envelope"></i><span></span>';
                option.querySelector("span").textContent = mailbox.label;
                option.addEventListener("mousedown", function (event) {
                    event.preventDefault();
                    chooseMailbox(mailbox);
                });
                mailboxResults.appendChild(option);
            });
            mailboxResults.hidden = false;
        }

        function resetForm() {
            form.reset();
            clearUser();
            closeUserPicker();
            selectedMailbox = null;
            selectedRole = null;
            collapseMailboxList();
            roleCards.forEach(function (button) { button.classList.remove("selected"); });
            hide(roleStep);
            hide(descriptionStep);
            clearError();
            formView.hidden = false;
            loadingView.hidden = true;
            successView.hidden = true;
        }

        function submitRequest(event) {
            event.preventDefault();
            clearError();
            if (!selectedUser || !selectedUser.value) {
                showError(text().missingUser);
                if (userPickerTrigger) userPickerTrigger.focus();
                return;
            }
            var mailboxLabel = mailboxInput.value.trim();
            if (!selectedMailbox) {
                var exact = mailboxObjects.find(function (mailbox) {
                    return normalizeText(mailbox.label) === normalizeText(mailboxLabel);
                });
                if (exact) {
                    selectedMailbox = exact;
                    mailboxLabel = exact.label;
                }
            }
            if (!selectedMailbox || !selectedMailbox.key) {
                showError(text().missingMailbox);
                mailboxInput.focus();
                return;
            }
            if (!selectedRole || !selectedRole.value) {
                showError(text().missingRole);
                return;
            }

            formView.hidden = true;
            loadingView.hidden = false;
            fetch(S.base + "/plugins/servlet/supportal/api/shared-mailbox-request", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "X-Atlassian-Token": "no-check"
                },
                body: JSON.stringify({
                    requestedForUserName: selectedUser.value,
                    requestedForDisplayName: selectedUser.label || selectedUser.value,
                    mailboxObjectKey: selectedMailbox.key,
                    mailboxLabel: selectedMailbox.label || mailboxLabel,
                    mailboxRole: selectedRole.value,
                    description: description.value.trim()
                })
            }).then(function (response) {
                if (!response || !response.ok) throw new Error("Shared-mailbox submit failed");
                return response.json();
            }).then(function (created) {
                loadingView.hidden = true;
                successView.hidden = false;
                var link = byId("shared-mailbox-success-link");
                var web = created && created._links && created._links.web;
                if (web) link.href = web;
                if (created && created.issueKey) link.textContent = created.issueKey;
            }).catch(function () {
                loadingView.hidden = true;
                formView.hidden = false;
                showError(text().submitFailed);
            });
        }

        panel.classList.add("active");
        loadData().then(function () {
            setTimeout(function () { mailboxInput.focus(); renderMailboxResults(); }, 250);
        });

        if (userPickerTrigger) {
            clearUser();
            userPickerSearch.placeholder = text().userSearchPlaceholder;
            userPickerTrigger.addEventListener("click", function () {
                userPickerOpen ? closeUserPicker() : openUserPicker();
            });
            userPickerTrigger.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    userPickerOpen ? closeUserPicker() : openUserPicker();
                }
                if (event.key === "Escape") closeUserPicker();
            });
            userPickerSearch.addEventListener("input", function (event) {
                var term = event.target.value;
                userPickerClearSearch.style.display = term ? "flex" : "none";
                queryUsers(term);
            });
            userPickerClearSearch.addEventListener("mousedown", function (event) {
                event.preventDefault();
                userPickerSearch.value = "";
                userPickerClearSearch.style.display = "none";
                queryUsers("");
                userPickerSearch.focus();
            });
        }

        mailboxInput.addEventListener("input", function () {
            if (selectedMailbox && mailboxInput.value !== selectedMailbox.label) selectedMailbox = null;
            renderMailboxResults();
            if (mailboxInput.value.trim()) reveal(roleStep);
            else {
                selectedRole = null;
                roleCards.forEach(function (button) { button.classList.remove("selected"); });
                hide(roleStep);
                hide(descriptionStep);
            }
            clearError();
        });
        mailboxInput.addEventListener("focus", renderMailboxResults);
        mailboxInput.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                collapseMailboxList();
            } else if (event.key === "Enter" && !mailboxResults.hidden) {
                var first = mailboxResults.querySelector(".network-folder-path-result");
                if (first) {
                    event.preventDefault();
                    first.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
                }
            }
        });

        roleCards.forEach(function (button) {
            button.addEventListener("click", function () {
                selectedRole = { value: button.dataset.role };
                roleCards.forEach(function (candidate) {
                    candidate.classList.toggle("selected", candidate === button);
                });
                reveal(descriptionStep);
                clearError();
                setTimeout(function () {
                    descriptionStep.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }, 50);
            });
        });

        document.addEventListener("mousedown", function (event) {
            if (userPickerOpen && userPicker && !userPicker.contains(event.target)) {
                closeUserPicker();
            }
            if (!mailboxResults.contains(event.target) && event.target !== mailboxInput) {
                mailboxResults.hidden = true;
            }
        });

        form.addEventListener("submit", submitRequest);
    }

    /* ===================== Module D: granting-access timeline ===================== */
    var tlTranslations = {
        EN: {
            timelineHeading: "The standard granting access process",
            duration: "~9.39 hrs",
            start: "Start", startTime: "Immediate",
            managerApproval: "Manager Approval", managerTime: "~4 hours",
            rightsApproval: "Rights Manager Approval", rightsTime: "~4 hours",
            granting: "Access Granting", grantingTime: "~1.39 hours",
            goodToKnow: "Good to know",
            info1: "Access will be granted after approvals from your manager and the rights manager",
            info2: "Certain requests may require additional time if they fall outside the standard process",
            info3: "Make sure all required information is submitted to avoid delays"
        },
        ET: {
            timelineHeading: "Standardne ligipääsu andmise protsess",
            duration: "~9,39 tundi",
            start: "Algus", startTime: "Kohene",
            managerApproval: "Juhi kinnitus", managerTime: "~4 tundi",
            rightsApproval: "Õiguste haldaja kinnitus", rightsTime: "~4 tundi",
            granting: "Ligipääsu andmine", grantingTime: "~1,39 tundi",
            goodToKnow: "Hea teada",
            info1: "Ligipääs antakse pärast teie juhi ja õiguste haldaja kinnitusi",
            info2: "Teatud taotlused võivad vajada lisaaega, kui need jäävad standardprotsessist väljapoole",
            info3: "Veenduge, et kogu nõutud teave on esitatud viivituste vältimiseks"
        },
        RU: {
            timelineHeading: "Стандартный процесс предоставления доступа",
            duration: "~9,39 часов",
            start: "Начало", startTime: "Немедленно",
            managerApproval: "Подтверждение менеджера", managerTime: "~4 часа",
            rightsApproval: "Подтверждение менеджера прав", rightsTime: "~4 часа",
            granting: "Предоставление доступа", grantingTime: "~1,39 часа",
            goodToKnow: "Полезно знать",
            info1: "Доступ будет предоставлен после одобрения вашим менеджером и менеджером прав",
            info2: "Некоторые запросы могут потребовать дополнительного времени, если они выходят за рамки стандартного процесса",
            info3: "Убедитесь, что вся необходимая информация предоставлена, чтобы избежать задержек"
        }
    };
    var tlSteps = [
        { id: "start", icon: "pi-play", label: "Start", x: 60, y: 70, timing: "Immediate" },
        { id: "manager approval", icon: "pi-check-circle", label: "Manager Approval", x: 280, y: 70, timing: "~4 hours" },
        { id: "rights manager approval", icon: "pi-check-circle", label: "Rights Manager Approval", x: 500, y: 70, timing: "~4 hours" },
        { id: "granting", icon: "pi-plus", label: "Access Granting", x: 720, y: 70, timing: "~1.39 hours" }
    ];
    var TL_CYCLE_MS = 5000;
    var tlCanvas, tlSvg, tlDetailPanel, tlPauseBtn, tlResetBtn, tlBall;
    var tlIsPaused = false, tlStartTime = 0, tlPausedAt = null, tlInited = false;

    function tlGetStepCenter(stepId) {
        var s = tlSteps.find(function (x) { return x.id === stepId; });
        return { x: s.x, y: s.y + 24 };
    }
    function tlShowDetail(step) {
        byId("detailIcon").className = "pi " + step.icon;
        byId("detailTitle").textContent = step.label;
        byId("detailTime").textContent = step.timing;
        tlDetailPanel.classList.add("visible");
        document.querySelectorAll(".flow-step").forEach(function (el) { el.classList.remove("active"); });
        document.querySelector('[data-id="' + step.id + '"]').classList.add("active");
    }
    function tlDrawPaths() {
        tlSvg.innerHTML = "";
        for (var i = 0; i < tlSteps.length - 1; i++) {
            var from = tlGetStepCenter(tlSteps[i].id);
            var to = tlGetStepCenter(tlSteps[i + 1].id);
            var midX = (from.x + to.x) / 2;
            var controlY = from.y - 50;
            var d = `M ${from.x} ${from.y} Q ${midX} ${controlY}, ${to.x} ${to.y}`;

            var bgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            bgPath.setAttribute("d", d);
            bgPath.setAttribute("stroke", "#e2ded9");
            bgPath.setAttribute("stroke-width", "2");
            bgPath.setAttribute("fill", "none");
            bgPath.setAttribute("class", "path-line-bg");
            bgPath.dataset.index = i;
            tlSvg.appendChild(bgPath);

            var animPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            animPath.setAttribute("d", d);
            animPath.setAttribute("stroke", "#008834");
            animPath.setAttribute("stroke-width", "2");
            animPath.setAttribute("fill", "none");
            animPath.setAttribute("class", "path-line-anim");
            animPath.dataset.index = i;
            var pathLength = animPath.getTotalLength();
            animPath.setAttribute("stroke-dasharray", pathLength.toString());
            animPath.setAttribute("stroke-dashoffset", pathLength.toString());
            tlSvg.appendChild(animPath);
        }
    }
    function tlUpdateStepPositions() {
        var containerWidth = tlCanvas.offsetWidth;
        var width = containerWidth - 40;
        var isMobile = containerWidth < 500;
        if (isMobile) {
            var spacing = (width - 80) / 3;
            tlSteps[0].x = 40;
            tlSteps[1].x = 40 + spacing;
            tlSteps[2].x = 40 + spacing * 2;
            tlSteps[3].x = 40 + spacing * 3;
        } else {
            var usableWidth = Math.min(width, 760);
            var spacing2 = (usableWidth - 120) / 3;
            tlSteps[0].x = 60;
            tlSteps[1].x = 60 + spacing2;
            tlSteps[2].x = 60 + spacing2 * 2;
            tlSteps[3].x = 60 + spacing2 * 3;
        }
        document.querySelectorAll(".flow-step").forEach(function (el, idx) {
            el.style.left = tlSteps[idx].x + "px";
        });
        tlDrawPaths();
    }
    function tlMoveBall(pathIds, cycleTime) {
        var elapsed = (Date.now() - tlStartTime) % cycleTime;
        var progress = elapsed / cycleTime;
        var totalSegments = pathIds.length - 1;
        var segmentIndex = Math.floor(progress * totalSegments);
        var segmentProgress = (progress * totalSegments) % 1;

        if (progress >= 0.99) {
            document.querySelectorAll(".flow-step").forEach(function (el) { el.classList.add("completed"); });
            document.querySelectorAll(".path-line-anim").forEach(function (path) { path.setAttribute("stroke-dashoffset", "0"); });
            var lastStep = tlGetStepCenter(pathIds[pathIds.length - 1]);
            tlBall.style.left = (lastStep.x - 8) + "px";
            tlBall.style.top = (lastStep.y - 8) + "px";
            tlIsPaused = true;
            tlPauseBtn.querySelector("i").className = "pi pi-play";
            return;
        }

        document.querySelectorAll(".flow-step").forEach(function (el, index) {
            if (index <= segmentIndex) { el.classList.add("completed"); }
            else { el.classList.remove("completed"); }
        });
        document.querySelectorAll(".path-line-anim").forEach(function (path, index) {
            if (index < segmentIndex) {
                path.setAttribute("stroke-dashoffset", "0");
            } else if (index === segmentIndex) {
                var pl = path.getTotalLength();
                var offset = pl - (segmentProgress * pl);
                path.setAttribute("stroke-dasharray", pl.toString());
                path.setAttribute("stroke-dashoffset", offset.toString());
            } else {
                var pl2 = path.getTotalLength();
                path.setAttribute("stroke-dasharray", pl2.toString());
                path.setAttribute("stroke-dashoffset", pl2.toString());
            }
        });
        if (segmentIndex < totalSegments) {
            var from = tlGetStepCenter(pathIds[segmentIndex]);
            var to = tlGetStepCenter(pathIds[segmentIndex + 1]);
            var midX = (from.x + to.x) / 2;
            var controlY = from.y - 50;
            var tt = segmentProgress;
            var x = Math.pow(1 - tt, 2) * from.x + 2 * (1 - tt) * tt * midX + Math.pow(tt, 2) * to.x;
            var y = Math.pow(1 - tt, 2) * from.y + 2 * (1 - tt) * tt * controlY + Math.pow(tt, 2) * to.y;
            tlBall.style.left = (x - 8) + "px";
            tlBall.style.top = (y - 8) + "px";
        }
    }
    function tlAnimate() {
        if (!tlIsPaused) {
            tlMoveBall(["start", "manager approval", "rights manager approval", "granting"], TL_CYCLE_MS);
        }
        requestAnimationFrame(tlAnimate);
    }
    function updateAccessTimeline(lang) {
        if (!tlInited) return;
        var t = tlTranslations[lang] || tlTranslations.EN;
        var heading = document.querySelector(".timeline-heading");
        if (heading) heading.textContent = t.timelineHeading;
        var dur = document.querySelector(".timeline-duration span");
        if (dur) dur.textContent = t.duration;
        tlSteps[0].label = t.start;            tlSteps[0].timing = t.startTime;
        tlSteps[1].label = t.managerApproval;  tlSteps[1].timing = t.managerTime;
        tlSteps[2].label = t.rightsApproval;   tlSteps[2].timing = t.rightsTime;
        tlSteps[3].label = t.granting;         tlSteps[3].timing = t.grantingTime;
        document.querySelectorAll(".flow-step").forEach(function (el, idx) {
            var lbl = el.querySelector(".step-label");
            if (lbl) lbl.textContent = tlSteps[idx].label;
        });
        var gpTitle = document.querySelector(".gp-title");
        if (gpTitle) gpTitle.innerHTML = '<i class="pi pi-info-circle"></i>' + t.goodToKnow;
        var blocks = document.querySelectorAll(".gp-block p");
        if (blocks[0]) blocks[0].textContent = t.info1;
        if (blocks[1]) blocks[1].textContent = t.info2;
        if (blocks[2]) blocks[2].textContent = t.info3;
    }
    function initAccessTimeline() {
        tlCanvas = byId("canvas");
        if (!tlCanvas || tlInited) return;
        tlInited = true;
        tlSvg = byId("pathSvg");
        tlDetailPanel = byId("detailPanel");
        tlPauseBtn = byId("pauseBtn");
        tlResetBtn = byId("resetBtn");
        tlStartTime = Date.now();

        tlSteps.forEach(function (step) {
            var stepEl = document.createElement("div");
            stepEl.className = "flow-step";
            stepEl.style.left = step.x + "px";
            stepEl.style.top = step.y + "px";
            stepEl.dataset.id = step.id;
            stepEl.innerHTML =
                '<div class="step-icon"><i class="pi ' + step.icon + '"></i></div>' +
                '<div class="step-label label-small">' + step.label + '</div>';
            stepEl.addEventListener("click", function () {
                tlIsPaused = true;
                tlPausedAt = Date.now();
                tlPauseBtn.querySelector("i").className = "pi pi-play";
                tlShowDetail(step);
            });
            tlCanvas.appendChild(stepEl);
        });

        tlBall = document.createElement("div");
        tlBall.className = "moving-ball";
        tlCanvas.appendChild(tlBall);

        tlPauseBtn.addEventListener("click", function () {
            if (!tlIsPaused) {
                tlIsPaused = true;
                tlPausedAt = Date.now();
                tlPauseBtn.querySelector("i").className = "pi pi-play";
            } else {
                tlIsPaused = false;
                if (tlPausedAt !== null) { tlStartTime += Date.now() - tlPausedAt; tlPausedAt = null; }
                tlPauseBtn.querySelector("i").className = "pi pi-pause";
                tlDetailPanel.classList.remove("visible");
                document.querySelectorAll(".flow-step").forEach(function (el) { el.classList.remove("active"); });
            }
        });
        tlResetBtn.addEventListener("click", function () {
            tlStartTime = Date.now();
            tlPausedAt = null;
            tlIsPaused = false;
            tlPauseBtn.querySelector("i").className = "pi pi-pause";
            tlDetailPanel.classList.remove("visible");
            document.querySelectorAll(".flow-step").forEach(function (el) {
                el.classList.remove("active");
                el.classList.remove("completed");
            });
            document.querySelectorAll(".path-line-anim").forEach(function (path) {
                var pl = path.getTotalLength();
                path.setAttribute("stroke-dashoffset", pl.toString());
            });
        });

        tlDrawPaths();
        tlUpdateStepPositions();
        window.addEventListener("resize", tlUpdateStepPositions);
        tlAnimate();

        updateAccessTimeline(S.lang);  /* localize labels just built in EN */
    }


    S.registerLocalizer(renderAccessIntro);
    S.registerLocalizer(updateAccessTimeline);
    S.registerInit(initNetworkFolderRequest);
    S.registerInit(initSharedMailboxRequest);
    S.registerInit(initAccessTimeline);
})(window.Supportal);
