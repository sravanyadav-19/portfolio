/// <reference path="../content/portfolio.ts" />

// This file contains rendering logic only. Edit content/portfolio.ts to change content.
// The TypeScript compiler combines this file and the content into assets/js/portfolio.js.

(() => {
  "use strict";

  const data = portfolioContent;
  const currentYear = new Date().getFullYear();

  const sectionIds: Record<SectionName, string> = {
    hero: "hero",
    about: "about",
    education: "resume",
    skills: "skills",
    projects: "portfolio",
    achievements: "achievements",
    contact: "contact",
  };

  const visibleSections = data.sectionOrder.filter((name) => data[name].visible);

  const interpolate = (value: string): string => value
    .replace(/\{year\}/g, String(currentYear))
    .replace(/\{email\}/g, data.personal.email)
    .replace(/\{location\}/g, data.personal.location)
    .replace(/\{name\}/g, data.personal.fullName);

  const escapeHtml = (value: string | number): string => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[character] || character));

  const text = (value: string | number): string => escapeHtml(interpolate(String(value)));
  const slugify = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const padNumber = (value: number): string => String(value).padStart(2, "0");
  const externalAttributes = (href: string): string => /^https?:\/\//i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : "";
  const icon = (name: string): string => name ? `<i class="bi ${escapeHtml(name)}" aria-hidden="true"></i>` : "";

  const getMount = (id: string): HTMLElement => {
    const mount = document.getElementById(id);
    if (!mount) throw new Error(`Required mount point #${id} was not found.`);
    return mount;
  };

  const createFallbackImage = (label: string): string => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750"><rect width="1200" height="750" fill="#ebe8df"/><path d="M0 120h1200M0 630h1200M90 0v750M1110 0v750" stroke="#12243b" stroke-opacity=".12"/><rect x="475" y="235" width="250" height="190" fill="none" stroke="#2f61d5" stroke-width="4"/><circle cx="555" cy="305" r="28" fill="#2f61d5" fill-opacity=".45"/><path d="M495 390l75-65 55 45 45-35 35 55" fill="none" stroke="#2f61d5" stroke-width="4"/><text x="600" y="505" text-anchor="middle" font-family="monospace" font-size="25" fill="#475b70">${escapeHtml(label)}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const fallbackImage = createFallbackImage(data.ui.imageFallbackText);

  interface ImageOptions {
    defaultAlt: string;
    className?: string;
    width: number;
    height: number;
    eager?: boolean;
  }

  const renderImage = (image: PortfolioImage, options: ImageOptions): string => {
    const source = image.src.trim() || fallbackImage;
    const alternative = image.alt === undefined ? options.defaultAlt : image.alt;
    const classAttribute = options.className ? ` class="${escapeHtml(options.className)}"` : "";
    const loading = options.eager ? "eager" : "lazy";
    const priority = options.eager ? ' fetchpriority="high"' : "";
    return `<img src="${escapeHtml(source)}" alt="${escapeHtml(alternative)}"${classAttribute} width="${options.width}" height="${options.height}" loading="${loading}" decoding="async"${priority} data-content-image>`;
  };

  const installImageFallbacks = (): void => {
    document.querySelectorAll<HTMLImageElement>("img[data-content-image]").forEach((image) => {
      const useFallback = () => {
        if (image.dataset.fallbackApplied === "true") return;
        image.dataset.fallbackApplied = "true";
        image.src = fallbackImage;
      };
      image.addEventListener("error", useFallback);
      if (image.complete && image.naturalWidth === 0) useFallback();
    });
  };

  const renderSocialLinks = (style: "icons" | "text"): string => data.socialLinks.map((link) => {
    const href = interpolate(link.href);
    if (style === "icons") {
      return `<a href="${escapeHtml(href)}"${externalAttributes(href)} aria-label="${text(link.label)}">${icon(link.icon)}</a>`;
    }
    return `<a href="${escapeHtml(href)}"${externalAttributes(href)}>${text(link.label)} ↗</a>`;
  }).join("");

  const getSectionNumber = (name: SectionName): string => {
    const numberedSections: SectionName[] = visibleSections.filter((section) => section !== "hero");
    return padNumber(numberedSections.indexOf(name) + 1);
  };

  const renderSectionHeading = (section: SectionBase, name: SectionName, titleId: string): string => `
    <div class="section-heading" data-aos="fade-up">
      <p class="section-eyebrow">${getSectionNumber(name)} / ${text(section.eyebrow)}</p>
      <h2 id="${titleId}">${text(section.title)}${section.titleAccent ? `<span>${text(section.titleAccent)}</span>` : ""}</h2>
      <p>${text(section.description)}</p>
    </div>`;

  const renderHeader = (): string => {
    const navigation = visibleSections.map((name, index) => {
      const href = `#${sectionIds[name]}`;
      const active = index === 0 ? ' class="active" aria-current="location"' : "";
      return `<li><a href="${href}"${active}>${text(data[name].navigationLabel)}</a></li>`;
    }).join("");

    return `
      <a class="skip-link" href="#main-content">${text(data.ui.skipToContent)}</a>
      <header id="header" class="header">
        <div class="container header-inner">
          <a href="#${sectionIds[visibleSections[0]]}" class="logo" aria-label="${text(data.ui.homeAriaLabel)}">
            <span class="logo-mark">${text(data.personal.initials)}</span>
            <span class="logo-text">${text(data.personal.shortName)}<span>.</span></span>
          </a>
          <button class="mobile-nav-toggle" type="button" aria-label="${text(data.ui.openNavigationLabel)}" aria-controls="navmenu" aria-expanded="false" data-open-label="${text(data.ui.openNavigationLabel)}" data-close-label="${text(data.ui.closeNavigationLabel)}">${icon("bi-list")}</button>
          <nav id="navmenu" class="navmenu" aria-label="${text(data.ui.navigationAriaLabel)}"><ul>${navigation}</ul></nav>
        </div>
      </header>`;
  };

  const renderHero = (): string => {
    const hero = data.hero;
    const heroIndex = visibleSections.indexOf("hero");
    const nextSection = visibleSections[heroIndex + 1];
    const scrollTarget = nextSection ? `#${sectionIds[nextSection]}` : "#main-content";
    const phrases = hero.typedPhrases.join(", ");
    const firstPhrase = hero.typedPhrases[0] || "";
    const meta = hero.metaItems.map((item) => `<span>${text(item)}</span>`).join("");

    return `
      <section id="hero" class="hero" aria-labelledby="hero-title">
        ${renderImage(hero.background, { defaultAlt: "", className: "hero-bg-img", width: 1672, height: 941, eager: true })}
        <div class="hero-overlay" aria-hidden="true"></div>
        <div class="container hero-container">
          <div class="hero-content">
            <p class="hero-kicker"><span></span> ${text(hero.greeting)}</p>
            <h1 id="hero-title">${text(data.personal.fullName)}</h1>
            <p class="hero-subtitle">${text(hero.typedPrefix)} <span class="typed" data-typed-items="${escapeHtml(phrases)}">${text(firstPhrase)}</span></p>
            <p class="hero-intro">${text(hero.intro)}</p>
            <div class="hero-buttons">
              <a href="${escapeHtml(hero.primaryAction.href)}" class="btn btn-primary">${text(hero.primaryAction.label)} ${hero.primaryAction.icon ? icon(hero.primaryAction.icon) : ""}</a>
              <a href="${escapeHtml(hero.secondaryAction.href)}" class="btn btn-outline">${text(hero.secondaryAction.label)} ${hero.secondaryAction.icon ? icon(hero.secondaryAction.icon) : ""}</a>
            </div>
            <div class="hero-socials" aria-label="${text(data.ui.socialLinksAriaLabel)}">${renderSocialLinks("icons")}</div>
          </div>
        </div>
        <div class="hero-meta" aria-hidden="true">${meta}</div>
        <a href="${scrollTarget}" class="hero-scroll" aria-label="${text(hero.scrollAriaLabel)}"><span>${text(hero.scrollLabel)}</span>${icon("bi-arrow-down")}</a>
      </section>`;
  };

  const renderAbout = (): string => {
    const about = data.about;
    const paragraphs = about.paragraphs.map((paragraph) => `<p>${text(paragraph)}</p>`).join("");
    const focusAreas = about.focusAreas.map((area) => `<span class="focus-tag">${icon(area.icon)} ${text(area.name)}</span>`).join("");
    const facts = about.facts.map((fact, index) => {
      const value = fact.href
        ? `<a href="${escapeHtml(interpolate(fact.href))}"${externalAttributes(interpolate(fact.href))}>${text(fact.value)}</a>`
        : `<strong>${text(fact.value)}</strong>`;
      const wideClass = index === about.facts.length - 1 ? " fact-wide" : "";
      return `<div class="fact${wideClass}"><span>${text(fact.label)}</span>${value}</div>`;
    }).join("");

    return `
      <section id="about" class="about section" aria-labelledby="about-title">
        <div class="container">
          ${renderSectionHeading(about, "about", "about-title")}
          <div class="row align-items-center gy-5">
            <div class="col-lg-5" data-aos="fade-up">
              <div class="about-visual">
                <div class="about-image-wrap">${renderImage(about.photo, { defaultAlt: data.personal.fullName, width: 1269, height: 1240 })}</div>
                <div class="about-badge">${icon(about.badge.icon)}<div><strong>${text(about.badge.title)}</strong><span>${text(about.badge.subtitle)}</span></div></div>
                <span class="photo-note" aria-hidden="true">${text(about.photoNote)}</span>
              </div>
            </div>
            <div class="col-lg-7" data-aos="fade-up" data-aos-delay="100">
              <div class="about-content">
                <p class="about-overline">${text(about.overline)}</p>
                <h3>${text(about.heading)}</h3>
                ${paragraphs}
                <div class="focus-tags" aria-label="${text(data.ui.focusAreasAriaLabel)}">${focusAreas}</div>
                <div class="about-facts">${facts}</div>
              </div>
            </div>
          </div>
        </div>
      </section>`;
  };

  const renderEducation = (): string => {
    const education = data.education;
    const items = education.items.map((item, index) => `
      <article class="education-item" data-aos="fade-up"${index ? ` data-aos-delay="${index * 80}"` : ""}>
        <div class="timeline-marker">[${padNumber(index + 1)}]</div>
        <div class="education-card">
          <div class="education-meta"><span>${text(item.period)}</span>${item.status ? `<span class="status-badge">${text(item.status)}</span>` : ""}</div>
          <h3>${text(item.title)}${item.subtitle ? ` <small>${text(item.subtitle)}</small>` : ""}</h3>
          <p>${text(item.institution)}</p>
        </div>
      </article>`).join("");

    return `
      <section id="resume" class="education section section-alt" aria-labelledby="education-title">
        <div class="container">${renderSectionHeading(education, "education", "education-title")}<div class="education-timeline">${items}</div></div>
      </section>`;
  };

  const renderSkills = (): string => {
    const skills = data.skills;
    const items = skills.items.map((skill, index) => {
      const level = Math.max(0, Math.min(100, Math.round(skill.level)));
      return `
        <article class="skill-card" data-aos="fade-up"${index ? ` data-aos-delay="${index * 60}"` : ""}>
          <div class="skill-info"><span>${icon(skill.icon)} ${text(skill.name)}</span><strong>${level}%</strong></div>
          <div class="progress" role="progressbar" aria-label="${text(skill.name)}" aria-valuenow="${level}" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar" data-width="${level}%"></div></div>
        </article>`;
    }).join("");

    const groups = skills.toolkitGroups.map((group) => `
      <div class="toolkit-group"><h3>${text(group.title)}</h3><div class="tags">${group.tools.map((tool) => `<span>${text(tool)}</span>`).join("")}</div></div>`).join("");

    return `
      <section id="skills" class="skills section" aria-labelledby="skills-title">
        <div class="container">${renderSectionHeading(skills, "skills", "skills-title")}<div class="skills-grid">${items}</div><div class="toolkit-panel" data-aos="fade-up">${groups}</div></div>
      </section>`;
  };

  const renderProjectLink = (link: LinkData, overlay = false): string => {
    const href = interpolate(link.href);
    const label = overlay ? (link.overlayLabel || link.label) : link.label;
    return `<a ${overlay ? "" : 'class="project-link" '}href="${escapeHtml(href)}"${externalAttributes(href)}>${text(label)} ${link.icon ? icon(link.icon) : ""}</a>`;
  };

  const renderProjects = (): string => {
    const projects = data.projects;
    const categories = projects.items.map((project) => project.category).filter((category, index, all) => all.indexOf(category) === index);
    const categoryFilter = (category: string): string => projects.items.find((project) => project.category === category && project.categoryId)?.categoryId || slugify(category);
    const allCount = padNumber(projects.items.length);
    const filters = [
      `<button class="filter-btn active" type="button" data-filter="all" data-label="${text(projects.allFilterLabel)}" aria-pressed="true">[ ${text(projects.allFilterLabel)} <span>${allCount}</span> ]</button>`,
      ...categories.map((category) => {
        const count = padNumber(projects.items.filter((project) => project.category === category).length);
        return `<button class="filter-btn" type="button" data-filter="${escapeHtml(categoryFilter(category))}" data-label="${text(category)}" aria-pressed="false">[ ${text(category)} <span>${count}</span> ]</button>`;
      }),
    ].join("");

    const items = projects.items.map((project, index) => {
      const featured = project.featured ? " portfolio-item-featured" : "";
      const horizontal = project.featured ? " project-card-horizontal" : "";
      const delay = index > 0 && index % 2 === 0 ? ' data-aos-delay="80"' : "";
      const firstLink = project.links[0];
      const overlay = firstLink
        ? renderProjectLink(firstLink, true)
        : `<span>${text(project.overlayLabel || project.status?.text || "")}</span>`;
      const technologies = project.technologies.map((technology) => `<span>${icon(technology.icon)} ${text(technology.name)}</span>`).join("");
      const links = project.links.length
        ? `<div class="project-links">${project.links.map((link) => renderProjectLink(link)).join("")}</div>`
        : (project.status ? `<span class="project-status">${icon(project.status.icon)} ${text(project.status.text)}</span>` : "");

      return `
        <div class="portfolio-item${featured}" data-category="${escapeHtml(categoryFilter(project.category))}">
          <article class="project-card${horizontal}" data-aos="fade-up"${delay}>
            <div class="project-visual">
              ${renderImage(project.image, { defaultAlt: `${project.title} preview`, width: 1440, height: 900 })}
              <span class="project-number">${padNumber(index + 1)}</span><span class="project-category">${text(project.category)}</span>
              <div class="project-overlay">${overlay}</div>
            </div>
            <div class="project-content">
              <p class="project-context">${text(project.context)}</p><h3>${text(project.title)}</h3><p>${text(project.description)}</p>
              <div class="tech-stack">${technologies}</div>${links}
            </div>
          </article>
        </div>`;
    }).join("");

    return `
      <section id="portfolio" class="portfolio section section-alt" aria-labelledby="projects-title">
        <div class="container">
          ${renderSectionHeading(projects, "projects", "projects-title")}
          <div class="portfolio-filters" role="group" aria-label="${text(data.ui.projectFiltersAriaLabel)}" data-aos="fade-up" data-status-template="${text(projects.filterStatusTemplate)}">${filters}</div>
          <div class="project-grid">${items}</div><p class="filter-status" role="status" aria-live="polite"></p>
        </div>
      </section>`;
  };

  const renderAchievements = (): string => {
    const achievements = data.achievements;
    const highlightClasses: Record<AchievementHighlight, string> = {
      winner: "winner",
      topTen: "top-ten",
      topFive: "top-five",
      none: "",
    };
    const items = achievements.items.map((item, index) => {
      const highlight = highlightClasses[item.highlight];
      const delay = index % 2 ? ' data-aos-delay="60"' : "";
      return `
        <article class="achievement-card${highlight ? ` ${highlight}` : ""}" data-aos="fade-up"${delay}>
          <div class="achievement-top"><div class="badge-icon">${icon(item.icon)}</div><span class="outcome">${text(item.outcome)}</span></div>
          <h3>${text(item.title)}</h3><p>${text(item.description)}</p><span class="achievement-foot">${text(item.footnote)}</span>
        </article>`;
    }).join("");

    return `
      <section id="achievements" class="achievements section" aria-labelledby="achievements-title">
        <div class="container">${renderSectionHeading(achievements, "achievements", "achievements-title")}<div class="achievement-grid">${items}</div></div>
      </section>`;
  };

  const renderContact = (): string => {
    const contact = data.contact;
    const form = contact.form;
    const heading = contact.headingLines.map((line) => `${text(line.text)}${line.accent ? `<span>${text(line.accent)}</span>` : ""}`).join("<br>");

    return `
      <section id="contact" class="contact section section-alt" aria-labelledby="contact-title">
        <div class="container">
          <div class="contact-panel" data-aos="fade-up">
            <div class="contact-copy">
              <p class="section-eyebrow">${getSectionNumber("contact")} / ${text(contact.eyebrow)}</p><h2 id="contact-title">${heading}</h2><p>${text(contact.description)}</p>
              <a class="contact-email" href="mailto:${escapeHtml(data.personal.email)}">${icon("bi-envelope")} ${text(data.personal.email)}</a>
              <p class="contact-location">${icon("bi-geo-alt")} ${text(data.personal.location)}</p>
              <div class="contact-socials" aria-label="${text(data.ui.socialLinksAriaLabel)}">${renderSocialLinks("text")}</div>
            </div>
            <form id="contact-form" class="contact-form" data-recipient="${text(data.personal.email)}" data-success-message="${text(form.successMessage)}">
              <div class="form-row">
                <div class="form-field"><label for="contact-name">${text(form.nameLabel)}</label><input id="contact-name" name="name" type="text" autocomplete="name" placeholder="${text(form.namePlaceholder)}" required></div>
                <div class="form-field"><label for="contact-email">${text(form.emailLabel)}</label><input id="contact-email" name="email" type="email" autocomplete="email" placeholder="${text(form.emailPlaceholder)}" required></div>
              </div>
              <div class="form-field"><label for="contact-subject">${text(form.subjectLabel)}</label><input id="contact-subject" name="subject" type="text" placeholder="${text(form.subjectPlaceholder)}" required></div>
              <div class="form-field"><label for="contact-message">${text(form.messageLabel)}</label><textarea id="contact-message" name="message" rows="5" placeholder="${text(form.messagePlaceholder)}" required></textarea></div>
              <button type="submit" class="btn btn-primary">${text(form.submitLabel)} ${icon(form.submitIcon)}</button>
              <p class="form-note">${text(form.note)}</p><p class="form-status" role="status" aria-live="polite"></p>
            </form>
          </div>
        </div>
      </section>`;
  };

  const renderFooter = (): string => `
    <footer class="footer">
      <div class="container footer-inner">
        <a href="#${sectionIds[visibleSections[0]]}" class="logo" aria-label="${text(data.ui.backToTopAriaLabel)}"><span class="logo-mark">${text(data.personal.initials)}</span><span class="logo-text">${text(data.personal.shortName)}<span>.</span></span></a>
        <p>© <span id="current-year">${currentYear}</span> ${text(data.footer.copyright)}</p>
        <a href="#${sectionIds[visibleSections[0]]}" class="footer-top">[ ${text(data.footer.backToTopLabel)} ]</a>
      </div>
      <div class="footer-wordmark" aria-hidden="true">${text(data.footer.wordmark)}</div>
    </footer>`;

  const renderUtilityLinks = (): string => `<a href="#${sectionIds[visibleSections[0]]}" class="scroll-top" aria-label="${text(data.ui.backToTopAriaLabel)}">${icon("bi-arrow-up")}</a>`;

  const sectionRenderers: Record<SectionName, () => string> = {
    hero: renderHero,
    about: renderAbout,
    education: renderEducation,
    skills: renderSkills,
    projects: renderProjects,
    achievements: renderAchievements,
    contact: renderContact,
  };

  const render = (): void => {
    document.title = data.personal.siteTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", data.personal.metaDescription);
    getMount("header-mount").innerHTML = renderHeader();
    getMount("main-content").innerHTML = visibleSections.map((name) => sectionRenderers[name]()).join("");
    getMount("footer-mount").innerHTML = renderFooter();
    getMount("utility-mount").innerHTML = renderUtilityLinks();
    installImageFallbacks();
  };

  render();
})();
