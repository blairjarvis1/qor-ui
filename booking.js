/* ============================================================
   Queen of Retreats — Booking Flow JS
   v1.0 · 2026
   ============================================================ */

'use strict';

/* --- Module-level carousel handles -------------------------- */
let calScrollTo = null; // set by initCalCarousel; call calScrollTo(index) to jump
let calResize   = null; // set by initCalCarousel; call calResize() to recalculate card widths

/* --- State --------------------------------------------------- */
const state = {
  currentStep: 1,
  totalSteps: 6,
  selectedDate: null,
  selectedRoom: null,       // Room 1 selection (always the primary)
  extraRooms: {},           // extra room selections keyed by slot number {2: roomObj, 3: null, ...}
  activeRoomSlot: 1,        // which slot receives card clicks
  multiRoomMode: false,     // whether any extra room tabs have been added
  addedRoomSlots: 1,        // how many room-slot tabs currently exist
  guestCount: 1,
  guestType: null,          // 'solo' | 'multiple' | 'retreat'
  paymentOption: 'deposit', // 'deposit' | 'full'
  promoCode: null,          // applied promo code string
  promoDiscount: 0,         // discount multiplier (0.2 = 20%)
  selectedExtras: {},       // extra id → true when added
};

const RETREAT_DATES = [
  { id: 'd1',  label: '7–14 June 2026',          nights: 7, spaces: 3,  status: 'limited',   priceFrom: 2195 },
  { id: 'd2',  label: '21–28 June 2026',          nights: 7, spaces: 8,  status: 'available', priceFrom: 2195 },
  { id: 'd3',  label: '5–12 July 2026',           nights: 7, spaces: 0,  status: 'soldout',   priceFrom: 2195 },
  { id: 'd4',  label: '19–26 July 2026',          nights: 7, spaces: 6,  status: 'available', priceFrom: 2195 },
  { id: 'd5',  label: '2–9 August 2026',          nights: 7, spaces: 2,  status: 'limited',   priceFrom: 2895 },
  { id: 'd6',  label: '16–23 August 2026',        nights: 7, spaces: 10, status: 'available', priceFrom: 2195 },
  { id: 'd7',  label: '6–13 September 2026',      nights: 7, spaces: 8,  status: 'available', priceFrom: 2195 },
  { id: 'd8',  label: '20–27 September 2026',     nights: 7, spaces: 3,  status: 'limited',   priceFrom: 2195 },
  { id: 'd9',  label: '4–11 October 2026',        nights: 7, spaces: 6,  status: 'available', priceFrom: 2195 },
  { id: 'd10', label: '18–25 October 2026',       nights: 7, spaces: 0,  status: 'soldout',   priceFrom: 2195 },
  { id: 'd11', label: '1–8 November 2026',        nights: 7, spaces: 10, status: 'available', priceFrom: 2195 },
  { id: 'd12', label: '15–22 November 2026',      nights: 7, spaces: 4,  status: 'limited',   priceFrom: 2195 },
  { id: 'd13', label: '6–13 December 2026',       nights: 7, spaces: 8,  status: 'available', priceFrom: 2195 },
  { id: 'd14', label: '20–27 December 2026',      nights: 7, spaces: 2,  status: 'limited',   priceFrom: 2195 },
  { id: 'd15', label: '3–10 January 2027',        nights: 7, spaces: 12, status: 'available', priceFrom: 2195 },
  { id: 'd16', label: '17–24 January 2027',       nights: 7, spaces: 8,  status: 'available', priceFrom: 2195 },
  { id: 'd17', label: '7–14 February 2027',       nights: 7, spaces: 3,  status: 'limited',   priceFrom: 2195 },
  { id: 'd18', label: '21–28 February 2027',      nights: 7, spaces: 10, status: 'available', priceFrom: 2195 },
];

const ROOMS = [
  { id: 'r1', name: 'Shared Garden Room',   type: 'Twin share · Garden view',     price: 2195, badge: null },
  { id: 'r2', name: 'Garden Room',           type: 'Double · Garden view · Private', price: 2595, badge: null },
  { id: 'r3', name: 'Private Valley Room',  type: 'Double or twin · Valley view', price: 2895, badge: 'Most popular' },
  { id: 'r4', name: 'Quinta Suite',         type: 'Junior suite · Private terrace', price: 3750, badge: 'Premium' },
];

const EXTRAS = [
  { id: 'e1', category: 'treatments', name: 'Luxury Massage',          desc: '60-minute full-body Balinese massage.',                   price: 95  },
  { id: 'e2', category: 'treatments', name: 'Organic Facial',           desc: 'Nourishing organic facial — suited to all skin types.',   price: 85  },
  { id: 'e3', category: 'activities', name: 'Private Yoga Session',     desc: 'One-to-one with your lead facilitator.',                  price: 75  },
  { id: 'e4', category: 'activities', name: 'Sunrise Hike',             desc: 'Guided mountain trail — 3 hrs, moderate pace.',           price: 45  },
  { id: 'e5', category: 'coaching',   name: 'Life Coaching Session',    desc: '60-minute private session with a certified coach.',       price: 120 },
  { id: 'e6', category: 'coaching',   name: 'Nutrition Consultation',   desc: 'Personalised session with our resident nutritionist.',    price: 95  },
  { id: 'e7', category: 'transport',  name: 'Private Airport Transfer', desc: 'Door-to-door private car from Denpasar Airport.',        price: 65  },
  { id: 'e8', category: 'transport',  name: 'Spa Town Day Trip',        desc: 'Guided half-day trip to Ubud with driver-guide.',        price: 85  },
];

/* --- Init ---------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Clear hash so browser doesn't auto-scroll to step anchor
  history.replaceState(null, '', window.location.pathname);

  // ── PDP preselect: check if user arrived via the bottom bar "Book" CTA ──
  let startStep = 1;
  const preselectRaw = sessionStorage.getItem('qor_preselect');
  if (preselectRaw) {
    sessionStorage.removeItem('qor_preselect');
    try {
      const ps = JSON.parse(preselectRaw);
      // Map date ID → full date object
      const date = ps.dateId ? RETREAT_DATES.find(d => d.id === ps.dateId) : null;
      // Map room price → full room object
      const room = ps.roomPrice ? ROOMS.find(r => r.price === ps.roomPrice) : null;
      if (date) state.selectedDate = date;
      if (room) state.selectedRoom = room;
      if (ps.guests && ps.guests >= 1) state.guestCount = ps.guests;
      if (room) startStep = 2; // only jump ahead if a room was actually selected
    } catch (e) {
      // Malformed data — fall back to step 1
    }
  }

  // Handle URL hash on load (only used when no preselect)
  if (startStep === 1) {
    const hash = window.location.hash;
    const stepMatch = hash.match(/^#step-(\d)$/);
    if (stepMatch) {
      const n = parseInt(stepMatch[1]);
      if (n >= 1 && n <= 8) startStep = n;
    }
  }

  renderStep(startStep, false);

  initNavButtons();
  initDateSelection();
  initRoomSelection();
  initRoomTabs();
  initGuestStepper();
  initGuestType();
  initMultipleStepper();
  initPaymentToggle();
  initViewToggle();
  initCalendar();   // ← calendar DOM cells are created here
  initAccordions();
  initTabs();
  initConditionalFields();
  initCardFormatting();
  initPromoCode();

  // Apply preselect UI *after* all inits so calendar cells and room cards exist
  if (startStep === 2) {
    if (state.selectedDate) {
      selectDate(state.selectedDate.id);
      // Scroll the calendar carousel — two rAF frames: first resize, then scroll
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (calScrollTo) {
          const dayEl   = document.querySelector(`.cal-day[data-date-id="${state.selectedDate.id}"]`);
          const calCard = dayEl && dayEl.closest('.calendar');
          if (calCard) {
            const allCards = Array.from(document.querySelectorAll('.cal-months .calendar'));
            const idx = allCards.indexOf(calCard);
            if (idx >= 0) calScrollTo(idx);
          }
        }
      }));
    }
    if (state.selectedRoom) selectRoom(state.selectedRoom.id);
    applyStep3Fields();
  }
});

/* --- Populate Step 3 summary fields (also used after preselect) ---------- */
function applyStep3Fields() {
  const s = state;
  const d3dates  = document.getElementById('step3-dates');
  const d3room   = document.getElementById('step3-room');
  const d3guests = document.getElementById('step3-guests');
  if (d3dates)  d3dates.textContent  = s.selectedDate ? s.selectedDate.label : 'Dates not yet selected';
  if (d3room)   d3room.textContent   = s.selectedRoom  ? s.selectedRoom.name  : 'No room selected';
  if (d3guests) d3guests.textContent = s.guestCount === 1 ? '1 guest' : `${s.guestCount} guests`;
}

/* --- Step Navigation ----------------------------------------- */
function renderStep(n, animate = true) {
  const panels = document.querySelectorAll('.step-panel');
  panels.forEach(p => p.classList.remove('is-active'));

  const target = document.getElementById(`step-${n}`);
  if (!target) return;
  target.classList.add('is-active');

  state.currentStep = n;
  window.scrollTo(0, 0);
  updateProgressBar(n);
  updateSidebar();
  updateNavButtons(n);


  // Recalculate calendar widths when step 1 becomes visible —
  // needed when navigating back from a later step where step 1 was hidden (offsetWidth=0)
  if (n === 1 && calResize) {
    requestAnimationFrame(calResize);
  }

  // Populate confirmation receipt with live state values
  if (n === 6 && state.selectedRoom) {
    const base     = state.selectedRoom.price;
    const count    = state.guestCount;
    const subtotal = base * count;
    const discount = Math.round(subtotal * state.promoDiscount);
    const total    = subtotal - discount;
    const deposit  = Math.ceil(total * 0.25);
    const balance  = total - deposit;
    const paidFull = state.paymentOption === 'full';
    const amountPaid   = paidFull ? total    : deposit;
    const amountOwed   = paidFull ? 0        : balance;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    // Receipt card rows
    if (state.selectedDate) set('conf-dates', state.selectedDate.label);
    set('conf-room',    state.selectedRoom.name);
    set('conf-guests',  count === 1 ? '1 person' : `${count} people`);
    set('conf-deposit', `£${amountPaid.toLocaleString()} ✓`);
    set('conf-total',   `£${total.toLocaleString()}`);

    // Deposit label and balance rows — adjust for payment option
    const balanceRow     = document.getElementById('conf-balance-row');
    const balanceDateRow = document.getElementById('conf-balance-date-row');
    if (paidFull) {
      set('conf-deposit-label', 'Paid in full');
      if (balanceRow)     balanceRow.style.display     = 'none';
      if (balanceDateRow) balanceDateRow.style.display = 'none';
    } else {
      set('conf-deposit-label', 'Deposit paid');
      if (balanceRow)     balanceRow.style.display     = '';
      if (balanceDateRow) balanceDateRow.style.display = '';
      set('conf-balance', `£${amountOwed.toLocaleString()}`);
    }

    // "What happens next" inline balance mention
    set('conf-balance-text', `£${amountOwed.toLocaleString()}`);
  }

  // Booking nav: hide entirely on step 7 (confirmation)
  const bookingNav = document.querySelector('.booking-nav');
  if (bookingNav) {
    bookingNav.classList.toggle('hidden', n === 6);
    bookingNav.classList.toggle('booking-nav--no-summary', n === 7);
  }
  const bookingBasket = document.getElementById('booking-basket');
  if (bookingBasket) bookingBasket.classList.toggle('hidden', false);

  const isConfirmation = n === 6;
  const confActions = document.getElementById('basket-conf-actions');
  const totalSection = document.getElementById('basket-total-section');
  const basketFooter = document.querySelector('.booking-basket__footer');
  if (confActions)  confActions.style.display  = isConfirmation ? 'flex' : 'none';
  if (totalSection) totalSection.style.display = isConfirmation ? 'none' : '';
  if (basketFooter) basketFooter.style.display = isConfirmation ? 'none' : '';

  // Don't scroll to top or alter hash (preserves scroll position on step change)
  history.replaceState(null, '', `#step-${n}`);
}

const STEP_ICONS = [
  /* 1 Dates & Room */
  `<svg width="22.75" height="22.75" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  /* 2 Review */
  `<svg width="22.75" height="22.75" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>`,
  /* 3 Your Details */
  `<svg width="22.75" height="22.75" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  /* 4 About You */
  `<svg width="22.75" height="22.75" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  /* 5 Payment */
  `<svg width="22.75" height="22.75" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
];
const DONE_ICON = `<svg width="22.75" height="22.75" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;

function updateProgressBar(current) {
  const steps = document.querySelectorAll('.progress-step[data-step]');
  steps.forEach(step => {
    const n = parseInt(step.dataset.step);
    step.classList.remove('is-done', 'is-active');
    if (n < current) step.classList.add('is-done');
    if (n === current) step.classList.add('is-active');

    const dot = step.querySelector('.progress-step__dot');
    if (dot) {
      dot.innerHTML = n;
    }
  });
}

function updateNavButtons(n) {
  const backBtn = document.getElementById('nav-back');
  const continueBtn = document.getElementById('nav-continue');
  const stepInfo = document.getElementById('nav-step-info');

  if (backBtn) backBtn.style.visibility = n === 1 ? 'hidden' : 'visible';
  if (stepInfo) stepInfo.textContent = `${n} of 5`;

  const PLUS_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="4" x2="12" y2="20"/><line x1="4" y1="12" x2="20" y2="12"/></svg>';
  if (continueBtn) {
    if (n === 5) {
      continueBtn.innerHTML = 'Complete Booking ' + PLUS_ICON;
      continueBtn.classList.add('btn--ink');
      continueBtn.classList.remove('btn--primary');
    } else if (n === 6) {
      continueBtn.classList.add('hidden');
    } else {
      continueBtn.innerHTML = 'Continue ' + PLUS_ICON;
      continueBtn.classList.remove('btn--ink');
      continueBtn.classList.add('btn--primary');
      continueBtn.classList.remove('hidden');
    }
  }
}

function initNavButtons() {
  const backBtn = document.getElementById('nav-back');
  const continueBtn = document.getElementById('nav-continue');

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (state.currentStep > 1) renderStep(state.currentStep - 1);
    });
  }
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (!validateStep(state.currentStep)) return;
      if (state.currentStep < state.totalSteps) renderStep(state.currentStep + 1);
    });
  }

  // Step click on progress bar
  document.querySelectorAll('.progress-step[data-step]').forEach(step => {
    step.addEventListener('click', () => {
      const n = parseInt(step.dataset.step);
      if (n < state.currentStep) renderStep(n);
    });
  });
}

/* --- Validation --------------------------------------------- */
function validateStep(n) {
  switch (n) {
    case 1:
      if (!state.selectedDate) {
        showError('Please select your retreat dates to continue.');
        return false;
      }
      if (state.guestType !== 'retreat' && !(state.guestType === 'multiple' && state.guestCount >= 7) && !state.selectedRoom) {
        showError('Please choose a room to continue.');
        return false;
      }
      return true;
    case 2: {
      const cb1 = document.getElementById('agree-policies');
      const cb2 = document.getElementById('agree-tcs');
      if (!cb1?.checked || !cb2?.checked) {
        showError('Please read and accept the policies to continue.');
        return false;
      }
      return true;
    }
    case 3: {
      const req = document.querySelectorAll('#step-3 [required]');
      let valid = true;
      req.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = 'var(--error)';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });
      if (!valid) {
        showError('Please fill in all required fields.');
        return false;
      }
      return true;
    }
    default:
      return true;
  }
}

function showError(msg) {
  const existing = document.querySelector('.js-error-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'js-error-toast';
  toast.style.cssText = `
    position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
    background: var(--error-bg); color: var(--error); border: 1px solid var(--error);
    border-radius: var(--r-md); padding: var(--s3) var(--s6);
    font-size: var(--t-sm); font-weight: 500; z-index: 999;
    box-shadow: var(--shadow-md); white-space: nowrap;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* --- Date Selection ----------------------------------------- */
function initDateSelection() {
  // List view items
  document.querySelectorAll('.date-list-item[data-date-id]').forEach(item => {
    if (item.dataset.status === 'soldout') return;
    item.addEventListener('click', () => selectDate(item.dataset.dateId));
  });
}

function selectDate(id) {
  const date = RETREAT_DATES.find(d => d.id === id);
  if (!date || date.status === 'soldout') return;

  state.selectedDate = date;

  // Update list items
  document.querySelectorAll('.date-list-item[data-date-id]').forEach(el => {
    el.classList.toggle('is-selected', el.dataset.dateId === id);
  });

  // Update calendar
  document.querySelectorAll('.cal-day[data-date-id]').forEach(el => {
    el.classList.toggle('cal-day--selected', el.dataset.dateId === id);
    if (el.dataset.dateId === id) {
      el.classList.remove('cal-day--available', 'cal-day--limited');
    } else {
      restoreCalDay(el);
    }
  });

  // Update selected date card in list view
  const panel = document.getElementById('date-selected-panel');
  const label = document.getElementById('date-selected-label');
  if (panel && label) {
    label.textContent = date.label;
    panel.classList.remove('is-hidden');
  }

  updateSidebar();
}

function restoreCalDay(el) {
  const id = el.dataset.dateId;
  if (!id) return;
  const date = RETREAT_DATES.find(d => d.id === id);
  if (!date) return;
  el.className = `cal-day cal-day--${date.status}`;
}

/* --- Room Selection ----------------------------------------- */
function initRoomSelection() {
  document.querySelectorAll('.room-card[data-room-id]').forEach(card => {
    card.addEventListener('click', () => {
      selectRoom(card.dataset.roomId);
    });
  });
}

function selectRoom(id) {
  const room = ROOMS.find(r => r.id === id);
  if (!room) return;

  if (state.multiRoomMode && state.activeRoomSlot > 1) {
    state.extraRooms[state.activeRoomSlot] = room;
  } else {
    state.selectedRoom = room;
  }

  refreshRoomCardDisplay();
  updateSidebar();
}

function refreshRoomCardDisplay() {
  const active = state.activeRoomSlot > 1 ? state.extraRooms[state.activeRoomSlot] : state.selectedRoom;
  document.querySelectorAll('.room-card[data-room-id]').forEach(c => {
    c.classList.toggle('is-selected', !!(active && c.dataset.roomId === active.id));
  });
}

/* --- Room Tabs (Multiple Guests: Room 1 / Room N) ---------- */
function initRoomTabs() {
  const toggle = document.getElementById('room-slot-toggle');
  const addBtn = document.getElementById('room-tab-add');

  const tab1 = document.getElementById('room-tab-1');
  if (tab1) {
    tab1.addEventListener('click', () => {
      state.activeRoomSlot = 1;
      if (toggle) toggle.querySelectorAll('.view-toggle__btn').forEach(b => b.classList.remove('is-active'));
      tab1.classList.add('is-active');
      refreshRoomCardDisplay();
    });
  }

  if (toggle) {
    toggle.addEventListener('click', e => {
      const btn = e.target.closest('.view-toggle__btn[data-slot]');
      if (!btn || btn.id === 'room-tab-1') return;
      const slot = parseInt(btn.dataset.slot);
      state.activeRoomSlot = slot;
      toggle.querySelectorAll('.view-toggle__btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      refreshRoomCardDisplay();
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const newSlot = state.addedRoomSlots + 1;
      state.addedRoomSlots = newSlot;
      state.activeRoomSlot = newSlot;
      state.multiRoomMode  = true;

      const newTab = document.createElement('button');
      newTab.className = 'view-toggle__btn';
      newTab.id        = `room-tab-${newSlot}`;
      newTab.dataset.slot = String(newSlot);
      newTab.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Room ${newSlot}`;
      if (toggle) {
        toggle.querySelectorAll('.view-toggle__btn').forEach(b => b.classList.remove('is-active'));
        toggle.appendChild(newTab);
        newTab.classList.add('is-active');
      }

      addBasketRoomRow(newSlot);

      refreshRoomCardDisplay();
      updateRoomTabAddBtn();
      updateSidebar();
    });
  }
}

function addBasketRoomRow(slot) {
  const container = document.getElementById('basket-extra-rooms');
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'booking-basket__row';
  row.id = `basket-room${slot}-row`;
  row.innerHTML = `<span class="booking-basket__row-label">Room ${slot}</span><span class="booking-basket__row-val placeholder" id="nav-room${slot}">Select room</span>`;
  container.appendChild(row);
}

function updateRoomTabAddBtn() {
  const addBtn = document.getElementById('room-tab-add');
  if (!addBtn) return;
  const canAdd = state.addedRoomSlots < state.guestCount;
  addBtn.style.display = canAdd ? 'flex' : 'none';
}

function showRoomTabs() {
  const bar     = document.getElementById('room-tabs-bar');
  const heading = document.getElementById('room-section-heading');
  if (bar)     bar.style.display     = 'flex';
  if (heading) heading.textContent   = 'Choose your rooms';
  const label = document.getElementById('basket-room1-label');
  if (label)   label.textContent     = 'Room 1';
  updateRoomTabAddBtn();
}

function hideRoomTabs() {
  const bar      = document.getElementById('room-tabs-bar');
  const heading  = document.getElementById('room-section-heading');
  const tab1     = document.getElementById('room-tab-1');
  const addBtn   = document.getElementById('room-tab-add');
  const label    = document.getElementById('basket-room1-label');
  const extraContainer = document.getElementById('basket-extra-rooms');
  const toggle   = document.getElementById('room-slot-toggle');

  if (bar)     bar.style.display   = 'none';
  if (heading) heading.textContent = 'Choose your room';
  if (label)   label.textContent   = 'Room';

  if (toggle) {
    toggle.querySelectorAll('.view-toggle__btn:not(#room-tab-1)').forEach(t => t.remove());
  }

  if (extraContainer) extraContainer.innerHTML = '';

  if (addBtn) { addBtn.style.display = 'flex'; }
  if (tab1)   { tab1.classList.add('is-active'); }

  state.extraRooms      = {};
  state.activeRoomSlot  = 1;
  state.multiRoomMode   = false;
  state.addedRoomSlots  = 1;

  refreshRoomCardDisplay();
}

/* --- Guest Stepper ------------------------------------------ */
function initGuestStepper() {
  const minus = document.getElementById('guest-minus');
  const plus  = document.getElementById('guest-plus');
  const val   = document.getElementById('guest-count');

  if (!minus || !plus || !val) return;

  // Reflect any preselected guest count in the stepper UI
  val.textContent = state.guestCount;
  minus.disabled = state.guestCount <= 1;

  minus.addEventListener('click', () => {
    if (state.guestCount > 1) {
      state.guestCount--;
      val.textContent = state.guestCount;
      minus.disabled = state.guestCount <= 1;
      updateSidebar();
    }
  });
  plus.addEventListener('click', () => {
    if (state.guestCount < 12) {
      state.guestCount++;
      val.textContent = state.guestCount;
      minus.disabled = false;
      updateSidebar();
    }
  });
}

/* --- Guest Type (solo/multiple/retreat) -------------------- */
function initGuestType() {
  document.querySelectorAll('.guest-type-card[data-type]').forEach(card => {
    card.addEventListener('click', () => {
      const prevType = state.guestType;
      state.guestType = card.dataset.type;
      document.querySelectorAll('.guest-type-card[data-type]').forEach(c => {
        c.classList.toggle('is-active', c.dataset.type === state.guestType);
      });
      if (state.guestType === 'multiple') {
        const valEl = document.getElementById('group-stepper-val');
        state.guestCount = valEl ? parseInt(valEl.textContent) : 2;
        showRoomTabs();
      } else {
        if (prevType === 'multiple') hideRoomTabs();
        state.guestCount = 1;
      }
      const val = document.getElementById('guest-count');
      if (val) val.textContent = state.guestCount;
      const guestsRow = document.getElementById('basket-guests-row');
      if (guestsRow) guestsRow.style.display = state.guestType === 'retreat' ? 'none' : '';

      // Hide room + extras sections for Full Retreat; show for all other types
      const isRetreat = state.guestType === 'retreat';
      const roomSection    = document.getElementById('room-section');
      const extrasSection  = document.getElementById('extras-section');
      const retreatNotice  = document.getElementById('retreat-notice');
      if (roomSection)    roomSection.style.display    = isRetreat ? 'none' : '';
      if (extrasSection)  extrasSection.style.display  = isRetreat ? 'none' : '';
      if (retreatNotice)  retreatNotice.style.display  = isRetreat ? 'flex' : 'none';

      updateSidebar();
    });
  });
}

/* --- Multiple Guests stepper (2–6) -------------------------- */
function initMultipleStepper() {
  const minBtn = document.getElementById('group-stepper-minus');
  const plusBtn = document.getElementById('group-stepper-plus');
  const valEl  = document.getElementById('group-stepper-val');
  if (!minBtn || !plusBtn || !valEl) return;

  const MIN = 2, MAX = 12;

  function setCount(n) {
    const sel = document.getElementById('group-guest-count');
    if (sel) sel.value = String(n);
    valEl.textContent = n;
    minBtn.disabled   = (n <= MIN);
    plusBtn.disabled  = (n >= MAX);
    state.guestCount  = n;

    const roomSection   = document.getElementById('room-section');
    const extrasSection = document.getElementById('extras-section');
    const retreatNotice = document.getElementById('retreat-notice');

    if (n >= 7) {
      if (roomSection)   roomSection.style.display   = 'none';
      if (extrasSection) extrasSection.style.display = 'none';
      if (retreatNotice) retreatNotice.style.display = 'flex';
      hideRoomTabs();
    } else {
      if (roomSection)   roomSection.style.display   = '';
      if (extrasSection) extrasSection.style.display = '';
      if (retreatNotice) retreatNotice.style.display = 'none';
      showRoomTabs();
      if (state.addedRoomSlots > n) trimRoomSlotsTo(n);
    }

    updateRoomTabAddBtn();
    updateSidebar();
  }

  minBtn.addEventListener('click', e => {
    e.stopPropagation();
    const n = parseInt(valEl.textContent);
    if (n > MIN) setCount(n - 1);
  });
  plusBtn.addEventListener('click', e => {
    e.stopPropagation();
    const n = parseInt(valEl.textContent);
    if (n < MAX) setCount(n + 1);
  });
}

function trimRoomSlotsTo(n) {
  const toggle = document.getElementById('room-slot-toggle');
  if (toggle) {
    toggle.querySelectorAll('.view-toggle__btn[data-slot]').forEach(btn => {
      const slot = parseInt(btn.dataset.slot);
      if (slot > n) btn.remove();
    });
  }
  for (let s = n + 1; s <= 6; s++) {
    delete state.extraRooms[s];
  }
  for (let s = n + 1; s <= 6; s++) {
    const row = document.getElementById(`basket-room${s}-row`);
    if (row) row.remove();
  }
  state.addedRoomSlots = Math.min(state.addedRoomSlots, n);
  if (state.activeRoomSlot > n) {
    state.activeRoomSlot = 1;
    const tab1 = document.getElementById('room-tab-1');
    if (tab1) {
      toggle && toggle.querySelectorAll('.view-toggle__btn').forEach(b => b.classList.remove('is-active'));
      tab1.classList.add('is-active');
    }
    if (n === 1) state.multiRoomMode = false;
  }
  refreshRoomCardDisplay();
}

/* --- Payment Toggle ----------------------------------------- */
function initPaymentToggle() {
  document.querySelectorAll('.payment-option[data-payment]').forEach(opt => {
    opt.addEventListener('click', () => {
      state.paymentOption = opt.dataset.payment;
      document.querySelectorAll('.payment-option[data-payment]').forEach(o => {
        o.classList.toggle('is-active', o.dataset.payment === state.paymentOption);
      });
      updateSidebar();
    });
  });
}

/* --- View Toggle (Calendar / List) -------------------------- */
function initViewToggle() {
  const buttons  = document.querySelectorAll('.view-toggle__btn[data-view]');
  const calView  = document.getElementById('cal-view');
  const listView = document.getElementById('list-view');
  if (!calView || !listView) return;

  const arrowsEl = document.getElementById('cal-arrows');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const view = btn.dataset.view;
      calView.classList.toggle('hidden', view !== 'calendar');
      listView.classList.toggle('hidden', view !== 'list');
      if (arrowsEl) arrowsEl.style.display = view === 'calendar' ? 'flex' : 'none';
    });
  });
}

/* --- Calendar ----------------------------------------------- */
function initCalendar() {
  renderCalendarMonth('cal-june', 2026, 5);
  renderCalendarMonth('cal-july', 2026, 6);
  renderCalendarMonth('cal-aug',  2026, 7);
  renderCalendarMonth('cal-sep',  2026, 8);
  renderCalendarMonth('cal-oct',  2026, 9);
  renderCalendarMonth('cal-nov',  2026, 10);
  renderCalendarMonth('cal-dec',  2026, 11);
  renderCalendarMonth('cal-jan27', 2027, 0);
  renderCalendarMonth('cal-feb27', 2027, 1);
  initCalCarousel();
}

function initCalCarousel() {
  const viewport  = document.querySelector('.cal-months-viewport');
  const track     = document.querySelector('.cal-months');
  const prevBtn   = document.getElementById('cal-prev');
  const nextBtn   = document.getElementById('cal-next');
  const arrowsEl  = document.getElementById('cal-arrows');
  if (!viewport || !track || !prevBtn || !nextBtn) return;

  const GAP     = 20; // --s5
  const VISIBLE = 3;
  let offset    = 0;

  function getCards() { return Array.from(track.querySelectorAll('.calendar')); }

  function setWidths() {
    const vpW       = viewport.offsetWidth;
    const cardWidth = (vpW - (VISIBLE - 1) * GAP) / VISIBLE;
    getCards().forEach(c => { c.style.width = cardWidth + 'px'; });
    applyTransform();
  }

  function applyTransform() {
    const cards = getCards();
    if (!cards.length) return;
    const step = cards[0].offsetWidth + GAP;
    track.style.transform = `translateX(-${offset * step}px)`;
    prevBtn.disabled = offset === 0;
    nextBtn.disabled = offset >= cards.length - VISIBLE;
    // Hide arrows if all months fit
    if (arrowsEl) arrowsEl.style.display = cards.length <= VISIBLE ? 'none' : 'flex';
  }

  prevBtn.addEventListener('click', () => { if (offset > 0) { offset--; applyTransform(); } });
  nextBtn.addEventListener('click', () => {
    const cards = getCards();
    if (offset < cards.length - VISIBLE) { offset++; applyTransform(); }
  });

  /* ── Drag (live tracking, snap to nearest on release) ── */
  let isDragging  = false;
  let pointerDown = false;
  let dragStartX  = 0;
  let dragDelta   = 0;
  let capturedId  = null;
  const DRAG_THRESHOLD = 6; // px before we commit to a drag

  function getStep() {
    const cards = getCards();
    return cards.length ? cards[0].offsetWidth + GAP : 0;
  }

  viewport.addEventListener('pointerdown', e => {
    pointerDown = true;
    isDragging  = false;
    dragStartX  = e.clientX;
    dragDelta   = 0;
    capturedId  = e.pointerId;
    track.style.transition = 'none';
  });

  viewport.addEventListener('pointermove', e => {
    if (!pointerDown) return;
    dragDelta = e.clientX - dragStartX;
    if (!isDragging && Math.abs(dragDelta) > DRAG_THRESHOLD) {
      // Commit to drag — now capture the pointer so move stays smooth
      isDragging = true;
      viewport.setPointerCapture(capturedId);
      viewport.style.cursor = 'grabbing';
    }
    if (!isDragging) return;
    const base = -(offset * getStep());
    track.style.transform = `translateX(${base + dragDelta}px)`;
  });

  viewport.addEventListener('pointerup', () => {
    pointerDown = false;
    viewport.style.cursor = '';
    track.style.transition = '';
    if (!isDragging) return; // was a click — let it through
    isDragging = false;

    const step      = getStep();
    const threshold = step * 0.2;
    const cards     = getCards();
    const maxOffset = cards.length - VISIBLE;

    if (dragDelta < -threshold && offset < maxOffset) offset++;
    else if (dragDelta > threshold && offset > 0) offset--;

    applyTransform();
  });

  viewport.addEventListener('pointercancel', () => {
    pointerDown = false;
    isDragging  = false;
    viewport.style.cursor = '';
    track.style.transition = '';
    applyTransform();
  });

  // Prevent click-through only on intentional drags
  viewport.addEventListener('click', e => {
    if (Math.abs(dragDelta) > DRAG_THRESHOLD) e.stopPropagation();
  }, true);

  // Defer first width calculation until after layout is settled
  requestAnimationFrame(setWidths);
  window.addEventListener('resize', setWidths);

  // Expose handles so renderStep can resize/scroll when step 1 becomes visible
  calResize   = setWidths;
  calScrollTo = function(index) {
    const cards = getCards();
    const max   = Math.max(0, cards.length - VISIBLE);
    offset = Math.min(Math.max(0, index), max);
    applyTransform();
  };
}

function renderCalendarMonth(containerId, year, month) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map retreat dates to day ranges
  const dayStates = {}; // day number → { status, dateId }
  // June retreat blocks: 7-14, 21-28
  // July retreat blocks: 5-12, 19-26
  if (month === 5) { // June
    for (let d = 7; d <= 14; d++)  dayStates[d] = { status: 'limited',   id: 'd1' };
    for (let d = 21; d <= 28; d++) dayStates[d] = { status: 'available', id: 'd2' };
  }
  if (month === 6) { // July
    for (let d = 5; d <= 12; d++)  dayStates[d] = { status: 'soldout',   id: 'd3' };
    for (let d = 19; d <= 26; d++) dayStates[d] = { status: 'available', id: 'd4' };
  }
  if (month === 7) { // August
    for (let d = 2; d <= 9;   d++) dayStates[d] = { status: 'limited',   id: 'd5' };
    for (let d = 16; d <= 23; d++) dayStates[d] = { status: 'available', id: 'd6' };
  }
  if (month === 8) { // September
    for (let d = 6; d <= 13;  d++) dayStates[d] = { status: 'available', id: 'd7' };
    for (let d = 20; d <= 27; d++) dayStates[d] = { status: 'limited',   id: 'd8' };
  }
  if (month === 9) { // October
    for (let d = 4; d <= 11;  d++) dayStates[d] = { status: 'available', id: 'd9' };
    for (let d = 18; d <= 25; d++) dayStates[d] = { status: 'soldout',   id: 'd10' };
  }
  if (month === 10) { // November
    for (let d = 1; d <= 8;   d++) dayStates[d] = { status: 'available', id: 'd11' };
    for (let d = 15; d <= 22; d++) dayStates[d] = { status: 'limited',   id: 'd12' };
  }
  if (month === 11) { // December
    for (let d = 6; d <= 13;  d++) dayStates[d] = { status: 'available', id: 'd13' };
    for (let d = 20; d <= 27; d++) dayStates[d] = { status: 'limited',   id: 'd14' };
  }
  if (year === 2027 && month === 0) { // January 2027
    for (let d = 3; d <= 10;  d++) dayStates[d] = { status: 'available', id: 'd15' };
    for (let d = 17; d <= 24; d++) dayStates[d] = { status: 'available', id: 'd16' };
  }
  if (year === 2027 && month === 1) { // February 2027
    for (let d = 7; d <= 14;  d++) dayStates[d] = { status: 'limited',   id: 'd17' };
    for (let d = 21; d <= 28; d++) dayStates[d] = { status: 'available', id: 'd18' };
  }

  const grid = container.querySelector('.calendar__grid');
  if (!grid) return;

  // Clear
  grid.innerHTML = '';

  // Empty cells for offset (Monday start)
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < startOffset; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day cal-day--empty';
    grid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    const state = dayStates[d];
    cell.className = `cal-day${state ? ` cal-day--${state.status}` : ''}`;
    cell.textContent = d;
    if (state) {
      cell.dataset.dateId = state.id;
      if (state.status !== 'soldout') {
        cell.addEventListener('click', () => selectDate(state.id));
      }
    }
    grid.appendChild(cell);
  }
}

/* --- Sidebar Update ----------------------------------------- */
function updateSidebar() {
  // Date line
  const dateVal = document.getElementById('sidebar-date');
  const navDate = document.getElementById('nav-date');
  if (state.selectedDate) {
    if (dateVal) { dateVal.textContent = state.selectedDate.label; dateVal.classList.remove('placeholder'); }
    if (navDate) { navDate.textContent = state.selectedDate.label; navDate.classList.remove('placeholder'); }
  } else {
    if (dateVal) { dateVal.textContent = 'Select dates'; dateVal.classList.add('placeholder'); }
    if (navDate) { navDate.textContent = 'Select dates'; navDate.classList.add('placeholder'); }
  }

  // Room line
  const roomVal  = document.getElementById('sidebar-room');
  const navRoom  = document.getElementById('nav-room');

  if (state.selectedRoom) {
    if (roomVal) { roomVal.textContent = state.selectedRoom.name; roomVal.classList.remove('placeholder'); }
    if (navRoom) { navRoom.textContent = state.selectedRoom.name; navRoom.classList.remove('placeholder'); }
  } else {
    if (roomVal) { roomVal.textContent = 'Select room'; roomVal.classList.add('placeholder'); }
    if (navRoom) { navRoom.textContent = 'Select room'; navRoom.classList.add('placeholder'); }
  }

  // Extra room basket rows
  Object.entries(state.extraRooms).forEach(([slot, room]) => {
    const el = document.getElementById(`nav-room${slot}`);
    if (el) {
      el.textContent = room ? room.name : 'Select room';
      el.classList.toggle('placeholder', !room);
    }
  });

  // Guests line
  const guestVal = document.getElementById('sidebar-guests');
  const navGuests = document.getElementById('nav-guests');
  const guestsRowEl = document.getElementById('basket-guests-row');
  const hideGuests = state.guestType === 'retreat';
  if (guestsRowEl) guestsRowEl.style.display = hideGuests ? 'none' : '';
  const guestLabel = state.guestCount === 1 ? '1 guest' : `${state.guestCount} guests`;
  if (guestVal) { guestVal.textContent = guestLabel; guestVal.classList.remove('placeholder'); }
  if (navGuests) { navGuests.textContent = guestLabel; }

  // Extras line
  const selectedExtraIds = Object.keys(state.selectedExtras);
  const extrasLineEl  = document.getElementById('basket-extras-line');
  const extrasItemsEl = document.getElementById('basket-extras-items');
  if (extrasLineEl) extrasLineEl.style.display = selectedExtraIds.length > 0 ? '' : 'none';
  if (extrasItemsEl) {
    extrasItemsEl.innerHTML = selectedExtraIds.map(id => {
      const extra = EXTRAS.find(e => e.id === id);
      return extra ? `<span class="basket-extra-item">${extra.name}</span>` : '';
    }).join('');
  }

  // Price breakdown
  updatePriceBreakdown();

  // Step 1 continue button — retreat type only needs a date; others need date + room
  const step1Btn = document.getElementById('step1-continue');
  if (step1Btn) {
    const roomOk = (state.guestType === 'retreat' || (state.guestType === 'multiple' && state.guestCount >= 7)) ? true : !!state.selectedRoom;
    step1Btn.disabled = !(state.selectedDate && roomOk);
  }
}

function updatePriceBreakdown() {
  if (!state.selectedRoom) return;

  const base  = state.selectedRoom.price;
  const count = state.guestCount;

  const extraRoomTotal = Object.values(state.extraRooms).reduce((sum, r) => sum + (r ? r.price : 0), 0);
  const subtotalBeforePromo = state.multiRoomMode
    ? base + extraRoomTotal
    : base * count;
  const discountAmount = Math.round(subtotalBeforePromo * state.promoDiscount);
  const extrasTotal = Object.keys(state.selectedExtras).reduce((sum, id) => {
    const extra = EXTRAS.find(e => e.id === id);
    return extra ? sum + extra.price : sum;
  }, 0);
  const total = subtotalBeforePromo - discountAmount + extrasTotal;
  const deposit = Math.ceil(total * 0.25);
  const balance = total - deposit;

  // Promo discount rows (step 3 price table + step 4 review snapshot)
  const promoDiscountStr = `−£${discountAmount.toLocaleString()}`;
  [
    { row: 'promo-discount-row',  discount: 'price-promo-discount',  code: 'promo-code-applied' },
    { row: 'review-promo-row',    discount: 'review-promo-discount',  code: 'review-promo-code'  },
  ].forEach(({ row, discount, code }) => {
    const rowEl  = document.getElementById(row);
    const discEl = document.getElementById(discount);
    const codeEl = document.getElementById(code);
    if (!rowEl) return;
    if (state.promoCode) {
      rowEl.style.display = '';
      if (discEl) discEl.textContent = promoDiscountStr;
      if (codeEl) codeEl.textContent = state.promoCode;
    } else {
      rowEl.style.display = 'none';
    }
  });

  // Room line shows pre-discount subtotal
  const roomLineEl = document.getElementById('price-room-line');
  if (roomLineEl) roomLineEl.textContent = `£${base.toLocaleString()} × ${count} guest${count > 1 ? 's' : ''}`;

  const subtotalEl = document.getElementById('price-subtotal');
  if (subtotalEl) subtotalEl.textContent = `£${total.toLocaleString()}`;

  // Update sidebar + nav total
  const totalEl = document.getElementById('sidebar-total');
  if (totalEl) totalEl.textContent = `£${total.toLocaleString()}`;
  const navTotal = document.getElementById('nav-total');
  if (navTotal) navTotal.textContent = `£${total.toLocaleString()}`;

  const perEl = document.getElementById('sidebar-per');
  if (perEl) perEl.textContent = `per person`;

  const totalSumEl = document.getElementById('price-total');
  if (totalSumEl) totalSumEl.textContent = `£${total.toLocaleString()}`;

  const depositEl = document.getElementById('price-deposit');
  if (depositEl) depositEl.textContent = `£${deposit.toLocaleString()}`;

  const balanceEl = document.getElementById('price-balance');
  if (balanceEl) balanceEl.textContent = `£${balance.toLocaleString()}`;

  // Step 4 review snapshot
  const reviewTotalEl = document.getElementById('review-total');
  if (reviewTotalEl) reviewTotalEl.textContent = `£${total.toLocaleString()}`;

  const reviewDepositEl = document.getElementById('review-deposit');
  if (reviewDepositEl) reviewDepositEl.textContent = `£${deposit.toLocaleString()}`;

  // Payment step
  const payDepositEl = document.getElementById('pay-deposit-amount');
  if (payDepositEl) payDepositEl.textContent = `£${deposit.toLocaleString()}`;

  const payFullEl = document.getElementById('pay-full-amount');
  if (payFullEl) payFullEl.textContent = `£${total.toLocaleString()}`;

  const payNowEl = document.getElementById('pay-now-label');
  if (payNowEl) {
    const amount = state.paymentOption === 'deposit' ? deposit : total;
    payNowEl.textContent = `Pay £${amount.toLocaleString()} & Confirm Booking`;
  }

  const payBalanceEl = document.getElementById('pay-balance-note');
  if (payBalanceEl && state.paymentOption === 'deposit') {
    const dateStr = state.selectedDate ? `60 days before your arrival` : '60 days before arrival';
    payBalanceEl.textContent = `Balance of £${balance.toLocaleString()} due ${dateStr}.`;
  }
}

/* --- Accordions --------------------------------------------- */
function initAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const body = trigger.nextElementSibling;
      const isOpen = body?.classList.contains('is-open');
      trigger.classList.toggle('is-open', !isOpen);
      body?.classList.toggle('is-open', !isOpen);
    });
  });
}

/* --- Tabs ---------------------------------------------------- */
function initTabs() {
  document.querySelectorAll('.tabs__tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabList = tab.closest('.tabs');
      const target  = tab.dataset.tab;
      const scope   = tab.closest('.tabs-scope') || document;

      tabList.querySelectorAll('.tabs__tab').forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      scope.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('is-active', panel.dataset.panel === target);
      });
    });
  });
}

/* --- Conditional Fields ------------------------------------- */
function initConditionalFields() {
  document.querySelectorAll('[data-reveals]').forEach(trigger => {
    const targetId = trigger.dataset.reveals;
    const target   = document.getElementById(targetId);
    if (!target) return;
    trigger.addEventListener('change', () => {
      target.classList.toggle('hidden', !trigger.checked);
    });
  });
}

/* --- Card Formatting --------------------------------------- */
function initCardFormatting() {
  const cardNum = document.getElementById('card-number');
  if (cardNum) {
    cardNum.addEventListener('input', e => {
      let val = e.target.value.replace(/\D/g, '').slice(0, 16);
      e.target.value = val.match(/.{1,4}/g)?.join(' ') ?? val;
    });
  }

  const expiry = document.getElementById('card-expiry');
  if (expiry) {
    expiry.addEventListener('input', e => {
      let val = e.target.value.replace(/\D/g, '').slice(0, 4);
      if (val.length >= 3) val = val.slice(0, 2) + ' / ' + val.slice(2);
      e.target.value = val;
    });
  }
}

/* --- Promo Code -------------------------------------------- */
function initPromoCode() {
  const input    = document.getElementById('promo-code-input');
  const btn      = document.getElementById('promo-apply-btn');
  const feedback = document.getElementById('promo-feedback');
  if (!input || !btn || !feedback) return;

  btn.addEventListener('click', () => {
    const code = input.value.trim();
    if (!code) {
      showPromoFeedback(feedback, 'Please enter a promo code.', false);
      return;
    }

    // Any non-empty code is valid for prototype purposes
    state.promoCode     = code.toUpperCase();
    state.promoDiscount = 0.20;
    input.disabled      = true;
    btn.disabled        = true;
    btn.textContent     = 'Applied';

    showPromoFeedback(feedback, `Promo code "${state.promoCode}" applied — 20% discount added.`, true);
    updateSidebar();
  });
}

function showPromoFeedback(el, msg, success) {
  el.textContent = msg;
  el.style.display = 'block';
  el.style.color = success ? 'var(--sage)' : 'var(--error)';
}

/* --- Optional Extras ---------------------------------------- */
function toggleExtra(id) {
  const extra = EXTRAS.find(e => e.id === id);
  if (!extra) return;
  const card = document.querySelector(`.extra-card[data-extra-id="${id}"]`);

  if (state.selectedExtras[id]) {
    delete state.selectedExtras[id];
    card?.classList.remove('is-added');
  } else {
    state.selectedExtras[id] = true;
    card?.classList.add('is-added');
  }
  updateSidebar();
}

/* --- Edit links --------------------------------------------- */
document.addEventListener('click', e => {
  const target = e.target.closest('[data-goto-step]');
  if (target) {
    const step = parseInt(target.dataset.gotoStep);
    renderStep(step);
  }
});

/* --- Continue button enable/disable logic ------------------- */
function updateStep2Continue() {
  const btn = document.getElementById('step2-continue');
  if (!btn) return;
  const p1 = document.getElementById('agree-policies');
  const p2 = document.getElementById('agree-tcs');
  btn.disabled = !(p1?.checked && p2?.checked);
}

function updateStep3Continue() {
  const btn = document.getElementById('step3-continue');
  if (!btn) return;
  const firstName = document.getElementById('first-name')?.value.trim();
  const lastName  = document.getElementById('last-name')?.value.trim();
  const email     = document.getElementById('email')?.value.trim();
  btn.disabled = !(firstName && lastName && email);
}

document.addEventListener('change', e => {
  if (e.target.id === 'agree-policies' || e.target.id === 'agree-tcs') updateStep2Continue();
});

document.addEventListener('input', e => {
  if (['first-name','last-name','email'].includes(e.target.id)) updateStep3Continue();
});
