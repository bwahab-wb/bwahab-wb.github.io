// Année dynamique dans le footer
document.getElementById("year").textContent = new Date().getFullYear();

// Mise en surbrillance de l'onglet actif selon la section visible
const sections = document.querySelectorAll(".section");
const links = document.querySelectorAll(".tabs__link");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        links.forEach((link) => {
          link.classList.toggle(
            "is-active",
            link.dataset.section === id
          );
        });
      }
    });
  },
  { threshold: 0.5 }
);

sections.forEach((section) => observer.observe(section));
