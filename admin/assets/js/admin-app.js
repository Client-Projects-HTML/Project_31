/* Grand Palace — Admin page logic */
window.AdmApp = (function () {
  let Adm;

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function params() { return new URLSearchParams(window.location.search); }

  /* ================= LOGIN ================= */
  function initLogin() {
    const form = qs("#loginForm");
    const err = qs("#loginError");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = qs("#loginEmail").value.trim();
      const pass = qs("#loginPassword").value;
      if (email.length < 3 || pass.length < 3) {
        err.textContent = "Please enter a valid email and password.";
        err.classList.add("show");
        return;
      }
      Adm.login(qs("#loginRemember").checked);
      window.location.href = "dashboard.html";
    });
    qs("#loginDemoBtn").addEventListener("click", () => {
      qs("#loginEmail").value = "admin@grandpalace.example.com";
      qs("#loginPassword").value = "demo1234";
    });
  }

  /* ================= DASHBOARD ================= */
  function initDashboard() {
    const bookings = Adm.getStore("bookings", []);
    const halls = Adm.getStore("halls", []);
    const enquiries = Adm.getStore("enquiries", []);
    const customers = uniqueCustomers(bookings);
    const today = new Date().toISOString().slice(0, 10);

    const upcoming = bookings.filter(b => b.eventDate >= today && ["approved", "confirmed", "pending"].includes(b.status)).length;
    const revenue = bookings.filter(b => ["approved", "confirmed", "completed"].includes(b.status)).reduce((s, b) => s + b.amount, 0);
    const todays = bookings.filter(b => b.eventDate === today).length;
    const cancelled = bookings.filter(b => b.status === "cancelled" || b.status === "rejected").length;
    const pendingEnq = enquiries.filter(e => e.status === "new").length;

    const stats = [
      { label: "Total Bookings", value: bookings.length, icon: "🗓️", trend: "+12%" },
      { label: "Upcoming Events", value: upcoming, icon: "⏳", trend: "+5%" },
      { label: "Pending Enquiries", value: pendingEnq, icon: "✉️", trend: "-2%" },
      { label: "Revenue", value: Adm.money(revenue), icon: "💰", trend: "+18%" },
      { label: "Available Halls", value: halls.filter(h => h.availability === "Available").length, icon: "🏛️", trend: "Live" },
      { label: "Registered Users", value: customers.length, icon: "👥", trend: "+10%" },
      { label: "Today's Events", value: todays, icon: "📍", trend: "Today" },
      { label: "Cancelled Bookings", value: cancelled, icon: "🚫", trend: "-4%" }
    ];

    const statHtml = stats.map(s => `
    <div class="adm-stat-card">
        <div class="adm-stat-top">
            <div class="adm-stat-icon">${s.icon}</div>
            <div class="adm-stat-trend">${s.trend}</div>
        </div>
        <div class="adm-stat-value">${s.value}</div>
        <div class="adm-stat-label">${s.label}</div>
    </div>
    `).join("");

    Adm.contentEl().innerHTML = `
      <div class="adm-dashboard-header">
        <div>
          <h1 class="adm-dashboard-title">Welcome back, ${Adm.cfg.adminName}</h1>
          <p class="adm-dashboard-subtitle">Here's an overview of your venue bookings, revenue and recent activity.</p>
        </div>
        <div class="adm-dashboard-actions">
          <a href="bookings.html" class="adm-btn adm-btn-primary">+ New Booking</a>
          <a href="reports.html" class="adm-btn adm-btn-outline">View Reports</a>
        </div>
      </div>
      <div class="adm-stat-grid">${statHtml}</div>
      <div class="adm-dashboard-row">
        <div class="adm-panel">
          <div class="adm-panel-head"><h2>Monthly Revenue</h2></div>
          <canvas id="revChart"></canvas>
        </div>
        <div class="adm-panel">
          <div class="adm-panel-head"><h2>Booking Status</h2></div>
          <div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;">
            <canvas id="statusDonut" width="180" height="180" style="max-width:180px;"></canvas>
            <div id="donutLegend" style="font-size:13px;"></div>
          </div>
        </div>
      </div>
      <div class="adm-dashboard-row">
        <div class="adm-panel">
          <div class="adm-panel-head-luxury"><h2>Recent Bookings</h2><a href="bookings.html" class="adm-btn adm-btn-outline adm-btn-sm">View all</a></div>
          <div id="recentBookings"></div>
        </div>
        <div class="adm-panel">
          <div class="adm-panel-head-luxury"><h2>Latest Enquiries</h2><a href="enquiries.html" class="adm-btn adm-btn-outline adm-btn-sm">View all</a></div>
          <div id="recentEnquiries"></div>
        </div>
      </div>
    `;

    // Monthly revenue (last 6 months)
    const months = [];
    const revData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(m.toLocaleDateString("en-IN", { month: "short" }));
      const total = bookings.filter(b => {
        const d = new Date(b.eventDate);
        return d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth() && ["approved", "confirmed", "completed"].includes(b.status);
      }).reduce((s, b) => s + b.amount, 0);
      revData.push(total);
    }
    Adm.drawChart(qs("#revChart"), { type: "bar", labels: months, data: revData });

    const statusCounts = {};
    bookings.forEach(b => statusCounts[b.status] = (statusCounts[b.status] || 0) + 1);
    const donutColors = { pending: "#dbb84a", approved: "#276148", confirmed: "#1e4d3d", completed: "#0f2e24", cancelled: "#7f2536", rejected: "#6b1d2c" };
    const labels = Object.keys(statusCounts);
    Adm.drawDonut(qs("#statusDonut"), { labels, data: labels.map(l => statusCounts[l]), colors: labels.map(l => donutColors[l] || "#999") });
    qs("#donutLegend").innerHTML = labels.map(l => `<div style="margin-bottom:6px;"><span class="adm-legend-dot" style="background:${donutColors[l] || '#999'}"></span>${Adm.esc(l)} (${statusCounts[l]})</div>`).join("");

    const recent = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    qs("#recentBookings").innerHTML = recent.map(b => `
      <div class="adm-list-row">
        <div class="adm-list-avatar">${initials(b.customer)}</div>
        <div class="adm-list-main">
          <div class="adm-list-title">${Adm.esc(b.customer)} — ${Adm.esc(b.hall)}</div>
          <div class="adm-list-sub">${Adm.fmtDate(b.eventDate)} · ${Adm.money(b.amount)}</div>
        </div>
        ${Adm.statusBadge(b.status)}
      </div>`).join("");

    const recentE = [...enquiries].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    qs("#recentEnquiries").innerHTML = recentE.map(e => `
      <div class="adm-list-row">
        <div class="adm-list-avatar">${initials(e.name)}</div>
        <div class="adm-list-main">
          <div class="adm-list-title">${Adm.esc(e.name)} — ${Adm.esc(e.subject)}</div>
          <div class="adm-list-sub">${Adm.fmtDate(e.date)}</div>
        </div>
        ${Adm.statusBadge(e.status === "new" ? "pending" : "completed")}
      </div>`).join("");
  }

  function uniqueCustomers(bookings) {
    const map = {};
    bookings.forEach(b => { map[b.customer + b.phone] = b; });
    return Object.values(map);
  }
  function initials(name) {
    return String(name).split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  }

  /* ================= IMAGE FALLBACK POOLS ================= */
  /* Distinct stock photos so cards don't all show the same picture.
     Each item picks an image based on its position in the list (i % pool.length),
     or its own item.img if one has already been uploaded/set. */
  const HALL_IMAGES = [
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1470259078422-826894b933aa?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80"
  ];

  const PKG_IMAGES = [
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1478146059778-26028b07395a?auto=format&fit=crop&w=600&q=80"
  ];

  const GAL_IMAGES = [
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1478146059778-26028b07395a?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1470259078422-826894b933aa?auto=format&fit=crop&w=600&q=80"
  ];

  /* ================= BOOKINGS ================= */
  let bookingFilterStatus = "all", bookingSearch = "", bookingPage = 1;
  const PAGE_SIZE = 8;

  function initBookings() {
    Adm.contentEl().innerHTML = `
      <div class="adm-toolbar">
        <input type="search" class="adm-search" id="bkSearch" placeholder="Search by customer, phone or booking ID...">
        <select id="bkStatus">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>
        <div class="adm-spacer"></div>
        <button class="adm-btn adm-btn-outline" id="bkExport">⬇ Export CSV</button>
      </div>
      <div class="adm-panel"><div id="bkTable"></div><div class="adm-pagination" id="bkPager"></div></div>
    `;
    qs("#bkSearch").addEventListener("input", (e) => { bookingSearch = e.target.value.toLowerCase(); bookingPage = 1; renderBookings(); });
    qs("#bkStatus").addEventListener("change", (e) => { bookingFilterStatus = e.target.value; bookingPage = 1; renderBookings(); });
    qs("#bkExport").addEventListener("click", () => {
      const rows = filteredBookings();
      Adm.exportCSV("bookings.csv", [
        { label: "Booking ID", key: "id" }, { label: "Customer", key: "customer" }, { label: "Phone", key: "phone" },
        { label: "Hall", key: "hall" }, { label: "Package", key: "package" }, { label: "Guests", key: "guests" },
        { label: "Event Date", key: "eventDate" }, { label: "Amount", key: "amount" }, { label: "Status", key: "status" }
      ], rows);
      Adm.toast("Bookings exported.", "success");
    });
    renderBookings();
  }

  function filteredBookings() {
    let rows = Adm.getStore("bookings", []);
    if (bookingFilterStatus !== "all") rows = rows.filter(b => b.status === bookingFilterStatus);
    if (bookingSearch) rows = rows.filter(b => (b.customer + b.phone + b.id).toLowerCase().includes(bookingSearch));
    return rows.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
  }

  function renderBookings() {
    const all = filteredBookings();
    const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
    bookingPage = Math.min(bookingPage, totalPages);
    const rows = all.slice((bookingPage - 1) * PAGE_SIZE, bookingPage * PAGE_SIZE);

    Adm.buildTable(qs("#bkTable"), [
      { label: "Booking ID", key: "id" },
      { label: "Customer", render: b => `<div>${Adm.esc(b.customer)}</div>` },
      { label: "Phone", key: "phone" },
      { label: "Hall", key: "hall" },
      { label: "Package", key: "package" },
      { label: "Guests", key: "guests" },
      { label: "Event Date", render: b => Adm.fmtDate(b.eventDate) },
      { label: "Amount", render: b => Adm.money(b.amount) },
      { label: "Status", render: b => Adm.statusBadge(b.status) },
      {
        label: "Actions", render: b => `
        <div class="adm-row-actions">
          <a class="adm-btn adm-btn-sm adm-btn-outline" href="booking-details.html?id=${b.id}">View</a>
          ${b.status === "pending" ? `<button class="adm-btn adm-btn-sm adm-btn-primary" data-approve="${b.id}">Approve</button>
          <button class="adm-btn adm-btn-sm adm-btn-danger" data-reject="${b.id}">Reject</button>` : ""}
          ${["approved", "confirmed"].includes(b.status) ? `<button class="adm-btn adm-btn-sm adm-btn-danger" data-cancel="${b.id}">Cancel</button>` : ""}
          <button class="adm-btn adm-btn-sm adm-btn-ghost" data-print="${b.id}">Print</button>
        </div>`
      }
    ], rows, { emptyText: "No bookings match your filters." });

    qsa("[data-approve]").forEach(btn => btn.onclick = () => updateBookingStatus(btn.dataset.approve, "approved"));
    qsa("[data-reject]").forEach(btn => btn.onclick = () => Adm.confirmAction("Reject this booking request?", () => updateBookingStatus(btn.dataset.reject, "rejected")));
    qsa("[data-cancel]").forEach(btn => btn.onclick = () => Adm.confirmAction("Cancel this confirmed booking?", () => updateBookingStatus(btn.dataset.cancel, "cancelled")));
    qsa("[data-print]").forEach(btn => btn.onclick = () => window.print());

    const pager = qs("#bkPager");
    let ph = "";
    for (let i = 1; i <= totalPages; i++) ph += `<button class="${i === bookingPage ? 'active' : ''}" data-pg="${i}">${i}</button>`;
    pager.innerHTML = ph;
    qsa("[data-pg]", pager).forEach(btn => btn.onclick = () => { bookingPage = Number(btn.dataset.pg); renderBookings(); });
  }

  function updateBookingStatus(id, status) {
    const rows = Adm.getStore("bookings", []);
    const b = rows.find(x => x.id === id);
    if (b) b.status = status;
    Adm.setStore("bookings", rows);
    Adm.toast("Booking " + id + " marked as " + status + ".", "success");
    renderBookings();
  }

  /* ================= BOOKING DETAILS ================= */
  function initBookingDetails() {
    const id = params().get("id");
    const rows = Adm.getStore("bookings", []);
    const b = rows.find(x => x.id === id);
    if (!b) { Adm.contentEl().innerHTML = `<div class="adm-panel"><div class="adm-empty">Booking not found. <a href="bookings.html">Back to bookings</a></div></div>`; return; }

    Adm.contentEl().innerHTML = `
      <div class="adm-panel">
        <div class="adm-panel-head">
          <h2>Booking ${Adm.esc(b.id)} ${Adm.statusBadge(b.status)}</h2>
          <div class="adm-row-actions no-print">
            <button class="adm-btn adm-btn-outline" id="printInv">🖨 Print Invoice</button>
            <button class="adm-btn adm-btn-outline" id="dlInv">⬇ Download PDF</button>
            <a href="bookings.html" class="adm-btn adm-btn-ghost">← Back</a>
          </div>
        </div>
        <div class="adm-detail-grid">
          <div class="adm-detail-item"><label>Customer Name</label><div class="val">${Adm.esc(b.customer)}</div></div>
          <div class="adm-detail-item"><label>Phone</label><div class="val">${Adm.esc(b.phone)}</div></div>
          <div class="adm-detail-item"><label>Email</label><div class="val">${Adm.esc(b.email)}</div></div>
          <div class="adm-detail-item"><label>Event Type</label><div class="val">${Adm.esc(b.eventType)}</div></div>
          <div class="adm-detail-item"><label>Hall</label><div class="val">${Adm.esc(b.hall)}</div></div>
          <div class="adm-detail-item"><label>Package</label><div class="val">${Adm.esc(b.package)}</div></div>
          <div class="adm-detail-item"><label>Guests</label><div class="val">${b.guests}</div></div>
          <div class="adm-detail-item"><label>Event Date</label><div class="val">${Adm.fmtDate(b.eventDate)}</div></div>
          <div class="adm-detail-item"><label>Amount</label><div class="val">${Adm.money(b.amount)}</div></div>
          <div class="adm-detail-item"><label>Booked On</label><div class="val">${Adm.fmtDate(b.createdAt)}</div></div>
        </div>
        <div class="adm-form-section" style="margin-top:20px;">
          <h3>Notes</h3>
          <p>${Adm.esc(b.notes)}</p>
        </div>
      </div>
    `;
    qs("#printInv").onclick = () => window.print();
    qs("#dlInv").onclick = () => Adm.toast("Invoice PDF generation would run here (print dialog opened).", "info") || window.print();
  }

  /* ================= HALLS ================= */
  function initHalls() {
    const halls = Adm.getStore("halls", []);
    Adm.contentEl().innerHTML = `
      <div class="adm-toolbar">
        <div class="adm-spacer"></div>
        <a href="add-hall.html" class="adm-btn adm-btn-primary">+ Add Hall</a>
      </div>
      <div class="adm-card-grid" id="hallGrid"></div>
    `;
    renderHallGrid(halls);
  }

  function renderHallGrid(halls) {
    qs("#hallGrid").innerHTML = halls.map((h, i) => `
      <div class="adm-item-card">
        <div class="thumb" style="height: 180px; overflow: hidden; background: #f3f4f6;">
          <img src="${Adm.esc(h.img || HALL_IMAGES[i % HALL_IMAGES.length])}" alt="${Adm.esc(h.name)}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div class="body">
          <div class="title">${Adm.esc(h.name)}</div>
          <div class="meta">Capacity: ${h.capacity} · ${Adm.money(h.price)}</div>
          <div class="meta">${Adm.esc(h.facilities)}</div>
          ${Adm.statusBadge(h.availability)}
        </div>
        <div class="foot">
          <a href="edit-hall.html?id=${h.id}" class="adm-btn adm-btn-sm adm-btn-outline">Edit</a>
          <button class="adm-btn adm-btn-sm adm-btn-danger" data-del="${h.id}">Delete</button>
        </div>
      </div>`).join("");

    qsa("[data-del]").forEach(btn => btn.onclick = () => Adm.confirmAction("Delete this hall permanently?", () => {
      let rows = Adm.getStore("halls", []);
      rows = rows.filter(h => h.id !== btn.dataset.del);
      Adm.setStore("halls", rows);
      Adm.toast("Hall deleted.", "success");
      renderHallGrid(rows);
    }));
  }

  function hallForm(existing) {
    return `
      <div class="adm-field"><label>Hall Name</label><input id="hfName" value="${existing ? Adm.esc(existing.name) : ''}" required></div>
      <div class="adm-field-row">
        <div class="adm-field"><label>Capacity (guests)</label><input id="hfCap" type="number" min="1" value="${existing ? existing.capacity : ''}" required></div>
        <div class="adm-field"><label>Price (₹)</label><input id="hfPrice" type="number" min="0" value="${existing ? existing.price : ''}" required></div>
      </div>
      <div class="adm-field"><label>Description</label><textarea id="hfDesc" rows="3">${existing ? Adm.esc(existing.desc) : ''}</textarea></div>
      <div class="adm-field"><label>Facilities (comma separated)</label><input id="hfFac" value="${existing ? Adm.esc(existing.facilities) : ''}"></div>
      <div class="adm-field-row">
        <div class="adm-field"><label>Availability</label>
          <select id="hfAvail">
            <option ${existing && existing.availability === 'Available' ? 'selected' : ''}>Available</option>
            <option ${existing && existing.availability === 'Booked' ? 'selected' : ''}>Booked</option>
            <option ${existing && existing.availability === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
          </select>
        </div>
        <div class="adm-field"><label>Images (upload)</label><input id="hfImg" type="file" accept="image/*"></div>
      </div>
      <div class="adm-row-actions" style="justify-content:flex-end;margin-top:8px;">
        <a href="halls.html" class="adm-btn adm-btn-ghost">Cancel</a>
        <button class="adm-btn adm-btn-primary" id="hfSave">${existing ? 'Save Changes' : 'Add Hall'}</button>
      </div>
    `;
  }

  function initAddHall() {
    Adm.contentEl().innerHTML = `<div class="adm-panel" style="max-width:640px;"><div class="adm-panel-head"><h2>Add New Hall</h2></div>${hallForm(null)}</div>`;
    bindHallForm(null);
  }

  function initEditHall() {
    const id = params().get("id");
    const halls = Adm.getStore("halls", []);
    const h = halls.find(x => x.id === id);
    if (!h) { Adm.contentEl().innerHTML = `<div class="adm-panel"><div class="adm-empty">Hall not found.</div></div>`; return; }
    Adm.contentEl().innerHTML = `<div class="adm-panel" style="max-width:640px;"><div class="adm-panel-head"><h2>Edit Hall</h2></div>${hallForm(h)}</div>`;
    bindHallForm(h);
  }

  function bindHallForm(existing) {
    qs("#hfSave").onclick = () => {
      const name = qs("#hfName").value.trim();
      const cap = Number(qs("#hfCap").value);
      const price = Number(qs("#hfPrice").value);
      if (!name || !cap || !price) { Adm.toast("Please fill all required fields.", "error"); return; }
      const halls = Adm.getStore("halls", []);
      const data = {
        name, capacity: cap, price, desc: qs("#hfDesc").value.trim(),
        facilities: qs("#hfFac").value.trim(), availability: qs("#hfAvail").value,
        img: existing ? existing.img : ""
      };
      if (existing) {
        Object.assign(existing, data);
      } else {
        halls.push(Object.assign({ id: Adm.uid("H") }, data));
      }
      Adm.setStore("halls", halls);
      Adm.toast(existing ? "Hall updated." : "Hall added.", "success");
      window.location.href = "halls.html";
    };
  }

  /* ================= PACKAGES ================= */
  function initPackages() {
    render();
    function render() {
      const packages = Adm.getStore("packages", []);
      Adm.contentEl().innerHTML = `
        <div class="adm-toolbar"><div class="adm-spacer"></div><button class="adm-btn adm-btn-primary" id="addPkg">+ Add Package</button></div>
        <div class="adm-card-grid" id="pkgGrid"></div>
      `;
      qs("#pkgGrid").innerHTML = packages.map((p, i) => `
        <div class="adm-item-card">
          <div class="thumb" style="height: 160px; overflow: hidden; background: #f3f4f6;">
            <img src="${Adm.esc(p.img || PKG_IMAGES[i % PKG_IMAGES.length])}" alt="${Adm.esc(p.name)}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div class="body">
            <div class="title">${Adm.esc(p.name)}</div>
            <div class="meta">${Adm.esc(p.type)} · ${Adm.money(p.price)}</div>
            <div class="meta">${Adm.esc(p.desc)}</div>
          </div>
          <div class="foot">
            <button class="adm-btn adm-btn-sm adm-btn-outline" data-edit="${p.id}">Edit</button>
            <button class="adm-btn adm-btn-sm adm-btn-danger" data-del="${p.id}">Delete</button>
          </div>
        </div>`).join("");

      qs("#addPkg").onclick = () => openPkgModal(null);
      qsa("[data-edit]").forEach(b => b.onclick = () => openPkgModal(packages.find(p => p.id === b.dataset.edit)));
      qsa("[data-del]").forEach(b => b.onclick = () => Adm.confirmAction("Delete this package?", () => {
        Adm.setStore("packages", packages.filter(p => p.id !== b.dataset.del));
        Adm.toast("Package deleted.", "success"); render();
      }));
    }

    function openPkgModal(existing) {
      const body = `
        <div class="adm-field"><label>Package Name</label><input id="pkName" value="${existing ? Adm.esc(existing.name) : ''}"></div>
        <div class="adm-field-row">
          <div class="adm-field"><label>Type</label>
            <select id="pkType">${["Wedding", "Birthday", "Corporate", "Anniversary"].map(t => `<option ${existing && existing.type === t ? 'selected' : ''}>${t}</option>`).join("")}</select>
          </div>
          <div class="adm-field"><label>Price (₹)</label><input id="pkPrice" type="number" value="${existing ? existing.price : ''}"></div>
        </div>
        <div class="adm-field"><label>Description</label><textarea id="pkDesc" rows="3">${existing ? Adm.esc(existing.desc) : ''}</textarea></div>
        <div class="adm-modal-actions"><button class="adm-btn adm-btn-ghost" data-cancel>Cancel</button><button class="adm-btn adm-btn-primary" id="pkSave">${existing ? 'Save' : 'Add Package'}</button></div>
      `;
      const el = Adm.openModal(existing ? "Edit Package" : "Add Package", body);
      el.querySelector("[data-cancel]").onclick = Adm.closeModal;
      el.querySelector("#pkSave").onclick = () => {
        const name = qs("#pkName").value.trim();
        const price = Number(qs("#pkPrice").value);
        if (!name || !price) { Adm.toast("Please complete all fields.", "error"); return; }
        const packages = Adm.getStore("packages", []);
        const data = { name, type: qs("#pkType").value, price, desc: qs("#pkDesc").value.trim() };
        if (existing) Object.assign(packages.find(p => p.id === existing.id), data);
        else packages.push(Object.assign({ id: Adm.uid("P") }, data));
        Adm.setStore("packages", packages);
        Adm.closeModal();
        Adm.toast(existing ? "Package updated." : "Package added.", "success");
        render();
      };
    }
  }

  /* ================= GALLERY ================= */
  function initGallery() {
    render();
    function render() {
      const items = Adm.getStore("gallery", []);
      Adm.contentEl().innerHTML = `
        <div class="adm-toolbar"><div class="adm-spacer"></div>
          <button class="adm-btn adm-btn-outline" id="addVideo">+ Upload Video</button>
          <button class="adm-btn adm-btn-primary" id="addImg">+ Upload Image</button>
        </div>
        <div class="adm-card-grid" id="galGrid"></div>
      `;
      qs("#galGrid").innerHTML = items.map((g, i) => `
        <div class="adm-item-card">
          <div class="thumb" style="height: 180px; overflow: hidden; background: #000;">
            ${g.type === 'video'
              ? `<video src="${Adm.esc(g.url || 'https://www.w3schools.com/html/mov_bbb.mp4')}" controls style="width: 100%; height: 100%; object-fit: cover;"></video>`
              : `<img src="${Adm.esc(g.img || GAL_IMAGES[i % GAL_IMAGES.length])}" alt="${Adm.esc(g.caption)}" style="width: 100%; height: 100%; object-fit: cover;">`
            }
          </div>
          <div class="body">
            <div class="title">${Adm.esc(g.caption)}</div>
            <div class="meta">${Adm.esc(g.category)} · ${g.type}</div>
          </div>
          <div class="foot">
            <button class="adm-btn adm-btn-sm adm-btn-outline" data-cap="${g.id}">Edit Caption</button>
            <button class="adm-btn adm-btn-sm adm-btn-danger" data-del="${g.id}">Delete</button>
          </div>
        </div>`).join("");

      qs("#addImg").onclick = () => addItem("image");
      qs("#addVideo").onclick = () => addItem("video");
      qsa("[data-del]").forEach(b => b.onclick = () => Adm.confirmAction("Delete this media item?", () => {
        Adm.setStore("gallery", items.filter(g => g.id !== b.dataset.del));
        Adm.toast("Deleted.", "success"); render();
      }));
      qsa("[data-cap]").forEach(b => b.onclick = () => {
        const item = items.find(g => g.id === b.dataset.cap);
        const body = `<div class="adm-field"><label>Caption</label><input id="capInput" value="${Adm.esc(item.caption)}"></div>
          <div class="adm-modal-actions"><button class="adm-btn adm-btn-ghost" data-cancel>Cancel</button><button class="adm-btn adm-btn-primary" id="capSave">Save</button></div>`;
        const el = Adm.openModal("Edit Caption", body);
        el.querySelector("[data-cancel]").onclick = Adm.closeModal;
        el.querySelector("#capSave").onclick = () => {
          item.caption = qs("#capInput").value.trim();
          Adm.setStore("gallery", items);
          Adm.closeModal(); Adm.toast("Caption updated.", "success"); render();
        };
      });
    }

    function addItem(type) {
      const body = `
        <div class="adm-field"><label>${type === 'video' ? 'Video' : 'Image'} File</label><input type="file" accept="${type === 'video' ? 'video/*' : 'image/*'}"></div>
        <div class="adm-field"><label>Caption</label><input id="newCap" placeholder="e.g. Wedding decor setup"></div>
        <div class="adm-field"><label>Category</label>
          <select id="newCat">${["Weddings", "Birthdays", "Corporate", "Halls", "Decor"].map(c => `<option>${c}</option>`).join("")}</select>
        </div>
        <div class="adm-modal-actions"><button class="adm-btn adm-btn-ghost" data-cancel>Cancel</button><button class="adm-btn adm-btn-primary" id="upSave">Upload</button></div>
      `;
      const el = Adm.openModal(`Upload ${type === 'video' ? 'Video' : 'Image'}`, body);
      el.querySelector("[data-cancel]").onclick = Adm.closeModal;
      el.querySelector("#upSave").onclick = () => {
        const items = Adm.getStore("gallery", []);
        items.unshift({ id: Adm.uid("IMG"), caption: qs("#newCap").value.trim() || "Untitled", category: qs("#newCat").value, type, img: "" });
        Adm.setStore("gallery", items);
        Adm.closeModal(); Adm.toast("Uploaded successfully.", "success"); render();
      };
    }
  }

  /* ================= TESTIMONIALS ================= */
  function initTestimonials() {
    render();
    function render() {
      const items = Adm.getStore("testimonials", []);
      Adm.contentEl().innerHTML = `<div class="adm-panel"><div id="testTable"></div></div>`;
      Adm.buildTable(qs("#testTable"), [
        { label: "Customer", key: "name" },
        { label: "Rating", render: t => `<span class="adm-rating">${"★".repeat(t.rating)}${"☆".repeat(5 - t.rating)}</span>` },
        { label: "Comment", render: t => `<div style="max-width:320px;">${Adm.esc(t.comment)}</div>` },
        { label: "Status", render: t => Adm.statusBadge(t.status) },
        {
          label: "Actions", render: t => `
          <div class="adm-row-actions">
            ${t.status !== 'approved' ? `<button class="adm-btn adm-btn-sm adm-btn-primary" data-appr="${t.id}">Approve</button>` : ""}
            ${t.status !== 'rejected' ? `<button class="adm-btn adm-btn-sm adm-btn-outline" data-rej="${t.id}">Reject</button>` : ""}
            <button class="adm-btn adm-btn-sm adm-btn-danger" data-del="${t.id}">Delete</button>
          </div>`
        }
      ], items);
      qsa("[data-appr]").forEach(b => b.onclick = () => setStatus(b.dataset.appr, "approved"));
      qsa("[data-rej]").forEach(b => b.onclick = () => setStatus(b.dataset.rej, "rejected"));
      qsa("[data-del]").forEach(b => b.onclick = () => Adm.confirmAction("Delete this review permanently?", () => {
        Adm.setStore("testimonials", items.filter(t => t.id !== b.dataset.del));
        Adm.toast("Review deleted.", "success"); render();
      }));
      function setStatus(id, status) {
        const t = items.find(x => x.id === id); t.status = status;
        Adm.setStore("testimonials", items);
        Adm.toast("Review " + status + ".", "success"); render();
      }
    }
  }

  /* ================= CUSTOMERS ================= */
  function initCustomers() {
    const bookings = Adm.getStore("bookings", []);
    const map = {};
    bookings.forEach(b => {
      const key = b.customer + b.phone;
      if (!map[key]) map[key] = { name: b.customer, email: b.email, phone: b.phone, bookings: [], status: "Active" };
      map[key].bookings.push(b);
    });
    const customers = Object.values(map).map(c => ({
      ...c,
      total: c.bookings.length,
      last: c.bookings.map(b => b.eventDate).sort().reverse()[0],
      status: c.bookings.some(b => ["approved", "confirmed", "pending"].includes(b.status)) ? "Active" : "Inactive"
    }));
    Adm.contentEl().innerHTML = `
      <div class="adm-toolbar"><input type="search" class="adm-search" id="custSearch" placeholder="Search customers..."></div>
      <div class="adm-panel"><div id="custTable"></div></div>
    `;
    function render(list) {
      Adm.buildTable(qs("#custTable"), [
        { label: "Customer Name", key: "name" }, { label: "Email", key: "email" }, { label: "Phone", key: "phone" },
        { label: "Total Bookings", key: "total" }, { label: "Last Booking", render: c => Adm.fmtDate(c.last) },
        { label: "Status", render: c => Adm.statusBadge(c.status) }
      ], list);
    }
    render(customers);
    qs("#custSearch").addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      render(customers.filter(c => (c.name + c.email + c.phone).toLowerCase().includes(q)));
    });
  }

  /* ================= ENQUIRIES ================= */
  function initEnquiries() {
    render();
    function render() {
      const items = Adm.getStore("enquiries", []);
      Adm.contentEl().innerHTML = `<div class="adm-panel"><div id="enqTable"></div></div>`;
      Adm.buildTable(qs("#enqTable"), [
        { label: "Name", key: "name" }, { label: "Email", key: "email" }, { label: "Phone", key: "phone" },
        { label: "Subject", key: "subject" }, { label: "Date", render: e => Adm.fmtDate(e.date) },
        { label: "Status", render: e => Adm.statusBadge(e.status === 'new' ? 'pending' : 'completed') },
        {
          label: "Actions", render: e => `
          <div class="adm-row-actions">
            <button class="adm-btn adm-btn-sm adm-btn-outline" data-view="${e.id}">View / Reply</button>
            <button class="adm-btn adm-btn-sm adm-btn-danger" data-del="${e.id}">Delete</button>
          </div>`
        }
      ], items);
      qsa("[data-view]").forEach(b => b.onclick = () => openView(items.find(e => e.id === b.dataset.view)));
      qsa("[data-del]").forEach(b => b.onclick = () => Adm.confirmAction("Delete this enquiry?", () => {
        Adm.setStore("enquiries", items.filter(e => e.id !== b.dataset.del));
        Adm.toast("Enquiry deleted.", "success"); render();
      }));
      function openView(item) {
        const body = `
          <p><strong>${Adm.esc(item.name)}</strong> · ${Adm.esc(item.email)} · ${Adm.esc(item.phone)}</p>
          <p style="color:var(--adm-text-muted);font-size:13px;">${Adm.fmtDate(item.date)} — ${Adm.esc(item.subject)}</p>
          <p>${Adm.esc(item.message)}</p>
          <div class="adm-field"><label>Reply</label><textarea id="replyBox" rows="4">${Adm.esc(item.reply)}</textarea></div>
          <div class="adm-modal-actions"><button class="adm-btn adm-btn-ghost" data-cancel>Close</button><button class="adm-btn adm-btn-primary" id="sendReply">Send Reply</button></div>
        `;
        const el = Adm.openModal("Enquiry — " + item.subject, body, { wide: true });
        el.querySelector("[data-cancel]").onclick = Adm.closeModal;
        el.querySelector("#sendReply").onclick = () => {
          item.reply = qs("#replyBox").value.trim();
          item.status = "replied";
          Adm.setStore("enquiries", items);
          Adm.closeModal(); Adm.toast("Reply sent.", "success"); render();
        };
      }
    }
  }

  /* ================= CALENDAR ================= */
  let calMonth = new Date().getMonth(), calYear = new Date().getFullYear();
  function initCalendar() {
    render();
    function render() {
      const bookings = Adm.getStore("bookings", []).filter(b => !["cancelled", "rejected"].includes(b.status));
      const first = new Date(calYear, calMonth, 1);
      const startDow = first.getDay();
      const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
      const todayStr = new Date().toISOString().slice(0, 10);

      let cells = "";
      for (let i = 0; i < startDow; i++) cells += `<div class="adm-cal-cell empty"></div>`;
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const evts = bookings.filter(b => b.eventDate === dateStr);
        cells += `<div class="adm-cal-cell ${dateStr === todayStr ? 'today' : ''}">
          <div class="dnum">${day}</div>
          ${evts.slice(0, 3).map(e => `<div class="adm-cal-evt" title="${Adm.esc(e.customer)} — ${Adm.esc(e.hall)}">${Adm.esc(e.eventType)}</div>`).join("")}
          ${evts.length > 3 ? `<div class="adm-cal-evt">+${evts.length - 3} more</div>` : ""}
        </div>`;
      }

      Adm.contentEl().innerHTML = `
        <div class="adm-panel">
          <div class="adm-cal-head">
            <button class="adm-btn adm-btn-outline adm-btn-sm" id="calPrev">← Prev</button>
            <h2>${first.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</h2>
            <button class="adm-btn adm-btn-outline adm-btn-sm" id="calNext">Next →</button>
          </div>
          <div class="adm-cal-grid">
            ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => `<div class="adm-cal-dow">${d}</div>`).join("")}
            ${cells}
          </div>
          <div class="adm-cal-legend">
            <span><span class="adm-legend-dot" style="background:#c9a227"></span>Weddings</span>
            <span><span class="adm-legend-dot" style="background:#276148"></span>Birthday Parties</span>
            <span><span class="adm-legend-dot" style="background:#1e4d3d"></span>Corporate Events</span>
            <span><span class="adm-legend-dot" style="background:#6b1d2c"></span>Reception</span>
            <span><span class="adm-legend-dot" style="background:#83795f"></span>Anniversary</span>
          </div>
        </div>
      `;
      qs("#calPrev").onclick = () => { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } render(); };
      qs("#calNext").onclick = () => { calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } render(); };
    }
  }

  /* ================= REPORTS ================= */
  function initReports() {
    const bookings = Adm.getStore("bookings", []);
    const now = new Date();
    const months = [], revData = [], countData = [];
    for (let i = 5; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(m.toLocaleDateString("en-IN", { month: "short" }));
      const inMonth = bookings.filter(b => { const d = new Date(b.eventDate); return d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth(); });
      revData.push(inMonth.filter(b => ["approved", "confirmed", "completed"].includes(b.status)).reduce((s, b) => s + b.amount, 0));
      countData.push(inMonth.length);
    }
    const hallCounts = {}; bookings.forEach(b => hallCounts[b.hall] = (hallCounts[b.hall] || 0) + 1);
    const pkgCounts = {}; bookings.forEach(b => pkgCounts[b.package] = (pkgCounts[b.package] || 0) + 1);
    const topHall = Object.entries(hallCounts).sort((a, b) => b[1] - a[1])[0];
    const topPkg = Object.entries(pkgCounts).sort((a, b) => b[1] - a[1])[0];
    const custCount = uniqueCustomers(bookings).length;

    Adm.contentEl().innerHTML = `
      <div class="adm-toolbar"><div class="adm-spacer"></div>
        <button class="adm-btn adm-btn-outline" id="repExcel">⬇ Export Excel</button>
        <button class="adm-btn adm-btn-outline" id="repPdf">⬇ Export PDF</button>
        <button class="adm-btn adm-btn-primary" id="repPrint">🖨 Print</button>
      </div>
      <div class="adm-grid-2">
        <div class="adm-panel"><div class="adm-panel-head"><h2>Monthly Revenue</h2></div><canvas id="repRev"></canvas></div>
        <div class="adm-panel"><div class="adm-panel-head"><h2>Bookings per Month</h2></div><canvas id="repCount"></canvas></div>
      </div>
      <div class="adm-grid-3">
        <div class="adm-panel"><div class="adm-stat-label">Most Popular Hall</div><div class="adm-stat-value" style="margin-top:6px;">${topHall ? Adm.esc(topHall[0]) : '—'}</div><div class="adm-stat-label">${topHall ? topHall[1] + ' bookings' : ''}</div></div>
        <div class="adm-panel"><div class="adm-stat-label">Most Popular Package</div><div class="adm-stat-value" style="margin-top:6px;">${topPkg ? Adm.esc(topPkg[0]) : '—'}</div><div class="adm-stat-label">${topPkg ? topPkg[1] + ' bookings' : ''}</div></div>
        <div class="adm-panel"><div class="adm-stat-label">Customer Growth</div><div class="adm-stat-value" style="margin-top:6px;">${custCount}</div><div class="adm-stat-label">Unique customers to date</div></div>
      </div>
    `;
    Adm.drawChart(qs("#repRev"), { type: "bar", labels: months, data: revData });
    Adm.drawChart(qs("#repCount"), { type: "line", labels: months, data: countData });
    qs("#repPrint").onclick = () => window.print();
    qs("#repExcel").onclick = () => Adm.exportCSV("bookings-report.csv",
      [{ label: "Booking ID", key: "id" }, { label: "Hall", key: "hall" }, { label: "Package", key: "package" }, { label: "Event Date", key: "eventDate" }, { label: "Amount", key: "amount" }, { label: "Status", key: "status" }],
      bookings);
    qs("#repPdf").onclick = () => Adm.toast("PDF export would run here (print dialog opened).", "info") || window.print();
  }

  /* ================= SETTINGS ================= */
  function initSettings() {
    const s = Adm.getStore("settings", {});
    Adm.contentEl().innerHTML = `
      <div class="adm-panel" style="max-width:680px;">
        <div class="adm-form-section">
          <h3>Venue Details</h3>
          <div class="adm-field"><label>Venue Name</label><input id="stName" value="${Adm.esc(s.venueName)}"></div>
          <div class="adm-field"><label>Address</label><textarea id="stAddr" rows="2">${Adm.esc(s.address)}</textarea></div>
          <div class="adm-field-row">
            <div class="adm-field"><label>Phone</label><input id="stPhone" value="${Adm.esc(s.phone)}"></div>
            <div class="adm-field"><label>Email</label><input id="stEmail" value="${Adm.esc(s.email)}"></div>
          </div>
        </div>
        <div class="adm-form-section">
          <h3>Social & Map</h3>
          <div class="adm-field-row">
            <div class="adm-field"><label>Facebook URL</label><input id="stFb" value="${Adm.esc(s.facebook)}"></div>
            <div class="adm-field"><label>Instagram URL</label><input id="stIg" value="${Adm.esc(s.instagram)}"></div>
          </div>
          <div class="adm-field"><label>Google Map Location</label><input id="stMap" value="${Adm.esc(s.map)}"></div>
        </div>
        <div class="adm-form-section">
          <h3>Business Info</h3>
          <div class="adm-field"><label>Opening Hours</label><input id="stHours" value="${Adm.esc(s.hours)}"></div>
          <div class="adm-field"><label>Footer Content</label><textarea id="stFooter" rows="2">${Adm.esc(s.footer)}</textarea></div>
          <div class="adm-field-row">
            <div class="adm-field"><label>Logo</label><input type="file" accept="image/*"></div>
            <div class="adm-field"><label>Favicon</label><input type="file" accept="image/*"></div>
          </div>
        </div>
        <button class="adm-btn adm-btn-primary" id="stSave">Save Settings</button>
      </div>
    `;
    qs("#stSave").onclick = () => {
      Adm.setStore("settings", {
        venueName: qs("#stName").value, address: qs("#stAddr").value, phone: qs("#stPhone").value, email: qs("#stEmail").value,
        facebook: qs("#stFb").value, instagram: qs("#stIg").value, map: qs("#stMap").value,
        hours: qs("#stHours").value, footer: qs("#stFooter").value, logo: s.logo, favicon: s.favicon
      });
      Adm.toast("Website settings saved.", "success");
    };
  }

  /* ================= PROFILE ================= */
  function initProfile() {
    const p = Adm.getStore("profile", {});
    Adm.contentEl().innerHTML = `
      <div class="adm-panel" style="max-width:520px;">
        <div class="adm-avatar-upload">
          <div class="adm-avatar-lg">${p.photo ? `<img src="${Adm.esc(p.photo)}">` : initials(p.name || "Admin")}</div>
          <div><input type="file" accept="image/*"><div style="font-size:12px;color:var(--adm-text-muted);margin-top:4px;">JPG or PNG, max 2MB</div></div>
        </div>
        <div class="adm-field"><label>Name</label><input id="pfName" value="${Adm.esc(p.name)}"></div>
        <div class="adm-field"><label>Email</label><input id="pfEmail" value="${Adm.esc(p.email)}"></div>
        <div class="adm-field"><label>Last Login</label><input value="${new Date(p.lastLogin || Date.now()).toLocaleString('en-IN')}" disabled></div>
        <button class="adm-btn adm-btn-primary" id="pfSave">Save Profile</button>
        <hr style="margin:22px 0;border:none;border-top:1px solid var(--adm-border);">
        <div class="adm-form-section"><h3>Change Password</h3>
          <div class="adm-field"><label>Current Password</label><input type="password"></div>
          <div class="adm-field"><label>New Password</label><input type="password" id="pfNewPass"></div>
          <div class="adm-field"><label>Confirm New Password</label><input type="password" id="pfConfPass"></div>
          <button class="adm-btn adm-btn-outline" id="pfPassBtn">Update Password</button>
        </div>
        <button class="adm-btn adm-btn-danger adm-btn-block" id="pfLogout">Logout</button>
      </div>
    `;
    qs("#pfSave").onclick = () => {
      Adm.setStore("profile", Object.assign({}, p, { name: qs("#pfName").value, email: qs("#pfEmail").value }));
      Adm.toast("Profile updated.", "success");
    };
    qs("#pfPassBtn").onclick = () => {
      const np = qs("#pfNewPass").value, cp = qs("#pfConfPass").value;
      if (!np || np !== cp) { Adm.toast("Passwords do not match.", "error"); return; }
      Adm.toast("Password updated successfully.", "success");
      qs("#pfNewPass").value = ""; qs("#pfConfPass").value = "";
    };
    qs("#pfLogout").onclick = () => Adm.confirmAction("Log out of the admin panel?", Adm.logout);
  }

  /* ================= ROUTER ================= */
  function init(page) {
    Adm = window.Adm;
    if (page !== "login") { window.Adm_seedAll(); }
    const map = {
      login: initLogin, dashboard: initDashboard, bookings: initBookings, "booking-details": initBookingDetails,
      halls: initHalls, "add-hall": initAddHall, "edit-hall": initEditHall, packages: initPackages,
      gallery: initGallery, testimonials: initTestimonials, customers: initCustomers, enquiries: initEnquiries,
      calendar: initCalendar, reports: initReports, settings: initSettings, profile: initProfile
    };
    if (map[page]) map[page]();
  }

  return { init };
})();