/* ============================================================
   ADMIN CORE ENGINE
   Shared layout, storage, table, modal, toast and chart helpers.
   Site-specific config comes from window.ADMIN_CONFIG (see admin-data.js)
   ============================================================ */
(function (w, d) {
  "use strict";

  const CFG = w.ADMIN_CONFIG || {};
  const LS_SESSION = CFG.storageKeyPrefix + "_session";

  /* ---------------- Shared theme & RTL initialization ----------------
     Syncs initial Dark Mode and RTL state from localStorage on load. */
  (function applySharedPreferences() {
    const theme = localStorage.getItem("gp-theme") ||
      ((w.matchMedia && w.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light");
    if (theme === "dark") {
      d.documentElement.setAttribute("data-theme", "dark");
    }

    if (localStorage.getItem("gp-rtl") === "true") {
      d.documentElement.setAttribute("dir", "rtl");
    }
  })();


  /* ---------------- Auth guard ---------------- */
  function isAuthed() {
    return sessionStorage.getItem(LS_SESSION) === "1" || localStorage.getItem(LS_SESSION) === "1";
  }
  function requireAuth() {
    const page = d.body.getAttribute("data-page");
    if (page === "login") return;
    if (!isAuthed()) {
      window.location.href = "login.html";
    }
  }
  function login(remember) {
    if (remember) localStorage.setItem(LS_SESSION, "1");
    else sessionStorage.setItem(LS_SESSION, "1");
    localStorage.setItem(CFG.storageKeyPrefix + "_lastLogin", new Date().toISOString());
  }
  function logout() {
    sessionStorage.removeItem(LS_SESSION);
    localStorage.removeItem(LS_SESSION);
    window.location.href = "login.html";
  }

  /* ---------------- Storage helpers ---------------- */
  function getStore(key, fallback) {
    try {
      const raw = localStorage.getItem(CFG.storageKeyPrefix + "_" + key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function setStore(key, value) {
    localStorage.setItem(CFG.storageKeyPrefix + "_" + key, JSON.stringify(value));
  }
  function seedIfEmpty(key, seedData) {
    if (localStorage.getItem(CFG.storageKeyPrefix + "_" + key) === null) {
      setStore(key, seedData);
    }
    return getStore(key, seedData);
  }

  /* ---------------- Formatting ---------------- */
  function money(n) {
    n = Number(n) || 0;
    return "₹" + n.toLocaleString("en-IN");
  }
  function fmtDate(iso) {
    if (!iso) return "—";
    const dt = new Date(iso);
    if (isNaN(dt)) return iso;
    return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }
  function esc(s) {
    return String(s === undefined || s === null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function uid(prefix) {
    return prefix + Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  /* ---------------- Toast ---------------- */
  function toast(msg, type) {
    let host = d.getElementById("admToastHost");
    if (!host) {
      host = d.createElement("div");
      host.id = "admToastHost";
      host.className = "adm-toast-host";
      d.body.appendChild(host);
    }
    const t = d.createElement("div");
    t.className = "adm-toast adm-toast-" + (type || "info");
    t.textContent = msg;
    host.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 2800);
  }

  /* ---------------- Modal ---------------- */
  function openModal(title, bodyHTML, opts) {
    closeModal();
    opts = opts || {};
    const wrap = d.createElement("div");
    wrap.className = "adm-modal-overlay";
    wrap.id = "admModalOverlay";
    wrap.innerHTML = `
      <div class="adm-modal ${opts.wide ? 'adm-modal-wide' : ''}" role="dialog" aria-modal="true">
        <div class="adm-modal-head">
          <h3>${esc(title)}</h3>
          <button class="adm-modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="adm-modal-body">${bodyHTML}</div>
      </div>`;
    d.body.appendChild(wrap);
    d.body.classList.add("adm-noscroll");
    wrap.querySelector(".adm-modal-close").onclick = closeModal;
    wrap.addEventListener("click", (e) => { if (e.target === wrap) closeModal(); });
    return wrap;
  }
  function closeModal() {
    const ex = d.getElementById("admModalOverlay");
    if (ex) ex.remove();
    d.body.classList.remove("adm-noscroll");
  }
  function confirmAction(message, onYes) {
    const body = `<p class="adm-confirm-text">${esc(message)}</p>
      <div class="adm-modal-actions">
        <button class="adm-btn adm-btn-ghost" data-cancel>Cancel</button>
        <button class="adm-btn adm-btn-danger" data-yes>Confirm</button>
      </div>`;
    const el = openModal("Please confirm", body);
    el.querySelector("[data-cancel]").onclick = closeModal;
    el.querySelector("[data-yes]").onclick = () => { closeModal(); onYes(); };
  }

  /* ---------------- Table builder ---------------- */
  function buildTable(container, columns, rows, opts) {
    opts = opts || {};
    if (!rows.length) {
      container.innerHTML = `<div class="adm-empty">${opts.emptyText || "No records found."}</div>`;
      return;
    }
    let html = `<div class="adm-table-scroll"><table class="adm-table"><thead><tr>`;
    columns.forEach(c => html += `<th>${esc(c.label)}</th>`);
    html += `</tr></thead><tbody>`;
    rows.forEach(row => {
      html += `<tr>`;
      columns.forEach(c => {
        html += `<td data-label="${esc(c.label)}">${c.render ? c.render(row) : esc(row[c.key])}</td>`;
      });
      html += `</tr>`;
    });
    html += `</tbody></table></div>`;
    container.innerHTML = html;
  }

  function statusBadge(status) {
    const map = {
      pending: "warn", approved: "ok", confirmed: "ok", completed: "info",
      rejected: "danger", cancelled: "danger", active: "ok", inactive: "muted",
      ongoing: "info", "in progress": "info"
    };
    const cls = map[String(status).toLowerCase()] || "muted";
    return `<span class="adm-badge adm-badge-${cls}">${esc(status)}</span>`;
  }

  /* ---------------- CSV export ---------------- */
  function exportCSV(filename, columns, rows) {
    const head = columns.map(c => `"${c.label.replace(/"/g, '""')}"`).join(",");
    const lines = rows.map(r => columns.map(c => {
      const val = c.csv ? c.csv(r) : (r[c.key] ?? "");
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(","));
    const csv = [head, ...lines].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = d.createElement("a");
    a.href = url; a.download = filename;
    d.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  /* ---------------- Layout: sidebar + topbar ---------------- */
  function renderLayout() {
    const page = d.body.getAttribute("data-page");
    if (page === "login") return;

    const shell = d.createElement("div");
    shell.className = "adm-shell";

    const menu = CFG.menu.map(m => `
<a href="${m.href}"
   class="adm-nav-link ${page===m.key ? "active" : ""}">

    <span class="adm-nav-icon">
        ${m.icon}
    </span>

    <span class="adm-nav-text">
        ${m.label}
    </span>

</a>
`).join("");

    shell.innerHTML = `
    <aside class="adm-sidebar" id="admSidebar">

<div class="adm-brand">

    <div class="adm-brand-mark">

        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round">

            <circle cx="12" cy="14" r="5"/>

            <path d="M7 14V8a5 5 0 0 1 10 0v6"/>

        </svg>

    </div>

    <div class="adm-brand-text">

        <h2>${CFG.brandName}</h2>

        <p>Luxury Event Management</p>

    </div>

</div>

<div class="adm-sidebar-divider"></div>

<nav class="adm-nav">

${menu}

</nav>

<div class="adm-sidebar-footer">

<button
class="adm-nav-link adm-logout"
id="admLogoutBtn">

<span class="adm-nav-icon">

⏻

</span>

<span>

Logout

</span>

</button>

</div>

</aside>

<div class="adm-main">
<header class="adm-topbar">

    <!-- Left -->

    <div class="adm-topbar-left">
        <button class="adm-hamburger" id="admBurger" aria-label="Open menu" aria-expanded="false">
            <span></span>
        </button>
        <div>

            <h1 class="adm-page-title">
                ${CFG.pageTitles[page] || CFG.brandName}
            </h1>

            <div class="adm-breadcrumb">

                <a href="dashboard.html">
                    Dashboard
                </a>

                <span> / </span>

                <span>
                    ${CFG.pageTitles[page] || CFG.brandName}
                </span>

            </div>

        </div>

    </div>

    <!-- Right -->

    <div class="adm-topbar-right" style="display: flex; align-items: center; gap: 0.75rem;">

        <a
            href="../pages/index.html"
            target="_blank"
            class="adm-btn adm-btn-outline adm-view-site">

            🌐 View Website

        </a>

        <!-- Dark Mode Toggle Button -->
        <button class="adm-icon-btn" id="admThemeToggleBtn" aria-label="Toggle dark mode" title="Toggle dark mode">
            <svg class="moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/></svg>
            <svg class="sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        </button>

        <!-- RTL Layout Toggle Button -->
        <button class="adm-icon-btn" id="admRtlToggleBtn" aria-label="Toggle RTL layout" title="Toggle RTL">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3Z"/></svg>
        </button>

        <button
            id="admAvatarBtn"
            class="adm-avatar">

            ${CFG.adminInitials}

        </button>

    </div>

</header>
<main
class="adm-content"
id="admContent">

</main>

</div>

      <div class="adm-sidebar-backdrop" id="admBackdrop"></div>
    `;
    d.body.prepend(shell);

    /* ---------- Logout ---------- */
    const logoutBtn = d.getElementById("admLogoutBtn");
    if (logoutBtn) {
      logoutBtn.onclick = () =>
        confirmAction(
          "Log out of the admin panel?",
          logout
        );
    }

    /* ---------- Dark Mode & RTL Toggles ---------- */
    const themeBtn = d.getElementById("admThemeToggleBtn");
    const rtlBtn = d.getElementById("admRtlToggleBtn");

    if (themeBtn) {
      themeBtn.onclick = () => {
        const isDark = d.documentElement.getAttribute("data-theme") === "dark";
        if (isDark) {
          d.documentElement.removeAttribute("data-theme");
          localStorage.setItem("gp-theme", "light");
        } else {
          d.documentElement.setAttribute("data-theme", "dark");
          localStorage.setItem("gp-theme", "dark");
        }
      };
    }

    if (rtlBtn) {
      rtlBtn.onclick = () => {
        const isRtl = d.documentElement.getAttribute("dir") === "rtl";
        if (isRtl) {
          d.documentElement.removeAttribute("dir");
          localStorage.setItem("gp-rtl", "false");
        } else {
          d.documentElement.setAttribute("dir", "rtl");
          localStorage.setItem("gp-rtl", "true");
        }
      };
    }

    /* ---------- Sidebar ---------- */
    const sidebar = d.getElementById("admSidebar");
    const backdrop = d.getElementById("admBackdrop");
    const burger = d.getElementById("admBurger");

    function closeSidebar() {
      sidebar.classList.remove("open");
      backdrop.classList.remove("show");
    }

    if (burger) {
      burger.onclick = () => {
        const isOpen = sidebar.classList.toggle("open");
        backdrop.classList.toggle("show", isOpen);
        burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      };
    }

    if (backdrop) {
      backdrop.onclick = closeSidebar;
    }

    /* ---------- Close sidebar on mobile navigation ---------- */
    d.querySelectorAll(".adm-nav-link").forEach(link => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 991) {
          closeSidebar();
        }
      });
    });

    /* ---------- ESC Key ---------- */
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeSidebar();
      }
    });

    /* ---------- Profile ---------- */
    const avatar = d.getElementById("admAvatarBtn");
    if (avatar) {
      avatar.onclick = () => {
        window.location.href = "profile.html";
      };
    }

    /* ---------- Active Menu ---------- */
    const active = d.querySelector(".adm-nav-link.active");
    if (active) {
      active.scrollIntoView({
        block: "center"
      });
    }

    /* ---------- Resize ---------- */
    window.addEventListener("resize", () => {
      if (window.innerWidth > 991) {
        closeSidebar();
      }
    });
  }

  function contentEl() { return d.getElementById("admContent"); }

  /* ---------------- Simple canvas line/bar chart (no deps) ---------------- */
  function drawChart(canvas, opts) {
    // opts: {type:'bar'|'line', labels:[], data:[], color, height}
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || canvas.parentElement.clientWidth;
    const cssH = opts.height || 220;
    canvas.width = cssW * dpr; canvas.height = cssH * dpr;
    canvas.style.height = cssH + "px";
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);

    const pad = { l: 40, r: 16, t: 16, b: 28 };
    const w2 = cssW - pad.l - pad.r, h2 = cssH - pad.t - pad.b;
    const max = Math.max(...opts.data, 1) * 1.15;
    const styles = getComputedStyle(d.body);
    const color = opts.color || styles.getPropertyValue("--adm-accent") || "#c9a227";
    const grid = "rgba(0,0,0,0.08)";
    const txt = "rgba(0,0,0,0.55)";

    // gridlines
    ctx.strokeStyle = grid; ctx.lineWidth = 1; ctx.font = "11px var(--adm-font-body, sans-serif)"; ctx.fillStyle = txt;
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + h2 - (h2 * i) / 4;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(cssW - pad.r, y); ctx.stroke();
      ctx.fillText(Math.round((max * i) / 4).toLocaleString("en-IN"), 2, y + 4);
    }

    const n = opts.data.length;
    const stepX = w2 / n;

    if (opts.type === "bar") {
      const barW = stepX * 0.55;
      opts.data.forEach((v, i) => {
        const x = pad.l + i * stepX + (stepX - barW) / 2;
        const bh = (v / max) * h2;
        const y = pad.t + h2 - bh;
        const grad = ctx.createLinearGradient(0, y, 0, pad.t + h2);
        grad.addColorStop(0, color); grad.addColorStop(1, color + "66");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, barW, bh, 4) : ctx.rect(x, y, barW, bh);
        ctx.fill();
      });
    } else {
      ctx.beginPath();
      opts.data.forEach((v, i) => {
        const x = pad.l + i * stepX + stepX / 2;
        const y = pad.t + h2 - (v / max) * h2;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineJoin = "round"; ctx.stroke();
      opts.data.forEach((v, i) => {
        const x = pad.l + i * stepX + stepX / 2;
        const y = pad.t + h2 - (v / max) * h2;
        ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
      });
    }

    ctx.fillStyle = txt; ctx.textAlign = "center";
    opts.labels.forEach((lb, i) => {
      const x = pad.l + i * stepX + stepX / 2;
      ctx.fillText(lb, x, cssH - 8);
    });
    ctx.textAlign = "left";
  }

  function drawDonut(canvas, opts) {
    // opts: {labels:[], data:[], colors:[]}
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(canvas.clientWidth || 220, 220);
    canvas.width = size * dpr; canvas.height = size * dpr;
    canvas.style.height = size + "px";
    ctx.scale(dpr, dpr);
    const cx = size / 2, cy = size / 2, r = size / 2 - 10, r0 = r * 0.6;
    const total = opts.data.reduce((a, b) => a + b, 0) || 1;
    let start = -Math.PI / 2;
    opts.data.forEach((v, i) => {
      const angle = (v / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + angle);
      ctx.closePath();
      ctx.fillStyle = opts.colors[i % opts.colors.length];
      ctx.fill();
      start += angle;
    });
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath(); ctx.arc(cx, cy, r0, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }

  w.Adm = {
    isAuthed, requireAuth, login, logout,
    getStore, setStore, seedIfEmpty,
    money, fmtDate, esc, uid,
    toast, openModal, closeModal, confirmAction,
    buildTable, statusBadge, exportCSV,
    renderLayout, contentEl,
    drawChart, drawDonut,
    cfg: CFG
  };

  d.addEventListener("DOMContentLoaded", () => {
    requireAuth();
    renderLayout();
    if (w.AdmApp && typeof w.AdmApp.init === "function") {
      w.AdmApp.init(d.body.getAttribute("data-page"));
    }
  });
})(window, document);