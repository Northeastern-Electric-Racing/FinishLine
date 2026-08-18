/* eslint-disable no-undef */
import { PROJECT_OR_WORKPACKAGE_PLACEHOLDER, SUBMIT_BUTTON, CR_ROW } from './selectors.utils';
import { INCLUDE } from './cypress-actions.utils';

export const createChangeRequest = ({ why = 'test why' } = {}) => {
  cy.get(PROJECT_OR_WORKPACKAGE_PLACEHOLDER).click();
  cy.get('[role="listbox"]').find('li').first().click();

  cy.contains('Why are you making this change?').parent().find('textarea').first().type(why);

  cy.contains(SUBMIT_BUTTON).click();
  cy.url().should(INCLUDE, '/change-requests');

  cy.get(CR_ROW('Un-reviewed Change Requests')).contains('Change Request').should('exist');
};
