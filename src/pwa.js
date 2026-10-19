import { registerSW } from 'virtual:pwa-register';

const RELOAD_GUARD_KEY = 'tf_pwa_reload_ts';
const RELOAD_DEBOUNCE_MS = 15000; // Prevent reload loops within 15 seconds
const UPDATE_CHECK_THROTTLE_MS = 60000; // Throttle background update checks to at most once per minute
const SAFE_RETRY_INTERVAL_MS = 30000; // Retry deferred updates every 30 seconds

let lastUpdateCheck = 0;
let updatePending = false;
let retryTimer = null;

/**
 * Throttle calls to registration.update() to avoid spamming the network on rapid tab switches.
 */
function requestUpdateCheck(registration) {
  if (!registration) return;
  const now = Date.now();
  if (now - lastUpdateCheck < UPDATE_CHECK_THROTTLE_MS) return;
  lastUpdateCheck = now;
  registration.update().catch(() => {});
}

/**
 * Determine whether the current route represents an active exam or test runner
 * that must never be disrupted by an automatic reload.
 */
function isExamOrProtectedPath(pathname) {
  // /exam/:id is an active exam; /exam/:id/result is post-exam review and safe
  if (pathname.startsWith('/exam/') && !pathname.endsWith('/result')) {
    return true;
  }
  if (pathname.startsWith('/live/') && !pathname.endsWith('/result')) {
    return true;
  }
  if (pathname.startsWith('/live-cbt/')) {
    return true;
  }
  return false;
}

/**
 * Detect active examination state via DOM indicators, ensuring protection even if
 * a route is accessed under unexpected URL parameters, hash fragments, or aliases.
 */
function isExamDomActive() {
  if (typeof document === 'undefined') return false;

  // Question navigator (rendered during CBT and live exam papers)
  if (document.querySelector('nav[aria-label="Question navigator"]')) {
    return true;
  }
  // Active exam question radio options
  if (document.querySelector('input[type="radio"][name="option"], input[type="radio"][name^="q-"]')) {
    return true;
  }
  // Open dialogs or modals (e.g. submit confirmation, calculator, exit alert)
  if (document.querySelector('[role="dialog"], [role="alertdialog"], [aria-modal="true"]')) {
    return true;
  }
  return false;
}

/**
 * Detect active form submission or ongoing loading states to avoid aborting in-flight requests.
 */
function isSubmissionOrLoadingActive() {
  if (typeof document === 'undefined') return false;

  // Submit suspense overlay (ExamRuntimePage marking phase)
  if (document.querySelector('.z-\\[700\\]')) {
    return true;
  }
  // Busy buttons or forms currently submitting
  if (document.querySelector('[aria-busy="true"], button[disabled] .animate-spin')) {
    return true;
  }
  return false;
}

/**
 * Check if the user is actively interacting with form controls or has unsaved input
 * across radio buttons, checkboxes, textareas, text inputs, and select dropdowns.
 */
function hasActiveFormControls() {
  if (typeof document === 'undefined') return false;

  // 1. Any input, textarea, select, or contenteditable currently focused
  const active = document.activeElement;
  if (active && active !== document.body && active !== document.documentElement) {
    const tag = active.tagName ? active.tagName.toLowerCase() : '';
    if (['input', 'textarea', 'select'].includes(tag) || active.isContentEditable) {
      return true;
    }
  }

  // 2. Check all form controls in the document for unsaved user-entered state
  const inputs = document.querySelectorAll('input, textarea, select');
  for (let i = 0; i < inputs.length; i++) {
    const el = inputs[i];
    if (el.disabled) continue;
    const type = (el.type || '').toLowerCase();
    if (['submit', 'button', 'reset', 'hidden'].includes(type)) continue;

    if (type === 'checkbox' || type === 'radio') {
      if (el.checked !== el.defaultChecked) {
        return true;
      }
    } else if (el.value !== el.defaultValue && el.value?.trim().length > 0) {
      return true;
    }
  }

  return false;
}

/**
 * Check if it is safe to reload the application right now.
 * Defers the reload if an examination is in progress, any form control has
 * unsaved state, a submission is pending, or a modal is currently open.
 */
function isSafeToReload() {
  // Prevent reload loops
  try {
    const lastReload = Number(sessionStorage.getItem(RELOAD_GUARD_KEY) || '0');
    if (Date.now() - lastReload < RELOAD_DEBOUNCE_MS) {
      return false;
    }
  } catch {
    // sessionStorage not accessible (e.g. strict security settings)
  }

  // 1. Route check for active exams and live sessions
  if (isExamOrProtectedPath(window.location.pathname)) {
    return false;
  }

  // 2. DOM-level exam element check (navigators, options, exam modals)
  if (isExamDomActive()) {
    return false;
  }

  // 3. Active submission / pending network operation check
  if (isSubmissionOrLoadingActive()) {
    return false;
  }

  // 4. Form control check (radio buttons, checkboxes, textareas, inputs, focus)
  if (hasActiveFormControls()) {
    return false;
  }

  return true;
}

/**
 * Execute a controlled page reload to load newly activated service worker assets.
 */
function performSafeReload() {
  try {
    sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
  } catch {
    // Ignore storage errors
  }
  window.location.reload();
}

/**
 * Stop any active deferred retry timer.
 */
function stopRetryTimer() {
  if (retryTimer) {
    clearInterval(retryTimer);
    retryTimer = null;
  }
}

/**
 * Start a low-frequency timer (30s) to safely retry applying a pending update
 * once the user reaches an idle, safe state outside of exams or unsaved forms.
 */
function startRetryTimer() {
  if (retryTimer) return;
  retryTimer = setInterval(() => {
    if (!updatePending) {
      stopRetryTimer();
      return;
    }
    if (isSafeToReload()) {
      stopRetryTimer();
      updatePending = false;
      performSafeReload();
    }
  }, SAFE_RETRY_INTERVAL_MS);
}

/**
 * Attempt to apply the activated service worker update safely, or retain
 * pending-update state and schedule a safe retry.
 */
function tryApplyUpdate() {
  if (isSafeToReload()) {
    stopRetryTimer();
    updatePending = false;
    performSafeReload();
  } else {
    updatePending = true;
    startRetryTimer();
  }
}

/**
 * Initialize PWA service worker registration and background update lifecycle.
 * Note: Does NOT intercept history.pushState or history.replaceState to ensure
 * zero interference with React Router navigation, form submissions, or history.
 */
export function initPwa() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  const updateSW = registerSW({
    immediate: true,
    onNeedReload() {
      tryApplyUpdate();
    },
    onOfflineReady() {
      // Offline assets cached and ready
    },
    onRegistered(registration) {
      if (!registration) return;

      // 1. Check for updates periodically (every 60 minutes)
      setInterval(() => {
        requestUpdateCheck(registration);
      }, 60 * 60 * 1000);

      // 2. Check for updates when user returns to the tab (throttled)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          requestUpdateCheck(registration);
          if (updatePending) {
            tryApplyUpdate();
          }
        }
      });

      // 3. Check for updates when network connection is restored (throttled)
      window.addEventListener('online', () => {
        requestUpdateCheck(registration);
        if (updatePending) {
          tryApplyUpdate();
        }
      });
    },
    onRegisterError(error) {
      console.warn('PWA service worker registration failed:', error);
    },
  });

  return updateSW;
}
