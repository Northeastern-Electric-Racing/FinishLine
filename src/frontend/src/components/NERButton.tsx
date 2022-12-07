import { Button, styled } from '@mui/material';

export const NERButton = styled(Button)({
  textTransform: 'none',
  fontSize: 16,
  '&:hover': {
    backgroundColor: '#ff0000',
    borderColor: '#0062cc',
    boxShadow: 'none'
  }
});
