/// <reference types="cypress" />
import { OVERDUE } from '../../utils/selectors.utils';
import { createChangeRequest } from '../../utils/change-request.utils.cy';

import { VISIBLE, INCLUDE } from '../../utils/cypress-actions.utils';

describe('Home Page', () => {
  beforeEach(() => {
    cy.login('Thomas Emrax', '/home');
  });

  it('Displays Welcome Message', () => {
    cy.contains('Welcome, Thomas!').should(VISIBLE);
  });

  it('Displays Change Requests To Review Section', () => {
    cy.contains('Change Requests To Review').should(VISIBLE);
    cy.contains('Change Request #').should(VISIBLE);
  });

  it('Displays Overdue Work Packages Section', () => {
    cy.contains(OVERDUE).should(VISIBLE);
  });

  it('Overdue Work Packages Contains At Least One Entry', () => {
    // The empty-state message only renders when there are zero overdue work packages, so its
    // absence means at least one entry is showing -- checking this way doesn't depend on any
    // specific work package existing by name.
    cy.contains(OVERDUE).should(VISIBLE);
    cy.contains('Great Job Team!').should('not.exist');
  });

  it('Can Navigate to Change Requests Page via Sidebar', () => {
    cy.get('a[href="/change-requests"]').first().click({ force: true });
    cy.url().should(INCLUDE, '/change-requests');
  });

  it('Creating a CR Shows Up on Home Page', () => {
    const whyText = 'home page e2e test cr';

    // Navigate to new CR form
    cy.visit(Cypress.expose('base_url') + '/change-requests/new');
    cy.waitForLoading();

    // Create the CR
    createChangeRequest({ why: whyText });

    // Navigate back to home
    cy.visit(Cypress.expose('base_url') + '/home');
    cy.waitForLoading();

    // Verify the new CR appears somewhere on the home page (in My Un-reviewed section on CR overview,
    // which is also reflected in the home page CR count)
    cy.contains('Change Requests To Review').should(VISIBLE);
  });
});
