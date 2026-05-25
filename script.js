const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navLinks = document.querySelector("[data-nav-links]");
const revealItems = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Update header scroll class
function updateHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 20);
}

// Mobile navigation menu toggle
function closeMenu() {
  if (!menuToggle || !navLinks) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.classList.remove("is-active");
  navLinks.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

function setupMenu() {
  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.classList.toggle("is-active", !isOpen);
    navLinks.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

// Scroll progress bar indicator
function setupScrollProgress() {
  const progressBar = document.querySelector("[data-scroll-progress]");
  if (!progressBar) return;

  window.addEventListener("scroll", () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;
    const progress = (window.scrollY / totalHeight) * 100;
    progressBar.style.width = `${progress}%`;
  }, { passive: true });
}

// Scrollspy for active navigation links
function setupScrollspy() {
  const sections = document.querySelectorAll("main > section[id]");
  const navLinksList = document.querySelectorAll("[data-nav-link]");
  if (!sections.length || !navLinksList.length) return;

  window.addEventListener("scroll", () => {
    let currentId = "";
    const scrollPosition = window.scrollY + 150; // offset for nav height

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentId = section.getAttribute("id");
      }
    });

    navLinksList.forEach((link) => {
      const href = link.getAttribute("href");
      const isActive = href && href.includes(`#${currentId}`);
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }, { passive: true });
}

// Staggered reveals on scroll
function setupReveals() {
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
  );

  revealItems.forEach((item) => {
    const parent = item.closest("[data-stagger]");
    if (parent) {
      const siblings = Array.from(parent.querySelectorAll(".reveal"));
      const index = siblings.indexOf(item);
      item.style.transitionDelay = `${index * 60}ms`;
    }
    observer.observe(item);
  });
}

// Mousemove parallax effect in Hero
function setupParallax() {
  const hero = document.getElementById("home");
  if (!hero || prefersReducedMotion) return;

  const targets = hero.querySelectorAll(".interactive-parallax");
  hero.addEventListener("mousemove", (event) => {
    const { width, height, left, top } = hero.getBoundingClientRect();
    const moveX = (event.clientX - left - width / 2) / (width / 2);
    const moveY = (event.clientY - top - height / 2) / (height / 2);

    targets.forEach((target) => {
      const speed = Number(target.dataset.speed || "1.0");
      const x = moveX * speed * 22;
      const y = moveY * speed * 22;
      target.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      target.style.transition = "transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    });
  });

  hero.addEventListener("mouseleave", () => {
    targets.forEach((target) => {
      target.style.transform = "translate3d(0px, 0px, 0px)";
      target.style.transition = "transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)";
    });
  });
}

// Contact form fields capture and Google Form redirection
function setupContactForm() {
  const form = document.querySelector("[data-contact-form]");
  const modal = document.getElementById("redirectionModal");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Show the redirection modal
    if (modal) {
      modal.classList.add("is-active");
      modal.setAttribute("aria-hidden", "false");
    }

    // Redirect to Google Form after progress bar completion
    setTimeout(() => {
      window.open("https://forms.gle/sMC2fT8t8hiXJbve8", "_blank", "noopener,noreferrer");

      // Reset the form and close the modal
      form.reset();
      setTimeout(() => {
        if (modal) {
          modal.classList.remove("is-active");
          modal.setAttribute("aria-hidden", "true");
        }
      }, 500);
    }, 1500);
  });
}

// Polished Testimonials Slider
function setupCarousel() {
  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll("[data-slide]"));
  const previous = carousel.querySelector("[data-carousel-prev]");
  const next = carousel.querySelector("[data-carousel-next]");
  const dots = carousel.querySelector("[data-carousel-dots]");
  let activeIndex = 0;
  let timerId;

  function renderDots() {
    if (!dots) return;
    dots.innerHTML = "";
    slides.forEach((_, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", `Show testimonial ${index + 1}`);
      button.setAttribute("aria-current", String(index === activeIndex));
      button.addEventListener("click", () => {
        showSlide(index);
        restart();
      });
      dots.append(button);
    });
  }

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });
    dots?.querySelectorAll("button").forEach((dot, dotIndex) => {
      dot.setAttribute("aria-current", String(dotIndex === activeIndex));
    });
  }

  function restart() {
    if (prefersReducedMotion) return;
    window.clearInterval(timerId);
    timerId = window.setInterval(() => showSlide(activeIndex + 1), 7000);
  }

  previous?.addEventListener("click", () => {
    showSlide(activeIndex - 1);
    restart();
  });

  next?.addEventListener("click", () => {
    showSlide(activeIndex + 1);
    restart();
  });

  // Swipe support for touch screens
  let touchStartX = 0;
  let touchEndX = 0;
  
  carousel.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carousel.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleGesture();
  }, { passive: true });

  function handleGesture() {
    if (touchStartX - touchEndX > 50) {
      showSlide(activeIndex + 1);
      restart();
    }
    if (touchEndX - touchStartX > 50) {
      showSlide(activeIndex - 1);
      restart();
    }
  }

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      showSlide(activeIndex - 1);
      restart();
    }
    if (event.key === "ArrowRight") {
      showSlide(activeIndex + 1);
      restart();
    }
  });

  renderDots();
  showSlide(0);
  restart();
}

// Interactive Wedding Invitation Flaps
function setupWeddingCurtain() {
  const curtain = document.getElementById("weddingCurtain");
  if (!curtain) return;

  let opened = false;

  function openCurtain() {
    if (opened) return;
    opened = true;
    curtain.classList.add("is-opened");

    // Completely remove/hide overlay after transitions complete
    setTimeout(() => {
      curtain.style.display = "none";
    }, 1500);
  }

  // Click on curtain area to open
  curtain.addEventListener("click", openCurtain);

  // Automated opening after a short delay
  setTimeout(openCurtain, 2800);
}

// Global initialization
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();
setupMenu();
setupScrollProgress();
setupScrollspy();
setupReveals();
setupParallax();
setupContactForm();
setupCarousel();
setupWeddingCurtain();

