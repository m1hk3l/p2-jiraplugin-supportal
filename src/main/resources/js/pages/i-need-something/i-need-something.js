/* ============================================================================
 *  pages/i-need-something/i-need-something.js — i-need-something page: intro + terms-of-use FAQ handbook
 *  modal, category cards (End user / IT-to-IT), and the view toggle. Guarded
 *  by their root elements; card modals reuse the shared popup.
 * ========================================================================== */
(function (S) {
    "use strict";
    var byId = S.byId;
    var SUPPORTAL_BASE = S.base;
    var showJiraPopup = S.showJiraPopup;

    /* ========================================================================
     *  I-NEED-SOMETHING PAGE
     *  Modules: journey breadcrumb (shared renderJourneyNav above), intro text
     *  + "terms of use" FAQ handbook modal, and the category cards (End user /
     *  IT-to-IT toggle). Each entry point guards its root element, so these are
     *  inert on home.vm / access-or-permissions.vm. Card modal links reuse the
     *  shared showJiraPopup() above (no duplicate popup code).
     * ===================================================================== */

    /* ---- Module 2: intro text + terms-of-use FAQ handbook modal ---- */
    var iNeedEscHandler = null;
    var iNeedIntroTexts = {
        EN: `
      <p class="i-need-something-intro-text line-default">On this page you can request various IT services and equipment, including <strong class="highlight">access rights, hardware, software, telecom services</strong> and <strong class="highlight">presentation support</strong>. Select the category below that best matches your need.</p>
      </br>
      <p class="i-need-something-intro-text line-default">Read the terms of use <strong class="highlight modal-btn" id="submitting-a-request-popup-faq-open-modal-btn">here</strong>.</p>
    <div id="submitting-a-request-popup-faq-app-detail-modal" class="submitting-a-request-popup-faq-app-modal">
      <div class="submitting-a-request-popup-faq-app-modal-overlay"></div>
        <div class="submitting-a-request-popup-faq-app-modal-content">
          <div class="submitting-a-request-popup-faq-app-modal-submitting-a-request-popup-faq-header">
            <h2 class="submitting-a-request-popup-faq-app-detail-title">IT Request Submission Guide</h2>
            <button class="submitting-a-request-popup-faq-app-modal-close" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M5 5L15 15M15 5L5 15"></path>
              </svg>
            </button>
          </div>
          <div class="submitting-a-request-popup-faq-app-modal-body">
            <div class="submitting-a-request-popup-faq-extra-info">
        <div class="submitting-a-request-popup-faq-header">
          <h1 class="line-default">IT Request Submission Guide</h1>
          <p class="label-small">All IT-related requests must be submitted in the ITabi web portal. In the portal you will find instructions for ordering hardware, software and access rights. The goal is to help you submit your request quickly and correctly and avoid delays.</p>
        </div>

        <div class="submitting-a-request-popup-faq-handbook-container">
          <div class="submitting-a-request-popup-faq-sidebar">
            <button class="submitting-a-request-popup-faq-nav-button label-small active" onclick="showPanel(event, 'submitting-a-request-popup-faq-panel-how-to-submit-a-request')">
              <span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-pen-to-square" style="color:#f47f7f; font-size:18px;"></i></span> How to submit a request?
            </button>
            <button class="submitting-a-request-popup-faq-nav-button label-small" onclick="showPanel(event, 'submitting-a-request-popup-faq-panel-the-role-of-itabi')">
              <span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-lightbulb" style="color:#f4a96a; font-size:18px;"></i></span> The role of ITabi
            </button>
            <button class="submitting-a-request-popup-faq-nav-button label-small" onclick="showPanel(event, 'submitting-a-request-popup-faq-panel-before-submitting-a-request')">
              <span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-check-square" style="color:#f4d76a; font-size:18px;"></i></span> Before submitting a request
            </button>
            <button class="submitting-a-request-popup-faq-nav-button label-small" onclick="showPanel(event, 'submitting-a-request-popup-faq-panel-approval')">
              <span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-check" style="color:#7fcf8e; font-size:18px;"></i></span> Approval
            </button>
            <button class="submitting-a-request-popup-faq-nav-button label-small" onclick="showPanel(event, 'submitting-a-request-popup-faq-panel-who-does-what')">
              <span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-users" style="color:#6ab4f4; font-size:18px;"></i></span> Who does what?
            </button>
            <button class="submitting-a-request-popup-faq-nav-button label-small" onclick="showPanel(event, 'submitting-a-request-popup-faq-panel-delays')">
              <span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-clock" style="color:#8a7ff4; font-size:18px;"></i></span> Delays
            </button>
            <button class="submitting-a-request-popup-faq-nav-button label-small" onclick="showPanel(event, 'submitting-a-request-popup-faq-panel-definitions')">
              <span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-book" style="color:#c47fd4; font-size:18px;"></i></span> Definitions
            </button>
          </div>
          <div class="submitting-a-request-popup-faq-content-area">

            <div id="submitting-a-request-popup-faq-panel-how-to-submit-a-request" class="submitting-a-request-popup-faq-content-panel active">
              <h2 class="line-default"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-pen-to-square" style="color:#f47f7f; font-size:20px;"></i></span> How to submit a request?</h2>
              <p class="line-small">All IT-related requests must be submitted in the ITabi web environment, <strong>Enefit Intranet > <a href="https://jiradev.energia.sise/jira/plugins/servlet/desk/site/itsm-portal" target="_blank" class="submitting-a-request-popup-faq-link">ITSM Portal</a></strong>.</p>

              <div class="submitting-a-request-popup-faq-alert-box label-small">
                <div>
                  <p><strong style="color:#0b2f66;">Important:</strong></p>
                  <p>Email, phone calls or Teams chats do not replace an official IT request.</p>
                </div>
              </div>

              <h3 class="line-small">Steps for submitting a request:</h3>
              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Select „I need something" from the menu</li>
                  <li class="label-small"><i class="pi pi-check"></i>Fill in all required information fields carefully</li>
                  <li class="label-small"><i class="pi pi-check"></i>Review the entered information</li>
                  <li class="label-small"><i class="pi pi-check"></i>Create the request and wait for confirmation</li>
                </ul>
              </div>

              <div class="submitting-a-request-popup-faq-info-box label-small">
                <div>
                  <p><strong style="color:#0b2f66;">Attention:</strong></p>
                  <p>If information is incomplete, the request may be put on hold or rejected. Make sure all fields are filled in accurately and thoroughly.</p>
                </div>
              </div>
            </div>

            <div id="submitting-a-request-popup-faq-panel-the-role-of-itabi" class="submitting-a-request-popup-faq-content-panel">
              <h2 class="line-default"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-lightbulb" style="color:#f4a96a; font-size:20px;"></i></span> What is the role of ITabi?</h2>
              <p class="line-small">ITabi helps ensure that the IT request process runs smoothly and monitors the successful and timely completion of requests.</p>

              <h3 class="line-small">ITabi responsibilities:</h3>
              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Takes the request into processing as soon as possible, but no later than within one working day</li>
                  <li class="label-small"><i class="pi pi-check"></i>Sends an email notification when processing begins</li>
                  <li class="label-small"><i class="pi pi-check"></i>Forwards the request to the responsible executor</li>
                  <li class="label-small"><i class="pi pi-check"></i>Coordinates communication between the requester and the executor</li>
                  <li class="label-small"><i class="pi pi-check"></i>Monitors deadlines</li>
                  <li class="label-small"><i class="pi pi-check"></i>Notifies when the request is completed and closed</li>
                </ul>
              </div>

              <div class="submitting-a-request-popup-faq-alert-box label-small">
                <div>
                  <p><strong>Note:</strong></p>
                  <p>The deadline is not determined by ITabi alone – it depends on the type of request, approvals and the executor. Delays may occur if information or approvals are missing.</p>
                </div>
              </div>

              <div class="submitting-a-request-popup-faq-tip-box label-small">
                <div>
                  <p><strong style="color:#006527;">Good to know:</strong></p>
                  <p>ITabi acts as an intermediary and coordinator. The actual IT service is performed by specialized executors whose work ITabi coordinates.</p>
                </div>
              </div>
            </div>

            <div id="submitting-a-request-popup-faq-panel-before-submitting-a-request" class="submitting-a-request-popup-faq-content-panel">
              <h2 class="line-default"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-check-square" style="color:#f4d76a; font-size:20px;"></i></span> What should you do before submitting a request?</h2>
              <h3 class="line-small">Thorough preparation helps avoid delays:</h3>
              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Think through exactly what you need and how it will be used</li>
                  <li class="label-small"><i class="pi pi-check"></i>Inform your direct manager if you need new hardware or software</li>
                  <li class="label-small"><i class="pi pi-check"></i>Ensure that manager approval is obtained for ordering new paid software or hardware</li>
                  <li class="label-small"><i class="pi pi-check"></i>Check whether it is a standard or a special solution, as this affects the cost of the order</li>
                </ul>
              </div>

              <div class="submitting-a-request-popup-faq-info-box label-small">
                <div>
                  <p><strong style="color:#0b2f66;">Ordering devices and software:</strong></p>
                  <p>Before placing an order, review the lists of standard solutions. If you need something that is not on the standard list, additional approval may be required.</p>
                </div>
              </div>

              <div class="submitting-a-request-popup-faq-alert-box label-small">
                <div>
                  <p><strong>Financial responsibility:</strong></p>
                  <p>If the request causes additional costs or damage to the company due to incorrect information, it will be covered by the budget of the requester’s structural unit.</p>
                </div>
              </div>

              <div class="submitting-a-request-popup-faq-tip-box label-small">
                <div>
                  <p><strong style="color:#006527;">Recommendation:</strong></p>
                  <p>If you are unsure what hardware or software you need, consult ITabi or your direct manager before submitting the request.</p>
                </div>
              </div>
            </div>

            <div id="submitting-a-request-popup-faq-panel-approval" class="submitting-a-request-popup-faq-content-panel">
              <h2 class="line-default"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-check" style="color:#7fcf8e; font-size:20px;"></i></span> How are IT requests approved?</h2>
              <p class="line-small">Request approval depends on the type and content of the request. Different requests require different approvals.</p>

              <h3 class="line-small">IT requests involving financial costs:</h3>
              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Hardware, paid software and services are approved by the direct manager</li>
                  <li class="label-small"><i class="pi pi-check"></i>Approval is required before processing begins</li>
                </ul>
              </div>
              <h3 class="line-small">Access rights:</h3>
              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Standard access rights are approved by the direct manager</li>
                  <li class="label-small"><i class="pi pi-check"></i>Access to sensitive data is approved by the data owner or their designated representative</li>
                  <li class="label-small"><i class="pi pi-check"></i>Both approvals may be required if necessary</li>
                </ul>
              </div>
              <h3 class="line-small">Special hardware:</h3>
              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>When ordering hardware that differs from standard equipment, approval from the manager is required</li>
                  <li class="label-small"><i class="pi pi-check"></i>Additionally, approval from the Digital Workplace asset manager is required</li>
                </ul>
              </div>
              <h3 class="line-small">Special software:</h3>
              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Software not included in the standard software list requires approval from the license manager</li>
                  <li class="label-small"><i class="pi pi-check"></i>This approval ensures compliance with license management requirements</li>
                </ul>
              </div>

              <div class="submitting-a-request-popup-faq-info-box label-small">
                <div>
                  <p><strong style="color:#0b2f66;">Fast processing:</strong></p>
                  <p>Make sure all required approvers are aware and available. This significantly speeds up request processing.</p>
                </div>
              </div>
            </div>

            <div id="submitting-a-request-popup-faq-panel-who-does-what" class="submitting-a-request-popup-faq-content-panel panel-block">
              <h2 class="line-default"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-users" style="color:#6ab4f4; font-size:20px;"></i></span> Who does what?</h2>
              <h3 class="line-small">Several parties participate in the IT request process. Here is an overview of the roles and responsibilities:</h3>

              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Requester</strong></p>
                    <p>An EE employee using a computer who submits an IT request in the ITabi portal.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Requester’s direct manager</strong></p>
                    <p>Approves IT requests involving financial costs and standard access rights. Ensures that the request is justified and covered by the budget.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Data owner</strong></p>
                    <p>Approves IT requests for access to sensitive data assets or appoints an approver. Responsible for data security.</p>
                  </li>
                  <li class="label-small">
                      <p><strong style="color:#008834;">Digital workplace asset manager</strong></p>
                      <p>Approves requests for special hardware (solutions not part of standard IT equipment). Ensures technical compatibility.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">License manager</strong></p>
                    <p>Approves IT requests for special software (software not included in the standard software list). Responsible for license management.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">ITabi</strong></p>
                    <p>Service center that forwards requests submitted in the ITabi portal to executors and coordinates IT request processing.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">IT request executor</strong></p>
                    <p>Performs the work. EE IT equipment and/or asset procurement partner, cooperation partner, or a person authorized to perform the IT request.</p>
                  </li>
                </ul>
              </div>

              <div class="submitting-a-request-popup-faq-tip-box label-small">
                <div>
                  <p><strong style="color:#006527;">Cooperation is key:</strong></p>
                  <p>Successful IT request completion requires smooth cooperation between all parties. Monitor the status of your request and respond quickly to additional questions.</p>
                </div>
              </div>
            </div>

            <div id="submitting-a-request-popup-faq-panel-delays" class="submitting-a-request-popup-faq-content-panel">
              <h2 class="line-default"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-clock" style="color:#8a7ff4; font-size:20px;"></i></span> When can an IT request be delayed?</h2>
              <p class="line-small">Understand the main reasons why a request may be put on hold or rejected:</p>
              <h3 class="line-small">An IT request may be put on hold or rejected if:</h3>

              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Required approvals are missing or delayed</li>
                  <li class="label-small"><i class="pi pi-check"></i>Submitted information is inaccurate, contradictory or incomplete</li>
                  <li class="label-small"><i class="pi pi-check"></i>The request does not comply with agreed principles or rules</li>
                  <li class="label-small"><i class="pi pi-check"></i>Technical details are unclear or missing</li>
                  <li class="label-small"><i class="pi pi-check"></i>Budget approval has not been received</li>
                  <li class="label-small"><i class="pi pi-check"></i>The requester has not responded to clarification questions</li>
                </ul>
              </div>

              <div class="submitting-a-request-popup-faq-alert-box label-small">
                <div>
                  <p><strong>How to avoid delays:</strong></p>
                  <p>Before submitting the request, make sure all required information is available, approvers are informed and the request meets the standards.</p>
                </div>
              </div>

              <div class="submitting-a-request-popup-faq-tip-box label-small">
                <div>
                  <p><strong style="color:#006527;">Quick solution:</strong></p>
                  <p>If your request is on hold, check your email for clarification requests or questions from ITabi. Quick responses speed up the process.</p>
                </div>
              </div>
            </div>

            <div id="submitting-a-request-popup-faq-panel-definitions" class="submitting-a-request-popup-faq-content-panel panel-block">
              <h2 class="line-default"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-book" style="color:#c47fd4; font-size:20px;"></i></span> Definitions</h2>
              <h3 class="line-small">Important terms that help better understand the IT request process:</h3>

              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small">
                    <p><strong style="color:#008834;">IT request</strong></p>
                    <p>A request created in the ITabi portal to obtain an IT unit or access rights to information assets.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Access right</strong></p>
                    <p>Permission to process data or use information system functionality. Granted according to the role and job responsibilities.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Data Owner (DO)</strong></p>
                    <p>An employee who has the authority and responsibility to make decisions regarding the management and development of data belonging to agreed information classes and to allocate resources for it. If the role is absent, the responsibilities are performed by a coordinating data manager.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Information asset</strong></p>
                    <p>Data, systems and services that are valuable to the company and require protection and management according to security standards.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Standard hardware</strong></p>
                    <p>IT equipment approved and commonly used in the company, which can be ordered through a simplified and faster process.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Standard software</strong></p>
                    <p>A list of software approved in the company, whose licenses are managed and whose ordering does not require additional approvals.</p>
                  </li>
                </ul>
              </div>

              <div class="submitting-a-request-popup-faq-tip-box label-small">
                <div>
                  <p><strong style="color:#006527;">Questions?</strong></p>
                  <p>If you have any questions about IT requests, please feel free to contact the ITabi via the portal, email, or phone.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
          </div>
        </div>
    </div>
    `,
        ET: `
      <p class="i-need-something-intro-text line-default">Siin lehel saate tellida või taotleda erinevaid IT-teenuseid ja -vahendeid, sealhulgas <strong class="highlight">ligipääsuõigused, riistvara, tarkvara, telekommunikatsiooni teenused</strong> ja <strong class="highlight">esitlustugi</strong>. Valige allolevast kategooriast, mis vastab teie vajadusele.</p>
      </br>
      <p class="i-need-something-intro-text line-default">Tutvu kasutustingimustega <strong class="highlight modal-btn" id="submitting-a-request-popup-faq-open-modal-btn">siin</strong>.</p>

    <div id="submitting-a-request-popup-faq-app-detail-modal" class="submitting-a-request-popup-faq-app-modal">
      <div class="submitting-a-request-popup-faq-app-modal-overlay"></div>
        <div class="submitting-a-request-popup-faq-app-modal-content">
          <div class="submitting-a-request-popup-faq-app-modal-submitting-a-request-popup-faq-header">
            <h2 class="submitting-a-request-popup-faq-app-detail-title">IT Tellimuse Esitamise Juhend</h2>
            <button class="submitting-a-request-popup-faq-app-modal-close" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M5 5L15 15M15 5L5 15"></path>
              </svg>
            </button>
          </div>
          <div class="submitting-a-request-popup-faq-app-modal-body">
            <div class="submitting-a-request-popup-faq-extra-info">
        <div class="submitting-a-request-popup-faq-header">
          <h1 class="line-default">IT Tellimuse Esitamise Juhend</h1>
          <p class="label-small">Kõik IT-ga seotud tellimused tuleb esitada ITabi veebikeskkonnas. Portaalist leiad juhised riistvara, tarkvara ja ligipääsuõiguste tellimiseks. Eesmärk on aidata sul esitada tellimus kiiresti ja korrektselt ning vältida viivitusi.</p>
        </div>

        <div class="submitting-a-request-popup-faq-handbook-container">
          <div class="submitting-a-request-popup-faq-sidebar">
            <button class="submitting-a-request-popup-faq-nav-button label-small active" onclick="showPanel(event, 'submitting-a-request-popup-faq-panel-how-to-submit-a-request')"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-pen-to-square" style="color:#f47f7f; font-size:18px;"></i></span> Kuidas tellida?</button>
            <button class="submitting-a-request-popup-faq-nav-button label-small" onclick="showPanel(event, 'submitting-a-request-popup-faq-panel-the-role-of-itabi')"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-lightbulb" style="color:#f4a96a; font-size:18px;"></i></span> ITabi roll</button>
            <button class="submitting-a-request-popup-faq-nav-button label-small" onclick="showPanel(event, 'submitting-a-request-popup-faq-panel-before-submitting-a-request')"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-check-square" style="color:#f4d76a; font-size:18px;"></i></span> Enne tellimist</button>
            <button class="submitting-a-request-popup-faq-nav-button label-small" onclick="showPanel(event, 'submitting-a-request-popup-faq-panel-approval')"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-check" style="color:#7fcf8e; font-size:18px;"></i></span> Kinnitamine</button>
            <button class="submitting-a-request-popup-faq-nav-button label-small" onclick="showPanel(event, 'submitting-a-request-popup-faq-panel-who-does-what')"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-users" style="color:#6ab4f4; font-size:18px;"></i></span> Kes mida teeb?</button>
            <button class="submitting-a-request-popup-faq-nav-button label-small" onclick="showPanel(event, 'submitting-a-request-popup-faq-panel-delays')"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-clock" style="color:#8a7ff4; font-size:18px;"></i></span> Viivitused</button>
            <button class="submitting-a-request-popup-faq-nav-button label-small" onclick="showPanel(event, 'submitting-a-request-popup-faq-panel-definitions')"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-book" style="color:#c47fd4; font-size:18px;"></i></span> Mõisted</button>
          </div>
          <div class="submitting-a-request-popup-faq-content-area">

            <div id="submitting-a-request-popup-faq-panel-how-to-submit-a-request" class="submitting-a-request-popup-faq-content-panel active">
              <h2 class="line-default"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-pen-to-square" style="color:#f47f7f; font-size:20px;"></i></span> Kuidas tellimust esitada?</h2>
              <p class="line-small">Kõik IT-ga seotud tellimused tuleb esitada ITabi veebikeskkonnas, <strong>Enefiti siseveeb > <a href="https://jiradev.energia.sise/jira/plugins/servlet/desk/site/itsm-portal" target="_blank" class="submitting-a-request-popup-faq-link">ITSM Portal</a></strong>.</p>

              <div class="submitting-a-request-popup-faq-alert-box label-small">
                <div>
                  <p><strong style="color:#0b2f66;">Oluline:</strong></p>
                  <p>E-kiri, telefonikõne või Teamsi vestlus ei asenda ametlikku IT tellimust.</p>
                </div>
              </div>

              <h3 class="line-small">Tellimuse esitamise sammud:</h3>
              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Vali menüüst „Mul on midagi vaja"</li>
                  <li class="label-small"><i class="pi pi-check"></i>Täida kõik nõutud infoväljad hoolikalt</li>
                  <li class="label-small"><i class="pi pi-check"></i>Kontrolli sisestatud andmeid</li>
                  <li class="label-small"><i class="pi pi-check"></i>Loo tellimus ja oota kinnitust</li>
                </ul>
              </div>

              <div class="submitting-a-request-popup-faq-info-box label-small">
                <div>
                  <p><strong style="color:#0b2f66;">Tähelepanu:</strong></p>
                  <p>Puuduliku info korral võib tellimus jääda ootele või saada tagasi lükatud. Veendu, et kõik väljad on täidetud täpselt ja ammendavalt.</p>
                </div>
              </div>
            </div>

            <div id="submitting-a-request-popup-faq-panel-the-role-of-itabi" class="submitting-a-request-popup-faq-content-panel">
              <h2 class="line-default"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-lightbulb" style="color:#f4a96a; font-size:20px;"></i></span> Mis on ITabi roll?</h2>
              <p class="line-small">ITabi aitab IT tellimuse protsessi sujuvalt liikuma ja jälgib selle edukat ja ajakohast täitmist.</p>

              <h3 class="line-small">ITabi kohustused:</h3>
              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Võtab tellimuse töösse esimesel võimalusel, kuid mitte hiljemalt, kui ühe tööpäeva jooksul</li>
                  <li class="label-small"><i class="pi pi-check"></i>Teavitab e-kirjaga, kui täitmine algab</li>
                  <li class="label-small"><i class="pi pi-check"></i>Edastab tellimuse vastutavale täitjale</li>
                  <li class="label-small"><i class="pi pi-check"></i>Koordineerib suhtlust tellija ja täitja vahel</li>
                  <li class="label-small"><i class="pi pi-check"></i>Jälgib tähtaegade täitmist</li>
                  <li class="label-small"><i class="pi pi-check"></i>Teavitab tellimuse valmimisest ja sulgemisest</li>
                </ul>
              </div>

              <div class="submitting-a-request-popup-faq-alert-box label-small">
                <div>
                  <p><strong>Pane tähele:</strong></p>
                  <p>Tähtaega ei määra ITabi üksi – see sõltub tellimuse liigist, kinnitajatest ja täitjast. Viivitused võivad tekkida, kui info või kinnitused puuduvad.</p>
                </div>
              </div>

              <div class="submitting-a-request-popup-faq-tip-box label-small">
                <div>
                  <p><strong style="color:#006527;">Hea teada:</strong></p>
                  <p>ITabi on vahendaja ja koordinaator. Tegelik IT teenuse täitmine toimub spetsialiseerunud täitjate poolt, kelle tööd ITabi koordineerib.</p>
                </div>
              </div>
            </div>

            <div id="submitting-a-request-popup-faq-panel-before-submitting-a-request" class="submitting-a-request-popup-faq-content-panel">
              <h2 class="line-default"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-check-square" style="color:#f4d76a; font-size:20px;"></i></span> Mida teha enne tellimuse esitamist?</h2>
              <h3 class="line-small">Põhjalik ettevalmistus aitab vältida viivitusi:</h3>
              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Mõtle läbi, mida täpselt vajad ja milleks seda kasutad</li>
                  <li class="label-small"><i class="pi pi-check"></i>Teavita oma otsest juhti, kui vajad uut riistvara või tarkvara</li>
                  <li class="label-small"><i class="pi pi-check"></i>Veendu, et juhi kooskõlastus uue tasulise tarkvara või riistvara tellimiseks on olemas</li>
                  <li class="label-small"><i class="pi pi-check"></i>Kontrolli, kas tegemist on standardse või erilahendusega, sest sellest sõltub tellimuse kulu</li>
                </ul>
              </div>

              <div class="submitting-a-request-popup-faq-info-box label-small">
                <div>
                  <p><strong style="color:#0b2f66;">Seadmete ja tarkvara tellimine:</strong></p>
                  <p>Tutvu enne tellimist standardsete lahenduste nimekirjadega. Kui vajad midagi, mis ei ole standardnimekirjas, võib olla vajalik täiendav kooskõlastus.</p>
                </div>
              </div>

              <div class="submitting-a-request-popup-faq-alert-box label-small">
                <div>
                  <p><strong>Finantsiline vastutus:</strong></p>
                  <p>Kui tellimus põhjustab ettevõttele lisakulu või kahju vale info tõttu, kaetakse see tellija struktuuriüksuse eelarvest.</p>
                </div>
              </div>

              <div class="submitting-a-request-popup-faq-tip-box label-small">
                <div>
                  <p><strong style="color:#006527;">Soovitus:</strong></p>
                  <p>Kui sa ei ole kindel, millist riistvara või tarkvara vajad, konsulteeri ITabi või oma otsese juhiga enne tellimuse esitamist.</p>
                </div>
              </div>
            </div>

            <div id="submitting-a-request-popup-faq-panel-approval" class="submitting-a-request-popup-faq-content-panel">
              <h2 class="line-default"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-check" style="color:#7fcf8e; font-size:20px;"></i></span> Kuidas IT tellimusi kinnitatakse?</h2>
              <p class="line-small">Tellimuste kinnitamine sõltub tellimuse liigist ja sisust. Erinevad tellimused nõuavad erinevaid kinnitusi.</p>

              <h3 class="line-small">Rahalise kuluga IT tellimused:</h3>
              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Riistvara, tasuline tarkvara ja teenused kinnitab otsene juht</li>
                  <li class="label-small"><i class="pi pi-check"></i>Kinnitamine on vajalik enne tellimuse täitmise alustamist</li>
                </ul>
              </div>
              <h3 class="line-small">Ligipääsuõigused:</h3>
              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Standardõigused kinnitab otsene juht</li>
                  <li class="label-small"><i class="pi pi-check"></i>Tundlike andmete ligipääsu kinnitab andmevara omanik või tema määratud esindaja</li>
                  <li class="label-small"><i class="pi pi-check"></i>Vajadusel on nõutud mõlema kinnitus</li>
                </ul>
              </div>
              <h3 class="line-small">Eririistvara:</h3>
              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Standardvarustusest erineva riistvara tellimisel on vajalik juhi kinnitus</li>
                  <li class="label-small"><i class="pi pi-check"></i>Lisaks nõutakse digitaalse töökoha varahalduri kinnitust</li>
                </ul>
              </div>
              <h3 class="line-small">Eritarkvara:</h3>
              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Standardtarkvara nimekirjast väljas oleva tarkvara tellimisel on vajalik litsentsihalduri kinnitus</li>
                  <li class="label-small"><i class="pi pi-check"></i>Kinnitus tagab litsentsihalduse nõuetele vastavuse</li>
                </ul>
              </div>

              <div class="submitting-a-request-popup-faq-info-box label-small">
                <div>
                  <p><strong style="color:#0b2f66;">Kiire töötlemine:</strong></p>
                  <p>Veendu, et kõik vajalikud kinnitajad on teadlikud ja kättesaadavad. See kiirendab tellimuse töötlemist oluliselt.</p>
                </div>
              </div>
            </div>

            <div id="submitting-a-request-popup-faq-panel-who-does-what" class="submitting-a-request-popup-faq-content-panel panel-block">
              <h2 class="line-default"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-users" style="color:#6ab4f4; font-size:20px;"></i></span> Kes mida teeb?</h2>
              <h3 class="line-small">IT tellimuse protsessis osalevad mitmed osapooled. Siin on ülevaade rollidest ja vastutustest:</h3>

              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Tellija</strong></p>
                    <p>EE arvutikasutajast töötaja, kes esitab IT tellimuse ITabi portaalis.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Tellija otsene juht</strong></p>
                    <p>Kinnitab rahalise kuluga IT tellimused ja standardõigused. Tagab, et tellimus on põhjendatud ja eelarves kaetud.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Andmevara omanik</strong></p>
                    <p>Kinnitab infovaratundlike andmete ligipääsuõiguste IT tellimuse või määrab kinnitaja. Vastutab andmete turvalisuse eest.</p>
                  </li>
                  <li class="label-small">
                      <p><strong style="color:#008834;">Digitaalse töökoha varahaldur</strong></p>
                      <p>Kinnitab eririistvara (lahendusi, mis ei kuulu standardse IT varustuse hulka) tellimise. Tagab tehnilise sobivuse.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Litsentsihaldur</strong></p>
                    <p>Kinnitab eritarkvara (tarkvara, mis ei ole standardtarkvara nimekirjas) IT tellimuse. Vastutab litsentsihalduse eest.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">ITabi</strong></p>
                    <p>Teeninduskeskus, mis vahendab ITabi veebikeskkonnas vormistatud pöördumised täitjale ning koordineerib IT tellimuste menetlemist.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">IT tellimuse täitja</strong></p>
                    <p>Teostab töö. EE IT-seadmete ja/või -varade hanke-, koostööpartner või IT tellimuse täitmiseks õiguseid omav isik.</p>
                  </li>
                </ul>
              </div>

              <div class="submitting-a-request-popup-faq-tip-box label-small">
                <div>
                  <p><strong style="color:#006527;">Koostöö on võti:</strong></p>
                  <p>Edukas IT tellimuse täitmine nõuab kõigi osapoolte sujuvat koostööd. Hoia end kursis oma tellimuse staatusega ja vasta kiiresti täiendavatele küsimustele.</p>
                </div>
              </div>
            </div>

            <div id="submitting-a-request-popup-faq-panel-delays" class="submitting-a-request-popup-faq-content-panel">
              <h2 class="line-default"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-clock" style="color:#8a7ff4; font-size:20px;"></i></span> Millal IT tellimuse täitmine võib viibida?</h2>
              <p class="line-small">Mõista peamisi põhjuseid, miks tellimus võib jääda ootele või tagasi lükatud saada:</p>
              <h3 class="line-small">IT tellimus võib jääda ootele või tagasi lükatud, kui:</h3>

              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Vajalikud kinnitused puuduvad või on viibinud</li>
                  <li class="label-small"><i class="pi pi-check"></i>Esitatud info on ebatäpne, vastuoluline või puudulik</li>
                  <li class="label-small"><i class="pi pi-check"></i>Tellimus ei vasta kokkulepitud põhimõtetele või reeglitele</li>
                  <li class="label-small"><i class="pi pi-check"></i>Tehnilised detailid on ebaselged või puuduvad</li>
                  <li class="label-small"><i class="pi pi-check"></i>Eelarveline kinnitus on saamata</li>
                  <li class="label-small"><i class="pi pi-check"></i>Tellija ei ole vastanud täpsustavatele küsimustele</li>
                </ul>
              </div>

              <div class="submitting-a-request-popup-faq-alert-box label-small">
                <div>
                  <p><strong>Kuidas viivitusi vältida:</strong></p>
                  <p>Veendu enne tellimuse esitamist, et kõik vajalik info on olemas, kinnitajad on teavitatud ja tellimus vastab standarditele.</p>
                </div>
              </div>

              <div class="submitting-a-request-popup-faq-tip-box label-small">
                <div>
                  <p><strong style="color:#006527;">Kiire lahendus:</strong></p>
                  <p>Kui sinu tellimus on jäänud ootele, kontrolli e-posti ITabi poolt saadetud täpsustuste või küsimuste kohta. Kiire tagasiside kiirendab protsessi.</p>
                </div>
              </div>
            </div>

            <div id="submitting-a-request-popup-faq-panel-definitions" class="submitting-a-request-popup-faq-content-panel panel-block">
              <h2 class="line-default"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-book" style="color:#c47fd4; font-size:20px;"></i></span> Selgitavad mõisted</h2>
              <h3 class="line-small">Olulised terminid, mis aitavad paremini mõista IT tellimuste protsessi:</h3>

              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small">
                    <p><strong style="color:#008834;">IT tellimus</strong></p>
                    <p>ITabi veebikeskkonnas vormistatud tellitava IT ühiku või infovarade juurdepääsuõiguste soetamise pöördumine.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Ligipääsuõigus</strong></p>
                    <p>Luba andmevara töötlemiseks või infosüsteemi funktsionaalsuse kasutamiseks. Antakse vastavalt ametikohale ja tööülesannetele.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Andmevara omanik (Data Owner, DO)</strong></p>
                    <p>Töötaja, kellel on õigus ja vastutus kokkulepitud infoklassidesse kuuluvate andmete haldamise ja arenduste osas otsuseid teha ning selleks ressursse suunata. Rolli puudumisel täidab andmevara omaniku ülesandeid koordineeriv andmehaldur.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Infovara</strong></p>
                    <p>Ettevõtte jaoks väärtuslikud andmed, süsteemid ja teenused, mis vajavad kaitset ja haldamist vastavalt turvastandarditele.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Standardriistvara</strong></p>
                    <p>Ettevõttes heakskiidetud ja tavapäraselt kasutatavad IT-seadmed, mille tellimine on lihtsustatud ja kiirem.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Standardtarkvara</strong></p>
                    <p>Ettevõttes heakskiidetud tarkvara nimekiri, mille litsentsid on hallatud ja mille tellimine ei nõua täiendavaid kooskõlastusi.</p>
                  </li>
                </ul>
              </div>

              <div class="submitting-a-request-popup-faq-tip-box label-small">
                <div>
                  <p><strong style="color:#006527;">Küsimused?</strong></p>
                  <p>Kui sul tekib küsimusi IT tellimuste kohta, pöördu julgelt ITabi poole läbi portaali, e-posti või telefoni teel.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
          </div>
        </div>
    </div>
    `,
        RU: `
      <p class="i-need-something-intro-text line-default">На этой странице вы можете заказать или запросить различные IT-услуги и оборудование, включая <strong class="highlight">права доступа, оборудование, программное обеспечение, телекоммуникационные услуги</strong> и <strong class="highlight">поддержку презентаций</strong>. Выберите категорию ниже, которая лучше всего соответствует вашей потребности.</p>
      </br>
      <p class="i-need-something-intro-text line-default">Ознакомьтесь с условиями использования <strong class="highlight modal-btn" id="submitting-a-request-popup-faq-open-modal-btn">здесь</strong>.</p>

    <div id="submitting-a-request-popup-faq-app-detail-modal" class="submitting-a-request-popup-faq-app-modal">
      <div class="submitting-a-request-popup-faq-app-modal-overlay"></div>
        <div class="submitting-a-request-popup-faq-app-modal-content">
          <div class="submitting-a-request-popup-faq-app-modal-submitting-a-request-popup-faq-header">
            <h2 class="submitting-a-request-popup-faq-app-detail-title">Руководство по подаче IT-запроса</h2>
            <button class="submitting-a-request-popup-faq-app-modal-close" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M5 5L15 15M15 5L5 15"></path>
              </svg>
            </button>
          </div>
          <div class="submitting-a-request-popup-faq-app-modal-body">
            <div class="submitting-a-request-popup-faq-extra-info">
        <div class="submitting-a-request-popup-faq-header">
          <h1 class="line-default">Руководство по подаче IT-запроса</h1>
          <p class="label-small">Все IT-запросы необходимо подавать через веб-портал ITabi. В портале вы найдете инструкции по заказу оборудования, программного обеспечения и прав доступа. Цель - помочь вам подать запрос быстро и корректно, чтобы избежать задержек.</p>
        </div>

        <div class="submitting-a-request-popup-faq-handbook-container">
          <div class="submitting-a-request-popup-faq-sidebar">
            <button class="submitting-a-request-popup-faq-nav-button label-small active" onclick="showPanel(event, 'submitting-a-request-popup-faq-panel-how-to-submit-a-request')"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-pen-to-square" style="color:#f47f7f; font-size:18px;"></i></span> Как подать запрос?</button>
            <button class="submitting-a-request-popup-faq-nav-button label-small" onclick="showPanel(event, 'submitting-a-request-popup-faq-panel-the-role-of-itabi')"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-lightbulb" style="color:#f4a96a; font-size:18px;"></i></span> Роль ITabi</button>
            <button class="submitting-a-request-popup-faq-nav-button label-small" onclick="showPanel(event, 'submitting-a-request-popup-faq-panel-before-submitting-a-request')"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-check-square" style="color:#f4d76a; font-size:18px;"></i></span> Перед подачей запроса</button>
            <button class="submitting-a-request-popup-faq-nav-button label-small" onclick="showPanel(event, 'submitting-a-request-popup-faq-panel-approval')"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-check" style="color:#7fcf8e; font-size:18px;"></i></span> Подтверждение</button>
            <button class="submitting-a-request-popup-faq-nav-button label-small" onclick="showPanel(event, 'submitting-a-request-popup-faq-panel-who-does-what')"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-users" style="color:#6ab4f4; font-size:18px;"></i></span> Кто за что отвечает?</button>
            <button class="submitting-a-request-popup-faq-nav-button label-small" onclick="showPanel(event, 'submitting-a-request-popup-faq-panel-delays')"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-clock" style="color:#8a7ff4; font-size:18px;"></i></span> Задержки</button>
            <button class="submitting-a-request-popup-faq-nav-button label-small" onclick="showPanel(event, 'submitting-a-request-popup-faq-panel-definitions')"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-book" style="color:#c47fd4; font-size:18px;"></i></span> Определения</button>
          </div>
          <div class="submitting-a-request-popup-faq-content-area">

            <div id="submitting-a-request-popup-faq-panel-how-to-submit-a-request" class="submitting-a-request-popup-faq-content-panel active">
              <h2 class="line-default"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-pen-to-square" style="color:#f47f7f; font-size:20px;"></i></span> Как подать запрос?</h2>
              <p class="line-small">Все IT-запросы необходимо подавать через веб-портал ITabi, <strong>Enefiti Intranet > <a href="https://jiradev.energia.sise/jira/plugins/servlet/desk/site/itsm-portal" target="_blank" class="submitting-a-request-popup-faq-link">ITSM Portal</a></strong>.</p>

              <div class="submitting-a-request-popup-faq-alert-box label-small">
                <div>
                  <p><strong style="color:#0b2f66;">Важно:</strong></p>
                  <p>Электронная почта, телефонные звонки или сообщения в Teams не заменяют официальный IT-запрос.</p>
                </div>
              </div>

              <h3 class="line-small">Шаги подачи запроса:</h3>
              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Выберите в меню „Мне что-то нужно"</li>
                  <li class="label-small"><i class="pi pi-check"></i>Тщательно заполните все обязательные поля</li>
                  <li class="label-small"><i class="pi pi-check"></i>Проверьте введенную информацию</li>
                  <li class="label-small"><i class="pi pi-check"></i>Создайте запрос и дождитесь подтверждения</li>
                </ul>
              </div>

              <div class="submitting-a-request-popup-faq-info-box label-small">
                <div>
                  <p><strong style="color:#0b2f66;">Внимание:</strong></p>
                  <p>Если информация неполная, запрос может быть приостановлен или отклонён. Убедитесь, что все поля заполнены точно и полностью.</p>
                </div>
              </div>
            </div>

            <div id="submitting-a-request-popup-faq-panel-the-role-of-itabi" class="submitting-a-request-popup-faq-content-panel">
              <h2 class="line-default"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-lightbulb" style="color:#f4a96a; font-size:20px;"></i></span> Какова роль ITabi?</h2>
              <p class="line-small">ITabi помогает эффективно организовать процесс IT-запросов и следит за их успешным и своевременным выполнением.</p>

              <h3 class="line-small">Обязанности ITabi:</h3>
              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Берёт запрос в обработку при первой возможности, но не позднее одного рабочего дня</li>
                  <li class="label-small"><i class="pi pi-check"></i>Уведомляет по электронной почте о начале обработки</li>
                  <li class="label-small"><i class="pi pi-check"></i>Передает запрос ответственному исполнителю</li>
                  <li class="label-small"><i class="pi pi-check"></i>Координирует коммуникацию между заказчиком и исполнителем</li>
                  <li class="label-small"><i class="pi pi-check"></i>Следит за соблюдением сроков</li>
                  <li class="label-small"><i class="pi pi-check"></i>Сообщает о выполнении и закрытии запроса</li>
                </ul>
              </div>

              <div class="submitting-a-request-popup-faq-alert-box label-small">
                <div>
                  <p><strong>Обратите внимание:</strong></p>
                  <p>Срок выполнения определяется не только ITabi - он зависит от типа запроса, подтверждений и исполнителя. Задержки могут возникнуть, если отсутствует информация или подтверждения.</p>
                </div>
              </div>

              <div class="submitting-a-request-popup-faq-tip-box label-small">
                <div>
                  <p><strong style="color:#006527;">Полезно знать:</strong></p>
                  <p>ITabi выступает посредником и координатором. Фактическое выполнение IT-услуг осуществляется специализированными исполнителями, работу которых координирует ITabi.</p>
                </div>
              </div>
            </div>

            <div id="submitting-a-request-popup-faq-panel-before-submitting-a-request" class="submitting-a-request-popup-faq-content-panel">
              <h2 class="line-default"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-check-square" style="color:#f4d76a; font-size:20px;"></i></span> Что нужно сделать перед подачей запроса?</h2>
              <h3 class="line-small">Тщательная подготовка помогает избежать задержек:</h3>
              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Продумайте, что именно вам нужно и для каких целей</li>
                  <li class="label-small"><i class="pi pi-check"></i>Сообщите своему непосредственному руководителю, если вам требуется новое оборудование или программное обеспечение</li>
                  <li class="label-small"><i class="pi pi-check"></i>Убедитесь, что получено согласование руководителя на заказ нового платного программного обеспечения или оборудования</li>
                  <li class="label-small"><i class="pi pi-check"></i>Проверьте, является ли это стандартным или специальным решением, так как от этого зависит стоимость заказа</li>
                </ul>
              </div>

              <div class="submitting-a-request-popup-faq-info-box label-small">
                <div>
                  <p><strong style="color:#0b2f66;">Заказ оборудования и программного обеспечения:</strong></p>
                  <p>Перед оформлением заказа ознакомьтесь со списками стандартных решений. Если вам нужно что-то, чего нет в стандартном списке, может потребоваться дополнительное согласование.</p>
                </div>
              </div>

              <div class="submitting-a-request-popup-faq-alert-box label-small">
                <div>
                  <p><strong>Финансовая ответственность:</strong></p>
                  <p>Если из-за неверной информации запрос приведет к дополнительным расходам или ущербу для компании, эти расходы будут покрыты из бюджета структурного подразделения заказчика.</p>
                </div>
              </div>

              <div class="submitting-a-request-popup-faq-tip-box label-small">
                <div>
                  <p><strong style="color:#006527;">Рекомендация:</strong></p>
                  <p>Если вы не уверены, какое оборудование или программное обеспечение вам нужно, проконсультируйтесь с ITabi или своим непосредственным руководителем перед подачей запроса.</p>
                </div>
              </div>
            </div>

            <div id="submitting-a-request-popup-faq-panel-approval" class="submitting-a-request-popup-faq-content-panel">
              <h2 class="line-default"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-check" style="color:#7fcf8e; font-size:20px;"></i></span> Как утверждаются IT-запросы?</h2>
              <p class="line-small">Утверждение запросов зависит от типа и содержания запроса. Разные запросы требуют разных подтверждений.</p>

              <h3 class="line-small">IT-запросы, связанные с финансовыми расходами:</h3>
              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Оборудование, платное программное обеспечение и услуги утверждает непосредственный руководитель</li>
                  <li class="label-small"><i class="pi pi-check"></i>Подтверждение требуется до начала выполнения запроса</li>
                </ul>
              </div>
              <h3 class="line-small">Права доступа:</h3>
              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Стандартные права доступа утверждает непосредственный руководитель</li>
                  <li class="label-small"><i class="pi pi-check"></i>Доступ к конфиденциальным данным утверждает владелец данных или назначенный им представитель</li>
                  <li class="label-small"><i class="pi pi-check"></i>При необходимости могут потребоваться оба подтверждения</li>
                </ul>
              </div>
              <h3 class="line-small">Специальное оборудование:</h3>
              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>При заказе оборудования, отличающегося от стандартного, требуется подтверждение руководителя</li>
                  <li class="label-small"><i class="pi pi-check"></i>Дополнительно требуется подтверждение менеджера дигитального рабочего места</li>
                </ul>
              </div>
              <h3 class="line-small">Специальное программное обеспечение:</h3>
              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Программное обеспечение, не входящее в список стандартного ПО, требует подтверждения менеджера лицензий</li>
                  <li class="label-small"><i class="pi pi-check"></i>Это подтверждение обеспечивает соблюдение требований управления лицензиями</li>
                </ul>
              </div>

              <div class="submitting-a-request-popup-faq-info-box label-small">
                <div>
                  <p><strong style="color:#0b2f66;">Быстрая обработка:</strong></p>
                  <p>Убедитесь, что все необходимые утверждающие лица уведомлены и доступны. Это значительно ускоряет обработку запроса.</p>
                </div>
              </div>
            </div>

            <div id="submitting-a-request-popup-faq-panel-who-does-what" class="submitting-a-request-popup-faq-content-panel panel-block">
              <h2 class="line-default"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-users" style="color:#6ab4f4; font-size:20px;"></i></span> Кто за что отвечает?</h2>
              <h3 class="line-small">В процессе IT-запроса участвуют несколько сторон. Ниже представлен обзор ролей и обязанностей:</h3>

              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Заказчик</strong></p>
                    <p>Сотрудник EE, использующий компьютер, который подает IT-запрос через портал ITabi.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Непосредственный руководитель</strong></p>
                    <p>Утверждает IT-запросы, связанные с финансовыми расходами, и стандартные права доступа. Обеспечивает обоснованность запроса и наличие бюджета.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Владелец данных</strong></p>
                    <p>Утверждает запросы на доступ к конфиденциальным данным или назначает утверждающего. Отвечает за безопасность данных.</p>
                  </li>
                  <li class="label-small">
                      <p><strong style="color:#008834;">Менеджер дигитального рабочего места</strong></p>
                      <p>Утверждает запросы на специальное оборудование (решения, не входящие в стандартное IT-оборудование). Обеспечивает техническую совместимость.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Менеджер лицензий</strong></p>
                    <p>Утверждает запросы на специальное программное обеспечение (ПО, не входящее в список стандартного). Отвечает за управление лицензиями.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">ITabi</strong></p>
                    <p>Сервисный центр, который передает запросы, оформленные в портале ITabi, исполнителям и координирует процесс выполнения IT-запросов.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Исполнитель IT-запроса</strong></p>
                    <p>Выполняет работу. Это партнер по закупке IT-оборудования и/или русурсов EE, партнер по сотрудничеству или лицо, имеющее права на выполнение IT-запроса.</p>
                  </li>
                </ul>
              </div>

              <div class="submitting-a-request-popup-faq-tip-box label-small">
                <div>
                  <p><strong style="color:#006527;">Сотрудничество - ключ к успеху:</strong></p>
                  <p>Успешное выполнение IT-запроса требует слаженной работы всех сторон. Следите за статусом вашего запроса и быстро отвечайте на дополнительные вопросы.</p>
                </div>
              </div>
            </div>

            <div id="submitting-a-request-popup-faq-panel-delays" class="submitting-a-request-popup-faq-content-panel">
              <h2 class="line-default"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-clock" style="color:#8a7ff4; font-size:20px;"></i></span> Когда выполнение IT-запроса может задержаться?</h2>
              <p class="line-small">Основные причины, по которым запрос может быть приостановлен или отклонён:</p>
              <h3 class="line-small">IT-запрос может быть приостановлен или отклонён, если:</h3>

              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small"><i class="pi pi-check"></i>Отсутствуют или задерживаются необходимые подтверждения</li>
                  <li class="label-small"><i class="pi pi-check"></i>Предоставленная информация неточная, противоречивая или неполная</li>
                  <li class="label-small"><i class="pi pi-check"></i>Запрос не соответствует установленным принципам или правилам</li>
                  <li class="label-small"><i class="pi pi-check"></i>Технические детали неясны или отсутствуют</li>
                  <li class="label-small"><i class="pi pi-check"></i>Не получено бюджетное подтверждение</li>
                  <li class="label-small"><i class="pi pi-check"></i>Заказчик не ответил на уточняющие вопросы</li>
                </ul>
              </div>

              <div class="submitting-a-request-popup-faq-alert-box label-small">
                <div>
                  <p><strong>Как избежать задержек:</strong></p>
                  <p>Перед подачей запроса убедитесь, что вся необходимая информация имеется, утверждающие лица уведомлены и запрос соответствует стандартам.</p>
                </div>
              </div>

              <div class="submitting-a-request-popup-faq-tip-box label-small">
                <div>
                  <p><strong style="color:#006527;">Быстрое решение:</strong></p>
                  <p>Если ваш запрос находится на паузе, проверьте электронную почту на наличие уточнений или вопросов от ITabi. Быстрый ответ ускорит процесс.</p>
                </div>
              </div>
            </div>

            <div id="submitting-a-request-popup-faq-panel-definitions" class="submitting-a-request-popup-faq-content-panel panel-block">
              <h2 class="line-default"><span class="submitting-a-request-popup-faq-solutions-icon"><i class="pi pi-book" style="color:#c47fd4; font-size:20px;"></i></span> Определения</h2>
              <h3 class="line-small">Важные термины, которые помогут лучше понять процесс IT-запросов:</h3>

              <div class="submitting-a-request-popup-faq-subsection-content">
                <ul>
                  <li class="label-small">
                    <p><strong style="color:#008834;">IT-запрос</strong></p>
                    <p>Запрос, оформленный в веб-портале ITabi для получения IT-ресурса или прав доступа к информационным ресурсам.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Право доступа</strong></p>
                    <p>Разрешение на обработку данных или использование функциональности информационной системы. Предоставляется в соответствии с должностью и рабочими обязанностями.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Владелец данных (Data Owner, DO)</strong></p>
                    <p>Сотрудник, который имеет право и ответственность принимать решения по управлению и развитию данных, относящихся к согласованным информационным классам, и направлять на это ресурсы. При отсутствии этой роли функции выполняет координирующий менеджер данных.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Информационный ресурс</strong></p>
                    <p>Данные, системы и услуги, представляющие ценность для компании и требующие защиты и управления в соответствии со стандартами безопасности.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Стандартное оборудование</strong></p>
                    <p>IT-оборудование, утвержденное и обычно используемое в компании, заказ которого осуществляется по упрощённой и более быстрой процедуре.</p>
                  </li>
                  <li class="label-small">
                    <p><strong style="color:#008834;">Стандартное программное обеспечение</strong></p>
                    <p>Список программного обеспечения, утвержденного в компании, лицензии которого управляются централизованно и заказ которого не требует дополнительных согласований.</p>
                  </li>
                </ul>
              </div>

              <div class="submitting-a-request-popup-faq-tip-box label-small">
                <div>
                  <p><strong style="color:#006527;">Вопросы?</strong></p>
                  <p>Если у вас возникнут вопросы по IT-заявкам, смело обращайтесь в ITabi через портал, по электронной почте или по телефону.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
          </div>
        </div>
    </div>
    `
    };
    function renderINeedIntro(lang) {
        var container = byId("submitting-a-request-popup-faq-container");
        if (!container) return;
        container.innerHTML = iNeedIntroTexts[lang] || iNeedIntroTexts.EN;

        var modal = byId("submitting-a-request-popup-faq-app-detail-modal");
        var openBtn = byId("submitting-a-request-popup-faq-open-modal-btn");
        if (!modal || !openBtn) return;
        var overlay = modal.querySelector(".submitting-a-request-popup-faq-app-modal-overlay");
        var closeBtn = modal.querySelector(".submitting-a-request-popup-faq-app-modal-close");

        function openModal() {
            modal.style.display = "flex";
            document.body.style.overflow = "hidden";
            setTimeout(function () { modal.classList.add("active"); }, 10);
        }
        function closeModal() {
            modal.classList.remove("active");
            setTimeout(function () {
                modal.style.display = "none";
                document.body.style.overflow = "";
            }, 200);
        }
        openBtn.onclick = openModal;
        if (closeBtn) closeBtn.onclick = closeModal;
        if (overlay) overlay.onclick = closeModal;
        /* single Escape handler (replace any prior so they don't stack) */
        if (iNeedEscHandler) document.removeEventListener("keydown", iNeedEscHandler);
        iNeedEscHandler = function (e) {
            if (e.key === "Escape" && modal.classList.contains("active")) closeModal();
        };
        document.addEventListener("keydown", iNeedEscHandler);
    }

    /* tab switcher inside the FAQ handbook modal (exposed for inline onclick) */
    function showPanel(event, panelId) {
        document.querySelectorAll(".submitting-a-request-popup-faq-content-panel")
            .forEach(function (p) { p.classList.remove("active"); });
        document.querySelectorAll(".submitting-a-request-popup-faq-nav-button")
            .forEach(function (b) { b.classList.remove("active"); });
        var panel = byId(panelId);
        if (panel) panel.classList.add("active");
        if (event && event.currentTarget) event.currentTarget.classList.add("active");
    }

    /* ---- Module 3: category cards (End user / IT-to-IT) ---- */
    var iNeedCardTexts = {
        EN: {
            title: "How can we assist you today?",
            endUserLabel: "End user",
            itToItLabel: "IT to IT",
            endUserCards: [
                {title: "Access or permissions", tooltip: "Request access to applications, network folders, databases, USB permissions, external user account creation, access to email and distribution lists, or other access-related resources", icon: "pi-key"},
                {title: "Hardware", tooltip: "Order a computer, device, accessory, or request a computer replacemen.", icon: "pi-desktop"},
                {title: "Telecom", tooltip: "Request a SIM, number transfer, eSIM, package changes, mobile data for a computer, or phones", icon: "pi-phone"},
                {title: "Software", tooltip: "Request existing or new software", icon: "pi-th-large"},
                {title: "New mailbox or mailing list", tooltip: "Request a new mailbox or mailing list", icon: "pi-envelope"},
                {title: "Presentation device or help", tooltip: "Request a presentation device or assistance", icon: "pi-video"},
                {title: "Something is wrong / I want to request a data change", tooltip: "Use this form if you notice incorrect information in the system (e.g., document, phone number, name, etc.) and want it corrected or removed", icon: "pi-times-circle"}
            ],
            itToItCards: [
                {title: "Virtual Machine", tooltip: "Request a new virtual machine or changes to an existing VM infrastructure", icon: "pi-server"}
            ],
            otherOrInfoText: "Unable to find the desired service or looking for more information?",
            otherOrInfoTextSeparator1: "We are working to make the service available soon. In the meantime, you can request",
            otherTextLink: "something else",
            otherOrInfoTextSeparator2: ", or",
            infoTextLink: "information",
            card7Summary: "Something is wrong / I want to request a data change"
        },
        ET: {
            title: "Kuidas saame teid täna aidata?",
            endUserLabel: "Lõppkasutaja",
            itToItLabel: "IT to IT",
            endUserCards: [
                {title: "Ligipääs või õigused", tooltip: "Taotlege ligipääsu rakendustele, võrgukataloogidele, andmebaasidele, USB-õigused, välise kasutajakonto loomise, ligipääsu e-posti ja meililistidele või teistele ligipääsuga seotud ressurssidele", icon: "pi-key"},
                {title: "Riistvara", tooltip: "Telli arvuti, seade, lisatarvikud või esita taotlus arvuti väljavahetamiseks", icon: "pi-desktop"},
                {title: "Telekommunikatsioon", tooltip: "Taotle SIM-kaarti, numbri üleviimist, eSIM-i, paketimuudatusi, mobiilandmesidet arvutile või telefone", icon: "pi-phone"},
                {title: "Tarkvara", tooltip: "Taotle olemasolevat või uut tarkvara", icon: "pi-th-large"},
                {title: "Uue postkasti või meililisti loomine", tooltip: "Taotle uut postkasti või meililist", icon: "pi-envelope"},
                {title: "Esitlusseade või abi", tooltip: "Taotle esitlusseadet või abi", icon: "pi-video"},
                {title: "Midagi on valesti / soovin andmete muudatust", tooltip: "Kasuta seda vormi, kui märkad süsteemis valeinfot (nt dokument, telefoninumber, nimi vms) ja soovid selle parandamist või kustutamist", icon: "pi-times-circle"}
            ],
            itToItCards: [
                {title: "Virtuaalmasin", tooltip: "Taotle uut virtuaalmasinat või muudatusi olemasolevale VM-taristule", icon: "pi-server"}
            ],
            otherOrInfoText: "Kas soovitud teenust ei õnnestu hetkel leida või otsite lisateavet?",
            otherOrInfoTextSeparator1: "Töötame selle nimel, et teenus oleks peagi kättesaadav. Seniks võid taotleda",
            otherTextLink: "midagi muud",
            otherOrInfoTextSeparator2: ", või",
            infoTextLink: "lisateavet",
            card7Summary: "Midagi on valesti / soovin andmete muudatust"
        },
        RU: {
            title: "Как мы можем вам помочь сегодня?",
            endUserLabel: "Конечный пользователь",
            itToItLabel: "IT to IT",
            endUserCards: [
                {title: "Доступ или права", tooltip: "Запросите доступ к приложениям, сетевым папкам, базам данных, USB-права, создание учётной записи внешнего пользователя, доступ к почтовым ящикам и спискам рассылки, а также к другим ресурсам, связанным с доступом", icon: "pi-key"},
                {title: "Оборудование", tooltip: "Оформите заказ на новый компьютер, устройство, дополнительные аксессуары либо подайте запрос на замену рабочего компьютера", icon: "pi-desktop"},
                {title: "Телекоммуникации", tooltip: "Запросите SIM-карту, перенос номера, eSIM, изменения тарифного пакета, мобильные данные для компьютера или телефоны", icon: "pi-phone"},
                {title: "Программное обеспечение", tooltip: "Запросить существующее или новое программное обеспечение", icon: "pi-th-large"},
                {title: "Новая почта или общий адрес", tooltip: "Запросить новый почтовый ящик или бщий адрес", icon: "pi-envelope"},
                {title: "Презентационное устройство или помощь", tooltip: "Запросить устройство для презентации или помощь", icon: "pi-video"},
                {title: "Что-то не так / хочу изменить данные", tooltip: "Используйте эту форму, если заметили неверную информацию в системе (например, документ, номер телефона, имя и т.д.) и хотите её исправить или удалить", icon: "pi-times-circle"}
            ],
            itToItCards: [
                {title: "Виртуальная машина", tooltip: "Запросите новую виртуальную машину или изменения в существующей VM-инфраструктуре", icon: "pi-server"}
            ],
            otherOrInfoText: "Не удаётся найти нужную услугу или ищете дополнительную информацию?",
            otherOrInfoTextSeparator1: "Мы работаем над тем, чтобы услуга вскоре стала доступной. Тем временем вы можете запросить",
            otherTextLink: "что-то другое",
            otherOrInfoTextSeparator2: ", или",
            infoTextLink: "дополнительную информацию",
            card7Summary: "Что-то не так / хочу изменить данные"
        }
    };
    function iNeedCardHtml(card) {
        return '<div class="need-card-icon"><i class="pi ' + card.icon + '"></i></div>' +
            '<span class="need-card-title label-small">' + card.title +
            '<span class="tooltip-container"><i class="pi pi-info-circle info-icon"></i>' +
            '<span class="tooltip-text"><p>' + card.tooltip + '</p></span></span></span>';
    }
    /* bind a click -> shared iframe popup, once per element */
    function bindNeedJiraLink(el, urlOverride) {
        if (el.dataset.popupBound) return;
        el.dataset.popupBound = "true";
        el.addEventListener("click", function (e) {
            e.preventDefault();
            showJiraPopup(urlOverride || el.dataset.finalUrl || el.dataset.jiraUrl);
        });
    }
    function renderINeedCards(lang) {
        var t = iNeedCardTexts[lang] || iNeedCardTexts.EN;
        var titleEl = byId("i-need-title");
        if (!titleEl) return;
        titleEl.textContent = t.title;
        var euLabel = byId("end-user-label"); if (euLabel) euLabel.textContent = t.endUserLabel;
        var itLabel = byId("it-to-it-label"); if (itLabel) itLabel.textContent = t.itToItLabel;

        /* End-user cards 1..6 navigate via their static href; card 7 opens a modal */
        t.endUserCards.forEach(function (card, i) {
            var el = byId("end-user-need-card-" + (i + 1));
            if (el) el.innerHTML = iNeedCardHtml(card);
        });
        t.itToItCards.forEach(function (card, i) {
            var el = byId("it-to-it-need-card-" + (i + 1));
            if (!el) return;
            el.innerHTML = iNeedCardHtml(card);
            bindNeedJiraLink(el);
        });

        var card7 = byId("end-user-need-card-7");
        if (card7 && card7.dataset.jiraUrl) {
            var finalUrl = card7.dataset.jiraUrl + "?summary=" + encodeURIComponent(t.card7Summary);
            card7.dataset.finalUrl = finalUrl;
            bindNeedJiraLink(card7, finalUrl);
        }

        var footer = byId("i-need-other-or-info");
        if (footer) {
            footer.innerHTML =
                t.otherOrInfoText + " " +
                '<span class="other-or-info-text-separator">' + t.otherOrInfoTextSeparator1 + "</span> " +
                '<a href="#" class="i-need-something-link-button other-text-link" data-jira-url="' +
                (SUPPORTAL_BASE + "/servicedesk/customer/portal/31/create/366") + '">' + t.otherTextLink + "</a>" +
                '<span class="other-or-info-text-separator">' + t.otherOrInfoTextSeparator2 + "</span> " +
                '<a href="#" class="i-need-something-link-button info-text-link" data-jira-url="' +
                (SUPPORTAL_BASE + "/servicedesk/customer/portal/31/create/365") + '">' + t.infoTextLink + "</a>";
            footer.querySelectorAll(".i-need-something-link-button").forEach(function (b) {
                bindNeedJiraLink(b);
            });
        }
    }
    /* one-time: End user / IT-to-IT view toggle (static buttons in the .vm) */
    function initINeedViewToggle() {
        var toggles = document.querySelectorAll(".view-toggle");
        if (!toggles.length) return;
        var euView = document.querySelector(".enduser-view");
        var itView = document.querySelector(".ittoit-view");
        toggles.forEach(function (btn) {
            btn.addEventListener("click", function () {
                toggles.forEach(function (b) { b.classList.remove("active"); });
                btn.classList.add("active");
                if (btn.dataset.view === "ittoit") {
                    if (euView) euView.style.display = "none";
                    if (itView) itView.style.display = "grid";
                } else {
                    if (euView) euView.style.display = "grid";
                    if (itView) itView.style.display = "none";
                }
            });
        });
    }


    window.showPanel = showPanel;   /* FAQ handbook tab switcher (inline onclick) */
    S.registerLocalizer(renderINeedIntro);
    S.registerLocalizer(renderINeedCards);
    S.registerInit(initINeedViewToggle);
})(window.Supportal);
