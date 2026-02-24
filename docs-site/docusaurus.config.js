// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'FinishLine Documentation',
  tagline: "Developer documentation for Northeastern Electric Racing's project management platform",
  favicon: 'img/favicon.ico',

  // Production URL - update this when deploying
  url: 'https://northeastern-electric-racing.github.io',
  // Base URL - update if deploying to a subdirectory (e.g., /FinishLine/)
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Northeastern-Electric-Racing', // Usually your GitHub org/user name.
  projectName: 'FinishLine', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Markdown configuration
  markdown: {
    format: 'mdx',
    mermaid: false,
    hooks: {
      onBrokenMarkdownLinks: 'warn'
    }
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Point to the source documentation files in docs-site/docs/
          editUrl: 'https://github.com/Northeastern-Electric-Racing/FinishLine/edit/main/docs-site/docs/'
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css'
        }
      })
    ]
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Social card for link previews (uses logo for now)
      image: 'img/logo.png',
      navbar: {
        title: 'FinishLine Docs',
        logo: {
          alt: 'NER Logo',
          src: 'img/logo.png',
          href: '/docs/intro'
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation'
          },
          {
            href: 'https://github.com/Northeastern-Electric-Racing/FinishLine',
            label: 'GitHub',
            position: 'right'
          }
        ]
      },

      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula
      }
    })
};

export default config;
