/* =========================================================
   Wahab Bissiriou — Portfolio · one-page
   ========================================================= */

// Année dynamique dans le footer
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===== Thème clair / sombre ===== */
const root = document.documentElement;
const themeToggle = document.getElementById("theme-toggle");

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  if (themeToggle) themeToggle.setAttribute("aria-pressed", theme === "light");
}

const savedTheme = localStorage.getItem("theme");
const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
applyTheme(savedTheme || (prefersLight ? "light" : "dark"));

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("theme", next);
  });
}

/* ===== Effet "machine à écrire" sur le rôle ===== */
(function typedRole() {
  const el = document.getElementById("typed-role");
  if (!el) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const roles = [
    "Ingénieur Réseaux & Systèmes",
    "Administrateur Réseaux & Sécurité",
    "Pilote de projets IT",
  ];

  if (reduceMotion) {
    el.textContent = roles[0];
    return;
  }

  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const current = roles[roleIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 2200);
        return;
      }
      setTimeout(tick, 55);
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(tick, 350);
        return;
      }
      setTimeout(tick, 28);
    }
  }

  tick();
})();

/* ===== Scroll-spy : section active dans le rail ===== */
(function scrollSpy() {
  const links = document.querySelectorAll(".rail__link");
  const sections = document.querySelectorAll("main .section[id]");
  if (!links.length || !sections.length) return;

  const byId = {};
  links.forEach((link) => { byId[link.dataset.section] = link; });

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove("is-active"));
          const link = byId[entry.target.id];
          if (link) link.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-35% 0px -55% 0px" }
  );

  sections.forEach((s) => spy.observe(s));
})();

/* ===== Apparition en fondu au scroll ===== */
(function reveal() {
  const targets = document.querySelectorAll(".section__inner");
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  targets.forEach((el) => obs.observe(el));
})();

/* ===== Compteurs animés (stats du hero) ===== */
(function counters() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const values = document.querySelectorAll(".stat__value[data-count]");
  if (!values.length || reduceMotion) return;

  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1200;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  values.forEach((el) => obs.observe(el));
})();

/* ===== Fond animé : topologie réseau =====
   Une vraie métaphore métier : des nœuds (dont quelques "équipements
   cœur de réseau" plus marqués), des liens, et des paquets de données
   qui voyagent de nœud en nœud comme un routage. Discret, accordé
   à la couleur d'accent du thème actif. */
(function networkBackground() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width, height, nodes, packets;
  const LINK_DISTANCE = 165;
  const NODE_COUNT_DIVISOR = 24000;
  const mouse = { x: null, y: null };

  function cssVar(name, fallback) {
    return getComputedStyle(root).getPropertyValue(name).trim() || fallback;
  }

  function hexToRgb(hex) {
    const parsed = hex.replace("#", "");
    const bigint = parseInt(
      parsed.length === 3 ? parsed.split("").map((c) => c + c).join("") : parsed,
      16
    );
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  }

  function neighborsOf(node) {
    const out = [];
    for (const other of nodes) {
      if (other === node) continue;
      const dx = node.x - other.x;
      const dy = node.y - other.y;
      if (dx * dx + dy * dy < LINK_DISTANCE * LINK_DISTANCE) out.push(other);
    }
    return out;
  }

  function spawnPacket() {
    const from = nodes[Math.floor(Math.random() * nodes.length)];
    const options = neighborsOf(from);
    if (!options.length) return null;
    return {
      from,
      to: options[Math.floor(Math.random() * options.length)],
      t: 0,
      speed: 0.006 + Math.random() * 0.008,
      hops: 0,
    };
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const count = Math.min(85, Math.max(26, Math.floor((width * height) / NODE_COUNT_DIVISOR)));
    nodes = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      // ~1 nœud sur 8 est un "cœur de réseau" : plus gros, avec un anneau
      hub: i % 8 === 0,
      r: 1.4 + Math.random() * 0.9,
    }));
    packets = [];
    const packetCount = reduceMotion ? 0 : Math.max(4, Math.floor(count / 9));
    for (let i = 0; i < packetCount; i++) {
      const p = spawnPacket();
      if (p) packets.push(p);
    }
  }

  function drawNode(node, r, g, b) {
    if (node.hub) {
      // Anneau façon équipement central
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.35)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 6.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.38)`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPackets(r, g, b) {
    for (let i = 0; i < packets.length; i++) {
      const p = packets[i];
      p.t += p.speed;

      if (p.t >= 1) {
        // Arrivé au nœud : prochain saut, comme un routage
        p.hops++;
        const options = neighborsOf(p.to).filter((n) => n !== p.from);
        if (options.length && p.hops < 6) {
          p.from = p.to;
          p.to = options[Math.floor(Math.random() * options.length)];
          p.t = 0;
        } else {
          const fresh = spawnPacket();
          if (fresh) packets[i] = fresh;
          continue;
        }
      }

      const x = p.from.x + (p.to.x - p.from.x) * p.t;
      const y = p.from.y + (p.to.y - p.from.y) * p.t;

      // Traînée courte derrière le paquet
      const tx = p.from.x + (p.to.x - p.from.x) * Math.max(0, p.t - 0.08);
      const ty = p.from.y + (p.to.y - p.from.y) * Math.max(0, p.t - 0.08);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const [r, g, b] = hexToRgb(cssVar("--accent", "#58A6FF"));
    const [mr, mg, mb] = hexToRgb(cssVar("--mint", "#3DDC97"));

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      if (!reduceMotion) {
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > width) a.vx *= -1;
        if (a.y < 0 || a.y > height) a.vy *= -1;
      }

      // Lien discret vers le curseur
      if (mouse.x !== null) {
        const dxm = a.x - mouse.x;
        const dym = a.y - mouse.y;
        const distM = Math.sqrt(dxm * dxm + dym * dym);
        if (distM < LINK_DISTANCE * 0.9) {
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${(1 - distM / (LINK_DISTANCE * 0.9)) * 0.22})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      for (let j = i + 1; j < nodes.length; j++) {
        const bNode = nodes[j];
        const dx = a.x - bNode.x;
        const dy = a.y - bNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DISTANCE) {
          const strong = a.hub || bNode.hub ? 0.2 : 0.13;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${(1 - dist / LINK_DISTANCE) * strong})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(bNode.x, bNode.y);
          ctx.stroke();
        }
      }

      drawNode(a, r, g, b);
    }

    // Paquets en couleur "mint" (état OK / trafic sain)
    drawPackets(mr, mg, mb);
  }

  function loop() {
    draw();
    if (!reduceMotion) requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener("mouseleave", () => { mouse.x = null; mouse.y = null; });

  resize();
  loop();
})();

/* ===== Google Analytics (GA4) — chargé uniquement après consentement =====
   Respecte le RGPD : aucune requête vers Google tant que le visiteur
   n'a pas cliqué sur "Accepter". Le choix est mémorisé et modifiable
   à tout moment via le lien "Gérer les cookies" du pied de page. */
(function analyticsConsent() {
  const GA_ID = "G-SFLBKN1557";
  const CONSENT_KEY = "ga-consent";

  const banner = document.getElementById("cookie-banner");
  const acceptBtn = document.getElementById("cookie-accept");
  const declineBtn = document.getElementById("cookie-decline");
  const manageBtn = document.getElementById("cookie-manage");

  function loadGA() {
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID);
  }

  function showBanner() { if (banner) banner.classList.add("is-visible"); }
  function hideBanner() { if (banner) banner.classList.remove("is-visible"); }

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) { /* stockage indisponible, on continue sans mémoriser */ }
  }

  const consent = getConsent();
  if (consent === "accepted") {
    loadGA();
  } else if (consent !== "declined") {
    showBanner();
  }

  if (acceptBtn) acceptBtn.addEventListener("click", () => {
    setConsent("accepted");
    loadGA();
    hideBanner();
  });
  if (declineBtn) declineBtn.addEventListener("click", () => {
    setConsent("declined");
    hideBanner();
  });
  if (manageBtn) manageBtn.addEventListener("click", () => {
    showBanner();
  });
})();
