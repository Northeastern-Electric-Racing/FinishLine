/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Button, styled } from '@mui/material';

const NERSuccessButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.success.main,
  color: theme.palette.success.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.success.dark
  }
})) as typeof Button;

export default NERSuccessButton;
