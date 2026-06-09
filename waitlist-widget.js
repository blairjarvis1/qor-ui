/* ─────────────────────────────────────────────
   WAITLIST WIDGET — self-inserting
   Include waitlist-widget.css + this script on any page.
   Call openWaitlist(retreatName, isLoggedIn, userProfile) to open.

   userProfile = { name: 'Sarah Collins', email: 'sarah@email.com' }
───────────────────────────────────────────── */

(function () {
  const html = `
  <div class="wl-scrim" id="wl-scrim"></div>

  <div class="wl-panel" id="wl-panel">

    <div class="wl-panel__header">
      <div class="wl-panel__brand">
        <span class="wl-panel__logo">Queen of Retreats</span>
      </div>
      <button class="wl-panel__close" onclick="closeWaitlist()" aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- ─── Screen: Form (logged out) ─── -->
    <div class="wl-screen" id="wl-screen-form-guest">
      <div class="wl-screen-nav">
        <span class="wl-screen-nav__title">Join the waitlist</span>
      </div>
      <div class="wl-body">
        <div class="wl-form-inner">

          <div class="wl-retreat-pill" id="wl-retreat-pill-guest">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/></svg>
            <span id="wl-retreat-name-guest">Retreat name</span>
          </div>

          <div class="wl-context-card">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>Dates and pricing for this retreat aren't confirmed yet. Join the waitlist and we'll notify you first when they are.</span>
          </div>

          <div class="wl-field">
            <label for="wl-g-name">Your name</label>
            <input type="text" id="wl-g-name" class="form-input" placeholder="e.g. Sarah Collins" autocomplete="given-name">
          </div>

          <div class="wl-field">
            <label for="wl-g-email">Email address</label>
            <input type="email" id="wl-g-email" class="form-input" placeholder="e.g. sarah@email.com" autocomplete="email">
          </div>

          <div class="wl-field">
            <label>Number of guests <span>— optional</span></label>
            <div class="wl-guest-stepper">
              <button type="button" class="wl-step-btn" onclick="wlStepGuests(-1)" aria-label="Fewer guests">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span class="wl-guest-count" id="wl-guest-count-guest">2</span>
              <button type="button" class="wl-step-btn" onclick="wlStepGuests(1)" aria-label="More guests">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span class="wl-guest-label">guests</span>
            </div>
          </div>

          <div class="wl-field">
            <label>Flexible on dates?</label>
            <div class="wl-chips">
              <button type="button" class="wl-chip" data-flex="yes" onclick="wlSelectFlex(this)">Yes, flexible</button>
              <button type="button" class="wl-chip" data-flex="no" onclick="wlSelectFlex(this)">Need specific dates</button>
            </div>
          </div>

          <div class="wl-signin-nudge">
            Already have an account?
            <a href="account-login.html" class="wl-signin-link">Sign in</a>
            to pre-fill your details.
          </div>

        </div>
      </div>
      <div class="wl-form-footer">
        <button class="btn btn--primary btn--lg btn--full" onclick="wlSubmitGuest()">Join waitlist</button>
        <p class="wl-legal">By joining, you agree to our <a href="#">Privacy Policy</a>. We'll only contact you about this retreat.</p>
      </div>
    </div>

    <!-- ─── Screen: Email verify (logged out post-submit) ─── -->
    <div class="wl-screen" id="wl-screen-verify">
      <div class="wl-screen-nav" style="border-bottom:none;">
      </div>
      <div class="wl-body">
        <div class="wl-success-body">
          <div class="wl-success-icon wl-success-icon--mail">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <p class="wl-success-title">Check your inbox</p>
          <p class="wl-success-desc">We've sent a confirmation link to <strong id="wl-verify-email">your email</strong>. Click it to secure your place on the waitlist.</p>
          <div class="wl-verify-card">
            <div class="wl-retreat-pill wl-retreat-pill--light" id="wl-verify-retreat-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/></svg>
              <span id="wl-verify-retreat-name">Retreat name</span>
            </div>
            <p class="wl-verify-hint">Didn't receive it? Check your spam folder or <button class="wl-resend-btn" onclick="wlResend()">resend the link</button>.</p>
          </div>
          <button class="btn btn--secondary btn--full" onclick="closeWaitlist()" style="width:100%;">Continue browsing</button>
        </div>
      </div>
    </div>

    <!-- ─── Screen: Form (logged in) ─── -->
    <div class="wl-screen" id="wl-screen-form-member">
      <div class="wl-screen-nav">
        <span class="wl-screen-nav__title">Join the waitlist</span>
      </div>
      <div class="wl-body">
        <div class="wl-form-inner">

          <div class="wl-retreat-pill" id="wl-retreat-pill-member">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/></svg>
            <span id="wl-retreat-name-member">Retreat name</span>
          </div>

          <div class="wl-context-card">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>Dates and pricing for this retreat aren't confirmed yet. Join the waitlist and we'll notify you first when they are.</span>
          </div>

          <div class="wl-prefill-card">
            <div class="wl-prefill-avatar" id="wl-prefill-initial">S</div>
            <div class="wl-prefill-info">
              <p class="wl-prefill-name" id="wl-prefill-name">Sarah Collins</p>
              <p class="wl-prefill-email" id="wl-prefill-email">sarah@email.com</p>
            </div>
            <a href="account-details.html" class="wl-prefill-change">Not you?</a>
          </div>

          <div class="wl-field">
            <label>Number of guests <span>— optional</span></label>
            <div class="wl-guest-stepper">
              <button type="button" class="wl-step-btn" onclick="wlStepGuestsMember(-1)" aria-label="Fewer guests">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span class="wl-guest-count" id="wl-guest-count-member">2</span>
              <button type="button" class="wl-step-btn" onclick="wlStepGuestsMember(1)" aria-label="More guests">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span class="wl-guest-label">guests</span>
            </div>
          </div>

          <div class="wl-field">
            <label>Flexible on dates?</label>
            <div class="wl-chips">
              <button type="button" class="wl-chip wl-chip--member" data-flex="yes" onclick="wlSelectFlexMember(this)">Yes, flexible</button>
              <button type="button" class="wl-chip wl-chip--member" data-flex="no" onclick="wlSelectFlexMember(this)">Need specific dates</button>
            </div>
          </div>

          <div class="wl-field">
            <label for="wl-m-notes">Anything else we should know? <span>— optional</span></label>
            <textarea id="wl-m-notes" placeholder="Budget range, ideal month, group type…"></textarea>
          </div>

        </div>
      </div>
      <div class="wl-form-footer">
        <button class="btn btn--primary btn--lg btn--full" onclick="wlSubmitMember()">Join waitlist</button>
        <p class="wl-legal">By joining, you agree to our <a href="#">Privacy Policy</a>. We'll only contact you about this retreat.</p>
      </div>
    </div>

    <!-- ─── Screen: Confirmed (logged in) ─── -->
    <div class="wl-screen" id="wl-screen-confirmed">
      <div class="wl-screen-nav" style="border-bottom:none;"></div>
      <div class="wl-body">
        <div class="wl-success-body">
          <div class="wl-success-icon">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <p class="wl-success-title">You're on the list</p>
          <p class="wl-success-desc">We'll email <strong id="wl-conf-email">you</strong> as soon as dates and pricing are confirmed for this retreat.</p>
          <div class="wl-summary-card">
            <div class="wl-summary-row">
              <span class="wl-summary-label">Retreat</span>
              <span class="wl-summary-val" id="wl-conf-retreat">—</span>
            </div>
            <div class="wl-summary-row">
              <span class="wl-summary-label">Guests</span>
              <span class="wl-summary-val" id="wl-conf-guests">—</span>
            </div>
            <div class="wl-summary-row" id="wl-conf-flex-row">
              <span class="wl-summary-label">Dates</span>
              <span class="wl-summary-val" id="wl-conf-flex">—</span>
            </div>
          </div>
          <div class="wl-also-notify">
            <div class="wl-also-notify__text">
              <p class="wl-also-notify__heading">Similar retreats</p>
              <p class="wl-also-notify__sub">Notify me when similar retreats open up</p>
            </div>
            <label class="wl-toggle">
              <input type="checkbox" id="wl-similar-toggle">
              <span class="wl-toggle__track"></span>
            </label>
          </div>
          <div style="width:100%;display:flex;flex-direction:column;gap:var(--s3);">
            <a href="account-saved.html" class="btn btn--secondary btn--full" style="text-align:center;text-decoration:none;">View my saved retreats</a>
            <button class="btn btn--ghost btn--full" onclick="closeWaitlist()">Continue browsing</button>
          </div>
        </div>
      </div>
    </div>

  </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('wl-scrim').addEventListener('click', closeWaitlist);
})();

/* ── State ── */
let _wlGuestCount        = 2;
let _wlGuestCountMember  = 2;
let _wlFlexGuest         = null;
let _wlFlexMember        = null;
let _wlRetreatName       = '';
let _wlUserEmail         = '';

/* ── Public API ── */
function openWaitlist(retreatName, isLoggedIn, userProfile) {
  _wlRetreatName = retreatName || 'this retreat';
  document.getElementById('wl-panel').classList.add('is-open');
  document.getElementById('wl-scrim').classList.add('is-visible');

  /* Set retreat name in pills */
  document.getElementById('wl-retreat-name-guest').textContent   = _wlRetreatName;
  document.getElementById('wl-retreat-name-member').textContent  = _wlRetreatName;
  document.getElementById('wl-verify-retreat-name').textContent  = _wlRetreatName;

  if (isLoggedIn && userProfile) {
    _wlUserEmail = userProfile.email || '';
    document.getElementById('wl-prefill-name').textContent  = userProfile.name  || '';
    document.getElementById('wl-prefill-email').textContent = userProfile.email || '';
    document.getElementById('wl-prefill-initial').textContent =
      (userProfile.name || 'U').charAt(0).toUpperCase();
    wlShowScreen('form-member');
  } else {
    wlShowScreen('form-guest');
  }
}

function closeWaitlist() {
  document.getElementById('wl-panel').classList.remove('is-open');
  document.getElementById('wl-scrim').classList.remove('is-visible');
}

/* ── Internal ── */
function wlShowScreen(id) {
  document.querySelectorAll('.wl-screen').forEach(s => s.classList.remove('is-active'));
  const el = document.getElementById('wl-screen-' + id);
  if (el) el.classList.add('is-active');
}

/* Guest count — guest form */
function wlStepGuests(delta) {
  _wlGuestCount = Math.min(12, Math.max(1, _wlGuestCount + delta));
  document.getElementById('wl-guest-count-guest').textContent = _wlGuestCount;
}

/* Guest count — member form */
function wlStepGuestsMember(delta) {
  _wlGuestCountMember = Math.min(12, Math.max(1, _wlGuestCountMember + delta));
  document.getElementById('wl-guest-count-member').textContent = _wlGuestCountMember;
}

function wlSelectFlex(el) {
  document.querySelectorAll('.wl-chip:not(.wl-chip--member)').forEach(c => c.classList.remove('is-selected'));
  el.classList.add('is-selected');
  _wlFlexGuest = el.dataset.flex;
}

function wlSelectFlexMember(el) {
  document.querySelectorAll('.wl-chip--member').forEach(c => c.classList.remove('is-selected'));
  el.classList.add('is-selected');
  _wlFlexMember = el.dataset.flex;
}

function wlSubmitGuest() {
  const name  = document.getElementById('wl-g-name').value.trim();
  const email = document.getElementById('wl-g-email').value.trim();
  if (!name || !email) { alert('Please enter your name and email address.'); return; }
  _wlUserEmail = email;
  document.getElementById('wl-verify-email').textContent = email;
  wlShowScreen('verify');
}

function wlSubmitMember() {
  const flexLabel = { yes: 'Flexible', no: 'Specific dates needed' };
  document.getElementById('wl-conf-email').textContent  = _wlUserEmail;
  document.getElementById('wl-conf-retreat').textContent = _wlRetreatName;
  document.getElementById('wl-conf-guests').textContent =
    _wlGuestCountMember + ' guest' + (_wlGuestCountMember !== 1 ? 's' : '');
  if (_wlFlexMember) {
    document.getElementById('wl-conf-flex').textContent = flexLabel[_wlFlexMember] || '—';
  } else {
    document.getElementById('wl-conf-flex-row').style.display = 'none';
  }
  wlShowScreen('confirmed');
}

function wlResend() {
  const btn = document.querySelector('.wl-resend-btn');
  if (btn) { btn.textContent = 'Sent!'; btn.disabled = true; }
}
