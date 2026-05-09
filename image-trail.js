(function () {
  'use strict';

  function ImageTrail(element, opts) {
    var props = Object.assign({}, ImageTrail.defaults, opts);

    var container = element;
    var imageRefs = [];
    var zIndexCounter = 1;
    var imageIndex = 0;
    var lastRelative = { x: 0, y: 0 };
    var fadeTimeouts = new Map();
    var patternState = { time: 0 };

    if (props.backgroundColor !== 'transparent') {
      container.style.backgroundColor = props.backgroundColor;
    }

    var textEl = document.createElement('div');
    textEl.textContent = props.content;
    textEl.style.color = props.textColor;
    textEl.style.textAlign = 'center';
    textEl.style.zIndex = '0';
    textEl.style.pointerEvents = 'none';
    textEl.style.padding = '20px';
    container.appendChild(textEl);

    function getRel(clientX, clientY) {
      var b = container.getBoundingClientRect();
      return { x: clientX - b.left, y: clientY - b.top };
    }

    for (var i = 0; i < props.images.length; i++) {
      (function (idx) {
        var img = document.createElement('img');
        img.src = props.images[idx].src;
        img.alt = props.images[idx].alt;
        img.style.position = 'absolute';
        img.style.width = '120px';
        img.style.height = 'auto';
        img.style.objectFit = 'contain';
        img.style.borderRadius = props.borderRadius + 'px';
        img.style.transform = 'translate(-50%, -50%) scale(0)';
        img.style.opacity = '0';
        img.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        img.style.pointerEvents = 'none';
        img.style.zIndex = '1';
        img.style.willChange = 'transform, opacity';
        container.appendChild(img);
        imageRefs[idx] = img;
      })(i);
    }

    function patternPos(relX, relY, idx) {
      switch (props.trailPattern) {
        case 'circular':
          return { x: relX + Math.cos(idx * 0.5 + patternState.time * 0.02) * 80, y: relY + Math.sin(idx * 0.5 + patternState.time * 0.02) * 80 };
        case 'wavy':
          return { x: relX + Math.sin(patternState.time * 0.1 + idx * 0.3) * 60, y: relY + Math.cos(idx * 0.3) * 20 };
        case 'random':
          var s = idx + Math.floor(patternState.time / 100);
          var rx = (Math.sin(s * 12.9898) * 43758.5453) % 1;
          var ry = (Math.sin(s * 78.233) * 43758.5453) % 1;
          return { x: relX + (rx * 40 - 20), y: relY + (ry * 40 - 20) };
        case 'spiral':
          return { x: relX + Math.cos(idx * 0.8 + patternState.time * 0.01) * (20 + idx * 8), y: relY + Math.sin(idx * 0.8 + patternState.time * 0.01) * (20 + idx * 8) };
        case 'grid':
          var wx = Math.sin(patternState.time * 0.005 + idx) * 10;
          return { x: relX + (idx % 3) * 60 - 60 + wx, y: relY + Math.floor(idx / 3) * 60 - 60 + wx };
        case 'heart': {
          var t = idx * 0.3 + patternState.time * 0.01;
          return { x: relX + Math.pow(Math.sin(t), 3) * 30, y: relY - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 30 / 16 };
        }
        case 'star':
          var a3 = idx * (2 * Math.PI / 5) + patternState.time * 0.01;
          var r3 = idx % 2 === 0 ? 80 : 40;
          return { x: relX + Math.cos(a3) * r3, y: relY + Math.sin(a3) * r3 };
        case 'figure8':
          return { x: relX + Math.sin(idx * 0.2 + patternState.time * 0.01) * 60, y: relY + Math.sin(2 * (idx * 0.2 + patternState.time * 0.01)) * 30 };
        default:
          return { x: relX, y: relY };
      }
    }

    function activate(idx, relX, relY) {
      var img = imageRefs[idx];
      if (!img) return;
      patternState.time = Date.now();
      var p = patternPos(relX, relY, idx);
      var t = fadeTimeouts.get(idx);
      if (t) { clearTimeout(t); fadeTimeouts.delete(idx); }
      img.style.left = p.x + 'px';
      img.style.top = p.y + 'px';
      if (zIndexCounter > 40) zIndexCounter = 1;
      img.style.zIndex = String(zIndexCounter++);
      img.style.transform = 'translate(-50%, -50%) scale(1)';
      img.style.opacity = '1';
      if (props.useFadeEffect) {
        fadeTimeouts.set(idx, setTimeout(function () {
          if (img) { img.style.transform = 'translate(-50%, -50%) scale(0)'; img.style.opacity = '0'; }
          fadeTimeouts.delete(idx);
        }, props.fadeDelay));
      }
      lastRelative.x = relX;
      lastRelative.y = relY;
    }

    function deactivate(idx) {
      var img = imageRefs[idx];
      if (!img) return;
      var t = fadeTimeouts.get(idx);
      if (t) { clearTimeout(t); fadeTimeouts.delete(idx); }
      img.style.transform = 'translate(-50%, -50%) scale(0)';
      img.style.opacity = '0';
    }

    function inZone(clientX, clientY) {
      if (!props.zoneElement) return true;
      var el = document.querySelector(props.zoneElement);
      if (!el) return true;
      var r = el.getBoundingClientRect();
      return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
    }

    function handle(clientX, clientY) {
      if (props.images.length === 0 || !inZone(clientX, clientY)) return;
      var r = getRel(clientX, clientY);
      var dist = Math.hypot(r.x - lastRelative.x, r.y - lastRelative.y);
      var threshold = window.innerWidth / props.triggerDistance;
      if (dist > threshold) {
        var li = imageIndex % props.images.length;
        activate(li, r.x, r.y);
        if (imageIndex >= props.maxTrailImages) {
          var ti = (imageIndex - props.maxTrailImages) % props.images.length;
          deactivate(ti < 0 ? ti + props.images.length : ti);
        }
        imageIndex++;
      }
    }

    function onMouse(e) { handle(e.clientX, e.clientY); }
    function onTouch(e) { var t = e.touches[0]; if (t) handle(t.clientX, t.clientY); }

    function start() {
      document.addEventListener('mousemove', onMouse);
      document.addEventListener('touchmove', onTouch, { passive: true });
    }
    function stop() {
      document.removeEventListener('mousemove', onMouse);
      document.removeEventListener('touchmove', onTouch);
      fadeTimeouts.forEach(function (id) { clearTimeout(id); });
      fadeTimeouts.clear();
    }
    function destroy() {
      stop();
      imageRefs.forEach(function (img) { if (img && img.parentNode) img.parentNode.removeChild(img); });
      imageRefs = [];
      if (textEl && textEl.parentNode) textEl.parentNode.removeChild(textEl);
    }

    start();
    return { start: start, stop: stop, destroy: destroy };
  }

  ImageTrail.defaults = {
    images: [
      { src: 'https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg', alt: 'Trail Image 1' },
      { src: 'https://framerusercontent.com/images/aNsAT3jCvt4zglbWCUoFe33Q.jpg', alt: 'Trail Image 2' },
      { src: 'https://framerusercontent.com/images/BYnxEV1zjYb9bhWh1IwBZ1ZoS60.jpg', alt: 'Trail Image 3' },
      { src: 'https://framerusercontent.com/images/2uTNEj5aTl2K3NJaEFWMbnrA.jpg', alt: 'Trail Image 4' },
      { src: 'https://framerusercontent.com/images/f9RiWoNpmlCMqVRIHz8l8wYfeI.jpg', alt: 'Trail Image 5' }
    ],
    content: 'Move your mouse to see the Image Path effect',
    trailPattern: 'follow',
    triggerDistance: 20,
    maxTrailImages: 5,
    useFadeEffect: true,
    fadeDelay: 1500,
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    font: null,
    borderRadius: 8,
    zoneElement: null
  };

  window.ImageTrail = ImageTrail;
})();
