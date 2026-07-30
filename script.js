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

// Lightbox for gallery — click to view full design
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('.gallery-frame').forEach(frame => {
  frame.addEventListener('click', () => {
    const img = frame.querySelector('img');
    const caption = frame.closest('.gallery-item').querySelector('figcaption');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = caption ? caption.textContent : '';
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });
});

function closeLightbox() {
  lightbox.classList.remove('is-open');
  document.body.style.overflow = '';
}

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightbox) {
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// Formspree AJAX submission — works for both contact form and review form
function setupAjaxForm(formEl, statusId, successMsg, submitLabel) {
  if (!formEl) return;
  const statusEl = document.getElementById(statusId);
  const submitBtn = formEl.querySelector('.form-submit');

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    try {
      const response = await fetch(formEl.action, {
        method: 'POST',
        body: new FormData(formEl),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        statusEl.textContent = successMsg;
        statusEl.className = 'form-status success';
        formEl.reset();
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
      submitBtn.textContent = submitLabel;
    }
  });
}

setupAjaxForm(
  document.querySelector('.contact-form'),
  'formStatus',
  'Thanks! Your message has been sent — I\'ll get back to you soon.',
  'Send Message'
);

// Review form — submits to Firebase Firestore (pending approval) + emails via Formspree as backup notification
const reviewForm = document.querySelector('.review-form');
if (reviewForm && typeof db !== 'undefined') {
  const reviewStatus = document.getElementById('reviewStatus');
  const reviewBtn = reviewForm.querySelector('.form-submit');

  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    reviewBtn.disabled = true;
    reviewBtn.textContent = 'Sending...';
    reviewStatus.textContent = '';
    reviewStatus.className = 'form-status';

    const name = reviewForm.querySelector('#rev-name').value.trim();
    const role = reviewForm.querySelector('#rev-role').value.trim();
    const rating = reviewForm.querySelector('#rev-rating').value;
    const review = reviewForm.querySelector('#rev-text').value.trim();

    try {
      // Save to Firestore — publishes immediately, visible live to everyone
      await db.collection('reviews').add({
        name: name.slice(0, 100),
        role: role.slice(0, 100),
        rating: rating,
        review: review.slice(0, 1000),
        approved: true,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Also email a copy via Formspree so you get notified
      fetch('https://formspree.io/f/mvzelbjk', {
        method: 'POST',
        body: new FormData(reviewForm),
        headers: { 'Accept': 'application/json' }
      }).catch(() => {});

      reviewStatus.textContent = 'Thank you! Your review is now live on the site.';
      reviewStatus.className = 'form-status success';
      reviewForm.reset();
    } catch (err) {
      reviewStatus.textContent = 'Something went wrong — please try again.';
      reviewStatus.className = 'form-status error';
    } finally {
      reviewBtn.disabled = false;
      reviewBtn.textContent = 'Submit Review';
    }
  });

  // Real-time listener — approved reviews appear instantly for every visitor, no rebuild needed
  const liveContainer = document.getElementById('liveTestimonials');
  if (liveContainer) {
    db.collection('reviews')
      .where('approved', '==', true)
      .orderBy('timestamp', 'desc')
      .limit(20)
      .onSnapshot((snapshot) => {
        liveContainer.innerHTML = '';
        snapshot.forEach((doc) => {
          const data = doc.data();
          const card = document.createElement('div');
          card.className = 'testimonial-card';

          const stars = document.createElement('div');
          stars.className = 'stars';
          const starCount = parseInt(data.rating) || 5;
          stars.textContent = '★'.repeat(starCount) + '☆'.repeat(5 - starCount);

          const text = document.createElement('p');
          text.className = 'testimonial-text';
          text.textContent = '"' + data.review + '"';

          const name = document.createElement('span');
          name.className = 'testimonial-name';
          name.textContent = data.name;

          const role = document.createElement('span');
          role.className = 'testimonial-role';
          role.textContent = data.role || 'Client';

          card.appendChild(stars);
          card.appendChild(text);
          card.appendChild(name);
          card.appendChild(role);
          liveContainer.appendChild(card);
        });
      });
  }
}
