import { Button, ButtonProps, styled } from '@mui/material';

interface NERButtonProps extends ButtonProps {
  whiteVariant?: boolean;
}

export const NERButton = styled(Button)<NERButtonProps>(({ whiteVariant }) => ({
  textTransform: 'none',
  fontSize: 16,
  borderColor: '#ef4345',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: '#ff0000'
  },
  ...(whiteVariant && {
    backgroundColor: '#d9d9d9',
    color: '#474849',
    '&:hover': {
      backgroundColor: '#A4A4A4'
    },
    fontSize: 13,
    textTransform: 'uppercase',
    fontWeight: 'bold'
  })
}));
