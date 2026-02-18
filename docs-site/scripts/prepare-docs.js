const fs = require('fs');
const path = require('path');

// Paths
const SKILLS_DIR = path.join(__dirname, '../../.claude/skills');
const DOCS_DIR = path.join(__dirname, '../docs');

/**
 * Recursively find all SKILL.md files in a directory
 */
function findSkillFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findSkillFiles(filePath, fileList);
    } else if (file === 'SKILL.md') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Transform internal SKILL.md links to Docusaurus-compatible paths
 * 
 * Handles two cases:
 * 1. Same category: ../sibling/SKILL.md → ./sibling (one level up, then into sibling)
 * 2. Different category: ../../other-category/doc/SKILL.md → ../other-category/doc (two levels up)
 * 
 * After flattening from folder/file/SKILL.md to folder/file.md:
 * - Same category siblings are now in the same directory (../ → ./)
 * - Cross-category links lose one ../ but keep the category path (../../cat/doc → ../cat/doc)
 */
function transformInternalLinks(content) {
  // Transform ../../category/doc/SKILL.md to ../category/doc (cross-category)
  content = content.replace(/\[([^\]]+)\]\(\.\.\/\.\.\/([^/]+\/[^/]+)\/SKILL\.md\)/g, '[$1](../$2)');
  
  // Transform ../folder/SKILL.md to ./folder (same category after flattening)
  content = content.replace(/\[([^\]]+)\]\(\.\.\/([^/]+)\/SKILL\.md\)/g, '[$1](./$2)');
  
  // Transform ./folder/SKILL.md to ./folder
  content = content.replace(/\[([^\]]+)\]\(\.\/([^/]+)\/SKILL\.md\)/g, '[$1](./$2)');
  
  // Transform folder/SKILL.md to ./folder (explicit same directory)
  content = content.replace(/\[([^\]]+)\]\(([^./][^/]*)\/SKILL\.md\)/g, '[$1](./$2)');
  
  return content;
}

/**
 * Transform YAML frontmatter from Claude format to Docusaurus format
 */
function transformFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return content;
  }

  const yamlContent = match[1];
  const restOfContent = content.slice(match[0].length);

  // Parse the YAML manually (simple key-value pairs)
  const lines = yamlContent.split('\n');
  const metadata = {};

  let currentKey = null;
  let currentValue = '';

  lines.forEach((line) => {
    const keyMatch = line.match(/^(\w+):\s*(.*)$/);
    if (keyMatch) {
      if (currentKey) {
        metadata[currentKey] = currentValue.trim();
      }
      currentKey = keyMatch[1];
      currentValue = keyMatch[2];
    } else if (currentKey && line.trim()) {
      currentValue += ' ' + line.trim();
    }
  });

  if (currentKey) {
    metadata[currentKey] = currentValue.trim();
  }

  // Transform to Docusaurus format
  const title = metadata.name
    ? metadata.name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : 'Documentation';

  const description = metadata.description
    ? metadata.description.replace(/\s+/g, ' ').trim()
    : '';

  const newFrontmatter = `---
title: ${title}
description: ${description}
---`;

  return newFrontmatter + restOfContent;
}

/**
 * Process a single SKILL.md file
 */
function processSkillFile(skillPath) {
  const content = fs.readFileSync(skillPath, 'utf-8');
  let transformedContent = transformFrontmatter(content);
  transformedContent = transformInternalLinks(transformedContent);

  // Determine the relative path from SKILLS_DIR
  const relativePath = path.relative(SKILLS_DIR, path.dirname(skillPath));

  // Get the parent directory (where the file should be placed)
  const pathParts = relativePath.split(path.sep);
  const fileName = pathParts.pop() + '.md'; // Last part becomes filename
  const destDir = pathParts.length > 0 ? path.join(DOCS_DIR, ...pathParts) : DOCS_DIR;

  // Create the destination directory if needed
  if (pathParts.length > 0) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Write directly to parent folder
  const destPath = path.join(destDir, fileName);
  fs.writeFileSync(destPath, transformedContent);

  const outputPath = pathParts.length > 0 ? path.join(...pathParts, fileName) : fileName;
  console.log(`✓ Processed: ${relativePath}/SKILL.md → ${outputPath}`);
}

/**
 * Create an intro page for the docs
 */
function createIntroPage() {
  const introContent = `---
title: Introduction
description: Welcome to the FinishLine developer documentation
---

# FinishLine Developer Documentation

Welcome to the FinishLine developer documentation! This site contains comprehensive guides for developing and maintaining the FinishLine project management platform.

## What is FinishLine?

FinishLine is a full-stack ERP and project management application built for **Northeastern Electric Racing (NER)**, a student engineering organization at Northeastern University that designs, builds, and races electric vehicles.

## Documentation Structure

The documentation is organized by topic in the sidebar. Browse the categories to find guides on:

- Setting up your development environment
- Backend architecture and patterns
- API development and testing
- Database queries and data transformations
- And more!

## Getting Started

If you're new to the project, we recommend starting with:

1. [Repository Overview](general-practices/repository-overview) - Understand the overall architecture and set up your development environment
2. [Backend Endpoints](general-practices/backend-endpoints) - Learn the backend patterns and API structure
3. [Postman API Testing](general-practices/postman-api-testing) - Learn how to test APIs with Postman

## Contributing

This documentation is automatically generated from SKILL.md files located in \`.claude/skills/\`. To contribute:

1. Edit the relevant SKILL.md file in the main repository
2. Run \`yarn docs:dev\` to see your changes
3. Submit a pull request with your SKILL.md changes

The documentation and sidebar will be regenerated automatically!

## Need Help?

- Check the [GitHub repository](https://github.com/Northeastern-Electric-Racing/FinishLine)
- Reach out to the development team on Slack
`;

  const introPath = path.join(DOCS_DIR, 'intro.md');
  fs.writeFileSync(introPath, introContent);
  console.log('✓ Created intro page');
}

/**
 * Recursively build sidebar structure from docs directory
 */
function buildSidebarStructure(dir, basePath = '') {
  const items = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  // Separate files and directories
  const files = entries.filter((e) => e.isFile() && e.name.endsWith('.md') && e.name !== 'intro.md');
  const directories = entries.filter((e) => e.isDirectory());

  // Process directories (categories)
  directories.forEach((dirEntry) => {
    const dirPath = path.join(dir, dirEntry.name);
    const categoryItems = buildSidebarStructure(dirPath, path.join(basePath, dirEntry.name));

    if (categoryItems.length > 0) {
      // Convert directory name to human-readable label
      const label = dirEntry.name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      items.push({
        type: 'category',
        label: label,
        items: categoryItems,
      });
    }
  });

  // Process files in current directory
  files.forEach((file) => {
    const docId = path.join(basePath, file.name.replace('.md', '')).replace(/\\/g, '/');
    items.push(docId);
  });

  return items;
}

/**
 * Generate sidebars.js file automatically
 */
function generateSidebars() {
  const sidebarItems = buildSidebarStructure(DOCS_DIR);

  const sidebarsContent = `/**
 * Auto-generated sidebar configuration.
 * 
 * This file is automatically generated by scripts/prepare-docs.js
 * Do not edit manually - your changes will be overwritten!
 * 
 * To modify the sidebar structure, edit the folder structure in .claude/skills/
 * and re-run: yarn docs:prepare
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },
${sidebarItems.map((item) => '    ' + JSON.stringify(item, null, 2).split('\n').join('\n    ')).join(',\n')},
  ],
};

export default sidebars;
`;

  const sidebarsPath = path.join(__dirname, '../sidebars.js');
  fs.writeFileSync(sidebarsPath, sidebarsContent);
  console.log('✓ Generated sidebars.js');
}

/**
 * Main function
 */
function main() {
  try {
    console.log('🚀 Preparing documentation...\n');

    // Check if SKILLS_DIR exists
    if (!fs.existsSync(SKILLS_DIR)) {
      console.error(`❌ Error: Skills directory not found at ${SKILLS_DIR}`);
      process.exit(1);
    }

    // Clean the docs directory
    if (fs.existsSync(DOCS_DIR)) {
      fs.rmSync(DOCS_DIR, { recursive: true });
      console.log('✓ Cleaned docs directory');
    }

    // Create docs directory
    fs.mkdirSync(DOCS_DIR, { recursive: true });

    // Create intro page
    createIntroPage();

    // Find and process all SKILL.md files
    const skillFiles = findSkillFiles(SKILLS_DIR);
    
    if (skillFiles.length === 0) {
      console.warn('⚠️  Warning: No SKILL.md files found in .claude/skills/');
    } else {
      console.log(`\nFound ${skillFiles.length} SKILL.md files\n`);
    }

    skillFiles.forEach(processSkillFile);

    // Generate sidebar automatically
    generateSidebars();

    console.log('\n✅ Documentation preparation complete!\n');
  } catch (error) {
    console.error('\n❌ Error preparing documentation:');
    console.error(error.message);
    process.exit(1);
  }
}

main();
