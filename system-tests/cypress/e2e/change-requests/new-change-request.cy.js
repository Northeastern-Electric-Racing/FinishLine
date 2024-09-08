/// <reference types="cypress" />
import {
  PROJECT_OR_WORKPACKAGE_PLACEHOLDER,
  ISSUE_BUTTON,
  DEFINITION_CHANGE_BUTTON,
  OTHER_BUTTON,
  WHAT_DESCRIPTOR,
  EXPLAIN_TEXT_BOX_PLACEHOLDER,
  WHY_DESCRIPTOR,
  WHY_DELETE_OPTION,
  WHY_TYPE_OPTION,
  WHY_EXPLAIN_TEXT_BOX,
  ADD_PROPOSED_SOLUTION_BUTTON
} from '../../utils/selectors.utils';
import { VISIBLE, LENGTH_GREATER_THAN, EXIST } from '../../utils/cypress-actions.utils';
import { createChangeRequest } from '../../utils/change-request.utils.cy';

describe('New Change Request', () => {
  beforeEach(() => {
    cy.login('Thomas Emrax', '/change-requests/new');
  });

  it('Displays all new CR Fields', () => {
    cy.get(PROJECT_OR_WORKPACKAGE_PLACEHOLDER).should(VISIBLE);
    cy.contains(ISSUE_BUTTON).should(VISIBLE);
    cy.contains(DEFINITION_CHANGE_BUTTON).should(VISIBLE);
    cy.contains(OTHER_BUTTON).should(VISIBLE);
    cy.contains(WHAT_DESCRIPTOR).should(VISIBLE);
    cy.contains(WHAT_DESCRIPTOR).parent().find(EXPLAIN_TEXT_BOX_PLACEHOLDER);
    cy.contains(WHY_DESCRIPTOR).should(VISIBLE);
    cy.get(WHY_TYPE_OPTION(0)).should(EXIST);
    cy.get(WHY_EXPLAIN_TEXT_BOX(0)).should(EXIST);
    cy.get(WHY_DELETE_OPTION).should(VISIBLE);
    cy.get(WHY_DELETE_OPTION).should(LENGTH_GREATER_THAN, 0);
    cy.contains(ADD_PROPOSED_SOLUTION_BUTTON).should(VISIBLE);
  });

  [{ }].forEach((args) => {
    it('Creating a Change Request Works', () => {
      createChangeRequest(args);
    });
  });
});
