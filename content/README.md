# Editing portfolio content

Edit **`content/portfolio.ts`**. The HTML and CSS do not need content changes.

## Build after editing

```bash
npm install       # first time only
npm run build     # regenerates assets/js/portfolio.js
```

During repeated edits, use `npm run watch:content` instead. Do not edit the generated `assets/js/portfolio.js` directly. The generated file is included so the site still works on ordinary static hosting and GitHub Pages.

## Add a project

Copy an object inside `projects.items`, then change its values:

```ts
{
  title: "My New Project",
  context: "Machine learning experiment",
  category: "AI/ML",
  description: "A short explanation of what the project does.",
  image: { src: "assets/img/projects/my-project.webp", alt: "My project preview" },
  technologies: [{ name: "Python", icon: "bi-filetype-py" }],
  links: [],
}
```

Use `links: [{ label: "View live", overlayLabel: "View live", href: "https://example.com", icon: "bi-arrow-up-right" }]` when a public link exists. Categories, filter buttons, counts, numbering, and project markup are generated automatically. Add `categoryId: "web"` only when you need a specific filter ID; otherwise it is derived from the category name.

## Change the profile photo

Place the image in `assets/img/`, then update `about.photo.src`, for example:

```ts
photo: { src: "assets/img/my-photo.webp", alt: "Sravan Yadav K" },
```

Project and hero images work the same way. Missing or broken image paths show a built-in fallback; non-hero images lazy-load by default.

## Hide or show a section

Set the section's `visible` field, then rebuild:

```ts
achievements: {
  visible: false,
  // ...existing content
}
```

Its page section and navigation link are both omitted.

## Reorder content

- Reorder objects inside `projects.items`, `skills.items`, `education.items`, or `achievements.items` to reorder those items.
- Reorder names in `sectionOrder` to reorder both the page sections and navigation.
- Keep at least one section visible so the Home link has a target.
