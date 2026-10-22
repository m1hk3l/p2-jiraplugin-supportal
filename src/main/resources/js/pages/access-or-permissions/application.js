/* ============================================================================
 *  pages/access-or-permissions/application.js — the application catalogue (access-or-permissions/
 *  application): Insight-backed app grid, Jira user picker, AD-group picker, and
 *  the access-request form. Guarded by #applications-grid. Registers its own
 *  localizer with the shared language lifecycle from inside initAppCatalog.
 *  NOTE: migration candidate #1 to a React island (ARCHITECTURE §7).
 * ========================================================================== */
(function (S) {
    "use strict";
    var SUPPORTAL_BASE = S.base;
    var showJiraPopup = S.showJiraPopup;

    /* ===================================================================
       Application catalog widget (access-or-permissions/application page).
       Stateful + behaviour-heavy, so it stays JS-driven (like the feedback
       form) rather than declarative. TOKENLESS: every request rides the
       logged-in user's Jira session via credentials:"include" and is routed
       through SUPPORTAL_BASE (no host, no Authorization header). The shared
       showJiraPopup handles the "other access" link; the shared language
       lifecycle (S.registerLocalizer) drives re-localising.
       =================================================================== */
    function initAppCatalog() {
        const grid = document.getElementById('applications-grid');
        if (!grid) return;                       /* only on the application page */

        const searchInput  = document.getElementById('app-search');
        const resultsCount = document.getElementById('results-count');
        const panel        = document.getElementById('app-detail-panel');
        const panelClose   = panel.querySelector('.app-detail-panel-close');
        const detailTitle  = panel.querySelector('.app-detail-title');
        const formView     = document.getElementById('form-view');
        const loadingView  = document.getElementById('loading-view');
        const successView  = document.getElementById('success-view');
        const errorView    = document.getElementById('error-view');
        const successSubtextLabel = document.getElementById('success-subtext-label');
        const successLink = document.getElementById('success-link');
        const successCreatedSubtext = document.getElementById('success-created-subtext');
        const successCreatedLabel = document.getElementById('success-created-label');
        const successCreatedLink = document.getElementById('success-created-link');
        const accessForm   = document.getElementById('access-form');
        const submitAddBtn = document.getElementById('submit-add-btn');
        const retryBtn     = document.getElementById('retry-btn');
        const userSelect   = document.getElementById('user-select');
        const picker       = document.getElementById('user-picker');
        const pickerTrigger = document.getElementById('user-picker-trigger');
        const pickerSearch = document.getElementById('user-picker-search');
        const pickerList   = document.getElementById('user-picker-list');
        const pickerValue  = document.getElementById('user-picker-value');
        const pickerArrow  = document.getElementById('user-picker-arrow');
        const pickerClearSearch = document.getElementById('user-picker-clear-search');

        /* AD-group picker elements (mirrors the user picker) */
        const adPicker        = document.getElementById('adgroup-picker');
        const adPickerTrigger = document.getElementById('adgroup-picker-trigger');
        const adPickerSearch  = document.getElementById('adgroup-picker-search');
        const adPickerList    = document.getElementById('adgroup-picker-list');
        const adPickerValue   = document.getElementById('adgroup-picker-value');
        const adPickerArrow   = document.getElementById('adgroup-picker-arrow');
        const adPickerClearSearch = document.getElementById('adgroup-picker-clear-search');
        const adSelect        = document.getElementById('adgroup-select');
        const adHint          = document.getElementById('adgroup-hint');

        let allApps = [], insightUsers = [], currentApp = null, selectedUser = null, pickerOpen = false;
        let listedUsers = [], userReqToken = 0, userSearchTimer = null;
        let adGroups = [], selectedAdGroup = null, adPickerOpen = false, adEnabled = false, adReqToken = 0;
        let createdIssue = null;
        let catLang = S.lang;               /* synced from the shared switcher */

        /* ---------------------------------------------------------------
           Insight coordinates, by NAME.

           Insight object-schema ids, object-type ids and attribute ids are
           per-instance autoincrement values: the same schema imported into
           another environment gets entirely different numbers (local id=1
           vs dev id=11, typeId 13 vs 349, and so on). Hardcoding them means
           the page works in exactly one environment.

           Everything below is therefore expressed with the human-readable
           names, which the import preserves, and resolved to ids at runtime
           against whatever instance we happen to be running on.
           --------------------------------------------------------------- */
        const INSIGHT = {
            schema:          'Public schema',            /* was objectSchemaId 11 */
            typeUser:        'User',                     /* AD-imported users */
            typeApplication: 'Application',              /* was objectTypeId 262  */
            attrEmail:       'E-mail',
            attrItoKey:      'ITO Schema object key',    /* was attribute 2970    */
            attrDescription: 'Description'               /* was attribute 1315 -- which does not
                                                            exist on Application; the real
                                                            description attribute is 4057, so the
                                                            description panel was silently blank */
        };

        /* AD groups live in an Insight object type that is a CHILD of the
           Application type and carries the same name as the application it
           belongs to: the application "GitHub" (an object of type Application)
           has its groups in a child object type also called "GitHub".

           So there is no mapping table to maintain -- the application's own
           label is the object type name. Applications with no such child type
           simply return no objects, and the picker is disabled for them, which
           is the same outcome the old hand-maintained table produced for any
           application it did not list.

           NOTE: `objectType = "..."` matches the named type exactly and does not
           descend into child types, so querying the applications themselves is
           unaffected by these children. */
        const resolveAdGroupTypeName = (app) => (app && app.label) ? app.label : null;


        /* Fetch Insight objects by schema + object type NAME. includeTypeAttributes
           returns the objectTypeAttributes block, from which attribute names are
           mapped to this instance's attribute ids. */
        const fetchInsight = async (typeName, perPage) => {
            /* type names come from object labels, so escape quotes/backslashes
               before embedding them in a quoted IQL string */
            const iqlQuote = (v) => String(v).replace(/[\\"]/g, '\\$&');
            const iql = `objectSchema = "${iqlQuote(INSIGHT.schema)}" AND objectType = "${iqlQuote(typeName)}"`;
            const url = SUPPORTAL_BASE + '/rest/insight/1.0/iql/objects'
                + '?iql=' + encodeURIComponent(iql)
                + '&resultPerPage=' + perPage
                + '&includeAttributes=true&includeTypeAttributes=true';
            const res = await fetch(url, {
                method: 'GET', credentials: 'include', headers: { 'Accept': 'application/json' }
            });
            if (!res.ok) throw new Error('Insight query failed: ' + res.status);
            return res.json();
        };

        /* attribute name -> objectTypeAttributeId, built from the response itself */
        const attrIdMap = (data) => {
            const map = {};
            (data.objectTypeAttributes || []).forEach(a => { map[a.name] = a.id; });
            return map;
        };

        /* attribute id maps populated from the corresponding Insight responses */
        let appAttrIds = {}, userAttrIds = {};

        const translations = {
            EN: { title:'Applications', searchPlaceholder:'Search applications...', loading:'Loading applications...',
                applicationsCount: n => `${n} application${n === 1 ? '' : 's'}`, noResults:'No matching applications found',
                noApplications:'No applications found', errorLoading:'Failed to load applications. Please try again.',
                errorText:'Error loading', otherAccessText:"Don't see what you're looking for?",
                otherAccessLink:'Request other access or permissions', jiraSummaryAdd:'Add access to', jiraSummaryRemove:'Remove access to',
                labelDescription:'Description', labelUser:'User', labelBusinessReason:'Business reason and comments',
                userPlaceholder:'Select user...', userSearchPlaceholder:'Search user...', usersLoading:'Loading users...',
                usersLoadFailed:'Failed to load users', usersNotFound:'No users found', usersTypeToSearch:'Type to search users...',
                businessReasonPlaceholder:'Describe the reason...',
                submitAdd:'Request Add Access', submitDelete:'Request Delete Access', submitRequest:'Submit request', submitting:'Submitting request...',
                successText:'Request submitted successfully.', successSubtext:'You can view your open requests here:',
                successCreatedIssue:'Created issue key is',
                successLink:'My open requests', errorText2:'Failed to submit request.',
                errorSubtext:'Please try again later or contact the IT team.', retryBtn:'Try again', noDescription:'No description available',
                labelAdGroup:'AD group', adGroupPlaceholder:'Select AD group...', adGroupSearchPlaceholder:'Search AD group...',
                adGroupLoading:'Loading AD groups...', adGroupsNotFound:'No AD groups found', adGroupsLoadFailed:'Failed to load AD groups',
                adGroupUnavailable:'No AD groups for this application', adGroupNoSchema:'This application does not have AD groups defined in the schema.' },
            ET: { title:'Rakendused', searchPlaceholder:'Otsi rakendusi...', loading:'Laadin rakendusi...',
                applicationsCount: n => `${n} rakendus${n === 1 ? '' : 't'}`, noResults:'Vastavaid rakendusi ei leitud',
                noApplications:'Rakendusi ei leitud', errorLoading:'Rakenduste laadimine ebaõnnestus. Palun proovi uuesti.',
                errorText:'Viga laadimisel', otherAccessText:'Ei leia seda, mida otsite?',
                otherAccessLink:'Taotle muud juurdepääsu või õigusi', jiraSummaryAdd:'Lisa juurdepääs', jiraSummaryRemove:'Eemalda juurdepääs',
                labelDescription:'Kirjeldus', labelUser:'Kasutaja', labelBusinessReason:'Äriline põhjus ja kommentaarid',
                userPlaceholder:'Vali kasutaja...', userSearchPlaceholder:'Otsi kasutajat...', usersLoading:'Laadin kasutajaid...',
                usersLoadFailed:'Kasutajate laadimine ebaõnnestus', usersNotFound:'Kasutajaid ei leitud', usersTypeToSearch:'Alusta kasutaja otsingut...',
                businessReasonPlaceholder:'Kirjeldage põhjus...',
                submitAdd:'Taotle juurdepääsu lisamist', submitDelete:'Taotle juurdepääsu eemaldamist', submitRequest:'Esita taotlus', submitting:'Pöördumine esitatakse...',
                successText:'Pöördumine on edukalt esitatud.', successSubtext:'Oma avatud pöördumisi saab vaadata siit:',
                successCreatedIssue:'Loodud pöördumise võti on',
                successLink:'Minu avatud pöördumised', errorText2:'Pöördumise esitamine ebaõnnestus.',
                errorSubtext:'Palun proovige hiljem uuesti või võtke ühendust ITabi meeskonnaga.', retryBtn:'Proovi uuesti', noDescription:'Kirjeldus puudub',
                labelAdGroup:'AD grupp', adGroupPlaceholder:'Vali AD grupp...', adGroupSearchPlaceholder:'Otsi AD gruppi...',
                adGroupLoading:'Laadin AD gruppe...', adGroupsNotFound:'AD gruppe ei leitud', adGroupsLoadFailed:'AD gruppide laadimine ebaõnnestus',
                adGroupUnavailable:'Sellel rakendusel pole AD gruppe', adGroupNoSchema:'Sellel rakendusel ei ole skeemis määratud AD gruppe.' },
            RU: { title:'Приложения', searchPlaceholder:'Поиск приложений...', loading:'Загрузка приложений...',
                applicationsCount: n => `${n} приложени${n === 1 ? 'е' : n < 5 ? 'я' : 'й'}`, noResults:'Соответствующие приложения не найдены',
                noApplications:'Приложения не найдены', errorLoading:'Не удалось загрузить приложения. Пожалуйста, попробуйте снова.',
                errorText:'Ошибка загрузки', otherAccessText:'Не нашли то, что ищете?',
                otherAccessLink:'Запросить другой доступ или разрешения', jiraSummaryAdd:'Добавить доступ к', jiraSummaryRemove:'Удалить доступ к',
                labelDescription:'Описание', labelUser:'Пользователь', labelBusinessReason:'Бизнес-причина и комментарии',
                userPlaceholder:'Выберите пользователя...', userSearchPlaceholder:'Поиск пользователя...', usersLoading:'Загрузка пользователей...',
                usersLoadFailed:'Не удалось загрузить пользователей', usersNotFound:'Пользователи не найдены', usersTypeToSearch:'Начните вводить имя пользователя...',
                businessReasonPlaceholder:'Опишите причину...',
                submitAdd:'Запросить добавление доступа', submitDelete:'Запросить удаление доступа', submitRequest:'Отправить запрос', submitting:'Отправка запроса...',
                successText:'Запрос успешно отправлен.', successSubtext:'Ваши открытые запросы можно просмотреть здесь:',
                successCreatedIssue:'Ключ созданного запроса',
                successLink:'Мои открытые запросы', errorText2:'Не удалось отправить запрос.',
                errorSubtext:'Пожалуйста, попробуйте позже или обратитесь в IT-команду.', retryBtn:'Попробовать снова', noDescription:'Описание недоступно',
                labelAdGroup:'AD группа', adGroupPlaceholder:'Выберите AD группу...', adGroupSearchPlaceholder:'Поиск AD группы...',
                adGroupLoading:'Загрузка AD групп...', adGroupsNotFound:'AD группы не найдены', adGroupsLoadFailed:'Не удалось загрузить AD группы',
                adGroupUnavailable:'Нет AD групп для этого приложения', adGroupNoSchema:'Для этого приложения в схеме не определены AD группы.' }
        };

        const renderSuccessLinks = () => {
            const t = translations[catLang] || translations.EN;
            successSubtextLabel.textContent = t.successSubtext;
            successLink.textContent = t.successLink;
            successLink.href = SUPPORTAL_BASE + '/plugins/servlet/supportal';
            if (createdIssue && createdIssue.key && createdIssue.url) {
                successCreatedLabel.textContent = t.successCreatedIssue;
                successCreatedLink.textContent = createdIssue.key;
                successCreatedLink.href = createdIssue.url;
                successCreatedSubtext.style.display = '';
            } else {
                successCreatedLink.textContent = '';
                successCreatedLink.removeAttribute('href');
                successCreatedSubtext.style.display = 'none';
            }
        };

        const extractIssueKey = (created) => {
            if (!created || typeof created !== 'object') return '';
            if (created.issueKey) return String(created.issueKey);
            if (created.key) return String(created.key);
            const links = created._links || {};
            const web = typeof links.web === 'string' ? links.web : '';
            const jiraRest = typeof links.jiraRest === 'string' ? links.jiraRest : '';
            const source = web || jiraRest;
            const match = source.match(/([A-Z][A-Z0-9_]+-\d+)(?:[/?#]|$)/);
            return match ? match[1] : '';
        };

        const updateTexts = (lang) => {
            const t = translations[lang] || translations.EN;
            document.getElementById('app-title').textContent = t.title;
            searchInput.placeholder = t.searchPlaceholder;
            document.getElementById('loading-text').textContent = t.loading;
            document.getElementById('other-access-text').textContent = t.otherAccessText;
            document.getElementById('other-access-link').textContent = t.otherAccessLink;
            document.getElementById('label-description').innerHTML = t.labelDescription;
            document.getElementById('label-user').innerHTML = `${t.labelUser} <span class="required">*</span>`;
            document.getElementById('label-business-reason').innerHTML = `${t.labelBusinessReason} <span class="required">*</span>`;
            document.getElementById('user-picker-value').textContent = selectedUser ? selectedUser.label : t.userPlaceholder;
            pickerSearch.placeholder = t.userSearchPlaceholder;
            document.getElementById('label-adgroup').innerHTML = `${t.labelAdGroup} <span class="required">*</span>`;
            if (!selectedAdGroup && !adPickerValue.classList.contains('selected')) {
                adPickerValue.textContent = adEnabled ? t.adGroupPlaceholder : (adPickerValue.textContent || t.adGroupPlaceholder);
            }
            adPickerSearch.placeholder = t.adGroupSearchPlaceholder;
            document.getElementById('business-reason').placeholder = t.businessReasonPlaceholder;
            submitAddBtn.textContent = t.submitRequest;
            document.getElementById('submit-loading-text').textContent = t.submitting;
            document.getElementById('success-text').textContent = t.successText;
            renderSuccessLinks();
            document.getElementById('error-text').textContent = t.errorText2;
            document.getElementById('error-subtext').textContent = t.errorSubtext;
            document.getElementById('retry-btn').textContent = t.retryBtn;
            const usersLoadingText = document.getElementById('users-loading-text');
            if (usersLoadingText) usersLoadingText.textContent = t.usersLoading;
            const usersTypeToSearch = document.getElementById('users-type-to-search');
            if (usersTypeToSearch) usersTypeToSearch.textContent = t.usersTypeToSearch;
        };

        const normalizeText = t => t
            ? t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
                .replace(/[üÜ]/g,'u').replace(/[öÖ]/g,'o').replace(/[äÄ]/g,'a')
                .replace(/[õÕ]/g,'o').replace(/[šŠ]/g,'s').replace(/[žŽ]/g,'z')
            : '';

        const getAllAttributeValues = (app, attrId) => {
            if (!app || !app.attributes) return '';
            const attr = app.attributes.find(a => a.objectTypeAttributeId === attrId);
            if (!attr || !attr.objectAttributeValues) return '';
            return attr.objectAttributeValues.map(v => v.value || v.displayValue || '').filter(Boolean).join(', ');
        };

        /* Read an attribute by NAME, resolving it through the id map captured
           from the same response the object came from. */
        const getAttrByName = (obj, idMap, attrName) => {
            const id = idMap[attrName];
            if (id == null) return '';
            return getAllAttributeValues(obj, id);
        };

        /* The detail form is an inline panel that expands beneath the grid
           (no popup): opening it reveals the panel and smooth-scrolls it into
           view; closing collapses it and clears the selected-card highlight. */
        let selectedCard = null;
        const setSelectedCard = (card) => {
            if (selectedCard && selectedCard !== card) selectedCard.classList.remove('selected');
            selectedCard = card || null;
            if (selectedCard) selectedCard.classList.add('selected');
        };
        const openPanel = () => {
            panel.hidden = false;
            requestAnimationFrame(() => {
                panel.classList.add('active');
                panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        };
        const closePanel = () => {
            panel.classList.remove('active');
            setTimeout(() => {
                panel.hidden = true;
                createdIssue = null;
                renderSuccessLinks();
                showFormView(); accessForm.reset(); clearUser(); clearAdGroup(); closePicker(); closeAdPicker();
            }, 250);
            setSelectedCard(null);
        };
        const showFormView    = () => { formView.style.display='block'; loadingView.style.display='none'; successView.style.display='none'; errorView.style.display='none'; };
        const showLoadingView = () => { formView.style.display='none'; loadingView.style.display='block'; successView.style.display='none'; errorView.style.display='none'; };
        const showSuccessView = () => { formView.style.display='none'; loadingView.style.display='none'; successView.style.display='block'; errorView.style.display='none'; };
        const showErrorView   = () => { formView.style.display='none'; loadingView.style.display='none'; successView.style.display='none'; errorView.style.display='block'; };

        panelClose.onclick = closePanel;
        window.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('active')) closePanel(); });
        retryBtn.onclick = showFormView;

        const openAppModal = (app, card) => {
            const t = translations[catLang] || translations.EN;
            currentApp = app;
            setSelectedCard(card);
            detailTitle.textContent = app.label || '';
            const descSection = document.getElementById('description-section');
            const descEl = document.getElementById('form-description');
            const description = getAttrByName(app, appAttrIds, INSIGHT.attrDescription);
            descEl.textContent = description || t.noDescription;
            descSection.style.display = 'block';
            /* clean slate when switching between applications inline */
            accessForm.reset();
            createdIssue = null;
            renderSuccessLinks();
            clearUser();
            clearAdGroup();
            closePicker();
            closeAdPicker();
            loadAdGroupsForApp(app);
            showFormView();
            openPanel();
        };

        const USER_SEARCH_MIN = 2;

        const escapeHtml = (s) => String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');

        /* Directory search goes through SupportalServlet (/api/users), not
           Jira's /rest/api/2/user/* browser endpoints. */
        const searchJiraUsers = async (query) => {
            const q = encodeURIComponent(query);
            const res = await fetch(
                SUPPORTAL_BASE
                    + '/plugins/servlet/supportal/api/users?query='
                    + q,
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );
            if (!res.ok) {
                throw new Error('Supportal user search failed: ' + res.status);
            }
            const arr = await res.json();
            return (Array.isArray(arr) ? arr : [])
                .map(u => {
                    const name = u && u.name;
                    if (!name) {
                        return null;
                    }
                    return {
                        value: name,
                        label: u.displayName || name,
                        sub: u.emailAddress || name
                    };
                })
                .filter(Boolean);
        };

        /* AD-imported people historically came from the Public schema's User
           objects, while MidPoint provisions Jira users directly. Merge both
           sources so neither provisioning path disappears from the picker.
           Jira results win duplicate usernames because Jira is authoritative
           for the value submitted to JSM. */
        const searchAllUsers = async (query) => {
            let jiraUsers = [];
            let jiraError = null;
            try {
                jiraUsers = await searchJiraUsers(query);
            } catch (e) {
                jiraError = e;
            }

            const term = normalizeText(query);
            const matchingInsightUsers = insightUsers.filter(u =>
                normalizeText(u.value).includes(term)
                || normalizeText(u.label).includes(term)
                || normalizeText(u.sub).includes(term)
            );
            if (jiraError && !matchingInsightUsers.length) {
                throw jiraError;
            }

            const byUsername = new Map();
            matchingInsightUsers.forEach(u => byUsername.set(u.value.toLowerCase(), u));
            jiraUsers.forEach(u => byUsername.set(u.value.toLowerCase(), u));
            return Array.from(byUsername.values())
                .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
        };

        const showUserPickerMessage = (html) => { pickerList.innerHTML = html; };
        const showUserPrompt = () => {
            const t = translations[catLang] || translations.EN;
            showUserPickerMessage(`<div class="user-picker-empty"><i class="pi pi-search" style="font-size:20px;opacity:0.3;margin-bottom:8px;display:block;"></i><span id="users-type-to-search">${t.usersTypeToSearch}</span></div>`);
        };
        const showUserLoading = () => {
            const t = translations[catLang] || translations.EN;
            showUserPickerMessage(`<div class="user-picker-loading"><div class="user-picker-spinner"></div><span id="users-loading-text">${t.usersLoading}</span></div>`);
        };

        const openPicker = () => {
            pickerOpen = true; picker.classList.add('open'); pickerArrow.style.transform = 'rotate(180deg)';
            pickerSearch.value = ''; pickerClearSearch.style.display = 'none';
            listedUsers = [];
            if (userSearchTimer) clearTimeout(userSearchTimer);
            ++userReqToken;
            showUserPrompt();
            setTimeout(() => pickerSearch.focus(), 50);
        };
        const closePicker = () => { pickerOpen = false; picker.classList.remove('open'); pickerArrow.style.transform = ''; };
        const selectUser = (value, label) => {
            selectedUser = { value, label }; userSelect.value = value; pickerValue.textContent = label;
            pickerValue.classList.add('selected'); pickerTrigger.classList.add('has-value'); closePicker();
        };
        const clearUser = () => {
            selectedUser = null; userSelect.value = '';
            const t = translations[catLang] || translations.EN;
            pickerValue.textContent = t.userPlaceholder; pickerValue.classList.remove('selected'); pickerTrigger.classList.remove('has-value');
        };
        const highlightMatch = (text, term) => {
            if (!term) return text;
            const idx = normalizeText(text).indexOf(normalizeText(term));
            if (idx === -1) return text;
            return text.slice(0, idx) + '<mark>' + text.slice(idx, idx + term.length) + '</mark>' + text.slice(idx + term.length);
        };
        const renderUserList = (term) => {
            const t = translations[catLang] || translations.EN;
            if (!listedUsers.length) {
                showUserPickerMessage(`<div class="user-picker-empty"><i class="pi pi-search" style="font-size:20px;opacity:0.3;margin-bottom:8px;display:block;"></i>${t.usersNotFound}</div>`);
                return;
            }
            pickerList.innerHTML = listedUsers.map(u => {
                const label = escapeHtml(u.label);
                const sub = escapeHtml(u.sub || u.value);
                const value = escapeHtml(u.value);
                const initial = (u.label || u.value).charAt(0).toUpperCase();
                return `
            <div class="user-picker-item ${selectedUser && selectedUser.value === u.value ? 'active' : ''}" data-value="${value}" data-label="${label}">
              <span class="user-picker-item-avatar">${escapeHtml(initial)}</span>
              <span class="user-picker-item-text">
                <span class="user-picker-item-name">${highlightMatch(label, term)}</span>
                <span class="user-picker-item-sub">${highlightMatch(sub, term)}</span>
              </span>
              ${selectedUser && selectedUser.value === u.value ? '<i class="pi pi-check user-picker-item-check"></i>' : ''}
            </div>`;
            }).join('');
            pickerList.querySelectorAll('.user-picker-item').forEach(el => {
                el.addEventListener('mousedown', e => { e.preventDefault(); selectUser(el.dataset.value, el.dataset.label); });
            });
        };
        const queryUsers = (term) => {
            const q = (term || '').trim();
            if (userSearchTimer) clearTimeout(userSearchTimer);
            if (q.length < USER_SEARCH_MIN) {
                listedUsers = [];
                ++userReqToken;
                showUserPrompt();
                return;
            }
            const token = ++userReqToken;
            showUserLoading();
            userSearchTimer = setTimeout(() => {
                searchAllUsers(q).then(users => {
                    if (token !== userReqToken) return;
                    listedUsers = users;
                    renderUserList(q);
                }).catch(() => {
                    if (token !== userReqToken) return;
                    listedUsers = [];
                    const t = translations[catLang] || translations.EN;
                    showUserPickerMessage(`<div class="user-picker-empty" style="color:#8d575a;">${t.usersLoadFailed}</div>`);
                });
            }, 200);
        };

        pickerTrigger.addEventListener('click', () => pickerOpen ? closePicker() : openPicker());
        pickerTrigger.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickerOpen ? closePicker() : openPicker(); }
            if (e.key === 'Escape') closePicker();
        });
        pickerSearch.addEventListener('input', e => {
            const term = e.target.value;
            pickerClearSearch.style.display = term ? 'flex' : 'none';
            queryUsers(term);
        });
        pickerClearSearch.addEventListener('mousedown', e => {
            e.preventDefault(); pickerSearch.value = ''; pickerClearSearch.style.display = 'none';
            queryUsers(''); pickerSearch.focus();
        });
        document.addEventListener('mousedown', e => { if (pickerOpen && !picker.contains(e.target)) closePicker(); });

        /* ---------------------------------------------------------------
           AD-group picker. The list of groups depends on the application:
           each mapped application has an Insight object type (schema 11)
           holding its groups, fetched on demand when the panel opens. If
           the application is not mapped, the picker is disabled and greyed,
           with a note that the stakeholder has not provided AD groups.
           --------------------------------------------------------------- */
        const setAdEnabled = (on) => {
            adEnabled = on;
            adPicker.classList.toggle('disabled', !on);
            adPickerTrigger.setAttribute('tabindex', on ? '0' : '-1');
        };
        const openAdPicker = () => {
            if (!adEnabled) return;
            adPickerOpen = true; adPicker.classList.add('open'); adPickerArrow.style.transform = 'rotate(180deg)';
            adPickerSearch.value = ''; adPickerClearSearch.style.display = 'none'; renderAdGroupList(''); setTimeout(() => adPickerSearch.focus(), 50);
        };
        const closeAdPicker = () => { adPickerOpen = false; adPicker.classList.remove('open'); adPickerArrow.style.transform = ''; };
        const selectAdGroup = (value, label) => {
            selectedAdGroup = { value, label }; adSelect.value = value; adPickerValue.textContent = label;
            adPickerValue.classList.add('selected'); adPickerTrigger.classList.add('has-value'); closeAdPicker();
        };
        const clearAdGroup = () => {
            selectedAdGroup = null; adSelect.value = '';
            const t = translations[catLang] || translations.EN;
            adPickerValue.textContent = t.adGroupPlaceholder; adPickerValue.classList.remove('selected'); adPickerTrigger.classList.remove('has-value');
        };
        const renderAdGroupList = (term) => {
            const t = translations[catLang] || translations.EN;
            const filtered = term ? adGroups.filter(g => normalizeText(g.label).includes(normalizeText(term))) : adGroups;
            if (!filtered.length) {
                adPickerList.innerHTML = `<div class="user-picker-empty"><i class="pi pi-search" style="font-size:20px;opacity:0.3;margin-bottom:8px;display:block;"></i>${t.adGroupsNotFound}</div>`;
                return;
            }
            adPickerList.innerHTML = filtered.map(g => `
            <div class="user-picker-item ${selectedAdGroup && selectedAdGroup.value === g.value ? 'active' : ''}" data-value="${g.value.replace(/"/g,'&quot;')}" data-label="${g.label.replace(/"/g,'&quot;')}">
              <span class="user-picker-item-avatar"><i class="pi pi-users" style="font-size:12px;"></i></span>
              <span class="user-picker-item-name">${highlightMatch(g.label, term)}</span>
              ${selectedAdGroup && selectedAdGroup.value === g.value ? '<i class="pi pi-check user-picker-item-check"></i>' : ''}
            </div>`).join('');
            adPickerList.querySelectorAll('.user-picker-item').forEach(el => {
                el.addEventListener('mousedown', e => { e.preventDefault(); selectAdGroup(el.dataset.value, el.dataset.label); });
            });
        };

        /* Fetch the AD-group objects for an application from Insight, reusing
           the same IQL endpoint and session as the application list. Guarded
           by a request token so a slow response for a previously-selected app
           cannot overwrite the list for the one now open. */
        const loadAdGroupsForApp = async (app) => {
            const t = translations[catLang] || translations.EN;
            adGroups = [];
            const typeName = resolveAdGroupTypeName(app);
            if (!typeName) {
                setAdEnabled(false);
                adPickerValue.textContent = t.adGroupUnavailable;
                adHint.textContent = t.adGroupNoSchema;
                adHint.style.display = 'block';
                adPickerList.innerHTML = '';
                return;
            }
            adHint.style.display = 'none';
            setAdEnabled(true);
            adPickerValue.textContent = t.adGroupLoading;
            adPickerList.innerHTML = `<div class="user-picker-loading"><div class="user-picker-spinner"></div><span>${t.adGroupLoading}</span></div>`;
            const token = ++adReqToken;
            try {
                const d = await fetchInsight(typeName, 2000);
                if (token !== adReqToken) return;   /* a newer app was opened */
                adGroups = (d.objectEntries || []).map(o => ({ value: o.objectKey || o.label, label: o.label })).filter(g => g.value && g.label);
                /* No child object type for this application, or one that is empty:
                   there are no groups to choose, so disable the field rather than
                   leaving an enabled picker the user cannot satisfy. */
                if (!adGroups.length) {
                    setAdEnabled(false);
                    adPickerValue.textContent = t.adGroupUnavailable;
                    adHint.textContent = t.adGroupNoSchema;
                    adHint.style.display = 'block';
                    adPickerList.innerHTML = '';
                    return;
                }
                adPickerValue.textContent = t.adGroupPlaceholder;
                renderAdGroupList('');
            } catch (e) {
                if (token !== adReqToken) return;
                setAdEnabled(false);
                adPickerValue.textContent = t.adGroupUnavailable;
                adPickerList.innerHTML = `<div class="user-picker-empty" style="color:#8d575a;">${t.adGroupsLoadFailed}</div>`;
            }
        };

        adPickerTrigger.addEventListener('click', () => { if (!adEnabled) return; adPickerOpen ? closeAdPicker() : openAdPicker(); });
        adPickerTrigger.addEventListener('keydown', e => {
            if (!adEnabled) return;
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); adPickerOpen ? closeAdPicker() : openAdPicker(); }
            if (e.key === 'Escape') closeAdPicker();
        });
        adPickerSearch.addEventListener('input', e => { const term = e.target.value; adPickerClearSearch.style.display = term ? 'flex' : 'none'; renderAdGroupList(term); });
        adPickerClearSearch.addEventListener('mousedown', e => { e.preventDefault(); adPickerSearch.value=''; adPickerClearSearch.style.display='none'; renderAdGroupList(''); adPickerSearch.focus(); });
        document.addEventListener('mousedown', e => { if (adPickerOpen && !adPicker.contains(e.target)) closeAdPicker(); });

        /* ---------------------------------------------------------------
           Carousel of applications. Instead of a full grid of all 605
           applications, the page shows a single row of three cards that
           the user can page through horizontally. Its purpose is to hint
           "there's a large catalogue here -- just type to find yours",
           so the same track filters live as the user types in the search
           bar above. The track (#applications-grid) is a horizontal flex
           strip; the two chevron buttons (added lazily below) page it by
           whole views. renderApps() rebuilds the cards; syncCarousel()
           keeps the arrows enabled/disabled against scroll position.
           --------------------------------------------------------------- */
        let carouselPrevBtn = null, carouselNextBtn = null;

        /* Lazily wrap the track in a viewport + prev/next chevrons the first
           time we render. Kept in JS (no application.vm in this archive) so
           the widget stays self-contained. */
        function ensureCarouselControls() {
            if (carouselPrevBtn && carouselNextBtn) return;
            const viewport = grid.parentElement;           /* .app-grid-container */
            if (!viewport) return;
            viewport.classList.add('app-carousel-viewport');

            carouselPrevBtn = document.createElement('button');
            carouselPrevBtn.type = 'button';
            carouselPrevBtn.className = 'app-carousel-nav app-carousel-prev';
            carouselPrevBtn.setAttribute('aria-label', 'Previous');
            carouselPrevBtn.innerHTML = '<i class="pi pi-chevron-left"></i>';

            carouselNextBtn = document.createElement('button');
            carouselNextBtn.type = 'button';
            carouselNextBtn.className = 'app-carousel-nav app-carousel-next';
            carouselNextBtn.setAttribute('aria-label', 'Next');
            carouselNextBtn.innerHTML = '<i class="pi pi-chevron-right"></i>';

            const pageBy = dir => {
                /* advance by one "view" (three cards) minus a hair so a
                   partially-shown card doesn't get stranded */
                const step = Math.max(grid.clientWidth * 0.9, 240);
                grid.scrollBy({ left: dir * step, behavior: 'smooth' });
            };
            carouselPrevBtn.addEventListener('click', () => pageBy(-1));
            carouselNextBtn.addEventListener('click', () => pageBy(1));
            grid.addEventListener('scroll', syncCarousel, { passive: true });
            window.addEventListener('resize', syncCarousel);

            viewport.appendChild(carouselPrevBtn);
            viewport.appendChild(carouselNextBtn);
        }

        /* Enable/disable chevrons and hide them entirely when everything
           already fits (no overflow to page through). */
        function syncCarousel() {
            if (!carouselPrevBtn || !carouselNextBtn) return;
            const maxScroll = grid.scrollWidth - grid.clientWidth;
            const overflowing = maxScroll > 4;
            carouselPrevBtn.style.display = overflowing ? '' : 'none';
            carouselNextBtn.style.display = overflowing ? '' : 'none';
            carouselPrevBtn.disabled = grid.scrollLeft <= 2;
            carouselNextBtn.disabled = grid.scrollLeft >= maxScroll - 2;
        }

        function renderApps(items) {
            const t = translations[catLang] || translations.EN;
            resultsCount.textContent = t.applicationsCount(items.length);
            if (!items.length) { grid.innerHTML = `<div class="app-empty-state">${t.noApplications}</div>`; syncCarousel(); return; }
            ensureCarouselControls();
            grid.innerHTML = '';
            grid.scrollLeft = 0;
            items.forEach(app => {
                const card = document.createElement('a');
                card.className = 'app-card';
                card.href = '#';
                card.innerHTML = `<div class="app-icon"><i class="pi pi-th-large"></i></div><span class="app-name">${app.label}</span>`;
                card.onclick = e => { e.preventDefault(); openAppModal(app, card); };
                /* keep the highlight on the open application after a re-render */
                if (!panel.hidden && currentApp && currentApp.id === app.id) { selectedCard = card; card.classList.add('selected'); }
                grid.appendChild(card);
            });
            /* let layout settle before measuring overflow */
            requestAnimationFrame(syncCarousel);
        }

        searchInput.addEventListener('input', e => {
            const term = normalizeText(e.target.value);
            renderApps(allApps.filter(a => normalizeText(a.label).includes(term)));
        });

        const submitRequest = async () => {
            const username = userSelect.value;
            const reasonInput = document.getElementById('business-reason');
            const reason   = reasonInput.value.trim();
            const appId    = currentApp && currentApp.id;
            if (!username || !appId) { showErrorView(); return; }
            /* When the application has an AD-group schema, a group must be chosen. */
            if (adEnabled && !adSelect.value) { showErrorView(); return; }
            const itoKey = getAttrByName(currentApp, appAttrIds, INSIGHT.attrItoKey);
            if (!itoKey) { console.error('No "' + INSIGHT.attrItoKey + '" attribute found on app:', currentApp); showErrorView(); return; }
            const pickedUser = selectedUser ? selectedUser.label : username;
            const selectedApp = currentApp && currentApp.label ? currentApp.label : '';
            const selectedGroup = selectedAdGroup && selectedAdGroup.label ? selectedAdGroup.label : '';
            const generatedReason = selectedGroup
                ? `Please grant ${selectedApp} ${selectedGroup} to ${pickedUser}`
                : `Please grant ${selectedApp} to ${pickedUser}`;
            const summaryText = `Application access: ${currentApp.label}`;
            const requestFieldValues = {
                summary: summaryText,
                customfield_16038: { name: username },
                description: reason || generatedReason,
                customfield_17313: [{ key: itoKey }]
            };
            /* AD group the user selected -> customfield_35511 (Insight object key). */
            if (adSelect.value) {
                requestFieldValues.customfield_35511 = [{ key: adSelect.value }];
            }
            const payload = {
                serviceDeskId: '31',
                requestTypeId: '348',
                requestFieldValues: requestFieldValues,
                requestParticipants: [],
                raiseOnBehalfOf: username
            };
            showLoadingView();
            try {
                const res = await fetch(SUPPORTAL_BASE + '/rest/servicedeskapi/request', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'X-Atlassian-Token': 'no-check' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) { showErrorView(); return; }
                const created = await res.json().catch(() => null);
                const issueKey = extractIssueKey(created);
                createdIssue = issueKey
                    ? {
                        key: issueKey,
                        url: SUPPORTAL_BASE + '/browse/' + issueKey
                    }
                    : null;
                renderSuccessLinks();
                showSuccessView();
            } catch (err) { showErrorView(); }
        };

        submitAddBtn.onclick = e => { e.preventDefault(); submitRequest(); };

        /* "Request other access" -> shared portal popup (no private copy) */
        document.querySelectorAll('.other-access-or-permissions-link').forEach(btn => {
            btn.addEventListener('click', e => { e.preventDefault(); const url = btn.dataset.jiraUrl; if (url) showJiraPopup(url); });
        });

        /* expose re-localising to the shared language lifecycle */
        S.registerLocalizer((lang) => { if (translations[lang]) catLang = lang; updateTexts(catLang); renderApps(allApps); });

        updateTexts(catLang);   /* labels visible during the data load */

        /* Tokenless data loads ride the user's Jira session. AD-imported users
           are loaded from Insight and merged with live Jira directory results. */
        (async () => {
            try {
                const data = await fetchInsight(INSIGHT.typeUser, 8000);
                userAttrIds = attrIdMap(data);
                insightUsers = (data.objectEntries || []).map(user => {
                    const email = getAttrByName(user, userAttrIds, INSIGHT.attrEmail);
                    if (!email) return null;
                    return {
                        value: email.split('@')[0],
                        label: user.label || email,
                        sub: email
                    };
                }).filter(Boolean);
            } catch (e) {
                /* Jira-backed searching remains available if Insight is down. */
                insightUsers = [];
            }
            try {
                const d = await fetchInsight(INSIGHT.typeApplication, 700);
                appAttrIds = attrIdMap(d);
                allApps = d.objectEntries || [];
                renderApps(allApps);
            } catch (e) {
                const t = translations[catLang] || translations.EN;
                grid.innerHTML = `<div class="app-error-state">${t.errorLoading}</div>`;
                resultsCount.textContent = t.errorText;
            }
        })();
    }

    S.registerInit(initAppCatalog);
})(window.Supportal);
