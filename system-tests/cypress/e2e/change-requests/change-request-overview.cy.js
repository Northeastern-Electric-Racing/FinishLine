/// <reference types="cypress" />
import { CR_ROW, ALL_CHANGE_REQUESTS_TAB, CHANGE_REQUEST_TABLE } from '../../utils/selectors.utils';

import { LENGTH_GREATER_THAN, INCLUDE } from '../../utils/cypress-actions.utils';

// To learn more about how Cypress works and
// what makes it such an awesome testing tool,
// please read our getting started guide:
// https://on.cypress.io/introduction-to-cypress

describe('Change Request Overview', () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    cy.login('Thomas Emrax', '/change-requests');
  });

  it('Change Requests to Review Should Display At Least One CR', () => {
    // We use the `cy.get()` command to get all elements that match the selector.
    cy.get(CR_ROW('Change Requests To Review')).children().should(LENGTH_GREATER_THAN, 0);
  });

  it('My Aproved Change Requests Should Display At Least Three CRs', () => {
    cy.get(CR_ROW('My Approved Change Requests')).children().should(LENGTH_GREATER_THAN, 2);
  });

  it('Can Switch to All Change Requests Table', () => {
    cy.contains(ALL_CHANGE_REQUESTS_TAB).click();
    cy.url().should(INCLUDE, '/change-requests/all');
    cy.get(CHANGE_REQUEST_TABLE);
  });
});
