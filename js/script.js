/* Contact settings: edit these values if the business contact changes. */
const CONFIG = {
  email: "krisekspor@gmail.com",
  whatsapp: "6281112211796",
};

(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* Contact config */
  if (CONFIG.email)
    $$("[data-email]").forEach((a) => {
      a.href = "mailto:" + CONFIG.email;
      a.textContent = CONFIG.email;
    });
  if (CONFIG.whatsapp)
    $$("[data-wa]").forEach((a) => {
      a.href = "https://wa.me/" + CONFIG.whatsapp;
      a.textContent = "+" + CONFIG.whatsapp;
    });
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* Sticky nav state */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();

  /* Mobile menu */
  const burger = $("#burger"),
    menu = $("#menu");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("open", open);
    nav.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  if (burger && menu) {
    burger.addEventListener("click", () =>
      setMenu(burger.getAttribute("aria-expanded") !== "true"),
    );
  }
  if (menu) {
    $$("a", menu).forEach((a) =>
      a.addEventListener("click", () => setMenu(false)),
    );
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (burger && menu) setMenu(false);
      if (burger) burger.focus();
    }
  });
  window
    .matchMedia("(min-width:861px)")
    .addEventListener("change", () => setMenu(false));

  /* Scroll reveal + timeline */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
  );
  $$(".reveal, #timeline").forEach((el) => io.observe(el));

  /* Active nav link */
  const links = $$('.menu a[href^="#"]');
  const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((l) => l.classList.remove("active"));
          const id = en.target.id === "export" ? "contact" : en.target.id;
          const a = map.get(id);
          if (a && !a.classList.contains("nav-cta")) a.classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  ["home", "about", "product", "applications", "quality"].forEach((id) => {
    const s = document.getElementById(id);
    if (s) spy.observe(s);
  });

  /* Slow parallax (rAF-throttled) */
  const px = $$("[data-parallax]"),
    pimg = $$("[data-parallax-img]");
  let ticking = false;
  const parallax = () => {
    const vh = window.innerHeight;
    px.forEach((el) => {
      const f = parseFloat(el.dataset.parallax) || 0.1;
      el.style.transform = `translate3d(0,${(window.scrollY * f).toFixed(1)}px,0)`;
    });
    pimg.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const p = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.transform = `translate3d(0,${(p * -36).toFixed(1)}px,0)`;
    });
    ticking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      onScroll();
      if (!reduce && !ticking) {
        ticking = true;
        requestAnimationFrame(parallax);
      }
    },
    { passive: true },
  );
  if (!reduce) parallax();

  /* Floating stone particles (hero) */
  const cv = $("#particles");
  if (cv && !reduce) {
    const ctx = cv.getContext("2d");
    let w,
      h,
      dpr,
      parts = [],
      visible = true,
      raf;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(56, Math.max(22, w / 26)));
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2.2 + 0.5,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -(Math.random() * 0.16 + 0.04),
        a: Math.random() * 0.35 + 0.1,
        ph: Math.random() * 6.28,
      }));
    };
    const tick = (t) => {
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx + Math.sin(t / 3000 + p.ph) * 0.08;
        p.y += p.vy;
        if (p.y < -6) {
          p.y = h + 6;
          p.x = Math.random() * w;
        }
        if (p.x < -6) p.x = w + 6;
        if (p.x > w + 6) p.x = -6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = `rgba(232,222,204,${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    size();
    new ResizeObserver(size).observe(cv);
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) raf = requestAnimationFrame(tick);
      else cancelAnimationFrame(raf);
    }).observe(cv);
    raf = requestAnimationFrame(tick);
  }

  /* Map animation off for reduced motion */
  const svg = $("#worldmap");
  if (svg && reduce && svg.pauseAnimations) {
    svg.pauseAnimations();
    $$(".movers", svg).forEach((g) => g.remove());
  }

  /* Inquiry form: validates, then opens a pre-filled email */
  const form = $("#inquiry"),
    status = $("#formStatus");
  if (!form || !status) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.style.color = "";
    const bad = $$("[required]", form).find(
      (f) => !f.value.trim() || (f.type === "email" && !f.checkValidity()),
    );
    if (bad) {
      status.style.color = "#9a4a2f";
      status.textContent =
        bad.type === "email"
          ? "Please enter a valid email address."
          : "Please complete the required fields.";
      bad.focus();
      return;
    }
    const d = Object.fromEntries(new FormData(form));
    const body = `Name: ${d.name}\nCompany: ${d.company || "-"}\nEmail: ${d.email}\nCountry: ${d.country || "-"}\nProduct interest: ${d.product || "-"}\n\n${d.message}`;
    if (!CONFIG.email) {
      status.style.color = "#9a4a2f";
      status.textContent =
        "Set your email address in CONFIG (top of the script) to enable sending.";
      return;
    }
    location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Inquiry from " + d.name + (d.company ? " (" + d.company + ")" : ""))}&body=${encodeURIComponent(body)}`;
    status.textContent =
      "Your email app is opening with the inquiry ready to send.";
  });
})();
