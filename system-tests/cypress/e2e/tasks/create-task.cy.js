/// <reference types="cypress" />
import { VISIBLE, INCLUDE } from '../../utils/cypress-actions.utils';

const dismissAlerts = () => {
  // Remove all scheduling conflict alert banners from DOM directly
  cy.window().then((win) => {
    win.document.querySelectorAll('[role="alert"]').forEach((alert) => {
      alert.remove();
    });
  });
  cy.wait(300);
};

const openCreateTaskModal = () => {
  dismissAlerts();
  // Wait to ensure page is stable, then click New Event
  cy.wait(500);
  cy.contains('button', 'New Event').click({ force: true });
  cy.get('[role="dialog"]', { timeout: 10000 }).should('exist');
  cy.get('[role="dialog"]').contains('button', 'Create Task').click({ force: true });
  // Wait for the second dialog (Create Task) to appear
  cy.wait(500);
  cy.get('[role="dialog"]').find('h2').should('contain', 'Create Task');
};

describe('Create Task', () => {
  beforeEach(() => {
    cy.login('Thomas Emrax', '/calendar');
  });

  it('Can Open Create Task Modal from Calendar', () => {
    openCreateTaskModal();

    // Verify the Create Task modal is open with expected fields
    cy.get('[role="dialog"]').contains('Project').should('exist');
    cy.get('[role="dialog"]').contains('Title').should('exist');
    cy.get('[role="dialog"]').contains('Priority').should('exist');
    cy.get('[role="dialog"]').contains('Status').should('exist');
  });

  it('Creating a Task Writes to DB and Appears on Calendar', () => {
    const taskTitle = 'E2E Test Task';

    openCreateTaskModal();

    // Select a project
    cy.get('[role="dialog"]').find('input[placeholder="Select a project"]').click({ force: true });
    cy.get('[role="listbox"]').contains('Impact Attenuator').first().click();

    // Fill in the title - the title textbox has no placeholder, find it via the Title label
    cy.get('[role="dialog"]').contains('Title').siblings().find('input').first().type(taskTitle, { force: true });

    // Submit the form and verify the POST succeeds with the task title in the response
    cy.intercept('POST', '**/tasks/**').as('createTask');
    cy.get('[role="dialog"]').find('button').contains('Create').click({ force: true });
    cy.wait('@createTask').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body.title).to.eq(taskTitle);
    });
  });

  it('Creating a Task with Assignee Writes to DB Successfully', () => {
    const taskTitle = 'Assigned Task Test';

    openCreateTaskModal();

    // Select a project
    cy.get('[role="dialog"]').find('input[placeholder="Select a project"]').click({ force: true });
    cy.get('[role="listbox"]').contains('Impact Attenuator').first().click();

    // Fill in the title
    cy.get('[role="dialog"]').contains('Title').siblings().find('input').first().type(taskTitle, { force: true });

    // Add self as assignee
    cy.get('[role="dialog"]').find('input[placeholder="Select users"]').click({ force: true });
    cy.get('[role="listbox"]').contains('Thomas Emrax').click();
    // Close the assignee dropdown by clicking elsewhere in the dialog
    cy.get('[role="dialog"]').find('h2').click({ force: true });

    // Submit and verify the POST succeeds with correct data
    cy.intercept('POST', '**/tasks/**').as('createTask');
    cy.get('[role="dialog"]').find('button').contains('Create').click({ force: true });
    cy.wait('@createTask').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body.title).to.eq(taskTitle);
      expect(interception.response.body.assignees).to.have.length.greaterThan(0);
    });
  });
});
