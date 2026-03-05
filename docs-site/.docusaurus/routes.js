import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '5ff'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '5ba'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'a2b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'c3c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '156'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '88c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '000'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '914'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '82a'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', 'fd4'),
            routes: [
              {
                path: '/docs/general-practices/backend-endpoints',
                component: ComponentCreator('/docs/general-practices/backend-endpoints', 'a26'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/general-practices/frontend-forms',
                component: ComponentCreator('/docs/general-practices/frontend-forms', '714'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/general-practices/frontend-hooks-and-apis',
                component: ComponentCreator('/docs/general-practices/frontend-hooks-and-apis', '0a3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/general-practices/postman-api-testing',
                component: ComponentCreator('/docs/general-practices/postman-api-testing', 'd87'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/general-practices/prisma-schema-shared-types',
                component: ComponentCreator('/docs/general-practices/prisma-schema-shared-types', '9b7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/general-practices/query-args-and-transformers',
                component: ComponentCreator('/docs/general-practices/query-args-and-transformers', 'abd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/general-practices/react-components',
                component: ComponentCreator('/docs/general-practices/react-components', '249'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/general-practices/repository-overview',
                component: ComponentCreator('/docs/general-practices/repository-overview', 'd78'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/intro',
                component: ComponentCreator('/docs/intro', '61d'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', '2e1'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
