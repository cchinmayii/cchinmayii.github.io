const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeLabel = document.querySelector("[data-theme-label]");
const themeColor = document.querySelector('meta[name="theme-color"]');

const applyTheme = (theme) => {
  const isDark = theme === "dark";
  root.dataset.theme = theme;
  themeToggle?.setAttribute("aria-pressed", String(isDark));
  themeToggle?.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
  if (themeLabel) themeLabel.textContent = isDark ? "Light" : "Dark";
  themeColor?.setAttribute("content", isDark ? "#101614" : "#ffffff");
};

const savedTheme = localStorage.getItem("theme");
const preferredTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
applyTheme(preferredTheme);

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem("theme", nextTheme);
});

const navLinks = [...document.querySelectorAll(".site-nav a")].filter((link) => {
  const destination = new URL(link.href, window.location.href);
  const samePage =
    destination.pathname === window.location.pathname ||
    (window.location.pathname.endsWith("/") && destination.pathname.endsWith("/index.html"));
  return samePage && destination.hash;
});
const sections = document.querySelectorAll("main section[id]");

const setActiveNav = (sectionId) => {
  navLinks.forEach((link) => link.classList.toggle("active", link.hash === `#${sectionId}`));
};

const initialSection = (window.location.hash && document.querySelector(window.location.hash)) || sections[0];
if (initialSection) setActiveNav(initialSection.id);

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        setActiveNav(entry.target.id);
      });
    },
    { rootMargin: "-30% 0px -60%", threshold: 0 },
  );
  sections.forEach((section) => observer.observe(section));
}

const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();
