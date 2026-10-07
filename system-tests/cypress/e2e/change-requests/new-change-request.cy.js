/// <reference types="cypress" />
import { PROJECT_OR_WORKPACKAGE_PLACEHOLDER } from '../../utils/selectors.utils';
import { VISIBLE } from '../../utils/cypress-actions.utils';
import { createChangeRequest } from '../../utils/change-request.utils.cy';

describe('New Change Request', () => {
  beforeEach(() => {
    cy.login('Thomas Emrax', '/change-requests/new');
  });

  it('Displays all new CR Fields', () => {
    cy.get(PROJECT_OR_WORKPACKAGE_PLACEHOLDER).should(VISIBLE);
    cy.contains('Why are you making this change?').should(VISIBLE);
    cy.contains('Requested Reviewer (optional)').should(VISIBLE);
  });

  it('Creating a Change Request Works', () => {
    createChangeRequest({});
  });

  it('Creating a Change Request Works Without a Reviewer', () => {
    createChangeRequest({ why: 'test why no reviewer' });
  });
});
