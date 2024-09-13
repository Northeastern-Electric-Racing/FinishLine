/// <reference types="cypress" />
import { LEARN_MORE_BUTTON, FINISHLINE_BUTTON, USEFUL_LINKS, ABOUT_NER, SIDEBAR } from '../../utils/selectors.utils';
import { VISIBLE, NOT_EXIST } from '../../utils/cypress-actions.utils';

// To learn more about how Cypress works and
// what makes it such an awesome testing tool,
// please read our getting started guide:
// https://on.cypress.io/introduction-to-cypress

describe('Homepage Overview', () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    cy.login('Spongebob Squarepants');
  });

  it('Navigates to the PNM Home Page When Clicking Learn More', () => {
    cy.contains(LEARN_MORE_BUTTON).click();
    cy.url().should('include', '/home/pnm');
    cy.contains(ABOUT_NER).should(VISIBLE);
  });

  it('Navigates to the Member Home Page When Clicking About Finishline', () => {
    cy.contains(FINISHLINE_BUTTON).click();
    cy.url().should('include', '/home/member');
    cy.contains(USEFUL_LINKS).should(VISIBLE);
  });

  it('Preserves state when refreshing the page', () => {
    cy.contains(FINISHLINE_BUTTON).click();
    cy.url().should('include', '/home/member');
    cy.contains(USEFUL_LINKS).should(VISIBLE);
    cy.reload();
    cy.url().should('include', '/home/member');
    cy.contains(USEFUL_LINKS).should(VISIBLE);
  });

  it('Includes the sidebar on the member home page', () => {
    cy.contains(FINISHLINE_BUTTON).click();
    cy.get(SIDEBAR).should(VISIBLE);
  });

  it('Does not have the sidebar on the guest home page', () => {
    cy.get(SIDEBAR).should(NOT_EXIST);
  });

  it('Includes the sidebar on the pnm home page', () => {
    cy.contains(LEARN_MORE_BUTTON).click();
    cy.get(SIDEBAR).should(VISIBLE);
  });
});
