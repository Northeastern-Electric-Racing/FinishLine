# FinishLine Documentation Site

This directory contains the Docusaurus-based documentation site for FinishLine developers.

## Architecture

**Source of Truth:** `docs-site/docs/` contains all developer documentation in standard Docusaurus markdown format.

**Claude AI Integration:** Documentation files flagged with `skill: true` in their frontmatter are automatically synced to `.claude/skills/` for Claude AI to use as context when helping with development.

### Workflow

1. **Developers edit**: `docs-site/docs/` (tracked in Git)
2. **Run sync**: `yarn skills:sync` generates `.claude/skills/` (gitignored)
3. **Claude reads**: `.claude/skills/` to understand the codebase

This approach allows us to:

- Maintain comprehensive documentation for developers
- Selectively sync relevant docs to Claude's skills
- Have docs-only content (deployment, architecture) that Claude doesn't need

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
yarn start
```

The Docusaurus development server will start at `http://localhost:3002`.

The site will automatically reload when you edit files in `docs/`.

## Building for Production

To create a production build:

**From root:**

```bash
yarn docs:build
```

**Or from docs-site:**

```bash
cd docs-site
yarn build
```

The static site will be generated in the `build/` directory.

To test the production build locally:

```bash
yarn docs:serve
```

## Syncing Skills for Claude

After editing documentation that should be available to Claude:

```bash
yarn skills:sync
```

This command:

1. Scans all files in `docs/` for `skill: true` in frontmatter
2. Transforms them to Claude's SKILL.md format
3. Writes them to `.claude/skills/` (gitignored)

**When to sync:**

- After adding or editing documentation flagged as a skill
- Before using Claude for development (to ensure it has latest context)
- Can be automated in a pre-commit hook if desired

## Project Structure

```
docs-site/
├── docs/                   # Source of truth - developer documentation
│   ├── intro.md
│   └── general-practices/
│       ├── backend-endpoints.md
│       └── ...
├── scripts/
│   ├── sync-skills.js      # Generate .claude/skills/ from docs/
│   └── generate-sidebar.js # Auto-generate sidebars.js from docs/ structure
├── src/
│   ├── css/
│   │   └── custom.css      # Custom styling
│   └── pages/
│       └── index.js        # Homepage redirect
├── static/
│   └── img/                # Static assets (logos, favicon)
├── docusaurus.config.js    # Docusaurus configuration
├── sidebars.js             # Auto-generated sidebar (gitignored)
└── package.json            # Dependencies and scripts
```

## Adding New Documentation

### For All Documentation (Developers):

1. **Create a new markdown file** in `docs/`:

   ```bash
   docs/deployment/github-actions.md
   ```

2. **Add frontmatter:**

   ```yaml
   ---
   title: GitHub Actions Deployment
   description: Guide for deploying FinishLine using GitHub Actions
   skill: false # This is docs-only, not a Claude skill
   ---
   ```

3. **Test it:**
   ```bash
   yarn docs:dev
   ```

The sidebar will be automatically generated from the folder structure!

### For Documentation That Should Be a Claude Skill:

1. **Create the markdown file** as above

2. **Use `skill: true` in frontmatter:**

   ```yaml
   ---
   title: Backend Endpoints
   description: Guide for creating API endpoints
   skill: true
   skill_name: backend-endpoints # Maps to folder name in .claude/skills/
   ---
   ```

3. **Sync to Claude:**
   ```bash
   yarn skills:sync
   ```

The sidebar will be automatically generated!

### Organizing Documentation

The sidebar navigation is **automatically generated** from the `docs/` folder structure:

- **Reorder pages**: Rename files (alphabetical order is used)
- **Create categories**: Create nested folders in `docs/`
- **Change labels**: Folder names become category labels (use hyphens: `my-category`)

The sidebar regenerates automatically when you run `yarn docs:dev` or `yarn docs:build`.

You can also manually regenerate it:
```bash
yarn generate-sidebar
```

## Frontmatter Fields

All documentation files should have frontmatter:

| Field         | Required      | Purpose                        | Example                            |
| ------------- | ------------- | ------------------------------ | ---------------------------------- |
| `title`       | Yes           | Page title                     | `Backend Endpoints`                |
| `description` | Yes           | Page description               | `Guide for creating API endpoints` |
| `skill`       | Yes           | Should sync to Claude?         | `true` or `false`                  |
| `skill_name`  | If skill:true | Folder name in .claude/skills/ | `backend-endpoints`                |

## Customization

### Navbar and Footer

Edit `docusaurus.config.js` to customize:

- Site title and tagline
- Navbar links
- GitHub repository links
- Production URL

### Styling

Edit `src/css/custom.css` to customize:

- Primary colors (currently set to NER red: #ef4345)
- Dark mode colors
- Font sizes and spacing
- Custom component styles

### Sidebar Navigation

The sidebar is **automatically generated** from the `docs/` folder structure. To customize it:

- **Reorder pages**: Rename files (alphabetical sorting)
- **Create categories**: Create nested folders in `docs/`
- **Change labels**: Folder names become category labels (use hyphens: `my-category`)

The sidebar regenerates each time you run `yarn docs:dev` or `yarn docs:build`.

## Troubleshooting

### Documentation not updating

If your changes aren't appearing:

1. Stop the dev server (Ctrl+C)
2. Clear the cache: `yarn clear`
3. Run `yarn docs:dev` again

### Build errors

Common issues:

- **Node version**: Ensure you're running Node.js 18 or higher
- **Dependencies**: From the root directory, try `rm -rf docs-site/node_modules && yarn install`
- **Port conflict**: Docs run on port 3002. If it's in use, Docusaurus will try another port or you can stop the conflicting process

### Skills not syncing

If `yarn skills:sync` doesn't generate expected skills:

- Verify the doc has `skill: true` in frontmatter
- Verify `skill_name` is set for all docs with `skill: true`
- Check the console output for warnings
- Ensure `.claude/skills/` is gitignored (it will be regenerated)

## Future Enhancements

Potential improvements for future iterations:

- **Public deployment**: Deploy to GitHub Pages or Vercel
- **Search functionality**: Add DocSearch or local search plugin
- **Versioning**: Support documentation for multiple FinishLine versions
- **Interactive components**: Add live code examples or API explorers
- **Automated sync**: Pre-commit hook to run skills:sync automatically

## Contributing

When contributing to the documentation:

1. Edit markdown files in `docs-site/docs/`
2. Test your changes locally with `yarn docs:dev` (sidebar auto-generates)
3. If you edited a skill doc (`skill: true`), run `yarn skills:sync`
4. Ensure the site builds successfully with `yarn docs:build`
5. Submit a PR with your documentation changes

## License

This documentation is part of the FinishLine project, licensed under GNU AGPLv3.
