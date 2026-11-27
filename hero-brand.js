(function () {
  function updateTagline() {
    document.querySelectorAll('h1').forEach(function (heading) {
      if (heading.classList.contains('recallos-tagline') &&
          heading.textContent === 'Remember why you saved it.') return;
      heading.classList.add('recallos-tagline');
      heading.setAttribute('aria-label', 'Remember why you saved it.');
      heading.innerHTML = '<span>Remember why</span> <span>you saved it.</span>';
    });
    document.querySelectorAll('#v80dzt > img').forEach(function (image) {
      var phone = document.createElement('div');
      phone.className = 'recallos-phone';
      phone.innerHTML = '<div class="recallos-phone-status" aria-hidden="true"><span class="recallos-phone-time">9:41</span><span class="recallos-phone-island"></span><svg class="recallos-phone-indicators" viewBox="0 0 65 16" fill="none"><path d="M2 11v3h3v-3zm5-3v6h3V8zm5-3v9h3V5zm5-3v12h3V2z" fill="currentColor"/><path d="M26 5c5-4 11-4 16 0M29 8c3-3 7-3 10 0M32 11c1-1 3-1 4 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="34" cy="14" r="1" fill="currentColor"/><rect x="47" y="3" width="15" height="10" rx="3" stroke="currentColor" stroke-opacity=".6"/><rect x="49" y="5" width="11" height="6" rx="1" fill="currentColor"/><path d="M64 6v4" stroke="currentColor" stroke-linecap="round"/></svg></div>';
      image.before(phone);
      phone.appendChild(image);
    });
  }

  updateTagline();
  new MutationObserver(updateTagline).observe(document.body, {
    childList: true,
    subtree: true
  });
})();
