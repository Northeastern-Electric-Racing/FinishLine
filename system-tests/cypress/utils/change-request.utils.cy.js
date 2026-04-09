/* eslint-disable no-undef */
import {
  PROPOSED_SOLUTION_BUDGET_INPUT,
  PROPOSED_SOLUTION_DESCRIPTION_INPUT,
  PROPOSED_SOLUTION_SCOPE_INPUT,
  PROPOSED_SOLUTION_TIMELINE_INPUT,
  DIALOG,
  ADD_BUTTON,
  PROJECT_OR_WORKPACKAGE_PLACEHOLDER,
  EXPLAIN_TEXT_BOX_PLACEHOLDER,
  WHAT_DESCRIPTOR,
  WHY_EXPLAIN_TEXT_BOX,
  ADD_PROPOSED_SOLUTION_BUTTON,
  SUBMIT_BUTTON,
  CR_ROW,
  WHY_TYPE_OPTION,
  ADD_REASON
} from './selectors.utils';
import { INCLUDE } from './cypress-actions.utils';

const createProposedSolution = ({
  description = 'Test Description',
  scopeImpact = 'Test Scope',
  budgetImpact = 1,
  timelineImpact = 2
}) => {
  cy.get(PROPOSED_SOLUTION_DESCRIPTION_INPUT).type(description);
  cy.get(PROPOSED_SOLUTION_SCOPE_INPUT).type(scopeImpact);
  cy.get(PROPOSED_SOLUTION_BUDGET_INPUT).type(budgetImpact);
  cy.get(PROPOSED_SOLUTION_TIMELINE_INPUT).type(timelineImpact);
  cy.get(DIALOG).find('button').contains(ADD_BUTTON).click();
};

export const createChangeRequest = ({
  wbsTitle = '0.1.0 - Impact Attenuator',
  what = 'test what',
  type = 'ISSUE',
  whys = [
    {
      type: 'OTHER',
      description: 'test why'
    }
  ],
  psArguments = [
    {
      description: 'Test Description',
      scopeImpact: 'Test Scope',
      budgetImpact: 1,
      timelineImpact: 2
    }
  ]
}) => {
  cy.get(PROJECT_OR_WORKPACKAGE_PLACEHOLDER).click();
  cy.contains(wbsTitle).click();
  cy.contains(WHAT_DESCRIPTOR).parent().find(EXPLAIN_TEXT_BOX_PLACEHOLDER).type(what);
  cy.contains(type).click();
  whys.forEach((why, index) => {
    cy.get(WHY_TYPE_OPTION(index)).parent().click();
    cy.get('li')
      .contains(new RegExp(`^${why.type}$`, 'g'))
      .click();
    cy.get(WHY_EXPLAIN_TEXT_BOX(index)).type(why.description);
    if (index !== whys.length - 1) {
      cy.contains(ADD_REASON).click();
    }
  });

  cy.contains(ADD_PROPOSED_SOLUTION_BUTTON).click();
  psArguments.forEach((argument, index) => {
    createProposedSolution(argument);
    if (index !== psArguments.length - 1) {
      cy.contains(ADD_PROPOSED_SOLUTION_BUTTON).click();
    }
  });

  cy.contains(SUBMIT_BUTTON).click();
  cy.url().should(INCLUDE, '/change-requests');

  // Verify the created CR appears in My Un-reviewed Change Requests
  cy.get(CR_ROW('My Un-reviewed Change Requests')).contains('Change Request').should('exist');
};
