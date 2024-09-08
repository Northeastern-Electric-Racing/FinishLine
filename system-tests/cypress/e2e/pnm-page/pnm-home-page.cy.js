/// <reference types="cypress" />
import { LEARN_MORE_BUTTON, FINISHLINE_BUTTON } from '../../utils/selectors.utils';

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
    cy.login('Spongebob Squarepants', '/home');
  });

  it('Navigates to the PNM Home Page When Clicking Learn More', () => {
    cy.contains(LEARN_MORE_BUTTON).click();

    cy.url().should('include', '/home');
    cy.contains('h3', 'About NER').should('be.visible');
  });

  it('Navigates to the Member Home Page When Clicking About Finishline', () => {
    cy.contains(FINISHLINE_BUTTON).click();

    cy.url().should('include', '/home');
    cy.contains('Useful Links').should('be.visible');
  });

  it('Preserves state when refreshing the page', () => {
    cy.contains(FINISHLINE_BUTTON).click();

    cy.url().should('include', '/home');
    cy.contains('Useful Links').should('be.visible');
    cy.reload();
    cy.contains('Useful Links').should('be.visible');
  });
});
