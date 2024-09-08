import { LOADING_INDICATOR, LOGIN_ICON, DEV_LOGIN_TEXT } from '../utils/selectors.utils';
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add('login', (username = 'Thomas Emrax', redirect = '/home') => {
  cy.visit(Cypress.env('base_url') + '/login');
  cy.waitForLoading();
  cy.contains(DEV_LOGIN_TEXT).parent().click();
  cy.contains(username).click();
  cy.get(LOGIN_ICON).click();
  cy.waitForLoading();
  cy.visit(Cypress.env('base_url') + redirect);
  cy.waitForLoading();
});

Cypress.Commands.add('waitForLoading', () => {
  cy.ifElementExists(LOADING_INDICATOR).then((spinner) => {
    if (spinner) {
      cy.get(LOADING_INDICATOR).should('not.exist');
    }
  });
});

Cypress.Commands.add('ifElementExists', (selector) => {
  cy.get('body').then((body) => {
    const obj = body.find(selector);
    if (obj?.length) return obj;
    return null;
  });
});

//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
