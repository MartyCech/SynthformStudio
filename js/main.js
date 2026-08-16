const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

document.documentElement.classList.add('has-js');

function completePreloader() {
  const preloader = document.querySelector('[data-preloader]');
  if (!preloader || preloader.classList.contains('is-complete')) return;
  preloader.classList.add('is-complete');
}

function afterPageLoad(callback) {
  if (document.readyState === 'complete') {
    callback();
  } else {
    window.addEventListener('load', callback, { once: true });
  }
}

afterPageLoad(() => {
  window.setTimeout(completePreloader, reducedMotion ? 0 : 650);
});
window.setTimeout(completePreloader, 2400);

function initScrollMotion(gsap) {
  gsap.utils.toArray('.reveal').forEach((element) => {
    gsap.from(element, {
      y: 72,
      autoAlpha: 0,
      duration: 0.95,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 88%',
        once: true,
      },
    });
  });

  gsap.utils.toArray('.reveal-text').forEach((element) => {
    gsap.from(element, {
      yPercent: 14,
      autoAlpha: 0,
      duration: 1.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 84%',
        once: true,
      },
    });
  });

  gsap.to('.hero__content', {
    yPercent: 9,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.7,
    },
  });
}

function initPointerMotion(gsap) {
  const cursor = document.querySelector('[data-cursor]');
  const setCursorX = gsap.quickSetter(cursor, 'x', 'px');
  const setCursorY = gsap.quickSetter(cursor, 'y', 'px');

  window.addEventListener('pointermove', (event) => {
    setCursorX(event.clientX - 20);
    setCursorY(event.clientY - 20);
    cursor.style.opacity = '1';
  }, { passive: true });

  document.querySelectorAll('a, button, input, textarea, select, [data-project]').forEach((element) => {
    element.addEventListener('pointerenter', () => cursor.classList.add('is-active'));
    element.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));
  });

  document.querySelectorAll('.magnetic').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) * 0.12;
      const y = (event.clientY - bounds.top - bounds.height / 2) * 0.12;
      gsap.to(element, { x, y, duration: 0.3, ease: 'power2.out' });
    });
    element.addEventListener('pointerleave', () => {
      gsap.to(element, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.45)' });
    });
  });
}

async function initEnhancements() {
  try {
    const [{ initParticleField }, { gsap }, { ScrollTrigger }] = await Promise.all([
      import('./particle-field.js'),
      import('./vendor/gsap-3.15.0/index.js'),
      import('./vendor/gsap-3.15.0/ScrollTrigger.js'),
    ]);

    initParticleField(document.querySelector('[data-particle-field]'), { reducedMotion });
    if (reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);
    initScrollMotion(gsap);
    if (finePointer) initPointerMotion(gsap);
  } catch {
    document.documentElement.dataset.enhancements = 'unavailable';
  }
}

afterPageLoad(() => {
  window.setTimeout(() => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(initEnhancements, { timeout: 1200 });
    } else {
      initEnhancements();
    }
  }, reducedMotion ? 0 : 500);
});

const header = document.querySelector('[data-header]');
let lastScroll = window.scrollY;

function updateHeader() {
  const currentScroll = window.scrollY;
  header?.classList.toggle('is-compact', currentScroll > 40);
  header?.classList.toggle('is-hidden', currentScroll > lastScroll && currentScroll > 320);
  lastScroll = currentScroll;
}

window.addEventListener('scroll', updateHeader, { passive: true });

const orderForm = document.querySelector('[data-order-form]');
orderForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!orderForm.reportValidity()) return;

  const data = new FormData(orderForm);
  const subject = `Poptávka webu — ${data.get('name')}`;
  const body = [
    `Jméno / firma: ${data.get('name')}`,
    `E-mail: ${data.get('email')}`,
    `Služba: ${data.get('service')}`,
    `Rozpočet: ${data.get('budget')}`,
    '',
    'O projektu:',
    data.get('message'),
  ].join('\n');

  window.location.href = `mailto:hello@synthform.studio?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

const year = document.querySelector('[data-year]');
if (year) year.textContent = new Date().getFullYear();