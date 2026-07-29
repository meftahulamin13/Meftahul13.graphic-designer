// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// Scroll reveal
const revealTargets = document.querySelectorAll(
  '.about-grid, .chip-row, .gallery-item, .contact-grid, .section-heading, .section-label, .services-grid, .hero-statement, .why-grid, .rating-strip, .testimonial-grid, .cta-content'
);
revealTargets.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealTargets.forEach(el => observer.observe(el));

// Safety fallback: guarantee nothing stays permanently hidden
setTimeout(() => {
  revealTargets.forEach(el => el.classList.add('is-visible'));
}, 1200);

// Contact form (Formspree AJAX submission)
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  const statusEl = document.getElementById('formStatus');
  const submitBtn = contactForm.querySelector('.form-submit');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        statusEl.textContent = 'Thanks! Your message has been sent — I\'ll get back to you soon.';
        statusEl.className = 'form-status success';
        contactForm.reset();
      } else {
        const data = await response.json().catch(() => null);
        const msg = data && data.errors ? data.errors.map(err => err.message).join(', ') : 'Something went wrong. Please try again.';
        statusEl.textContent = msg;
        statusEl.className = 'form-status error';
      }
    } catch (err) {
      statusEl.textContent = 'Network error — please try again or email me directly.';
      statusEl.className = 'form-status error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
}
