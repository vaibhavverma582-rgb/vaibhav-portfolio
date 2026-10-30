/* ═══════════════════════════════════════════════════════════
   Vaibhav Verma — Portfolio interactions
   Preloader · custom cursor · topo-contour canvas · typing
   rotator · scroll reveals · counters · bars · tilt · magnet ·
   lightbox · theme · nav
   ═══════════════════════════════════════════════════════════ */
"use strict";

document.documentElement.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ── Theme (restore early to avoid flash) ─────────────────── */
const savedTheme = localStorage.getItem("vv-theme");
if (savedTheme === "light" || savedTheme === "dark") {
  document.documentElement.setAttribute("data-theme", savedTheme);
}
$("#theme-toggle").addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("vv-theme", next);
});

/* ── Preloader ────────────────────────────────────────────── */
const preloader = $("#preloader");
const preFill = $("#pre-fill");
const prePct = $("#pre-pct");

function runPreloader() {
  return new Promise((resolve) => {
    if (reducedMotion) { resolve(); return; }
    const start = performance.now();
    const DURATION = 1100;
    (function tick(now) {
      const p = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - p, 3);
      const pct = Math.round(eased * 100);
      preFill.style.width = pct + "%";
      prePct.textContent = pct + "%";
      if (p < 1) requestAnimationFrame(tick); else resolve();
    })(start);
  });
}

const windowLoaded = new Promise((resolve) => {
  if (document.readyState === "complete") resolve();
  else {
    window.addEventListener("load", resolve, { once: true });
    setTimeout(resolve, 3000); // never block the site on a slow asset
  }
});

Promise.all([runPreloader(), windowLoaded]).then(() => {
  preloader.classList.add("done");
  document.body.classList.remove("loading");
  initReveals();
});

/* ── Custom cursor ────────────────────────────────────────── */
if (finePointer && !reducedMotion) {
  const dot = $("#cursor-dot");
  const ring = $("#cursor-ring");
  let mx = -100, my = -100, rx = -100, ry = -100;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
  }, { passive: true });

  (function follow() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(follow);
  })();

  $$("a, button, .g-item, input, textarea").forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("hover"));
    el.addEventListener("mouseleave", () => ring.classList.remove("hover"));
  });
}

/* ── Scroll progress + navbar + back-to-top ───────────────── */
const navbar = $("#navbar");
const progressBar = $("#progress-bar");
const toTop = $("#toTop");
const heroSection = $("#home");
let heroHeight = heroSection ? heroSection.offsetHeight : 0;
window.addEventListener("resize", () => { heroHeight = heroSection.offsetHeight; });

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  navbar.classList.toggle("scrolled", y > 40);
  navbar.classList.toggle("on-hero", y <= 40 && y < heroHeight - 72);
  toTop.classList.toggle("show", y > 600);
}, { passive: true });

toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));
navbar.classList.toggle("scrolled", window.scrollY > 40);
navbar.classList.toggle("on-hero", window.scrollY <= 40 && window.scrollY < heroHeight - 72);

/* ── Active nav link ──────────────────────────────────────── */
const navLinks = $$(".nav-link");
const sectionByLink = new Map(
  navLinks.map((l) => [$(l.getAttribute("href")), l])
);
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) {
      navLinks.forEach((l) => l.classList.remove("active"));
      sectionByLink.get(en.target)?.classList.add("active");
    }
  });
}, { rootMargin: "-40% 0px -55% 0px" });
sectionByLink.forEach((_, sec) => sec && sectionObserver.observe(sec));

/* ── Mobile menu ──────────────────────────────────────────── */
const hamburger = $("#hamburger");
const navPanel = $("#nav-links");
hamburger.addEventListener("click", () => {
  const open = navPanel.classList.toggle("open");
  hamburger.classList.toggle("open", open);
  hamburger.setAttribute("aria-expanded", String(open));
});
navLinks.forEach((l) => l.addEventListener("click", () => {
  navPanel.classList.remove("open");
  hamburger.classList.remove("open");
  hamburger.setAttribute("aria-expanded", "false");
}));

/* ── Scroll reveals (after preloader) ─────────────────────── */
function initReveals() {
  const targets = $$(".reveal, .reveal-left, .reveal-right, .reveal-zoom");
  if (reducedMotion) { targets.forEach((el) => el.classList.add("in")); return; }

  // skill bar fill levels
  $$(".bar i[data-level]").forEach((bar) => {
    bar.style.setProperty("--lv", bar.dataset.level + "%");
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        revealObserver.unobserve(en.target);
      }
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });

  targets.forEach((el) => revealObserver.observe(el));

  // counters
  const counters = $$(".stat-num[data-count]");
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      counterObserver.unobserve(el);
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || "";
      const pad = +(el.dataset.pad || 0);
      const start = performance.now();
      const DURATION = 1700;
      (function tick(now) {
        const p = Math.min(1, (now - start) / DURATION);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = String(Math.round(eased * target));
        el.textContent = (pad ? val.padStart(pad, "0") : val) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    });
  }, { threshold: 0.6 });
  counters.forEach((c) => counterObserver.observe(c));
}

/* ── Tilt cards ───────────────────────────────────────────── */
if (finePointer && !reducedMotion) {
  $$(".tilt").forEach((card) => {
    const MAX = 7;
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.transform =
        `perspective(850px) rotateX(${(0.5 - py) * MAX}deg) rotateY(${(px - 0.5) * MAX}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });
}

/* ── Magnetic hover ───────────────────────────────────────── */
if (finePointer && !reducedMotion) {
  $$(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.22}px)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  });
}

/* ── Gallery lightbox ─────────────────────────────────────── */
(function lightbox() {
  const lb = $("#lightbox");
  const img = $("#lb-img");
  const cap = $("#lb-cap");
  const photoCollection = [
    ["1759894941779_Firefly 20251008091218.png.jpg.png", "JNU International Conference 2025"],
    ["AT DU CONFERENCE.jpg", "At the Delhi University Conference"],
    ["AT GOLDEN BEACH PURI.jpg", "Golden Beach, Puri"],
    ["At Ministry of Environment, Forest and Climate Change of India.jpg", "At the Ministry of Environment, Forest and Climate Change"],
    ["AT MOES.jpg", "At the Ministry of Earth Sciences"],
    ["Cartographic analysis, niu.jpg", "Cartographic Analysis · NIU"],
    ["chemistry lab niu.jpg", "Chemistry Laboratory · NIU"],
    ["CMA HEAD OFFICE, NEW DELHI.jpg", "CMA Head Office · New Delhi"],
    ["Conducting Filed Survey in Okhla Bird Sanctuary.png", "Field Survey · Okhla Bird Sanctuary"],
    ["Dr. Raghunath Pal Survey Okhla Bird Sanctuary.png", "Okhla Bird Sanctuary Survey with Dr. Raghunath Pal"],
    ["Dr. Vikram Singh, Former DGP, Uttar Pradesh CONVOCATION DEGREE.jpg", "Convocation with Dr. Vikram Singh"],
    ["DU CONFERECE PRESENTATION.png", "Research Presentation · Delhi University"],
    ["DU CONFERENCE.JPG", "Delhi University Conference"],
    ["Gangtok, Sikkim.JPG", "Geographical Field Trip · Gangtok, Sikkim"],
    ["GOLDEN BEACH, PURI.jpg", "Golden Beach, Puri"],
    ["GROUP PHOTO DU CONFERENCE.JPG", "Conference Gathering · Delhi University"],
    ["ICAI HEAD OFFICE, NEW DELHI.jpg", "ICAI Head Office · New Delhi"],
    ["IMD.jpg", "IMD Head Office, New Delhi"],
    ["IMG_20251006_170530749_HDR.jpg", "JNU Conference Poster Evaluation by Invigilator"],
    ["IMG_20260324_155737156_HDR.jpg", "Vriti 2026 Job Fair"],
    ["JNU CONFERENCE.jpg", "Conference at Jawaharlal Nehru University"],
    ["JOB FAIR DU.jpg", "Job Fair · Delhi University · Vriti 26"],
    ["Kalindi college, DU HOD - Dr. Seema Shadev and professor Dr. Geeta Kumari.jpg", "With Faculty · Kalindi College, Delhi University"],
    ["Lab Dress.jpg", "Laboratory Work"],
    ["Lecture Room NIU.jpg", "Lecture Room · NIU"],
    ["Mahanadi River, Cuttack District, Odisha.jpg", "Mahanadi River · Cuttack, Odisha"],
    ["Ministry of Environment, Forest and Climate Change of India.jpg", "Ministry of Environment, Forest and Climate Change"],
    ["Minstry of Earth Science - IMD.jpg", "Ministry of Earth Sciences · India Meteorological Department"],
    ["MOES.jpg", "Ministry of Earth Sciences"],
    ["NIU CONVOCATION.jpg", "Convocation · Noida International University"],
    ["NIU DEGREE.jpg", "Degree Ceremony · Noida International University"],
    ["NIU GIS ANALYSIS GEO LAB.jpg", "GIS Analysis · Geospatial Laboratory, NIU"],
    ["NIU LAB SATELLITE IMAGE INTERPETATION.jpg", "Satellite Image Interpretation · NIU"],
    ["Noida International University.jpg", "Noida International University"],
    ["Prof. B.W. Pandey, director, center for himalayan studies, DU.jpg", "With Prof. B. W. Pandey · Delhi University"],
    ["Prof. Ilora Ghosh.jpg", "With Prof. Ilora Ghosh · JNU"],
    ["Prof. Kasturi Mukhopadhyay, JNU.jpg", "With Prof. Kasturi Mukhopadhyay · JNU"],
    ["Prof. Muduru Lachhana Dora, Former Director General, GSI, New Delhi & Dr. Dhananjai Pandey, Scientist -G, NCPOR, Goa.jpg", "With GSI and NCPOR Scientists · New Delhi"],
    ["Prof. Satish Chandra Garkoti, JNU.jpg", "With Prof. Satish Chandra Garkoti · JNU"],
    ["Ranchi.jpg", "Ranchi · Field Visit"],
    ["Sikkim Geographical Tour, NIU,Banjhakri Water Falls - Gangtok WITH DR. MALINI PRAVE SETHI AND VINEET CHANDAN.JPG", "Geographical Tour · Banjhakri Falls, Gangtok"],
    ["Stereoscopy Anlysis niu lab.jpg", "Stereoscopic Analysis · NIU Laboratory"],
    ["Study Room.png", "Study Space"],
    ["Socio-Economic Survey, Yaktin Village, Sikkim.jpg", "Socio-Economic Survey · Yaktin Village, Sikkim"],
    ["Survey conducted along Village located on bank of mahanadi river to monitor river health.jpg", "River Health Survey · Mahanadi Riverbank"],
    ["Tree Plantation Dr. Raghunath Pal, Dr. Deepak Katariya and Dr. Moin Khan.jpg", "Tree Plantation with Dr. Raghunath Pal, Dr. Deepak Katariya and Dr. Moin Khan"],
    ["Water Quality Analysis of Mahanadi River, Cuttack District, Odisha.jpg", "Water Quality Analysis · Mahanadi River, Odisha"],
  ];
  const gallery = $(".gallery-grid");
  photoCollection.forEach(([file, title]) => {
    const figure = document.createElement("figure");
    figure.className = "g-item";
    const photo = document.createElement("img");
    photo.src = `photos/${encodeURIComponent(file)}`;
    photo.alt = title;
    photo.loading = "lazy";
    photo.decoding = "async";
    const caption = document.createElement("figcaption");
    const heading = document.createElement("b");
    heading.textContent = title;
    caption.append(heading);
    figure.append(photo, caption);
    gallery.append(figure);
  });
  const certificateCollection = [
    ["Central University of Karanataka 21 Days Online Training Programme using QGIS Certificate_page-0001.jpg", "21-Day Online GIS Training Using QGIS · Central University of Karnataka"],
    ["Certificate JNU Conference October 6-7 2025_page-0001.jpg", "JNU International Conference · Poster Presentation · 2025"],
    ["Certificate of conference.jpg", "Geospatial Innovations for Biodiversity Conservation · Kalindi College"],
    ["GBU Certificate Atmospheric Science webinar_page-0001.jpg", "Atmospheric Processes and Computational Mathematics Workshop · GBU"],
    ["GSI Certificate Online Course Basics of Geomorphology.jpg", "Basics of Geomorphology · Geological Survey of India"],
    ["Image (1).png (2).jpg", "Overview of Planetary Geosciences: The Moon and Mars · IIRS"],
    ["Image (1).png (3).jpg", "Geoinformatics in Ecological Studies · IIRS"],
    ["Image (1).png (4).jpg", "Basic Principles of Remote Sensing Technology · IIRS"],
    ["Image (1).png (5).jpg", "Remote Sensing and GIS Applications · IIRS"],
    ["Image (1).png (6).jpg", "Computer Applications Diploma · SAMTECH"],
    ["Image (1).png (7).jpg", "Adventure Education Camp · Climb Up"],
    ["IMG-20260403-WA0000.jpg", "Volunteer Internship Completion · Suvidha Foundation · 2026"],
    ["IMG_20260324_195640273~2.jpg", "HR Professional Appreciation · Vriti 2026 Job Fair"],
    ["Module 3_page-0001.jpg", "Data Management, Statistical Methods, Data Analysis and QC · INCOIS"],
    ["Module 4_page-0001.jpg", "Visualization of Oceanographic Data Using Open-Source Tools · INCOIS"],
    ["NDMI Certificate on National Training Programme on Earthquake_page-0001.jpg", "Earthquake Risk Mitigation · NIDM and NEHU"],
  ];
  const certificateGallery = $(".certificate-gallery");
  certificateCollection.forEach(([file, title]) => {
    const figure = document.createElement("figure");
    figure.className = "g-item certificate-item";
    figure.tabIndex = 0;
    figure.setAttribute("role", "button");
    figure.setAttribute("aria-label", `View certificate: ${title}`);
    const certificate = document.createElement("img");
    certificate.src = `Certificates/${encodeURIComponent(file)}`;
    certificate.alt = title;
    certificate.loading = "lazy";
    certificate.decoding = "async";
    const caption = document.createElement("figcaption");
    const heading = document.createElement("b");
    heading.textContent = title;
    caption.append(heading);
    figure.append(certificate, caption);
    certificateGallery.append(figure);
  });
  const items = $$(".g-item");
  const sources = items.map((f) => ({
    src: f.querySelector("img").src,
    alt: f.querySelector("img").alt,
    cap: f.querySelector("figcaption")?.innerText || "",
  }));
  let idx = 0;

  function show(i) {
    idx = (i + sources.length) % sources.length;
    img.src = sources[idx].src;
    img.alt = sources[idx].alt;
    cap.textContent = sources[idx].cap.replace(/\n/g, " · ");
  }
  function open(i) { show(i); lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); }
  function close() { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); }

  items.forEach((f, i) => {
    f.addEventListener("click", () => open(i));
    if (f.classList.contains("certificate-item")) {
      f.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(i);
        }
      });
    }
  });
  $(".lb-close").addEventListener("click", close);
  $(".lb-prev").addEventListener("click", (e) => { e.stopPropagation(); show(idx - 1); });
  $(".lb-next").addEventListener("click", (e) => { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  window.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
})();

/* ── Contact form → mailto compose ────────────────────────── */
$("#contact-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#f-name").value.trim();
  const email = $("#f-email").value.trim();
  const msg = $("#f-msg").value.trim();
  const subject = encodeURIComponent(`Portfolio message from ${name}`);
  const body = encodeURIComponent(`${msg}\n\n— ${name} (${email})`);
  window.location.href = `mailto:vaibhavverma582@gmail.com?subject=${subject}&body=${body}`;
});

/* ── Footer year ──────────────────────────────────────────── */
$("#year").textContent = new Date().getFullYear();
