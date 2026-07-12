// Année dynamique dans le footer
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===== Thème clair / sombre ===== */
const root = document.documentElement;
const themeToggle = document.getElementById("theme-toggle");

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  themeToggle.setAttribute("aria-pressed", theme === "light");
}

const savedTheme = localStorage.getItem("theme");
const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
applyTheme(savedTheme || (prefersLight ? "light" : "dark"));

themeToggle.addEventListener("click", () => {
  const current = root.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem("theme", next);
});

/* ===== Mise en surbrillance de la page courante dans la nav ===== */
const currentPage = document.body.dataset.page;
document.querySelectorAll(".tabs__link").forEach((link) => {
  link.classList.toggle("is-active", link.dataset.page === currentPage);
});

/* ===== Apparition en fondu au scroll ===== */
const revealTargets = document.querySelectorAll(".section__inner");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealTargets.forEach((el) => revealObserver.observe(el));

/* ===== Fond animé : réseau de nœuds =====
   Représente visuellement le domaine métier (réseaux/infra) en toile de fond,
   discret, en accord avec la couleur d'accent du thème actif. */
(function networkBackground() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width, height, nodes;
  const LINK_DISTANCE = 150;
  const NODE_COUNT_DIVISOR = 22000; // densité des nœuds selon la surface

  function getAccentColor() {
    return getComputedStyle(root).getPropertyValue("--color-accent").trim() || "#4C8DFF";
  }

  function hexToRgb(hex) {
    const parsed = hex.replace("#", "");
    const bigint = parseInt(parsed.length === 3
      ? parsed.split("").map((c) => c + c).join("")
      : parsed, 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const count = Math.min(90, Math.max(28, Math.floor((width * height) / NODE_COUNT_DIVISOR)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const [r, g, b] = hexToRgb(getAccentColor());

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      if (!reduceMotion) {
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > width) a.vx *= -1;
        if (a.y < 0 || a.y > height) a.vy *= -1;
      }
      for (let j = i + 1; j < nodes.length; j++) {
        const bNode = nodes[j];
        const dx = a.x - bNode.x;
        const dy = a.y - bNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DISTANCE) {
          const opacity = (1 - dist / LINK_DISTANCE) * 0.16;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(bNode.x, bNode.y);
          ctx.stroke();
        }
      }
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.45)`;
      ctx.beginPath();
      ctx.arc(a.x, a.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() {
    draw();
    if (!reduceMotion) requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  resize();
  loop();
})();
