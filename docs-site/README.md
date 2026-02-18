# FinishLine Documentation Site

This directory contains the Docusaurus-based documentation site for FinishLine developers.

## Why Docusaurus?

We chose Docusaurus over alternatives like VitePress for these reasons:

- **Stack alignment**: Our main app uses React 19; Docusaurus is React-based, so the team already knows the framework
- **Long-term support**: Meta-backed with strong institutional support and proven longevity
- **Growth potential**: Handles versioning, plugins, and complex documentation needs as the project grows
- **Industry standard**: Used by React, Jest, Redux, and many other major projects - proven at scale
- **Extensibility**: Can embed custom React components for interactive examples in the future

## How It Works

The documentation site is built from the SKILL.md files in `.claude/skills/`. A build script automatically:

1. Copies SKILL.md files from `.claude/skills/` to the `docs/` folder
2. Transforms YAML frontmatter to Docusaurus-compatible format
3. Generates the documentation structure matching the skills folder hierarchy

This maintains a **single source of truth** - the SKILL.md files serve both Claude AI (for development assistance) and human developers (via this documentation site).

## Prerequisites

- Node.js 18 or higher
- Yarn package manager (this project uses Yarn workspaces)

## Setup

The docs-site is part of the FinishLine monorepo workspace. Dependencies are managed from the root:

```bash
# From the FinishLine root directory
yarn install
```

This will install all dependencies for docs-site along with the rest of the project.

## Development

### Running the documentation site locally:

**From the root directory:**
```bash
yarn docs:dev
```

**Or from within docs-site:**
```bash
cd docs-site
yarn docs:dev
```

This command:

1. Runs the `prepare-docs` script to transform SKILL.md files
2. Starts the Docusaurus development server at `http://localhost:3002`

The site will automatically reload when you edit SKILL.md files or re-run the prepare script.

### Manual build steps:

If you want to run the steps separately:

```bash
# Transform SKILL.md files to docs folder
yarn prepare-docs

# Start development server only
yarn start
```

## Building for Production

To create a production build:

**From root:**
```bash
yarn docs:build
```

**Or from docs-site:**
```bash
cd docs-site
yarn docs:build
```

The static site will be generated in the `build/` directory.

To test the production build locally:

```bash
yarn docs:serve
```

## Project Structure

```
docs-site/
├── docs/                   # Generated documentation (gitignored)
├── scripts/
│   └── prepare-docs.js     # Script to transform SKILL.md files and generate sidebar
├── src/
│   └── css/
│       └── custom.css      # Custom styling
├── static/
│   └── img/                # Static assets (logos, images)
├── docusaurus.config.js    # Docusaurus configuration
├── sidebars.js             # Auto-generated sidebar (gitignored)
└── package.json            # Dependencies and scripts
```

## Adding New Documentation

To add new documentation:

1. **Create a SKILL.md file** in the appropriate location under `.claude/skills/`
2. **Use the standard YAML frontmatter format:**
   ```yaml
   ---
   name: my-new-skill
   description: >-
     Brief description of what this documentation covers.
   ---
   ```
3. **Re-run the documentation site:**
   ```bash
   yarn docs:dev
   ```

The new documentation will automatically appear in the site and sidebar! The sidebar structure is automatically generated from your folder hierarchy.

### Organizing Documentation

The sidebar navigation is **automatically generated** from the folder structure in `.claude/skills/`:

- Folders become categories in the sidebar
- Folder names are converted to human-readable labels (e.g., `backend-endpoints` → "Backend Endpoints")
- The hierarchy in `.claude/skills/` is preserved in the sidebar

**No need to manually edit sidebars.js** - it's auto-generated each time you run `yarn docs:prepare`!

## Customization

### Navbar and Footer

Edit `docusaurus.config.js` to customize:

- Site title and tagline
- Navbar links
- Footer content
- GitHub repository links

### Styling

Edit `src/css/custom.css` to customize:

- Primary colors (currently set to NER red: #ef4345)
- Dark mode colors
- Font sizes and spacing
- Custom component styles

### Sidebar Navigation

The sidebar is **automatically generated** from the `.claude/skills/` folder structure. To customize it:

- **Reorder pages**: Rename folders/files (alphabetical order is used)
- **Create categories**: Create nested folders in `.claude/skills/`
- **Change labels**: Folder names become category labels (use hyphens: `my-category`)

The sidebar regenerates each time you run `yarn docs:prepare`.

## Troubleshooting

### Documentation not updating

If your changes to SKILL.md files aren't appearing:

1. Stop the dev server (Ctrl+C)
2. Delete the generated `docs/` folder
3. Run `yarn docs:dev` again

### Missing images or assets

Ensure logo and favicon files exist in `static/img/`:

- Copy from `src/frontend/public/NERfavicon.ico`
- Create or copy a logo.svg file

### Build errors

Common issues:

- **Node version**: Ensure you're running Node.js 18 or higher
- **Dependencies**: From the root directory, try `rm -rf docs-site/node_modules && yarn install`
- **Port conflict**: Docs run on port 3002. If it's in use, Docusaurus will try another port or you can stop the conflicting process

## Future Enhancements

Potential improvements for future iterations:

- **Public deployment**: Deploy to GitHub Pages or Vercel (requires leadership approval)
- **Search functionality**: Add DocSearch or local search plugin
- **Versioning**: Support documentation for multiple FinishLine versions
- **Interactive components**: Add live code examples or API explorers
- **Custom theme**: Match the main FinishLine application design
- **Automated sidebar generation**: Generate `sidebars.js` from folder structure

## Contributing

When contributing to the documentation:

1. Edit SKILL.md files in `.claude/skills/`, not the generated `docs/` folder
2. Test your changes locally with `yarn docs:dev` (from root or docs-site)
3. Ensure the site builds successfully with `yarn docs:build`
4. Submit a PR with your SKILL.md changes

The documentation site will be regenerated automatically from the updated SKILL.md files.

## License

This documentation is part of the FinishLine project, licensed under GNU AGPLv3.
