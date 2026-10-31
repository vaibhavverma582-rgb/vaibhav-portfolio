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
if (heroSection) {
  window.addEventListener("resize", () => { heroHeight = heroSection.offsetHeight; });
}

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

/* ── Mobile menu ──────────────────────────────────────────── */
const hamburger = $("#hamburger");
const navPanel = $("#nav-links");
hamburger.addEventListener("click", () => {
  const open = navPanel.classList.toggle("open");
  navbar.classList.toggle("menu-open", open);
  hamburger.classList.toggle("open", open);
  hamburger.setAttribute("aria-expanded", String(open));
});
navLinks.forEach((l) => l.addEventListener("click", () => {
  navPanel.classList.remove("open");
  navbar.classList.remove("menu-open");
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
(function researchMarquees() {
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  $$(".research-marquee-shell").forEach((shell) => {
    const marquee = shell.querySelector(".research-marquee");
    const track = shell.querySelector(".research-track");
    const sequence = shell.querySelector(".research-sequence");
    if (!marquee || !track || !sequence) return;

    const loopLength = sequence.scrollWidth;
    const copies = loopLength > 0 ? Math.max(1, Math.ceil(marquee.clientWidth / loopLength)) : 1;
    for (let i = 0; i < copies; i++) {
      const clone = sequence.cloneNode(true);
      clone.classList.add("research-sequence--clone");
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-zoom, .tilt")
        .forEach((card) => card.classList.remove("reveal", "reveal-left", "reveal-right", "reveal-zoom", "tilt"));
      track.append(clone);
    }

    let lastInteraction = 0;
    let lastFrame = 0;
    let animationFrame = 0;
    const INTERACTION_HOLD = 800;

    function isPaused() {
      return document.hidden || motionPreference.matches ||
        performance.now() - lastInteraction < INTERACTION_HOLD;
    }
    function animate(timestamp) {
      if (!lastFrame) lastFrame = timestamp;
      const elapsed = Math.min(timestamp - lastFrame, 64);
      lastFrame = timestamp;
      const loop = sequence.scrollWidth;
      if (!isPaused() && loop > 0) {
        marquee.scrollLeft = (marquee.scrollLeft - elapsed * 0.045 + loop) % loop;
      }
      animationFrame = requestAnimationFrame(animate);
    }
    function start() {
      if (!motionPreference.matches && !animationFrame) {
        animationFrame = requestAnimationFrame(animate);
      }
    }

    shell.addEventListener("pointerdown", () => { lastInteraction = performance.now(); });
    ["pointerup", "pointercancel"].forEach((eventName) => {
      shell.addEventListener(eventName, () => { lastInteraction = performance.now(); });
    });
    shell.querySelectorAll(".marquee-arrow").forEach((button) => {
      button.addEventListener("click", () => {
        const card = sequence.firstElementChild;
        if (!card) return;
        const gap = Number.parseFloat(getComputedStyle(sequence).gap) || 0;
        const direction = button.classList.contains("marquee-arrow--prev") ? -1 : 1;
        const loop = sequence.scrollWidth;
        const target = (marquee.scrollLeft + direction * (card.getBoundingClientRect().width + gap) + loop) % loop;
        lastInteraction = performance.now();
        // Instant step: a smooth glide visibly moves the row against the ambient drift
        marquee.scrollLeft = target;
        if (event.detail > 0) button.blur(); // pointer clicks keep focus and would pause the loop forever
      });
    });
    document.addEventListener("visibilitychange", () => { lastFrame = 0; });
    motionPreference.addEventListener("change", () => {
      lastFrame = 0;
      if (motionPreference.matches) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else {
        start();
      }
    });
    start();
  });
})();

(function lightbox() {
  const lb = $("#lightbox");
  const img = $("#lb-img");
  const cap = $("#lb-cap");
  const galleries = $$(".gallery-grid");
  // Measured intrinsic dimensions so cards get their final size before any image loads —
  // loading then changes pixels only, never layout (no shift, no flicker).
  const GALLERY_DIMS = {
    "1759894941779_Firefly 20251008091218.png.jpg.png": [3072, 4080],
    "AT DU CONFERENCE.jpg": [3072, 4080],
    "AT GOLDEN BEACH PURI.jpg": [1200, 1600],
    "AT MOES.jpg": [6144, 8160],
    "At Ministry of Environment, Forest and Climate Change of India.jpg": [6144, 8160],
    "CMA HEAD OFFICE, NEW DELHI.jpg": [3072, 4080],
    "Cartographic analysis, niu.jpg": [905, 597],
    "Conducting Filed Survey in Okhla Bird Sanctuary.png": [1783, 1288],
    "DU CONFERECE PRESENTATION.png": [720, 896],
    "DU CONFERENCE.JPG": [6000, 4000],
    "Dr. Raghunath Pal Survey Okhla Bird Sanctuary.png": [1818, 1363],
    "Dr. Vikram Singh, Former DGP, Uttar Pradesh CONVOCATION DEGREE.jpg": [606, 1236],
    "GOLDEN BEACH, PURI.jpg": [1200, 1600],
    "Gangtok, Sikkim.JPG": [1280, 960],
    "GROUP PHOTO DU CONFERENCE.JPG": [5712, 4284],
    "ICAI HEAD OFFICE, NEW DELHI.jpg": [2919, 3877],
    "IMD.jpg": [6144, 8160],
    "IMG_20251006_170530749_HDR.jpg": [3072, 4080],
    "IMG_20260324_155737156_HDR.jpg": [3072, 4080],
    "JNU CONFERENCE.jpg": [3072, 4080],
    "JOB FAIR DU.jpg": [3072, 4080],
    "Kalindi college, DU HOD - Dr. Seema Shadev and professor Dr. Geeta Kumari.jpg": [3000, 4000],
    "Lab Dress.jpg": [720, 1061],
    "Lecture Room NIU.jpg": [1000, 750],
    "Mahanadi River, Cuttack District, Odisha.jpg": [1600, 1200],
    "Ministry of Environment, Forest and Climate Change of India.jpg": [6144, 8160],
    "Minstry of Earth Science - IMD.jpg": [8160, 6144],
    "MOES.jpg": [8160, 6144],
    "NIU CONVOCATION.jpg": [1200, 1600],
    "NIU DEGREE.jpg": [1200, 1600],
    "NIU GIS ANALYSIS GEO LAB.jpg": [1200, 1600],
    "NIU LAB SATELLITE IMAGE INTERPETATION.jpg": [958, 1280],
    "Noida International University.jpg": [3120, 4160],
    "Prof. B.W. Pandey, director, center for himalayan studies, DU.jpg": [1813, 3376],
    "Prof. Ilora Ghosh.jpg": [2630, 3904],
    "Prof. Kasturi Mukhopadhyay, JNU.jpg": [3072, 4080],
    "Prof. Muduru Lachhana Dora, Former Director General, GSI, New Delhi & Dr. Dhananjai Pandey, Scientist -G, NCPOR, Goa.jpg": [4080, 3072],
    "Prof. Satish Chandra Garkoti, JNU.jpg": [3072, 4080],
    "Ranchi.jpg": [1200, 1600],
    "Sikkim Geographical Tour, NIU,Banjhakri Water Falls - Gangtok WITH DR. MALINI PRAVE SETHI AND VINEET CHANDAN.JPG": [4032, 3024],
    "Socio-Economic Survey, Yaktin Village, Sikkim.jpg": [1032, 774],
    "Stereoscopy Anlysis niu lab.jpg": [1600, 1200],
    "Study Room.png": [1184, 864],
    "Survey conducted along Village located on bank of mahanadi river to monitor river health.jpg": [1600, 1200],
    "Tree Plantation Dr. Raghunath Pal, Dr. Deepak Katariya and Dr. Moin Khan.jpg": [813, 576],
    "Water Quality Analysis of Mahanadi River, Cuttack District, Odisha.jpg": [1200, 1600],
    "chemistry lab niu.jpg": [1920, 4160],
  };
  const academicCollection = [
    ["1759894941779_Firefly 20251008091218.png.jpg.png", "JNU International Conference 2025"],
    ["AT DU CONFERENCE.jpg", "At the Delhi University Conference"],
    ["At Ministry of Environment, Forest and Climate Change of India.jpg", "At the Ministry of Environment, Forest and Climate Change"],
    ["AT MOES.jpg", "At the Ministry of Earth Sciences"],
    ["CMA HEAD OFFICE, NEW DELHI.jpg", "CMA Head Office · New Delhi"],
    ["Dr. Vikram Singh, Former DGP, Uttar Pradesh CONVOCATION DEGREE.jpg", "Convocation with Dr. Vikram Singh"],
    ["DU CONFERECE PRESENTATION.png", "Research Presentation · Delhi University"],
    ["DU CONFERENCE.JPG", "Delhi University Conference"],
    ["GROUP PHOTO DU CONFERENCE.JPG", "Conference Gathering · Delhi University"],
    ["ICAI HEAD OFFICE, NEW DELHI.jpg", "ICAI Head Office · New Delhi"],
    ["IMD.jpg", "IMD Head Office, New Delhi"],
    ["IMG_20251006_170530749_HDR.jpg", "JNU Conference Poster Evaluation by Invigilator"],
    ["IMG_20260324_155737156_HDR.jpg", "Vriti 2026 Job Fair"],
    ["JNU CONFERENCE.jpg", "Conference at Jawaharlal Nehru University"],
    ["JOB FAIR DU.jpg", "Job Fair · Delhi University · Vriti 26"],
    ["Kalindi college, DU HOD - Dr. Seema Shadev and professor Dr. Geeta Kumari.jpg", "With Faculty · Kalindi College, Delhi University"],
    ["Lecture Room NIU.jpg", "Lecture Room · NIU"],
    ["Ministry of Environment, Forest and Climate Change of India.jpg", "Ministry of Environment, Forest and Climate Change"],
    ["Minstry of Earth Science - IMD.jpg", "Ministry of Earth Sciences · India Meteorological Department"],
    ["MOES.jpg", "Ministry of Earth Sciences"],
    ["NIU CONVOCATION.jpg", "Convocation · Noida International University"],
    ["NIU DEGREE.jpg", "Degree Ceremony · Noida International University"],
    ["Noida International University.jpg", "Noida International University"],
    ["Prof. B.W. Pandey, director, center for himalayan studies, DU.jpg", "With Prof. B. W. Pandey · Delhi University"],
    ["Prof. Ilora Ghosh.jpg", "With Prof. Ilora Ghosh · JNU"],
    ["Prof. Kasturi Mukhopadhyay, JNU.jpg", "With Prof. Kasturi Mukhopadhyay · JNU"],
    ["Prof. Muduru Lachhana Dora, Former Director General, GSI, New Delhi & Dr. Dhananjai Pandey, Scientist -G, NCPOR, Goa.jpg", "With GSI and NCPOR Scientists · New Delhi"],
    ["Prof. Satish Chandra Garkoti, JNU.jpg", "With Prof. Satish Chandra Garkoti · JNU"],
    ["Study Room.png", "Study Space"],
  ];
  const fieldCollection = [
    ["AT GOLDEN BEACH PURI.jpg", "Golden Beach, Puri"],
    ["Cartographic analysis, niu.jpg", "Cartographic Analysis · NIU"],
    ["chemistry lab niu.jpg", "Chemistry Laboratory · NIU"],
    ["Conducting Filed Survey in Okhla Bird Sanctuary.png", "Field Survey · Okhla Bird Sanctuary"],
    ["Dr. Raghunath Pal Survey Okhla Bird Sanctuary.png", "Okhla Bird Sanctuary Survey with Dr. Raghunath Pal"],
    ["Gangtok, Sikkim.JPG", "Geographical Field Trip · Gangtok, Sikkim"],
    ["GOLDEN BEACH, PURI.jpg", "Golden Beach, Puri"],
    ["Lab Dress.jpg", "Laboratory Work"],
    ["Mahanadi River, Cuttack District, Odisha.jpg", "Mahanadi River · Cuttack, Odisha"],
    ["NIU GIS ANALYSIS GEO LAB.jpg", "GIS Analysis · Geospatial Laboratory, NIU"],
    ["NIU LAB SATELLITE IMAGE INTERPETATION.jpg", "Satellite Image Interpretation · NIU"],
    ["Ranchi.jpg", "Ranchi · Field Visit"],
    ["Sikkim Geographical Tour, NIU,Banjhakri Water Falls - Gangtok WITH DR. MALINI PRAVE SETHI AND VINEET CHANDAN.JPG", "Geographical Tour · Banjhakri Falls, Gangtok"],
    ["Stereoscopy Anlysis niu lab.jpg", "Stereoscopic Analysis · NIU Laboratory"],
    ["Socio-Economic Survey, Yaktin Village, Sikkim.jpg", "Socio-Economic Survey · Yaktin Village, Sikkim"],
    ["Survey conducted along Village located on bank of mahanadi river to monitor river health.jpg", "River Health Survey · Mahanadi Riverbank"],
    ["Tree Plantation Dr. Raghunath Pal, Dr. Deepak Katariya and Dr. Moin Khan.jpg", "Tree Plantation with Dr. Raghunath Pal, Dr. Deepak Katariya and Dr. Moin Khan"],
    ["Water Quality Analysis of Mahanadi River, Cuttack District, Odisha.jpg", "Water Quality Analysis · Mahanadi River, Odisha"],
  ];

  function appendPhotos(sequence, collection) {
    collection.forEach(([file, title]) => {
      const figure = document.createElement("figure");
      figure.className = "g-item";
      const photo = document.createElement("img");
      photo.src = `photos/${encodeURIComponent(file)}`;
      photo.alt = title;
      photo.loading = "lazy";
      photo.decoding = "async";
      const dims = GALLERY_DIMS[file];
      if (dims) { photo.width = dims[0]; photo.height = dims[1]; }
      const caption = document.createElement("figcaption");
      const heading = document.createElement("b");
      heading.textContent = title;
      caption.append(heading);
      figure.append(photo, caption);
      sequence.append(figure);
    });
  }
  if (galleries[0]) appendPhotos(galleries[0], academicCollection);
  if (galleries[1]) appendPhotos(galleries[1], fieldCollection);
  const photoItems = galleries.flatMap((g) => [...g.querySelectorAll(".g-item")]);
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  galleries.forEach((gallery) => {
    const galleryTrack = gallery.closest(".gallery-track");
    const shell = gallery.closest(".gallery-marquee-shell");
    const marquee = shell ? shell.querySelector(".gallery-marquee") : null;
    if (!galleryTrack || !shell || !marquee) return;

    const galleryClone = gallery.cloneNode(true);
    galleryClone.classList.add("gallery-sequence--clone");
    galleryClone.setAttribute("aria-hidden", "true");
    galleryClone.querySelectorAll(".g-item").forEach((figure) => {
      figure.classList.remove("reveal", "reveal-zoom");
      figure.removeAttribute("role");
      figure.removeAttribute("tabindex");
      figure.removeAttribute("aria-label");
    });
    galleryClone.querySelectorAll("img").forEach((photo) => { photo.alt = ""; });
    galleryTrack.append(galleryClone);
    const galleryPhotos = [...gallery.querySelectorAll("img")];
    const clonedPhotos = [...galleryClone.querySelectorAll("img")];
    const photoPairs = galleryPhotos.map((photo, index) => [photo, clonedPhotos[index]]);
    function sizePhotoCards() {
      const maxWidth = window.matchMedia("(max-width: 380px)").matches ? 205
        : window.matchMedia("(max-width: 640px)").matches ? 270
          : window.matchMedia("(max-width: 900px)").matches ? 330 : 390;
      const maxHeight = window.matchMedia("(max-width: 640px)").matches ? 220
        : window.matchMedia("(max-width: 900px)").matches ? 270 : 310;
      photoPairs.forEach(([photo, clone]) => {
        // Fall back to the width/height attributes so cards are sized from the
        // first frame, before their image finishes loading
        const natW = photo.naturalWidth || +photo.getAttribute("width") || 0;
        const natH = photo.naturalHeight || +photo.getAttribute("height") || 0;
        if (!natW || !natH) return;
        const scale = Math.min(maxWidth / natW, maxHeight / natH);
        const width = Math.round(natW * scale);
        const height = Math.round(natH * scale);
        const portrait = natH > natW * 1.1;
        [photo, clone].forEach((image) => {
          const card = image.closest(".g-item");
          card.style.setProperty("--photo-width", `${width}px`);
          card.style.setProperty("--photo-height", `${height}px`);
          card.classList.toggle("g-item--portrait", portrait);
        });
      });
    }
    galleryPhotos.forEach((photo) => {
      if (!photo.complete) photo.addEventListener("load", sizePhotoCards, { once: true });
    });
    window.addEventListener("resize", sizePhotoCards, { passive: true });
    sizePhotoCards();

    let lastInteraction = 0;
    let lastFrame = 0;
    let animationFrame;
    const INTERACTION_HOLD = 800;

    function isMarqueePaused() {
      return document.hidden || motionPreference.matches ||
        lb.classList.contains("open") ||
        performance.now() - lastInteraction < INTERACTION_HOLD;
    }
    function animateMarquee(timestamp) {
      if (!lastFrame) lastFrame = timestamp;
      const elapsed = Math.min(timestamp - lastFrame, 64);
      lastFrame = timestamp;
      const loop = gallery.scrollWidth;
      if (!isMarqueePaused() && loop > 0) {
        marquee.scrollLeft = (marquee.scrollLeft - elapsed * 0.055 + loop) % loop;
      }
      animationFrame = requestAnimationFrame(animateMarquee);
    }
    function startMarquee() {
      if (!motionPreference.matches && !animationFrame) {
        animationFrame = requestAnimationFrame(animateMarquee);
      }
    }
    shell.addEventListener("pointerdown", () => { lastInteraction = performance.now(); });
    ["pointerup", "pointercancel"].forEach((eventName) => {
      shell.addEventListener(eventName, () => { lastInteraction = performance.now(); });
    });
    shell.querySelectorAll(".marquee-arrow").forEach((button) => {
      button.addEventListener("click", () => {
        const card = gallery.firstElementChild;
        if (!card) return;
        const gap = Number.parseFloat(getComputedStyle(gallery).gap) || 0;
        const direction = button.classList.contains("marquee-arrow--prev") ? -1 : 1;
        const loop = gallery.scrollWidth;
        const target = (marquee.scrollLeft + direction * (card.getBoundingClientRect().width + gap) + loop) % loop;
        lastInteraction = performance.now();
        // Instant step: a smooth glide visibly moves the row against the ambient drift
        marquee.scrollLeft = target;
        if (event.detail > 0) button.blur(); // pointer clicks keep focus and would pause the loop forever
      });
    });
    document.addEventListener("visibilitychange", () => { lastFrame = 0; });
    motionPreference.addEventListener("change", () => {
      lastFrame = 0;
      if (motionPreference.matches) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else {
        startMarquee();
      }
    });
    startMarquee();
  });

  const certificateCollection = [
    ["Central University of Karanataka 21 Days Online Training Programme using QGIS Certificate_page-0001.jpg", "21-Day Online GIS Training Using QGIS · Central University of Karnataka", "2020"],
    ["Certificate JNU Conference October 6-7 2025_page-0001.jpg", "JNU International Conference · Poster Presentation", "2025"],
    ["Certificate of conference.jpg", "DU International Conference · Oral Presentation", "2025"],
    ["GBU Certificate Atmospheric Science webinar_page-0001.jpg", "Atmospheric Processes and Computational Mathematics Workshop · GBU", "2020"],
    ["GSI Certificate Online Course Basics of Geomorphology.jpg", "Basics of Geomorphology · Geological Survey of India", "2021"],
    ["Image (1).png (2).jpg", "Overview of Planetary Geosciences: The Moon and Mars · IIRS", "2020"],
    ["Image (1).png (3).jpg", "Geoinformatics in Ecological Studies · IIRS", "2020"],
    ["Image (1).png (4).jpg", "Basic Principles of Remote Sensing Technology · IIRS", "2020"],
    ["Image (1).png (5).jpg", "Remote Sensing and GIS Applications · IIRS", "2020"],
    ["Image (1).png (6).jpg", "Computer Applications Diploma · SAMTECH", "2017"],
    ["Image (1).png (7).jpg", "Adventure Education Camp · Climb Up", "2014"],
    ["IMG-20260403-WA0000.jpg", "Volunteer Internship Completion · Suvidha Foundation", "2026"],
    ["IMG_20260324_195640273~2.jpg", "HR Professional Appreciation · Vriti Job Fair", "2026"],
    ["Module 3_page-0001.jpg", "Data Management, Statistical Methods, Data Analysis and QC · INCOIS", "2026"],
    ["Module 4_page-0001.jpg", "Visualization of Oceanographic Data Using Open-Source Tools · INCOIS", "2026"],
    ["NDMI Certificate on National Training Programme on Earthquake_page-0001.jpg", "Earthquake Risk Mitigation · NIDM and NEHU", "2020"],
  ];
  certificateCollection.sort((a, b) => Number(a[2]) - Number(b[2]));
  const certificateSources = certificateCollection.map(([file, title, year]) => ({
    src: `Certificates/${encodeURIComponent(file)}`,
    alt: title,
    cap: `${title} · ${year}`,
    year,
  }));
  const certificateCards = $(".certificate-cards");
  const certificateButtons = certificateCards ? certificateSources.map((certificate) => {
    const button = document.createElement("button");
    button.className = "certificate-card";
    button.type = "button";
    button.setAttribute("aria-label", `Certificate details: ${certificate.alt}`);
    const icon = document.createElement("span");
    icon.className = "certificate-card-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M7 3.75h7l4 4v12.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 4v4h4M8.5 12h7M8.5 15.5h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
    const title = document.createElement("span");
    title.className = "certificate-card-title";
    title.textContent = certificate.alt;
    const year = document.createElement("span");
    year.className = "certificate-card-year";
    year.textContent = certificate.year;
    const action = document.createElement("span");
    action.className = "certificate-card-action";
    action.innerHTML = 'View <span aria-hidden="true">→</span>';
    button.append(icon, title, year, action);
    certificateCards.append(button);
    return button;
  }) : [];
  certificateButtons.forEach((button, index) => {
    button.addEventListener("click", () => open(photoItems.length + index, button));
  });

  const sources = [
    ...photoItems.map((f) => ({
      src: f.querySelector("img").src,
      alt: f.querySelector("img").alt,
      cap: f.querySelector("figcaption")?.innerText || "",
    })),
    ...certificateSources,
  ];
  let idx = 0;
  let returnFocus;

  function show(i) {
    idx = (i + sources.length) % sources.length;
    img.src = sources[idx].src;
    img.alt = sources[idx].alt;
    cap.textContent = sources[idx].cap.replace(/\n/g, " · ");
  }
  function open(i, trigger) {
    returnFocus = trigger;
    show(i);
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    $(".lb-close").focus();
  }
  function close() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    if (returnFocus) returnFocus.focus();
  }

  photoItems.forEach((f, i) => {
    const title = f.querySelector("img").alt;
    f.tabIndex = 0;
    f.setAttribute("role", "button");
    f.setAttribute("aria-label", `View image: ${title}`);
    f.addEventListener("click", () => open(i, f));
    f.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(i, f);
      }
    });
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
$("#contact-form")?.addEventListener("submit", (e) => {
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
