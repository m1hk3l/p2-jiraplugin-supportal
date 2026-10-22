/* ============================================================================
 * FeedbackWizard — React island replacing the JS-injected feedback widget
 * (formerly js/page-home.js). Mounted into #feedback-container-wrapper on
 * home.vm via the data-supportal-component convention.
 *
 * THE POINT OF THIS CONVERSION (ARCHITECTURE.md §7, migration step 3): the
 * old widget triplicated its entire HTML per language (feedbackTexts EN/ET/RU)
 * because the i18n engine cannot re-text JS-injected markup with colliding
 * ids. Here the STRUCTURE exists once, as JSX; only the STRINGS exist three
 * times. The portal remains fully trilingual.
 *
 * Behaviour preserved from the original:
 *  - 4 steps + review; step 2 (free-text "what made it easy/hard") optional,
 *    steps 3-4 validated with the same not-blank/not-dash rule;
 *  - progress bar = ((step-1)/4)*100;
 *  - submit: GET /rest/api/2/myself, then POST /rest/servicedeskapi/request
 *    (serviceDeskId 31, requestTypeId 365), summary + starred description
 *    labels in the CURRENT language, raiseOnBehalfOf the logged-in user;
 *  - result popup (loading/success/error + retry), body scroll locked while
 *    open; form reset on success/close.
 * One deliberate improvement: answers now SURVIVE a language switch (the old
 * widget re-injected its HTML and lost them); the selected radio is stored as
 * an index and rendered/submitted in whichever language is active.
 *
 * CSS: reuses the existing classes from css/home.css unchanged.
 * ========================================================================== */
import React, { useEffect, useRef, useState } from 'react';
import useLang from '../../hooks/useLang';

const STRINGS = {
    EN: {
        title: 'Portal Feedback',
        intro: 'We value your feedback! Please answer the questions below.',
        q1: 'How easy was it for you to reach your goal on this portal?',
        q1Options: ['Very easy', 'Easy', 'Neutral', 'Difficult', 'Very Difficult'],
        q1Error: 'Please choose an option',
        q2: 'Tell us what made it easy or hard.',
        q3: 'What would make this portal more useful for you?',
        q4: 'Do you have any suggestions or wishes for new features or content?',
        textError: 'Please enter a valid answer',
        placeholder: 'Enter your answer',
        review: 'Review your answers',
        next: 'Next', back: 'Back', submit: 'Give Feedback',
        loadingText: 'Submitting your feedback...',
        successText: 'Your feedback has been submitted successfully.',
        successSubtext: 'Thank you for taking the time to share your feedback!',
        errorText: 'Failed to submit the feedback.',
        errorSubtext: 'Please try again later or contact the IT support team.',
        retryBtn: 'Retry',
        jiraSummary: 'Feedback',
        submitLabels: [
            '*1. How easy was it for you to reach your goal on this portal?* ',
            '*Tell us what made it easy or hard.* ',
            '*2. What would make this portal more useful for you?* ',
            '*3. Do you have any suggestions or wishes for new features or content?* ',
        ],
    },
    ET: {
        title: 'Portaali tagasiside',
        intro: 'Hindame teie tagasisidet! Palun vastake allolevatele küsimustele.',
        q1: 'Kui lihtne oli sul siin portaalis oma eesmärgini jõuda?',
        q1Options: ['Väga lihtne', 'Lihtne', 'Neutraalne', 'Keeruline', 'Väga keeruline'],
        q1Error: 'Palun vali üks võimalus.',
        q2: 'Räägi meile, mis tegi selle lihtsaks või keeruliseks.',
        q3: 'Mis muudaks selle portaali sinu jaoks kasulikumaks?',
        q4: 'Kas sul on ettepanekuid või soove uute funktsioonide või sisu osas?',
        textError: 'Palun sisestage korrektne vastus',
        placeholder: 'Sisestage oma vastus',
        review: 'Vaata oma vastuseid üle',
        next: 'Edasi', back: 'Tagasi', submit: 'Anna tagasisidet',
        loadingText: 'Tagasiside esitatakse...',
        successText: 'Teie tagasiside on edukalt edastatud.',
        successSubtext: 'Täname, et võtsite aega meile tagasisidet anda!',
        errorText: 'Tagasiside esitamine ebaõnnestus.',
        errorSubtext: 'Palun proovige hiljem uuesti või võtke ühendust ITabi meeskonnaga.',
        retryBtn: 'Proovi uuesti',
        jiraSummary: 'Tagasiside',
        submitLabels: [
            '*1. Kui lihtne oli sul siin portaalis oma eesmärgini jõuda?* ',
            '*Räägi meile, mis tegi selle lihtsaks või keeruliseks.* ',
            '*2. Mis muudaks selle portaali sinu jaoks kasulikumaks?* ',
            '*3. Kas sul on ettepanekuid või soove uute funktsioonide või sisu osas?* ',
        ],
    },
    RU: {
        title: 'Обратная связь о портале',
        intro: 'Мы ценим ваши отзывы! Пожалуйста, ответьте на приведенные ниже вопросы.',
        q1: 'Насколько легко выполнять задачи на этом портале?',
        q1Options: ['Очень легко', 'Легко', 'Нейтрально', 'Трудно', 'Очень трудно'],
        q1Error: 'Пожалуйста, выберите вариант.',
        q2: 'Расскажите, что сделало это легким или сложным.',
        q3: 'Что сделало бы этот портал более полезным для вас?',
        q4: 'Есть ли у вас предложения или пожелания по новым функциям или контенту?',
        textError: 'Пожалуйста, введите корректный ответ',
        placeholder: 'Введите ответ',
        review: 'Проверьте свои ответы',
        next: 'Далее', back: 'Назад', submit: 'Оставь отзыв',
        loadingText: 'Подача отзыва...',
        successText: 'Ваш отзыв был успешно отправлен.',
        successSubtext: 'Спасибо, что нашли время оставить отзыв!',
        errorText: 'Не удалось отправить отзыв.',
        errorSubtext: 'Пожалуйста, попробуйте позже или свяжитесь с командой ITabi.',
        retryBtn: 'Повторить',
        jiraSummary: 'Обратная связь',
        submitLabels: [
            '*1. Насколько легко выполнять задачи на этом портале?* ',
            '*Расскажите, что сделало это легким или сложным.* ',
            '*2. Что сделало бы этот портал более полезным для вас?* ',
            '*3. Есть ли у вас предложения или пожелания по новым функциям или контенту?* ',
        ],
    },
};

const BASE = () => (window.Supportal && window.Supportal.base) || window.SUPPORTAL_BASE || '';

/* same rule as the original feedbackValidateInput */
const isValidText = (value) => {
    const trimmed = value.trim();
    return !(trimmed === '' || trimmed === '-' || /^[\s-]+$/.test(trimmed));
};

const NORMAL_BORDER = '#e2ded9';
const INVALID_BORDER = '#8d575a';

function getCurrentUser() {
    return fetch(BASE() + '/rest/api/2/myself', {
        method: 'GET', credentials: 'include', headers: { Accept: 'application/json' },
    }).then((r) => {
        if (!r.ok) throw new Error('Failed to get user');
        return r.json();
    }).catch(() => null);
}

/* ---- result popup (loading / success / error + retry) ---- */
function ResultPopup({ view, t, onClose, onRetry }) {
    const [shown, setShown] = useState(false);

    useEffect(() => {
        document.body.classList.add('feedback-modal-open');
        const id = setTimeout(() => setShown(true), 50);   // same entry animation
        return () => {
            clearTimeout(id);
            document.body.classList.remove('feedback-modal-open');
        };
    }, []);

    return (
        <div id="feedback-popup-overlay" className={'feedback-popup-overlay' + (shown ? ' show' : '')}>
            <div className="feedback-popup-modal">
                <div className="feedback-popup-header">
                    <div />
                    <button type="button" className="feedback-popup-close" onClick={onClose}>
                        <i className="pi pi-times" />
                    </button>
                </div>
                <div className="feedback-popup-body">
                    {view === 'loading' && (
                        <div className="loading-message">
                            <div className="loading-icon"><i className="pi pi-spin pi-spinner" style={{ fontSize: '32px' }} /></div>
                            <p className="loading-text">{t.loadingText}</p>
                        </div>
                    )}
                    {view === 'success' && (
                        <div className="success-message">
                            <div className="success-icon"><i className="pi pi-check" /></div>
                            <p className="success-text">{t.successText}</p>
                            <p className="success-subtext">{t.successSubtext}</p>
                        </div>
                    )}
                    {view === 'error' && (
                        <div className="error-message">
                            <div className="error-icon"><i className="pi pi-times" /></div>
                            <p className="error-text">{t.errorText}</p>
                            <p className="error-subtext">{t.errorSubtext}</p>
                            <div className="form-actions" style={{ marginTop: '20px' }}>
                                <button type="button" className="app-btn app-btn-primary" onClick={onRetry}>
                                    {t.retryBtn}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function FeedbackWizard() {
    const lang = useLang();
    const t = STRINGS[lang] || STRINGS.EN;

    const [step, setStep] = useState(1);                 // 1..4, 5 = review
    const [q1, setQ1] = useState(null);                  // index into q1Options
    const [q2, setQ2] = useState('');
    const [q3, setQ3] = useState('');
    const [q4, setQ4] = useState('');
    const [errors, setErrors] = useState({});            // { 1: true, 3: true, 4: true }
    const [popup, setPopup] = useState(null);            // null | 'loading' | 'success' | 'error'
    /* language at submit time, so a retry reproduces the same request even if
       the user switches languages while the error popup is open */
    const submitLang = useRef(lang);

    const progress = ((step - 1) / 4) * 100;

    const setError = (n, on) => setErrors((e) => ({ ...e, [n]: on }));

    const next = (from) => {
        if (from === 1) {
            if (q1 === null) { setError(1, true); return; }
            setError(1, false);
        } else if (from === 3 || from === 4) {
            const value = from === 3 ? q3 : q4;
            if (!isValidText(value)) { setError(from, true); return; }
            setError(from, false);
        }
        setStep(from === 4 ? 5 : from + 1);              // step 4 -> review
    };
    const back = (from) => setStep(from === 5 ? 4 : Math.max(1, from - 1));

    const reset = () => {
        setStep(1); setQ1(null); setQ2(''); setQ3(''); setQ4(''); setErrors({});
    };

    const submit = () => {
        const st = STRINGS[lang] || STRINGS.EN;
        submitLang.current = lang;
        const answers = [
            q1 !== null ? st.q1Options[q1] : '—',
            q2.trim() || '—',
            q3.trim() || '—',
            q4.trim() || '—',
        ];
        setPopup('loading');
        getCurrentUser().then((user) => {
            if (!user) { setPopup('error'); return undefined; }
            const requestData = {
                serviceDeskId: '31',
                requestTypeId: '365',
                requestFieldValues: {
                    summary: st.jiraSummary,
                    description: st.submitLabels.map((label, i) => label + answers[i]).join('\n'),
                },
                requestParticipants: [],
                raiseOnBehalfOf: user.name,
            };
            return fetch(BASE() + '/rest/servicedeskapi/request', {
                method: 'POST', credentials: 'include',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
            }).then((response) => {
                if (!response.ok) { setPopup('error'); return; }
                setPopup('success');
                reset();
            });
        }).catch(() => setPopup('error'));
    };

    const textStep = (n, question, value, setValue, { numbered, validated, textarea }) => (
        <div className={'feedback-step' + (step === n ? ' active' : '')} id={'feedbackStep' + n}>
            <div className="feedback-step-header">
                {numbered && <div className="feedback-step-number line-default">{numbered}</div>}
                <div className="feedback-question line-large">{question}</div>
            </div>
            {textarea ? (
                <textarea
                    className="feedback-textarea label-default"
                    placeholder={t.placeholder}
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        if (validated && isValidText(e.target.value)) setError(n, false);
                    }}
                />
            ) : (
                <input
                    type="text"
                    className="feedback-input label-small"
                    placeholder={t.placeholder}
                    value={value}
                    style={{ borderColor: errors[n] ? INVALID_BORDER : NORMAL_BORDER }}
                    onChange={(e) => {
                        setValue(e.target.value);
                        if (validated && isValidText(e.target.value)) setError(n, false);
                    }}
                />
            )}
            {validated && (
                <div className={'feedback-error label-small' + (errors[n] ? ' show' : '')}>{t.textError}</div>
            )}
            <div className="feedback-buttons">
                <button type="button" className="feedback-button feedback-btn-back label-small" onClick={() => back(n)}>
                    <span>{t.back}</span>
                </button>
                <button type="button" className="feedback-button feedback-btn-next label-small" onClick={() => next(n)}>
                    <span>{t.next}</span>
                </button>
            </div>
        </div>
    );

    const summaryValues = [
        q1 !== null ? t.q1Options[q1] : '—',
        q2.trim() || '—',
        q3.trim() || '—',
        q4.trim() || '—',
    ];
    const summaryQuestions = ['1. ' + t.q1, t.q2, '2. ' + t.q3, '3. ' + t.q4];

    return (
        <div className="feedback-container" id="feedback-form">
            <div className="feedback-card">
                <div className="feedback-header">
                    <h3 className="feedback-title"><i className="pi pi-comment" /> {t.title}</h3>
                    <p className="line-default">{t.intro}</p>
                </div>
                <div className="feedback-progress-bar">
                    <div className="feedback-progress-fill" style={{ width: progress + '%' }} />
                </div>
                <div className="feedback-content">

                    {/* step 1: radio */}
                    <div className={'feedback-step' + (step === 1 ? ' active' : '')} id="feedbackStep1">
                        <div className="feedback-step-header">
                            <div className="feedback-step-number line-default">1</div>
                            <div className="feedback-question line-large">{t.q1}</div>
                        </div>
                        <div className="feedback-options">
                            {t.q1Options.map((opt, i) => (
                                <label className="line-default" key={i}>
                                    <input
                                        type="radio"
                                        name="q1"
                                        checked={q1 === i}
                                        onChange={() => { setQ1(i); setError(1, false); }}
                                    /> {opt}
                                </label>
                            ))}
                        </div>
                        <div className={'feedback-error label-small' + (errors[1] ? ' show' : '')}>{t.q1Error}</div>
                        <div className="feedback-buttons">
                            <button type="button" className="feedback-button feedback-btn-next label-small" onClick={() => next(1)}>
                                <span>{t.next}</span>
                            </button>
                        </div>
                    </div>

                    {/* step 2: optional textarea (unvalidated, as in the original) */}
                    {textStep(2, t.q2, q2, setQ2, { numbered: null, validated: false, textarea: true })}
                    {/* step 3: validated input */}
                    {textStep(3, t.q3, q3, setQ3, { numbered: '2', validated: true, textarea: false })}
                    {/* step 4: validated textarea */}
                    {textStep(4, t.q4, q4, setQ4, { numbered: '3', validated: true, textarea: true })}

                    {/* step 5: review */}
                    <div className={'feedback-step' + (step === 5 ? ' active' : '')} id="feedbackStep5">
                        <div className="feedback-step-header review-header">
                            <div className="feedback-step-number line-default"><i className="pi pi-check-circle" /></div>
                            <div className="feedback-question line-large">{t.review}</div>
                        </div>
                        <div className="feedback-summary">
                            {summaryQuestions.map((q, i) => (
                                <div className="feedback-summary-item" key={i}>
                                    <div className="feedback-summary-question label-default">{q}</div>
                                    <div className="feedback-summary-answer label-small">{summaryValues[i]}</div>
                                </div>
                            ))}
                        </div>
                        <div className="feedback-buttons">
                            <button type="button" className="feedback-button feedback-btn-back label-small" onClick={() => back(5)}>
                                <span>{t.back}</span>
                            </button>
                            <button type="button" className="feedback-button feedback-btn-submit label-small" onClick={submit}>
                                <span>{t.submit}</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {popup && (
                <ResultPopup
                    view={popup}
                    t={STRINGS[submitLang.current] || STRINGS.EN}
                    onClose={() => { setPopup(null); reset(); }}
                    onRetry={() => { setPopup('loading'); submit(); }}
                />
            )}
        </div>
    );
}
