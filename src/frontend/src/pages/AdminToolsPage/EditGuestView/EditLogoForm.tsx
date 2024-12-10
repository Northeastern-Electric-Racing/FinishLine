import React from 'react';
import { Box, Button, Stack, useTheme } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import LogoDisplay from '../../HomePage/components/LogoDisplay';

interface EditLogoFormProps {
  onSubmit: (logoImage: File) => Promise<void>;
}

const EditLogoForm: React.FC<EditLogoFormProps> = ({ onSubmit }) => {
  const theme = useTheme();
  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: theme.palette.background.paper,
          width: 300,
          height: 300,
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <LogoDisplay />
      </Box>

      <Button
        variant="contained"
        color="error"
        component="label"
        startIcon={<FileUploadIcon />}
        sx={{
          width: 'fit-content',
          textTransform: 'none',
          mt: '9.75px',
          color: 'black'
        }}
      >
        Upload
        <input
          onChange={(e) => {
            !!e.target.files && onSubmit(e.target.files[0]);
          }}
          type="file"
          id="logo-image"
          accept="image/png, image/jpeg, application/pdf"
          name="logoImageFile"
          multiple
          hidden
        />
      </Button>
    </Stack>
  );
};

export default EditLogoForm;
