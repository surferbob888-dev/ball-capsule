// script.js

// ── Waitlist form ──────────────────────────────────────────────────────────
const waitlistForm = document.getElementById('waitlist-form');
const formStatus = document.getElementById('form-status');

if (waitlistForm) {
  waitlistForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = waitlistForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Joining…';
    formStatus.textContent = '';
    formStatus.style.color = '';

    const data = new FormData(waitlistForm);
    const payload = Object.fromEntries(data.entries());

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Request failed');
      }

      waitlistForm.reset();
      formStatus.textContent = "You're on the list — we'll be in touch at launch.";
      formStatus.style.color = '#137333';
      submitButton.textContent = 'You\'re in ✓';

    } catch (error) {
      formStatus.textContent = error.message || 'Something went wrong. Please try again.';
      formStatus.style.color = '#b3261e';
      submitButton.disabled = false;
      submitButton.textContent = 'Join the waitlist';
    }
  });
}
