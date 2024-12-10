import React from 'react';
import { Box, Button, Stack, useTheme } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';

interface EditLogoFormProps {
  logoImageUrl?: string;
  onSubmit: (logoImage: File) => Promise<void>;
}

const EditLogoForm: React.FC<EditLogoFormProps> = ({ logoImageUrl, onSubmit }) => {
  const theme = useTheme();
  return (
    <Stack spacing={2}>
      {!logoImageUrl ? (
        <Box
          sx={{
            background: theme.palette.background.paper,
            width: 300,
            height: 300,
            borderRadius: 2,
            boxShadow: 3
          }}
        />
      ) : (
        <Box
          component="img"
          src={logoImageUrl}
          alt="Logo"
          sx={{
            width: 300,
            height: 300,
            borderRadius: 2,
            boxShadow: 3
          }}
        />
      )}
      <Button
        variant="contained"
        color="error"
        component="label"
        startIcon={<FileUploadIcon />}
        sx={{
          width: 'fit-content',
          textTransform: 'none',
          mt: '9.75px'
        }}
      >
        Upload
        <input
          onChange={(e) => {
            console.log('SUBMITTED');
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
