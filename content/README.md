# Editing portfolio content

Edit **`content/portfolio.ts`**. The HTML and CSS do not need content changes.

## Build after editing

```bash
npm install       # first time only
npm run build     # regenerates assets/js/portfolio.js
```

During repeated edits, use `npm run watch:content` instead. Do not edit the generated `assets/js/portfolio.js` directly. The generated file is included so the site still works on ordinary static hosting and GitHub Pages.

## Automatic GitHub updates

The included `.github/workflows/portfolio-build.yml` workflow runs the build after you push changes to `content/portfolio.ts` or the renderer. It commits the regenerated bundle and cache version automatically, so new projects and milestones appear without a manual rebuild. In repository settings, ensure **Actions → General → Workflow permissions → Read and write permissions** is enabled.

## Add a milestone

Copy an object inside `achievements.items` and edit its text, icon, and highlight. Its grid position and `01`, `02`, `03`… numbering are generated from the array order. You can write `footnote: "Team of four"` without adding a number yourself.

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
