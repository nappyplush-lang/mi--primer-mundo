// =========================================
// El Oskar — Comida Criolla
// =========================================

// Número de WhatsApp: código de país + número, sin "+" ni espacios.
// Cámbialo por el número real del restaurante.
const WHATSAPP_NUMBER = "51999999999";
const DEFAULT_MESSAGE = "¡Hola El Oskar! Quisiera hacer un pedido.";

function whatsappLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const links = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("main section[id]");

  // ----- Enlaces de WhatsApp -----
  document.getElementById("whatsappDirect").href = whatsappLink(DEFAULT_MESSAGE);
  document.getElementById("whatsappFloat").href = whatsappLink(DEFAULT_MESSAGE);

  // ----- Menú hamburguesa (celular) -----
  function closeMenu() {
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menú");
  }

  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  });

  links.forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // ----- Header con fondo al bajar + enlace activo -----
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 50);

    let current = "";
    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 120) current = section.id;
    });
    links.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ----- Animación de aparición al hacer scroll -----
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("visible"));
  }

  // ----- Formulario: arma el mensaje y abre WhatsApp -----
  const form = document.getElementById("contactForm");
  const formError = document.getElementById("formError");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = form.nombre.value.trim();
    const tipo = form.tipo.value;
    const mensaje = form.mensaje.value.trim();

    if (!nombre || !mensaje) {
      formError.textContent = "Por favor completa tu nombre y tu mensaje.";
      return;
    }
    formError.textContent = "";

    const texto = `¡Hola El Oskar! Soy ${nombre}.\nQuisiera: ${tipo}.\n\n${mensaje}`;
    window.open(whatsappLink(texto), "_blank", "noopener");
    form.reset();
  });

  // ----- Año actual en el pie de página -----
  document.getElementById("year").textContent = new Date().getFullYear();
});
