const placeholderBuilder = (value) => `[placeholder="${value}"]`;

const testIdBuilder = (value) => `[data-testid="${value}"]`;

const idBuilder = (value) => `[id="${value}"]`;

const SELECTORS = {
  LOADING_INDICATOR: testIdBuilder('loader'),
  LOGIN_ICON: testIdBuilder('LoginIcon'),
  DEV_LOGIN_TEXT: 'Local Dev User',

  // Home Page
  LEARN_MORE_BUTTON: 'Learn More',
  FINISHLINE_BUTTON: 'FinishLine',
  USEFUL_LINKS: 'Useful Links',
  ABOUT_NER: 'About NER',
  SIDEBAR: idBuilder('sidebar-button'),

  // Change Request
  CR_ROW: (title) => testIdBuilder(`${title}crRow`),
  NEW_CHANGE_REQUEST_BUTTON: 'New Change Request',
  ALL_CHANGE_REQUESTS_TAB: 'All Change Requests',
  CHANGE_REQUEST_TABLE: testIdBuilder('Change Request Table'),
  PROJECT_OR_WORKPACKAGE_PLACEHOLDER: placeholderBuilder('Select a project or work package'),
  ISSUE_BUTTON: 'ISSUE',
  DEFINITION_CHANGE_BUTTON: 'DEFINITION_CHANGE',
  OTHER_BUTTON: 'OTHER',
  WHAT_DESCRIPTOR: 'What needs to be changed',
  WHY_DESCRIPTOR: 'Why does this need to be changed',
  WHY_TYPE_OPTION: (index) => `[name="why.${index}.type"]`,
  WHY_EXPLAIN_TEXT_BOX: (index) => idBuilder(`why.${index}.explain-input`),
  ADD_REASON: 'ADD REASON',
  WHY_DELETE_OPTION: testIdBuilder('DeleteIcon'),
  EXPLAIN_TEXT_BOX_PLACEHOLDER: placeholderBuilder('Explain *'),
  ADD_PROPOSED_SOLUTION_BUTTON: '+ Add Solution',
  PROPOSED_SOLUTION_DESCRIPTION_INPUT: idBuilder('description-input'),
  PROPOSED_SOLUTION_SCOPE_INPUT: idBuilder('scopeImpact-input'),
  PROPOSED_SOLUTION_BUDGET_INPUT: idBuilder('budgetImpact-input'),
  PROPOSED_SOLUTION_TIMELINE_INPUT: idBuilder('timelineImpact-input'),
  ADD_BUTTON: new RegExp('^Add$', 'g'),
  SUBMIT_BUTTON: new RegExp('^Submit$', 'g'),
  DIALOG: '[role="dialog"]',
  ACTIONS_BUTTON: 'Actions',
  ACTIONS_BUTTON_DELETE: 'Delete',
  CONFIRM_DELETE_TEXT_INPUT: idBuilder('identifier-input'),
  CHANGE_REQUEST_TITLE: new RegExp('Change Request #\\d+$')
};

export default SELECTORS;
