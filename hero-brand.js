(function () {
  function updateTagline() {
    document.querySelectorAll('h1').forEach(function (heading) {
      if (heading.classList.contains('recallos-tagline') &&
          heading.textContent === 'Remember why you saved it.') return;
      heading.classList.add('recallos-tagline');
      heading.setAttribute('aria-label', 'Remember why you saved it.');
      heading.innerHTML = '<span>Remember why</span> <span>you saved it.</span>';
    });
  }

  updateTagline();
  new MutationObserver(updateTagline).observe(document.body, {
    childList: true,
    subtree: true
  });
})();
