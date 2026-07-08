/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Button, styled } from '@mui/material';

/**
 * Shared primary action button for the Rules dashboard.
 */
export const RulesActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  color: '#ededed',
  backgroundColor: '#dd514c',
  padding: '2px 15px',
  fontSize: '16px',
  fontWeight: 700,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#c74340'
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.action.disabled,
    color: theme.palette.text.disabled
  }
}));
