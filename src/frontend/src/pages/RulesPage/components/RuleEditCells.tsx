/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, TextField, Theme, useTheme } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { memo, MutableRefObject } from 'react';
import { Rule } from 'shared';
import RuleActions from '../RuleActions';
import RuleContent from './RuleContent';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';

// how far a rule (code and content) steps right per level of depth
const RULE_INDENT_PX = 12;
// deep rules stop stepping right so the code keeps the width it needs to stay readable
const MAX_INDENT_LEVEL = 4;
const indentFor = (level: number) => `${Math.min(level, MAX_INDENT_LEVEL) * RULE_INDENT_PX}px`;

// the code and content being edited, kept in a ref so typing does not rerender
export interface RuleDraft {
  ruleCode: string;
  ruleContent: string;
}

const editFieldStyles = (theme: Theme) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.common.black,
    '& fieldset': {
      borderColor: '#dd514c'
    },
    '&:hover fieldset': {
      borderColor: '#dd514c'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#dd514c'
    }
  }
});

interface RuleCodeCellProps {
  rule: Rule;
  level: number;
  isExpanded: boolean;
  hasSubRules: boolean;
  onToggleExpand: () => void;
  isEditing: boolean;
  draftRef: MutableRefObject<RuleDraft>;
}

/**
 * Left cell of a rule row: the expand chevron and the rule code, swapped for an input while editing.
 */
const RuleCodeCellComponent: React.FC<RuleCodeCellProps> = ({
  rule,
  level,
  isExpanded,
  hasSubRules,
  onToggleExpand,
  isEditing,
  draftRef
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        width: '100%',
        paddingLeft: indentFor(level),
        color: theme.palette.common.black
      }}
    >
      {hasSubRules && (
        <ChevronRightIcon
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          sx={{
            fontSize: '20px',
            flexShrink: 0,
            color: theme.palette.common.black,
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              borderRadius: '50%'
            }
          }}
        />
      )}
      {isEditing ? (
        <TextField
          defaultValue={draftRef.current.ruleCode}
          onChange={(e) => {
            draftRef.current.ruleCode = e.target.value;
          }}
          onClick={(e) => e.stopPropagation()}
          variant="outlined"
          size="small"
          autoFocus
          sx={{ flex: 1, minWidth: 0, ...editFieldStyles(theme) }}
        />
      ) : (
        // a rule code always stays on one line, the column widens and pushes the content across instead
        <span style={{ color: theme.palette.common.black, whiteSpace: 'nowrap', flexShrink: 0 }}>{rule.ruleCode}</span>
      )}
    </Box>
  );
};

interface RuleBodyCellProps {
  rule: Rule;
  level: number;
  isEditing: boolean;
  draftRef: MutableRefObject<RuleDraft>;
  onReferenceRemove: (rule: Rule, referencedRuleId: string) => void;
  onImageRemove: (rule: Rule, fileId: string) => void;
}

/**
 * Middle cell of a rule row: the rule's content and attachments, swapped for an input while editing.
 */
const RuleBodyCellComponent: React.FC<RuleBodyCellProps> = ({
  rule,
  level,
  isEditing,
  draftRef,
  onReferenceRemove,
  onImageRemove
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ pl: indentFor(level) }}>
      {isEditing ? (
        <TextField
          fullWidth
          multiline
          defaultValue={draftRef.current.ruleContent}
          onChange={(e) => {
            draftRef.current.ruleContent = e.target.value;
          }}
          variant="outlined"
          size="small"
          sx={editFieldStyles(theme)}
        />
      ) : (
        (rule.ruleContent || rule.referencedRules.length > 0) && (
          <RuleContent
            rule={rule}
            color={theme.palette.common.black}
            onReferenceRemove={(referencedRuleId) => onReferenceRemove(rule, referencedRuleId)}
            onImageRemove={(fileId) => onImageRemove(rule, fileId)}
          />
        )
      )}
    </Box>
  );
};

interface RuleActionsCellProps {
  rule: Rule;
  isEditing: boolean;
  onAdd: (rule: Rule, anchorEl: HTMLElement) => void;
  onRemove: (rule: Rule) => void;
  onEdit: (rule: Rule) => void;
  onSave: (rule: Rule) => void;
  onCancel: () => void;
}

/**
 * Right cell of a rule row: the add, remove and edit actions, swapped for Cancel and Save while editing.
 */
const RuleActionsCellComponent: React.FC<RuleActionsCellProps> = ({
  rule,
  isEditing,
  onAdd,
  onRemove,
  onEdit,
  onSave,
  onCancel
}) => {
  const theme = useTheme();

  return (
    // Cancel and Save stay side by side on one line, held off the right wall since the cell is a
    // percentage of the page and the buttons crowd its edge once the sidebar opens
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap', pr: 2 }}>
      {isEditing ? (
        <>
          <NERFailButton size="small" onClick={onCancel} sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
            Cancel
          </NERFailButton>
          <NERSuccessButton size="small" onClick={() => onSave(rule)} sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
            Save
          </NERSuccessButton>
        </>
      ) : (
        <RuleActions
          ruleId={rule.ruleId}
          onAdd={(_ruleId, anchorEl) => onAdd(rule, anchorEl)}
          onRemove={() => onRemove(rule)}
          onEdit={() => onEdit(rule)}
          iconColor={theme.palette.common.black}
        />
      )}
    </Box>
  );
};

// memo so that starting or ending an edit, which rerenders every mounted row,
// doesn't rebuild the code, content and actions of the rows that didn't change
export const RuleCodeCell = memo(RuleCodeCellComponent);
export const RuleBodyCell = memo(RuleBodyCellComponent);
export const RuleActionsCell = memo(RuleActionsCellComponent);
