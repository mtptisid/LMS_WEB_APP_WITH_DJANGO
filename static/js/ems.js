/* ═══════════════════════
   EMS Global JavaScript
═══════════════════════ */

/* ── Toast auto-dismiss ── */
document.addEventListener('DOMContentLoaded', function () {

  // Auto-dismiss toasts after 5s
  document.querySelectorAll('.ems-toast').forEach(function (t) {
    setTimeout(function () {
      t.style.transition = 'opacity .35s';
      t.style.opacity = '0';
      setTimeout(function () { t.remove(); }, 370);
    }, 5000);
  });

  // Mobile sidebar toggle
  var toggle = document.getElementById('sidebarToggle');
  var sidebar = document.getElementById('emsSidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
    });
    // Close on outside click
    document.addEventListener('click', function (e) {
      if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== toggle) {
        sidebar.classList.remove('open');
      }
    });
  }

  // Sidebar tooltip (JS-based, works with overflow:visible)
  var tip = document.createElement('div');
  tip.className = 'ems-nav-tooltip';
  document.body.appendChild(tip);

  document.querySelectorAll('.ems-nav-link[data-tip], .ems-sidebar-logo[data-tip]').forEach(function (el) {
    el.addEventListener('mouseenter', function (e) {
      var label = this.getAttribute('data-tip');
      if (!label) return;
      var rect = this.getBoundingClientRect();
      tip.textContent = label;
      tip.style.display = 'block';
      tip.style.top = (rect.top + rect.height / 2 - 14) + 'px';
      tip.style.left = (rect.right + 10) + 'px';
    });
    el.addEventListener('mouseleave', function () {
      tip.style.display = 'none';
    });
  });

  // Confirm dialogs
  document.querySelectorAll('[data-confirm]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (!confirm(this.dataset.confirm)) { e.preventDefault(); }
    });
  });

  // Password show/hide toggle
  document.querySelectorAll('[data-pw-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = this.dataset.pwToggle;
      var inp = document.getElementById(id);
      if (!inp) return;
      if (inp.type === 'password') {
        inp.type = 'text';
        this.innerHTML = EMS.icons.eyeOff;
      } else {
        inp.type = 'password';
        this.innerHTML = EMS.icons.eye;
      }
    });
  });

  // Leave days calculator
  var s = document.getElementById('id_start_date');
  var e = document.getElementById('id_end_date');
  var d = document.getElementById('calculated-days');
  function calcDays() {
    if (!s || !e || !d || !s.value || !e.value) return;
    var start = new Date(s.value), end = new Date(e.value);
    if (end < start) { d.textContent = 'Invalid range'; return; }
    var days = 0, cur = new Date(start);
    while (cur <= end) { if (cur.getDay() !== 0 && cur.getDay() !== 6) days++; cur.setDate(cur.getDate() + 1); }
    d.textContent = days + ' working day' + (days !== 1 ? 's' : '');
    d.style.display = days > 0 ? 'block' : 'none';
  }
  if (s) s.addEventListener('change', calcDays);
  if (e) e.addEventListener('change', calcDays);

  // Leave balance display on type select change
  var ltSelect = document.getElementById('id_leave_type');
  var balDisp  = document.getElementById('leave-balance-display');
  var balData  = document.getElementById('balances-data');
  if (ltSelect && balDisp && balData) {
    var bals = {};
    try { bals = JSON.parse(balData.textContent); } catch (_) {}
    ltSelect.addEventListener('change', function () {
      var b = bals[this.value];
      if (b !== undefined) {
        balDisp.textContent = b + ' days available';
        balDisp.style.color = b > 0 ? '#065f46' : '#991b1b';
        balDisp.style.display = 'inline';
      } else {
        balDisp.textContent = '';
      }
    });
  }
});

/* ── EMS Namespace ── */
window.EMS = window.EMS || {};

EMS.icons = {
  eye:    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:16px;height:16px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:16px;height:16px;"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
};

/* Chart default config */
EMS.chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        font: { size: 11, family: 'Inter' },
        padding: 14,
        usePointStyle: true,
        pointStyleWidth: 8,
        color: '#5f6b7c',
      }
    },
    tooltip: {
      backgroundColor: '#1c1d2e',
      titleFont: { size: 12, family: 'Inter', weight: '600' },
      bodyFont:  { size: 12, family: 'Inter' },
      padding: 10,
      cornerRadius: 8,
      displayColors: true,
    }
  }
};

EMS.palette = [
  '#5b5ef4','#22c55e','#f59e0b','#ef4444',
  '#3b82f6','#8b5cf6','#ec4899','#f97316',
  '#06b6d4','#84cc16','#14b8a6','#a855f7'
];

/* Convenience: make a doughnut chart */
EMS.doughnut = function (canvasId, labels, data, title) {
  var ctx = document.getElementById(canvasId);
  if (!ctx) return;
  if (!labels.length) {
    ctx.parentElement.innerHTML = '<div class="ems-empty" style="height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;"><svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' style=\'width:32px;height:32px;opacity:.2\'><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg><p style="font-size:12px;color:#9aa0ab;margin-top:8px;">No data yet</p></div>';
    return;
  }
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{ data: data, backgroundColor: EMS.palette, borderWidth: 0, hoverOffset: 6 }]
    },
    options: Object.assign({}, EMS.chartDefaults, {
      cutout: '68%',
      plugins: Object.assign({}, EMS.chartDefaults.plugins, {
        title: title ? { display: true, text: title, font: { size: 12, weight: '700' }, color: '#1a1d23', padding: { bottom: 8 } } : undefined
      })
    })
  });
};

/* Convenience: make a bar chart */
EMS.bar = function (canvasId, labels, datasets, options) {
  var ctx = document.getElementById(canvasId);
  if (!ctx) return;
  var hasData = datasets.some(function(ds){ return ds.data.some(function(v){ return v > 0; }); });
  if (!hasData) {
    ctx.parentElement.innerHTML = '<div class="ems-empty" style="height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;"><svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' style=\'width:32px;height:32px;opacity:.2\'><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg><p style="font-size:12px;color:#9aa0ab;margin-top:8px;">No data yet</p></div>';
    return;
  }
  return new Chart(ctx, {
    type: 'bar',
    data: { labels: labels, datasets: datasets },
    options: Object.assign({}, EMS.chartDefaults, {
      scales: {
        y: { beginAtZero: true, grid: { color: '#f1f3f5' }, ticks: { font: { size: 11 }, color: '#9aa0ab' } },
        x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#9aa0ab' } }
      }
    }, options || {})
  });
};



/* ═══════════════════════════════════════════════════════════
   DRAWER SYSTEM — exact reference sample logic
   Works for both Apply Leave and Apply WFH
═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var overlay, drawer, titleEl, bodyEl, footEl, cancelBtn, submitBtn, lastFocus;
  var currentMode = null;   // 'leave' or 'wfh'
  var csrfToken   = '';

  /* ── helpers ── */
  function $(id) { return document.getElementById(id); }

  function getCSRF() {
    var el = document.querySelector('[name=csrfmiddlewaretoken]');
    if (el) return el.value;
    var m = document.cookie.match(/csrftoken=([^;]+)/);
    return m ? m[1] : '';
  }

  function toastMsg(msg, ok) {
    var t = $('emsToastBottom');
    if (!t) return;
    t.textContent = msg;
    t.className   = 'ems-toast-bottom show';
    setTimeout(function () { t.className = 'ems-toast-bottom'; }, 2800);
  }

  /* ── open / close ── */
  function openDrawer(mode) {
    if (!overlay) init();
    currentMode = mode;
    lastFocus   = document.activeElement;
    csrfToken   = getCSRF();

    titleEl.textContent = (mode === 'leave')      ? 'Apply for leave'
                        : (mode === 'wfh')         ? 'Work From Home Request'
                        :                            'Request Attendance Regularization';
    bodyEl.innerHTML    =
      '<div style="text-align:center;padding:56px 0;">' +
      '<div style="width:36px;height:36px;border:3px solid #e5e7eb;border-top-color:#4b3fa8;' +
      'border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 14px;"></div>' +
      '<p style="color:#6b7587;font-size:13px;">Loading…</p></div>';

    footEl.style.display = 'none';
    overlay.classList.add('open');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    var url = (mode === 'leave') ? '/leaves/drawer/'
            : (mode === 'wfh')   ? '/attendance/wfh/drawer/'
            :                      '/attendance/correction/drawer/';
    fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        bodyEl.innerHTML = html;
        footEl.style.display = 'flex';
        wireForm();
      })
      .catch(function () {
        bodyEl.innerHTML = '<p style="padding:32px;color:#f25b5b;">Failed to load. Please try again.</p>';
      });
  }

  function closeDrawer() {
    if (!overlay) return;
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  /* ── wire the form inside the drawer ── */
  function wireForm() {
    if (currentMode === 'leave')      wireLeaveForm();
    else if (currentMode === 'wfh')   wireWFHForm();
    else                              wireCorrectionForm();
  }

  /* ── LEAVE FORM wiring (mirrors reference sample JS exactly) ── */
  function wireLeaveForm() {
    var typeSel  = document.getElementById('df-leaveType');
    var fromEl   = document.getElementById('df-fromDate');
    var toEl     = document.getElementById('df-toDate');
    var daysOut  = document.getElementById('df-daysOut');
    var noteEl   = document.getElementById('df-note');
    var noteText = document.getElementById('df-noteText');
    var halfField = document.getElementById('df-halfField');
    var reasonErr = document.getElementById('df-reasonError');

    if (!typeSel || !fromEl || !toEl) return;

    // Parse balances JSON embedded in the page
    var balancesEl = document.getElementById('df-balances');
    var balances   = {};
    if (balancesEl) {
      try { balances = JSON.parse(balancesEl.textContent); } catch (e) {}
    }

    var today = new Date().toISOString().slice(0, 10);
    fromEl.min = toEl.min = today;
    if (!fromEl.value) fromEl.value = today;
    if (!toEl.value)   toEl.value   = today;

    function isHalf() {
      var checked = document.querySelector('input[name="df-half"]:checked');
      return checked && checked.value === 'yes';
    }

    function countWorkingDays() {
      if (!fromEl.value || !toEl.value) return null;
      var s = new Date(fromEl.value), e = new Date(toEl.value);
      if (e < s) return null;
      var n = 0;
      for (var d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        var day = d.getDay();
        if (day !== 0 && day !== 6) n++;
      }
      return isHalf() ? Math.min(n, 1) * 0.5 : n;
    }

    function refresh() {
      var half = isHalf();
      if (halfField) halfField.style.display = half ? '' : 'none';
      if (half && fromEl.value) toEl.value = fromEl.value;
      if (fromEl.value && (!toEl.value || toEl.value < fromEl.value)) toEl.value = fromEl.value;
      toEl.min      = fromEl.value || today;
      toEl.disabled = half;

      var days = countWorkingDays();
      var bal  = typeSel.value ? (balances[typeSel.value] || 0) : 0;
      var name = typeSel.options[typeSel.selectedIndex]
                   ? typeSel.options[typeSel.selectedIndex].text.replace(/\s*\(.*\)/, '')
                   : '';

      if (daysOut) daysOut.textContent = (days === null) ? '—' : days + ' ' + (days === 1 ? 'day' : 'days');

      if (noteEl && noteText) {
        noteEl.classList.remove('warn');
        if (days === null) {
          noteText.textContent = 'Select a leave type and dates to see your balance.';
        } else if (days === 0) {
          noteText.textContent = 'The selected dates fall on a weekend. Pick a working day.';
          noteEl.classList.add('warn');
        } else if (days > bal) {
          noteText.textContent =
            'Note: You have ' + bal + ' days of ' + name + ' left, but you are applying for ' + days +
            '. The extra days will be treated as leave without pay.';
          noteEl.classList.add('warn');
        } else {
          noteText.textContent =
            'Note: You have ' + bal + ' days of ' + name + ' available. ' +
            'After this request you will have ' + (bal - days) + ' days left.';
        }
      }
    }

    // Wire events
    ['change', 'input'].forEach(function (ev) {
      typeSel.addEventListener(ev, refresh);
      fromEl.addEventListener(ev, refresh);
      toEl.addEventListener(ev, refresh);
    });
    document.querySelectorAll('input[name="df-half"]').forEach(function (r) {
      r.addEventListener('change', refresh);
    });

    refresh(); // initial render

    // Submit button
    submitBtn.textContent = 'Submit leave request';
    submitBtn.onclick = function () {
      if (reasonErr) reasonErr.textContent = '';
      var reason = document.getElementById('df-reason');

      if (!fromEl.value || !toEl.value) {
        toastMsg('Choose the leave dates', false); return;
      }
      if (countWorkingDays() === 0) {
        toastMsg('Pick at least one working day', false); return;
      }
      if (reason && !reason.value.trim()) {
        if (reasonErr) reasonErr.textContent = 'Enter a reason for your leave.';
        reason.focus(); return;
      }

      submitBtn.disabled    = true;
      submitBtn.textContent = 'Submitting…';

      var sessionField = document.getElementById('df-session');
      var fd = new FormData();
      fd.append('csrfmiddlewaretoken', csrfToken);
      fd.append('leave_type', typeSel.value);
      fd.append('start_date', fromEl.value);
      fd.append('end_date',   toEl.value);
      if (isHalf() && sessionField) {
        fd.append('start_half', sessionField.value === 'First half' ? 'FIRST' : 'SECOND');
      }
      if (reason) fd.append('reason', reason.value.trim());
      var comment = document.getElementById('df-comment');
      if (comment) fd.append('comment', comment.value.trim());

      fetch('/leaves/drawer/', {
        method: 'POST',
        body: fd,
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          closeDrawer();
          toastMsg(data.message || 'Leave request submitted!', true);
          setTimeout(function () { window.location.reload(); }, 900);
        } else {
          submitBtn.disabled    = false;
          submitBtn.textContent = 'Submit leave request';
          toastMsg(data.errors || 'Submission failed.', false);
        }
      })
      .catch(function () {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Submit leave request';
        toastMsg('Something went wrong.', false);
      });
    };
  }

  /* ── WFH FORM wiring ── */
  function wireWFHForm() {
    var fromEl   = document.getElementById('df-wfhFrom');
    var toEl     = document.getElementById('df-wfhTo');
    var daysOut  = document.getElementById('df-wfhDays');
    var reasonErr = document.getElementById('df-wfhReasonError');

    if (!fromEl || !toEl) return;

    var today = new Date().toISOString().slice(0, 10);
    fromEl.min = toEl.min = today;
    if (!fromEl.value) fromEl.value = today;
    if (!toEl.value)   toEl.value   = today;

    function countDays() {
      if (!fromEl.value || !toEl.value) return 0;
      var s = new Date(fromEl.value), e = new Date(toEl.value);
      if (e < s) return 0;
      return Math.floor((e - s) / 86400000) + 1;
    }

    function refresh() {
      if (fromEl.value && (!toEl.value || toEl.value < fromEl.value)) toEl.value = fromEl.value;
      toEl.min = fromEl.value || today;
      var d = countDays();
      if (daysOut) daysOut.textContent = d + ' day' + (d !== 1 ? 's' : '');
    }

    ['change', 'input'].forEach(function (ev) {
      fromEl.addEventListener(ev, refresh);
      toEl.addEventListener(ev, refresh);
    });
    refresh();

    submitBtn.textContent = 'Submit WFH request';
    submitBtn.onclick = function () {
      if (reasonErr) reasonErr.textContent = '';
      var reason = document.getElementById('df-wfhReason');

      if (!fromEl.value || !toEl.value) {
        toastMsg('Choose the dates', false); return;
      }
      if (reason && !reason.value.trim()) {
        if (reasonErr) reasonErr.textContent = 'Enter a reason.';
        reason.focus(); return;
      }

      submitBtn.disabled    = true;
      submitBtn.textContent = 'Submitting…';

      var fd = new FormData();
      fd.append('csrfmiddlewaretoken', csrfToken);
      fd.append('start_date', fromEl.value);
      fd.append('end_date',   toEl.value);
      if (reason) fd.append('reason', reason.value.trim());

      fetch('/attendance/wfh/drawer/', {
        method: 'POST',
        body: fd,
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          closeDrawer();
          toastMsg(data.message || 'WFH request submitted!', true);
          setTimeout(function () { window.location.reload(); }, 900);
        } else {
          submitBtn.disabled    = false;
          submitBtn.textContent = 'Submit WFH request';
          toastMsg(data.errors || 'Submission failed.', false);
        }
      })
      .catch(function () {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Submit WFH request';
        toastMsg('Something went wrong.', false);
      });
    };
  }

  /* ── CORRECTION / REGULARIZE FORM wiring ── */
  function wireCorrectionForm() {
    var reasonErr = document.getElementById('df-corrReasonError');

    submitBtn.textContent = 'Submit Correction Request';
    submitBtn.onclick = function () {
      if (reasonErr) reasonErr.textContent = '';
      var dateEl   = document.getElementById('df-corrDate');
      var inEl     = document.getElementById('df-corrIn');
      var reasonEl = document.getElementById('df-corrReason');

      if (!dateEl || !dateEl.value) { toastMsg('Select the date to regularize', false); return; }
      if (!inEl || !inEl.value)     { toastMsg('Enter the correct clock-in time', false); return; }
      if (reasonEl && !reasonEl.value.trim()) {
        if (reasonErr) reasonErr.textContent = 'Enter a reason for the correction.';
        reasonEl.focus(); return;
      }

      submitBtn.disabled    = true;
      submitBtn.textContent = 'Submitting…';

      var fd = new FormData();
      fd.append('csrfmiddlewaretoken', csrfToken);
      fd.append('work_date', dateEl.value);
      fd.append('requested_clock_in', inEl.value);
      var outEl = document.getElementById('df-corrOut');
      if (outEl && outEl.value) fd.append('requested_clock_out', outEl.value);
      if (reasonEl) fd.append('reason', reasonEl.value.trim());

      fetch('/attendance/correction/drawer/', {
        method: 'POST', body: fd,
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          closeDrawer();
          toastMsg(data.message || 'Correction request submitted!', true);
          setTimeout(function () { window.location.reload(); }, 900);
        } else {
          submitBtn.disabled    = false;
          submitBtn.textContent = 'Submit Correction Request';
          toastMsg(data.errors || 'Submission failed.', false);
        }
      })
      .catch(function () {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Submit Correction Request';
        toastMsg('Something went wrong.', false);
      });
    };
  }

  /* ── init ── */
  function init() {
    overlay   = document.getElementById('emsOverlay');
    drawer    = document.getElementById('emsDrawer');
    titleEl   = document.getElementById('emsDrawerTitle');
    bodyEl    = document.getElementById('emsDrawerBody');
    footEl    = document.getElementById('emsDrawerFoot');
    cancelBtn = document.getElementById('emsDrawerCancel');
    submitBtn = document.getElementById('emsDrawerSubmit');

    if (!overlay) return;

    overlay.addEventListener('click', closeDrawer);
    if (cancelBtn) cancelBtn.addEventListener('click', closeDrawer);
    document.getElementById('emsDrawerClose').addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });
  }

  /* Spin animation */
  var s = document.createElement('style');
  s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(s);

  /* Public API */
  window.openLeaveDrawer       = function () { openDrawer('leave'); };
  window.openWFHDrawer         = function () { openDrawer('wfh'); };
  window.openCorrectionDrawer  = function () { openDrawer('correction'); };

  document.addEventListener('DOMContentLoaded', init);
})();
