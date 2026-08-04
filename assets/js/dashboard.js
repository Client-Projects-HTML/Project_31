/* =========================================================
   GRAND PALACE — dashboard.js
   Customer dashboard interactions: booking table status
   filter and invoice download placeholder.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Booking table status filter ---------- */
  const statusFilter = document.querySelector('#status-filter');
  const rows = document.querySelectorAll('[data-status-row]');
  statusFilter?.addEventListener('change', () => {
    const val = statusFilter.value;
    rows.forEach(row => {
      row.style.display = (val === 'all' || row.dataset.statusRow === val) ? '' : 'none';
    });
  });

  /* ---------- Invoice download placeholder ---------- */
  document.querySelectorAll('[data-download-invoice]').forEach(btn => {
    btn.addEventListener('click', () => {
      const note = document.querySelector('#download-note');
      if (note){
        note.textContent = 'Your invoice PDF is being prepared — connect a payment/PDF service to enable real downloads.';
        note.classList.add('show');
      } else {
        alert('Invoice download is a placeholder in this template — connect a PDF export service to enable it.');
      }
    });
  });

  /* ---------- Profile form save feedback ---------- */
  const profileForm = document.querySelector('#profile-form');
  profileForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const note = document.querySelector('#profile-note');
    if (note){
      note.textContent = 'Profile changes saved.';
      note.classList.add('show');
    }
  });

  /* ---------- Sidebar active link ---------- */
  const current = location.pathname.split('/').pop();
  document.querySelectorAll('.dash-sidebar a').forEach(a => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });

});
