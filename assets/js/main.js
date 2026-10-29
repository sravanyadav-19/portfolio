/* Sravan Yadav K — portfolio interactions */

(() => {
  "use strict";

  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  };

  ready(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const header = document.querySelector(".header");
    const scrollTopButton = document.querySelector(".scroll-top");
    const navmenu = document.querySelector(".navmenu");
    const mobileToggle = document.querySelector(".mobile-nav-toggle");
    const navLinks = [...document.querySelectorAll(".navmenu a[href^='#']")];

    /* Header, scroll-spy, and back-to-top */
    const updateActiveNavigation = () => {
      const probe = window.scrollY + Math.max(180, window.innerHeight * 0.3);
      let activeId = navLinks.length ? navLinks[0].getAttribute("href").slice(1) : "";

      navLinks.forEach((link) => {
        const section = document.querySelector(link.getAttribute("href"));
        if (section && probe >= section.offsetTop) activeId = section.id;
      });

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 20 && navLinks.length) {
        activeId = navLinks[navLinks.length - 1].getAttribute("href").slice(1);
      }

      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${activeId}`;
        link.classList.toggle("active", isActive);
        if (isActive) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    let scrollTicking = false;
    const updateScrollUI = () => {
      if (header) header.classList.toggle("scrolled", window.scrollY > 24);
      if (scrollTopButton) scrollTopButton.classList.toggle("visible", window.scrollY > 500);
      updateActiveNavigation();
      scrollTicking = false;
    };

    const requestScrollUpdate = () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(updateScrollUI);
        scrollTicking = true;
      }
    };

    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", requestScrollUpdate);
    updateScrollUI();

    /* Accessible mobile navigation */
    const setMenuState = (open, returnFocus = false) => {
      if (!navmenu || !mobileToggle) return;
      navmenu.classList.toggle("is-open", open);
      header?.classList.toggle("menu-open", open);
      document.body.classList.toggle("nav-open", open);
      mobileToggle.setAttribute("aria-expanded", String(open));
      mobileToggle.setAttribute("aria-label", open ? (mobileToggle.dataset.closeLabel || "Close navigation") : (mobileToggle.dataset.openLabel || "Open navigation"));
      const icon = mobileToggle.querySelector("i");
      icon?.classList.toggle("bi-list", !open);
      icon?.classList.toggle("bi-x", open);
      if (returnFocus) mobileToggle.focus();
    };

    mobileToggle?.addEventListener("click", () => {
      setMenuState(mobileToggle.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobileToggle?.getAttribute("aria-expanded") === "true") {
        setMenuState(false, true);
      }
    });

    document.addEventListener("click", (event) => {
      if (mobileToggle?.getAttribute("aria-expanded") === "true" && header && !header.contains(event.target)) {
        setMenuState(false);
      }
    });

    /* Smooth in-page navigation with a fixed-header offset supplied by CSS */
    document.querySelectorAll("a[href^='#']").forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const selector = anchor.getAttribute("href");
        if (!selector || selector === "#") return;
        const target = document.querySelector(selector);
        if (!target) return;

        event.preventDefault();
        setMenuState(false);
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });

        try {
          if (window.location.hash !== selector) history.pushState(null, "", selector);
        } catch (_) {
          // Hash updates are optional when previewing directly from a local file.
        }
      });
    });

    /* AOS scroll reveals — local, free DevFolio vendor library */
    if (window.AOS) {
      window.AOS.init({
        duration: 650,
        easing: "ease-out",
        once: true,
        offset: 55,
        disable: reduceMotion
      });
      window.addEventListener("load", () => window.AOS.refresh(), { once: true });
    }

    /* Typed.js hero rotation, with visible static fallbacks */
    const typedElement = document.querySelector(".typed");
    if (typedElement) {
      const phrases = (typedElement.dataset.typedItems || typedElement.textContent || "")
        .split(",")
        .map((phrase) => phrase.trim())
        .filter(Boolean);

      if (!phrases.length) {
        typedElement.textContent = "";
      } else if (reduceMotion || typeof window.Typed !== "function") {
        typedElement.textContent = phrases[0];
      } else {
        try {
          new window.Typed(typedElement, {
            strings: phrases,
            typeSpeed: 65,
            backSpeed: 35,
            backDelay: 1700,
            startDelay: 350,
            smartBackspace: true,
            loop: true,
            showCursor: true,
            cursorChar: "|"
          });
        } catch (_) {
          typedElement.textContent = phrases[0];
        }
      }
    }

    /* Skill bars fill only when their cards enter the viewport */
    const skillCards = [...document.querySelectorAll(".skill-card")];
    const fillSkillCard = (card) => {
      card.querySelectorAll(".progress-bar").forEach((bar) => {
        bar.style.width = bar.dataset.width || "0%";
      });
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      skillCards.forEach(fillSkillCard);
    } else {
      const skillObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            fillSkillCard(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.35, rootMargin: "0px 0px -30px" });
      skillCards.forEach((card) => skillObserver.observe(card));
    }

    /* Fast, dependency-free project filtering */
    const filterButtons = [...document.querySelectorAll(".filter-btn")];
    const projectItems = [...document.querySelectorAll(".portfolio-item")];
    const filterGroup = document.querySelector(".portfolio-filters");
    const filterStatus = document.querySelector(".filter-status");

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        let visibleCount = 0;

        filterButtons.forEach((item) => {
          const selected = item === button;
          item.classList.toggle("active", selected);
          item.setAttribute("aria-pressed", String(selected));
        });

        projectItems.forEach((item) => {
          const show = filter === "all" || item.dataset.category === filter;
          item.hidden = !show;
          item.classList.remove("filter-enter");

          if (show) {
            visibleCount += 1;
            if (!reduceMotion) {
              void item.offsetWidth;
              item.classList.add("filter-enter");
            }
          }
        });

        if (filterStatus && filterGroup?.dataset.statusTemplate) {
          const label = button.dataset.label || "selected";
          filterStatus.textContent = filterGroup.dataset.statusTemplate
            .replace(/\{count\}/g, String(visibleCount))
            .replace(/\{label\}/g, label)
            .replace(/\{s\}/g, visibleCount === 1 ? "" : "s");
        }

        window.AOS?.refresh();
        requestScrollUpdate();
      });
    });

    /* Static-host-friendly contact form: creates a real email draft */
    const contactForm = document.querySelector("#contact-form");
    contactForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      const recipient = contactForm.dataset.recipient || "";
      if (!recipient) return;

      const data = new FormData(contactForm);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const subject = String(data.get("subject") || "").trim();
      const message = String(data.get("message") || "").trim();
      const body = `${message}\n\nFrom: ${name}\nEmail: ${email}`;
      const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const status = contactForm.querySelector(".form-status");

      if (status) {
        status.textContent = (contactForm.dataset.successMessage || "").replace(/\{email\}/g, recipient);
        status.classList.add("visible");
      }
      window.location.href = mailto;
    });

    const year = document.querySelector("#current-year");
    if (year) year.textContent = new Date().getFullYear();
  });
})();
