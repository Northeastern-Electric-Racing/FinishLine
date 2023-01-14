import { Button, styled } from '@mui/material';

export const SubmitButton = styled(Button)({
  fontSize: 16,
  '&:hover': {
    backgroundColor: '#ff0000',
    borderColor: '#0062cc',
    boxShadow: 'none'
  }
});
