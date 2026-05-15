/* ─────────────────────────────────────────────
   CONTACT WIDGET — self-inserting
   Include contact-widget.css + this script on any page.
   Call openContact(screen, retreatContext) to open.
───────────────────────────────────────────── */

(function () {
  /* ── Inject HTML ── */
  const html = `
  <div class="contact-scrim" id="contact-scrim"></div>

  <div class="contact-panel" id="contact-panel">

    <div class="contact-panel__header">
      <div class="contact-panel__brand">
        <span class="contact-panel__logo">Queen of Retreats</span>
      </div>
      <button class="contact-panel__close" onclick="closeContact()" aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- Screen 1: Dashboard -->
    <div class="contact-screen is-active" id="screen-dashboard">
      <div class="contact-body">
        <div class="contact-dashboard">
          <div class="contact-team-intro">
            <div class="contact-avatars">
              <div class="contact-avatar contact-avatar--placeholder">S</div>
              <div class="contact-avatar contact-avatar--placeholder">J</div>
              <div class="contact-avatar contact-avatar--placeholder">A</div>
            </div>
            <h2 class="contact-intro-heading">How can we help?</h2>
            <p class="contact-intro-sub">Our retreat specialists are here to help you find the right experience, answer questions, or guide you through booking.</p>
            <div class="contact-hours-badge">
              <div class="contact-hours-dot"></div>
              Responds Mon–Fri, 9am–5pm
            </div>
          </div>
          <div class="contact-options">
            <button class="contact-option" onclick="showScreen('message')">
              <div class="contact-option__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div class="contact-option__content">
                <p class="contact-option__title">Message our team</p>
                <p class="contact-option__desc">Ask questions, get recommendations, or clarify a booking. We'll reply with personalised guidance.</p>
                <p class="contact-option__eta">We reply within 4 hours</p>
              </div>
              <div class="contact-option__arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </button>
            <button class="contact-option" onclick="showScreen('callback')">
              <div class="contact-option__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.13 1 .36 1.97.71 2.91a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.94.35 1.91.58 2.91.71a2 2 0 0 1 1.72 2.02z"/></svg>
              </div>
              <div class="contact-option__content">
                <p class="contact-option__title">Request a call back</p>
                <p class="contact-option__desc">Prefer to speak with someone? A specialist will call you at your chosen time.</p>
                <p class="contact-option__eta">We'll call within 24 hours</p>
              </div>
              <div class="contact-option__arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </button>
          </div>
        </div>
      </div>
      <div class="contact-trust">
        <div class="contact-trust-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Expert, concierge-led guidance — not generic support
        </div>
        <div class="contact-trust-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Your details are kept private and secure
        </div>
      </div>
    </div>

    <!-- Screen 2: Message form -->
    <div class="contact-screen" id="screen-message">
      <div class="contact-screen-nav">
        <button class="contact-back" onclick="showScreen('dashboard')" aria-label="Back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="contact-screen-nav__title">Message our team</span>
      </div>
      <div class="contact-body">
        <div class="contact-form-inner">
          <div class="contact-context-card">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>Our retreat specialists typically reply within <strong>4 hours</strong>, Mon–Fri. We'll respond to the email address you provide below.</span>
          </div>
          <div class="contact-field">
            <label for="msg-name">Your name</label>
            <input type="text" id="msg-name" class="form-input" placeholder="e.g. Sarah Collins" autocomplete="given-name">
          </div>
          <div class="contact-field">
            <label for="msg-email">Email address</label>
            <input type="email" id="msg-email" class="form-input" placeholder="e.g. sarah@email.com" autocomplete="email">
          </div>
          <div class="contact-field">
            <label for="msg-retreat">Retreat you're interested in <span>— optional</span></label>
            <select id="msg-retreat">
              <option value="">Select a retreat…</option>
              <option>Four Seasons Bali at Sayan</option>
              <option>Quinta da Levada, Portugal</option>
              <option>Elevation Barn, Bali</option>
              <option>London Meditation Centre</option>
              <option>I'm not sure yet</option>
            </select>
          </div>
          <div class="contact-field">
            <label for="msg-message">Your message</label>
            <textarea id="msg-message" placeholder="Tell us what you'd like to know or what you're looking for…"></textarea>
          </div>
        </div>
      </div>
      <div class="contact-form-footer">
        <button class="btn btn--primary btn--lg btn--full" onclick="submitMessage()">Send message</button>
        <p style="font-size:var(--t-xs);color:var(--stone);text-align:center;margin-top:var(--s3);line-height:1.5;">By sending, you agree to our <a href="#" style="color:var(--stone);">Privacy Policy</a>. We'll never share your details.</p>
      </div>
    </div>

    <!-- Screen 3: Message sent -->
    <div class="contact-screen" id="screen-message-sent">
      <div class="contact-screen-nav">
        <button class="contact-back" onclick="showScreen('dashboard')" aria-label="Back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="contact-screen-nav__title">Message sent</span>
      </div>
      <div class="contact-body">
        <div class="contact-thread">
          <div class="contact-bubble-wrap contact-bubble-wrap--user">
            <div class="contact-bubble contact-bubble--user" id="sent-bubble-text">—</div>
            <div class="contact-bubble__meta">Sent · just now</div>
          </div>
          <div class="contact-bubble-wrap contact-bubble-wrap--team">
            <div class="contact-bubble contact-bubble--team" id="sent-auto-reply">Thanks for your message — we've received it and will reply within 4 hours, Mon–Fri.</div>
            <div class="contact-bubble__meta">Queen of Retreats · automated</div>
          </div>
        </div>
      </div>
      <div class="contact-thread-footer">
        <div style="background:var(--sage-pale);border-radius:var(--r-md);padding:var(--s4) var(--s5);font-size:var(--t-sm);color:var(--ink);line-height:1.6;text-align:center;">
          We'll reply to <strong id="sent-email-display">your email</strong> shortly.
        </div>
        <button class="btn btn--secondary btn--full" onclick="closeContact()">Continue browsing</button>
      </div>
    </div>

    <!-- Screen 4: Callback form -->
    <div class="contact-screen" id="screen-callback">
      <div class="contact-screen-nav">
        <button class="contact-back" onclick="showScreen('dashboard')" aria-label="Back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="contact-screen-nav__title">Request a call back</span>
      </div>
      <div class="contact-body">
        <div class="contact-form-inner">
          <div class="contact-context-card">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>A member of our team will call you at your chosen time. Calls are Mon–Fri, within the times you select.</span>
          </div>
          <div class="contact-field">
            <label for="cb-name">Your name</label>
            <input type="text" id="cb-name" class="form-input" placeholder="e.g. Sarah Collins" autocomplete="given-name">
          </div>
          <div class="contact-field">
            <label for="cb-phone">Phone number</label>
            <input type="tel" id="cb-phone" class="form-input" placeholder="e.g. +44 7700 900 123" autocomplete="tel">
          </div>
          <div class="contact-field">
            <label>Preferred time</label>
            <div class="time-slots">
              <button type="button" class="time-slot" data-slot="morning" onclick="selectTimeSlot(this)">
                <span class="time-slot__label">Morning</span>
                <span class="time-slot__hours">9am–12pm</span>
              </button>
              <button type="button" class="time-slot" data-slot="afternoon" onclick="selectTimeSlot(this)">
                <span class="time-slot__label">Afternoon</span>
                <span class="time-slot__hours">12pm–5pm</span>
              </button>
              <button type="button" class="time-slot" data-slot="evening" onclick="selectTimeSlot(this)">
                <span class="time-slot__label">Evening</span>
                <span class="time-slot__hours">5pm–7pm</span>
              </button>
            </div>
          </div>
          <div class="contact-field">
            <label>Preferred date</label>
            <div class="date-chips">
              <button type="button" class="date-chip is-selected" data-date="today" onclick="selectDate(this)">Today</button>
              <button type="button" class="date-chip" data-date="tomorrow" onclick="selectDate(this)">Tomorrow</button>
              <button type="button" class="date-chip" data-date="thisweek" onclick="selectDate(this)">This week</button>
            </div>
          </div>
          <div class="contact-field">
            <label for="cb-retreat">Retreat you're interested in <span>— optional</span></label>
            <select id="cb-retreat">
              <option value="">Select a retreat…</option>
              <option>Four Seasons Bali at Sayan</option>
              <option>Quinta da Levada, Portugal</option>
              <option>Elevation Barn, Bali</option>
              <option>London Meditation Centre</option>
              <option>I'm not sure yet</option>
            </select>
          </div>
          <div class="contact-field">
            <label for="cb-notes">Anything you'd like us to know? <span>— optional</span></label>
            <textarea id="cb-notes" placeholder="Questions, retreat preferences, budget range…"></textarea>
          </div>
        </div>
      </div>
      <div class="contact-form-footer">
        <button class="btn btn--primary btn--lg btn--full" onclick="submitCallback()">Request call back</button>
        <p style="font-size:var(--t-xs);color:var(--stone);text-align:center;margin-top:var(--s3);line-height:1.5;">By submitting, you agree to our <a href="#" style="color:var(--stone);">Privacy Policy</a>.</p>
      </div>
    </div>

    <!-- Screen 5: Callback confirmed -->
    <div class="contact-screen" id="screen-callback-confirmed">
      <div class="contact-screen-nav" style="border-bottom:none;">
        <button class="contact-back" onclick="showScreen('dashboard')" aria-label="Back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      </div>
      <div class="contact-body">
        <div class="contact-success-body">
          <div class="contact-success-icon">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div><p class="contact-success-title">Call back requested</p></div>
          <p class="contact-success-desc">A member of our team will call <strong id="conf-phone">you</strong> <span id="conf-time-desc">within 24 hours</span>. We look forward to speaking with you.</p>
          <div class="contact-summary-card">
            <div class="contact-summary-row">
              <span class="contact-summary-row__label">Name</span>
              <span class="contact-summary-row__val" id="conf-name">—</span>
            </div>
            <div class="contact-summary-row">
              <span class="contact-summary-row__label">Phone</span>
              <span class="contact-summary-row__val" id="conf-phone-display">—</span>
            </div>
            <div class="contact-summary-row">
              <span class="contact-summary-row__label">Preferred time</span>
              <span class="contact-summary-row__val" id="conf-slot">—</span>
            </div>
            <div class="contact-summary-row">
              <span class="contact-summary-row__label">Date</span>
              <span class="contact-summary-row__val" id="conf-date">—</span>
            </div>
            <div class="contact-summary-row" id="conf-retreat-row" style="display:none;">
              <span class="contact-summary-row__label">Retreat</span>
              <span class="contact-summary-row__val" id="conf-retreat">—</span>
            </div>
          </div>
          <button class="btn btn--secondary btn--full" onclick="closeContact()" style="width:100%;">Continue browsing</button>
        </div>
      </div>
    </div>

  </div>`;

  document.body.insertAdjacentHTML('beforeend', html);

  /* ── Event: click scrim to close ── */
  document.getElementById('contact-scrim').addEventListener('click', closeContact);
})();

/* ── State ── */
let selectedTimeSlot = null;
let selectedDate     = 'today';

/* ── API ── */
function openContact(screen, retreatContext) {
  document.getElementById('contact-panel').classList.add('is-open');
  document.getElementById('contact-scrim').classList.add('is-visible');
  if (retreatContext) {
    document.getElementById('msg-retreat').value = retreatContext;
    document.getElementById('cb-retreat').value  = retreatContext;
  }
  showScreen(screen || 'dashboard');
}

function closeContact() {
  document.getElementById('contact-panel').classList.remove('is-open');
  document.getElementById('contact-scrim').classList.remove('is-visible');
}

function showScreen(id) {
  document.querySelectorAll('.contact-screen').forEach(s => s.classList.remove('is-active'));
  const target = document.getElementById('screen-' + id);
  if (target) target.classList.add('is-active');
}

function selectTimeSlot(el) {
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('is-selected'));
  el.classList.add('is-selected');
  selectedTimeSlot = el.dataset.slot;
}

function selectDate(el) {
  document.querySelectorAll('.date-chip').forEach(c => c.classList.remove('is-selected'));
  el.classList.add('is-selected');
  selectedDate = el.dataset.date;
}

function submitMessage() {
  const name    = document.getElementById('msg-name').value.trim();
  const email   = document.getElementById('msg-email').value.trim();
  const message = document.getElementById('msg-message').value.trim();
  if (!name || !email || !message) { alert('Please fill in your name, email and message.'); return; }
  document.getElementById('sent-bubble-text').textContent = message;
  document.getElementById('sent-email-display').textContent = email;
  document.getElementById('sent-auto-reply').textContent =
    `Thanks ${name} — we've received your message and will reply to ${email} within 4 hours, Mon–Fri.`;
  showScreen('message-sent');
}

function submitCallback() {
  const name  = document.getElementById('cb-name').value.trim();
  const phone = document.getElementById('cb-phone').value.trim();
  if (!name || !phone || !selectedTimeSlot) { alert('Please fill in your name, phone number and preferred time.'); return; }
  const slotLabels = { morning: 'Morning (9am–12pm)', afternoon: 'Afternoon (12pm–5pm)', evening: 'Evening (5pm–7pm)' };
  const dateLabels = { today: 'Today', tomorrow: 'Tomorrow', thisweek: 'This week' };
  const retreat    = document.getElementById('cb-retreat').value;
  document.getElementById('conf-name').textContent          = name;
  document.getElementById('conf-phone').textContent         = phone;
  document.getElementById('conf-phone-display').textContent = phone;
  document.getElementById('conf-slot').textContent          = slotLabels[selectedTimeSlot] || selectedTimeSlot;
  document.getElementById('conf-date').textContent          = dateLabels[selectedDate] || selectedDate;
  document.getElementById('conf-time-desc').textContent     =
    dateLabels[selectedDate].toLowerCase() + ', ' + slotLabels[selectedTimeSlot].toLowerCase();
  if (retreat) {
    document.getElementById('conf-retreat').textContent     = retreat;
    document.getElementById('conf-retreat-row').style.display = '';
  } else {
    document.getElementById('conf-retreat-row').style.display = 'none';
  }
  showScreen('callback-confirmed');
}
