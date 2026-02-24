const fs = require('fs');
const path = require('path');

// Paths
const DOCS_DIR = path.join(__dirname, '../docs');
const SKILLS_DIR = path.join(__dirname, '../../.claude/skills');

/**
 * Recursively find all markdown files
 */
function findMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Parse frontmatter from markdown
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { metadata: {}, content };
  }

  const yamlContent = match[1];
  const restOfContent = content.slice(match[0].length);

  // Parse YAML
  const lines = yamlContent.split('\n');
  const metadata = {};

  lines.forEach((line) => {
    const keyMatch = line.match(/^(\w+):\s*(.*)$/);
    if (keyMatch) {
      const key = keyMatch[1];
      let value = keyMatch[2].trim();
      
      // Handle booleans
      if (value === 'true') value = true;
      if (value === 'false') value = false;
      
      // Remove quotes
      if (typeof value === 'string') {
        value = value.replace(/^["']|["']$/g, '');
      }
      
      metadata[key] = value;
    }
  });

  return { metadata, content: restOfContent };
}

/**
 * Transform to Claude SKILL.md format
 */
function transformToSkillFormat(metadata, content) {
  const skillFrontmatter = `---
name: ${metadata.skill_name}
description: >-
  ${metadata.description}
---`;

  return skillFrontmatter + content;
}

/**
 * Transform Docusaurus links to SKILL.md links
 * Handles: ./doc or ../category/doc → proper SKILL.md paths
 * Avoids double-adding /SKILL.md if it's already there
 */
function transformLinksForSkills(content) {
  // Match markdown links and transform them
  content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (fullMatch, linkText, linkPath) => {
    // Skip if already ends with /SKILL.md
    if (linkPath.endsWith('/SKILL.md')) {
      return fullMatch;
    }
    
    // Skip external links (http/https)
    if (linkPath.startsWith('http://') || linkPath.startsWith('https://')) {
      return fullMatch;
    }
    
    // Skip anchor links
    if (linkPath.startsWith('#')) {
      return fullMatch;
    }
    
    // Transform ./doc → ../doc/SKILL.md
    if (linkPath.startsWith('./')) {
      const cleanPath = linkPath.substring(2); // Remove ./
      return `[${linkText}](../${cleanPath}/SKILL.md)`;
    }
    
    // Transform ../doc → ../../doc/SKILL.md
    if (linkPath.startsWith('../')) {
      return `[${linkText}](../${linkPath}/SKILL.md)`;
    }
    
    // Leave other links unchanged
    return fullMatch;
  });
  
  return content;
}

/**
 * Process a single doc file
 */
function processDocFile(docPath) {
  const content = fs.readFileSync(docPath, 'utf-8');
  const { metadata, content: bodyContent } = parseFrontmatter(content);

  // Skip if not flagged as a skill
  if (!metadata.skill) {
    return null;
  }

  // Validate required fields
  if (!metadata.skill_name) {
    console.warn(`⚠️  ${path.basename(docPath)} has skill:true but no skill_name, skipping`);
    return null;
  }

  // Transform content
  const transformedContent = transformToSkillFormat(metadata, bodyContent);
  const linkedContent = transformLinksForSkills(transformedContent);

  // Determine skill path (recreate folder/file/SKILL.md structure)
  const relativePath = path.relative(DOCS_DIR, path.dirname(docPath));
  const skillDir = path.join(SKILLS_DIR, relativePath, metadata.skill_name);
  const skillPath = path.join(skillDir, 'SKILL.md');

  // Create directory and write
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(skillPath, linkedContent);

  const relativeSkillPath = path.relative(SKILLS_DIR, skillPath);
  console.log(`✓ Synced: ${path.basename(docPath)} → ${relativeSkillPath}`);

  return skillPath;
}

/**
 * Main function
 */
function main() {
  try {
    console.log('🔄 Syncing documentation to skills...\n');

    // Check if docs exists
    if (!fs.existsSync(DOCS_DIR)) {
      console.error(`❌ Error: Docs directory not found at ${DOCS_DIR}`);
      console.error('Create documentation in docs-site/docs/ first');
      process.exit(1);
    }

    // Clean skills directory
    if (fs.existsSync(SKILLS_DIR)) {
      fs.rmSync(SKILLS_DIR, { recursive: true });
      console.log('✓ Cleaned skills directory');
    }

    // Create skills directory
    fs.mkdirSync(SKILLS_DIR, { recursive: true });

    // Find all docs
    const docFiles = findMarkdownFiles(DOCS_DIR);
    console.log(`Found ${docFiles.length} documentation files\n`);

    // Process each file
    let syncedCount = 0;
    docFiles.forEach((docPath) => {
      const result = processDocFile(docPath);
      if (result) syncedCount++;
    });

    if (syncedCount === 0) {
      console.warn('\n⚠️  No skills generated! Make sure your docs have skill:true in frontmatter');
    } else {
      console.log(`\n✅ Sync complete! ${syncedCount} skills generated\n`);
    }
  } catch (error) {
    console.error('\n❌ Error syncing documentation:');
    console.error(error.message);
    process.exit(1);
  }
}

main();
