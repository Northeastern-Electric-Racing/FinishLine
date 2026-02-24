/**
 * Mapping from FinishLine RR fields to Concur DOM selectors.
 *
 * Concur uses `data-nuiexp` attributes as stable, semantic selectors.
 * Text inputs use <input> elements; dropdowns use <div role="combobox">.
 *
 * Field IDs discovered via Playwright DOM inspection (2026-02-23):
 *
 * TEXT INPUTS (fillable via native value setter + event dispatch):
 *   - Report Name:      input[data-nuiexp="field-name"]          id="name"
 *   - Report Start Date: input[data-nuiexp="field-startDate"]    id="startDate-date-input-field-input"
 *   - Report End Date:   input[data-nuiexp="field-endDate"]      id="endDate-date-input-field-input"
 *   - Division:          input[data-nuiexp="field-custom7"]      id="custom7"    (pre-filled: DIV09)
 *   - Region:            input[data-nuiexp="field-custom13"]     id="custom13"   (pre-filled: Boston)
 *   - Type of User:      input[data-nuiexp="field-custom4"]      id="custom4"    (pre-filled: Undergraduate Student)
 *   - Comment:           textarea[data-nuiexp="field-comment"]   id="comment"
 *   - Policy:            input[data-nuiexp="field-policy__input"] (read-only, pre-filled)
 *
 * COMBOBOXES (dropdowns — require click + option selection):
 *   - Vendor ID:         [data-nuiexp="field-custom2"]           id="custom2"
 *   - Type of Expense:   [data-nuiexp="field-custom10"]          id="custom10"
 *   - Worktag:           [data-nuiexp="field-custom11"]          id="custom11"   (pre-filled)
 *   - Company:           [data-nuiexp="field-custom12"]          id="custom12"   (pre-filled)
 *   - Business Purpose:  [data-nuiexp="field-custom6"]           id="custom6"
 *   - Country Code:      [data-nuiexp="field-countryCode"]                       (pre-filled)
 */

export type FieldType = 'text' | 'date' | 'textarea' | 'combobox';

export interface FieldMapping {
  /** Key path in the RR data (e.g. 'recipient.firstName') */
  rrField: string;
  /** CSS selector on the Concur page */
  concurSelector: string;
  /** Human-readable label */
  label: string;
  /** Input type — determines fill strategy */
  type: FieldType;
  /** Whether Concur marks this field as required */
  required: boolean;
}

/**
 * Complete field mapping for the "Create Expense Report" dialog.
 * MVP starts with Report Name only; remaining fields listed for future phases.
 */
export const FIELD_MAPPINGS: FieldMapping[] = [
  // --- MVP: single text field ---
  {
    rrField: 'reportName',
    concurSelector: 'input[data-nuiexp="field-name"]',
    label: 'Report Name',
    type: 'text',
    required: true
  },

  // --- Future: additional text fields ---
  {
    rrField: 'startDate',
    concurSelector: 'input[data-nuiexp="field-startDate"]',
    label: 'Report Start Date',
    type: 'date',
    required: true
  },
  {
    rrField: 'endDate',
    concurSelector: 'input[data-nuiexp="field-endDate"]',
    label: 'Report End Date',
    type: 'date',
    required: true
  },
  {
    rrField: 'comment',
    concurSelector: 'textarea[data-nuiexp="field-comment"]',
    label: 'Comment',
    type: 'textarea',
    required: false
  },

  // --- Future: combobox fields (require different fill strategy) ---
  {
    rrField: 'vendorId',
    concurSelector: '[data-nuiexp="field-custom2"]',
    label: 'Vendor ID',
    type: 'combobox',
    required: false
  },
  {
    rrField: 'typeOfExpense',
    concurSelector: '[data-nuiexp="field-custom10"]',
    label: 'Type of Expense',
    type: 'combobox',
    required: true
  },
  {
    rrField: 'businessPurpose',
    concurSelector: '[data-nuiexp="field-custom6"]',
    label: 'Business Purpose',
    type: 'combobox',
    required: true
  }
];
