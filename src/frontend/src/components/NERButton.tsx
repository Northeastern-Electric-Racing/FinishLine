import { Button, styled } from '@mui/material';

export const NERButton = styled(Button)({
  textTransform: 'none',
  fontSize: 16,
  borderColor: '#ef4345',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: '#ff0000'
  }
});
