/* =========================================================
   GRAND PALACE — booking.js
   Booking form validation + availability calendar renderer.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Booking form validation ---------- */
  const bookingForm = document.querySelector('#booking-form');
  if (bookingForm){
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      bookingForm.querySelectorAll('[data-required]').forEach(field => {
        const wrap = field.closest('.field');
        const value = field.value.trim();
        let ok = value.length > 0;

        if (field.type === 'email' && ok){
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }
        if (field.type === 'tel' && ok){
          ok = /^[0-9+\-\s]{7,15}$/.test(value);
        }
        if (field.type === 'date' && ok){
          ok = new Date(value) >= new Date(new Date().toDateString());
        }
        if (field.type === 'number' && ok){
          ok = Number(value) > 0;
        }

        wrap?.classList.toggle('invalid', !ok);
        if (!ok) valid = false;
      });

      const successBox = document.querySelector('#booking-success');
if (valid){
    successBox?.classList.add('show');

    // Allow login form to redirect
    if (form.id === "loginForm") {
        window.location.href = form.action;
        return;
    }

    form.reset();
} else {
        successBox?.classList.remove('show');
      }
    });

    bookingForm.querySelectorAll('[data-required]').forEach(field => {
      field.addEventListener('input', () => field.closest('.field')?.classList.remove('invalid'));
    });
  }

  /* ---------- Generic form validation (contact, login, register) ---------- */
  document.querySelectorAll('form[data-validate]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('[data-required]').forEach(field => {
        const wrap = field.closest('.field');
        let ok = field.value.trim().length > 0;
        if (field.type === 'email' && ok) ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        if (field.type === 'password' && ok) ok = field.value.length >= 6;
        if (field.dataset.match && ok){
          const other = form.querySelector(field.dataset.match);
          ok = other ? other.value === field.value : ok;
        }
        wrap?.classList.toggle('invalid', !ok);
        if (!ok) valid = false;
      });
      const successBox = form.parentElement.querySelector('.form-success');
      if (valid){
        successBox?.classList.add('show');
        form.reset();
      }
    });
    form.querySelectorAll('[data-required]').forEach(field => {
      field.addEventListener('input', () => field.closest('.field')?.classList.remove('invalid'));
    });
  });

  /* ---------- Availability calendar ---------- */
  const calendarEl = document.querySelector('.calendar');
  if (calendarEl){
    const monthLabel = calendarEl.querySelector('.month-label');
    const grid = calendarEl.querySelector('.calendar-grid');
    const prevBtn = calendarEl.querySelector('.cal-prev');
    const nextBtn = calendarEl.querySelector('.cal-next');

    let viewDate = new Date();
    viewDate.setDate(1);

    // deterministic pseudo-status per date so the demo looks alive but stable
    function statusFor(y,m,d){
      const seed = (y * 372 + m * 31 + d) % 7;
      if (seed === 0) return 'booked';
      if (seed === 1) return 'pending';
      return 'available';
    }

    function render(){
      const y = viewDate.getFullYear();
      const m = viewDate.getMonth();
      monthLabel.textContent = viewDate.toLocaleDateString('en-US', { month:'long', year:'numeric' });

      grid.querySelectorAll('.day-cell').forEach(c => c.remove());

      const firstDay = new Date(y, m, 1).getDay();
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const today = new Date(); today.setHours(0,0,0,0);

      for (let i = 0; i < firstDay; i++){
        const empty = document.createElement('div');
        empty.className = 'day-cell empty';
        grid.appendChild(empty);
      }
      for (let d = 1; d <= daysInMonth; d++){
        const cell = document.createElement('div');
        const cellDate = new Date(y, m, d);
        const status = cellDate < today ? 'booked' : statusFor(y,m,d);
        cell.className = `day-cell ${status}`;
        cell.textContent = d;
        cell.title = status.charAt(0).toUpperCase() + status.slice(1);
        if (status === 'available'){
          cell.addEventListener('click', () => {
            grid.querySelectorAll('.day-cell.selected').forEach(c => c.classList.remove('selected'));
            cell.classList.add('selected');
            const out = document.querySelector('#selected-date');
            if (out) out.textContent = cellDate.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
          });
        }
        grid.appendChild(cell);
      }
    }

    prevBtn?.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() - 1); render(); });
    nextBtn?.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() + 1); render(); });
    render();
  }

});
