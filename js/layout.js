"use strict";

const pageLinks = [
  ["home", "index.html", "Home"],
  ["about", "about.html", "About"],
  ["journey", "journey.html", "Journey"],
  ["skills", "skills.html", "Skills"],
  ["research", "research.html", "Research"],
  ["certificates", "certificates.html", "Certificates"],
  ["gallery", "gallery.html", "Gallery"],
  ["contact", "contact.html", "Contact"],
];
const currentPage = document.documentElement.dataset.page || "home";

document.body.insertAdjacentHTML("afterbegin", `
  <div id="preloader" aria-hidden="true">
    <div class="pre-inner">
      <svg class="pre-logo" viewBox="0 0 120 120" width="110" height="110" aria-hidden="true">
        <circle class="pre-ring" cx="60" cy="60" r="52" fill="none" stroke="url(#pregrad)" stroke-width="2.5" stroke-dasharray="240 90"/>
        <defs><linearGradient id="pregrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1D5F8F"/><stop offset="1" stop-color="#2E7D8F"/></linearGradient></defs>
        <text x="60" y="72" text-anchor="middle" font-family="Sora, sans-serif" font-size="30" font-weight="800" fill="url(#pregrad)">VV</text>
      </svg>
      <div class="pre-name">Vaibhav&nbsp;Verma</div>
      <div class="pre-bar"><span id="pre-fill"></span></div>
      <div class="pre-pct" id="pre-pct">0%</div>
    </div>
  </div>
  <div class="cursor-dot" id="cursor-dot" aria-hidden="true"></div>
  <div class="cursor-ring" id="cursor-ring" aria-hidden="true"></div>
  <div class="progress-bar" id="progress-bar" aria-hidden="true"></div>
`);

const navMarkup = pageLinks.map(([id, href, label]) =>
  `<a href="${href}" class="nav-link" data-page="${id}">${label}</a>`
).join("");
document.querySelector("main").insertAdjacentHTML("beforebegin", `
  <header id="navbar">
    <div class="container nav-wrap">
      <a href="index.html" class="logo magnetic" aria-label="Vaibhav Verma — home">
        <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
          <defs><linearGradient id="loggrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1D5F8F"/><stop offset="1" stop-color="#2E7D8F"/></linearGradient></defs>
          <rect x="2" y="2" width="36" height="36" rx="10" fill="none" stroke="url(#loggrad)" stroke-width="2.5"/>
          <text x="20" y="27" text-anchor="middle" font-family="Sora, sans-serif" font-size="17" font-weight="800" fill="url(#loggrad)">VV</text>
        </svg>
        <span class="logo-text">Vaibhav<em>&nbsp;Verma</em></span>
      </a>
      <nav class="nav-links" id="nav-links" aria-label="Primary">${navMarkup}</nav>
      <div class="nav-actions">
        <button id="theme-toggle" class="icon-btn magnetic" aria-label="Toggle light / dark theme">
          <svg class="ic-sun" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
          <svg class="ic-moon" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
        </button>
        <button id="hamburger" class="icon-btn" aria-label="Open menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>
`);
document.querySelectorAll(".nav-link").forEach((link) => {
  if (link.dataset.page === currentPage) {
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
  }
});

document.querySelector("main").insertAdjacentHTML("afterend", `
  <footer>
    <div class="container foot-wrap">
      <div class="foot-brand">
        <a class="foot-name" href="index.html">Vaibhav <em style="font-style:italic; font-weight:500; color:var(--cyan);">Verma</em></a>
        <p>Mapping the Earth, understanding its stories.</p>
      </div>
      <nav class="foot-links" aria-label="Footer">
        <a href="about.html">About</a>
        <a href="research.html">Research</a>
        <a href="gallery.html">Gallery</a>
        <a href="contact.html">Contact</a>
      </nav>
      <div class="foot-meta">
        <span>© <span id="year">2026</span> Vaibhav Verma</span>
        <span class="foot-heart">Built with <em>❤</em> and plenty of keyframes</span>
      </div>
    </div>
  </footer>
  <button id="toTop" aria-label="Back to top">
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
  </button>
  <div id="lightbox" aria-hidden="true" aria-modal="true" role="dialog" aria-label="Image viewer">
    <button class="lb-close" aria-label="Close">&times;</button>
    <button class="lb-prev" aria-label="Previous image">&#8249;</button>
    <figure><img id="lb-img" alt=""><figcaption id="lb-cap"></figcaption></figure>
    <button class="lb-next" aria-label="Next image">&#8250;</button>
  </div>
`);
