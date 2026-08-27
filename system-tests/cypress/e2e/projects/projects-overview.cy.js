/// <reference types="cypress" />
import { NEW_PROJECT_BUTTON, ALL_PROJECTS_TAB, MY_TEAMS_PROJECTS, PROJECTS_IM_LEADING } from '../../utils/selectors.utils';
import { VISIBLE, LENGTH_GREATER_THAN, INCLUDE } from '../../utils/cypress-actions.utils';

describe('Projects Overview', () => {
  beforeEach(() => {
    cy.login('Thomas Emrax', '/projects');
  });

  it("My Team's Projects Should Display At Least One Project", () => {
    cy.contains(MY_TEAMS_PROJECTS).should(VISIBLE);
    cy.contains(MY_TEAMS_PROJECTS).parent().parent().find('a').should(LENGTH_GREATER_THAN, 0);
  });

  it("Projects I'm Leading Should Display At Least One Project", () => {
    cy.contains(PROJECTS_IM_LEADING).should(VISIBLE);
    cy.contains(PROJECTS_IM_LEADING).parent().parent().find('a').should(LENGTH_GREATER_THAN, 0);
  });

  it('Can Switch to All Projects Table', () => {
    cy.contains(ALL_PROJECTS_TAB).click();
    cy.url().should(INCLUDE, '/projects/all');
    cy.get('[role="grid"]').should(VISIBLE);
    // Header row plus at least one data row -- doesn't depend on any specific project existing.
    cy.get('[role="grid"] [role="row"]').should(LENGTH_GREATER_THAN, 1);
  });

  it('Creating a Project Writes to DB and Appears in All Projects', () => {
    const projectName = 'E2E Test Project';

    cy.contains(NEW_PROJECT_BUTTON).click();
    cy.url().should(INCLUDE, '/projects/new');

    cy.get('[placeholder="Enter project name..."]').type(projectName);

    cy.get('label').contains('Teams').parent().find('[role="combobox"]').click({ force: true });
    cy.get('[role="listbox"]').find('li').first().click();

    cy.get('body').click(0, 0);

    cy.get('[placeholder="Enter a summary..."]').type('An e2e test project for automated testing', { force: true });

    cy.contains('Create Project').click({ force: true });

    cy.url().should(INCLUDE, '/projects/all');

    // The grid virtualizes rows, so a newly-created project can exist without being rendered in
    // the DOM if it sorts outside the currently-visible window -- filter down to it first via
    // the grid's built-in quick filter instead of scanning the whole (unfiltered) grid.
    cy.get('input[placeholder^="Search"]').type(projectName);
    cy.contains(projectName, { timeout: 10000 }).should(VISIBLE);
  });
});
