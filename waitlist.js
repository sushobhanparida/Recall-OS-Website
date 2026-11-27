(function () {
  'use strict';

  var submitting = false;

  function showError(form, message) {
    var status = document.getElementById('waitlist-status');
    if (!status) {
      status = document.createElement('p');
      status.id = 'waitlist-status';
      status.setAttribute('role', 'alert');
      status.style.cssText = 'margin:12px 0 0;color:#ffb4b4;font:14px/1.5 Inter,Arial,sans-serif;text-align:center';
      form.insertAdjacentElement('afterend', status);
    }
    status.textContent = message;
  }

  // Capture on document: Framer replaces the initial form during hydration
  // and when switching breakpoints. A listener on that form would be lost.
  document.addEventListener('submit', async function (event) {
    var form = event.target;
    if (!(form instanceof HTMLFormElement) ||
        !form.matches('#waitlist-form, form.framer-1dqavq3')) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    if (submitting) return;

    var input = form.querySelector('input[type="email"]');
    if (!input) return;
    input.value = input.value.trim().toLowerCase();
    if (!input.value || !input.checkValidity()) {
      showError(form, 'Please enter a valid email address.');
      input.reportValidity();
      return;
    }

    var config = window.SUPABASE_CONFIG || {};
    if (!config.url || !config.anonKey) {
      showError(form, 'The waitlist is temporarily unavailable. Please try again shortly.');
      return;
    }

    var button = form.querySelector('button');
    var label = button && (button.querySelector('p') || button);
    var originalLabel = label && label.textContent;
    var status = document.getElementById('waitlist-status');
    if (status) status.textContent = '';
    submitting = true;
    form.setAttribute('aria-busy', 'true');
    if (button) button.disabled = true;
    if (label) label.textContent = 'Joining…';

    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 15000);
    try {
      var response = await fetch(config.url.replace(/\/$/, '') + '/rest/v1/waitlist', {
        method: 'POST',
        headers: {
          apikey: config.anonKey,
          Authorization: 'Bearer ' + config.anonKey,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({ email: input.value }),
        signal: controller.signal
      });
      var error = response.ok ? null : await response.json().catch(function () { return {}; });
      // A repeat signup is already registered and can use the same confirmation.
      if (response.ok || (response.status === 409 && error.code === '23505')) {
        window.location.assign('./thanks.html');
        return;
      }
      showError(form, response.status === 429
        ? 'Too many attempts. Please wait a moment and try again.'
        : 'We couldn’t add you to the waitlist. Please try again.');
    } catch (error) {
      showError(form, 'Couldn’t connect. Check your connection and try again.');
    } finally {
      clearTimeout(timeout);
      submitting = false;
      form.removeAttribute('aria-busy');
      if (button) button.disabled = false;
      if (label) label.textContent = originalLabel;
    }
  }, true);
})();
