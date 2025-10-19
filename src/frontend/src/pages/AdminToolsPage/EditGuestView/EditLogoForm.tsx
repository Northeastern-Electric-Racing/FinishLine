import React from 'react';
import { Box, Button, FormControl, Stack, Typography } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { Controller, useForm } from 'react-hook-form';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';
import ImageIcon from '@mui/icons-material/Image';

export interface EditLogoInput {
  logoImage?: File;
}

interface EditLogoFormProps {
  onSubmit: (logoImage: EditLogoInput) => Promise<void>;
  onHide: () => void;
  orgLogo?: File;
}

const EditLogoForm: React.FC<EditLogoFormProps> = ({ onSubmit, orgLogo, onHide }) => {
  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      logoImage: orgLogo
    }
  });

  const onHideWrapper = () => {
    onHide();
    reset();
  };

  return (
    <form
      id="edit-organization-logo"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit(onSubmit)(e);
        reset();
      }}
      onKeyPress={(e) => {
        e.key === 'Enter' && e.preventDefault();
      }}
    >
      <Stack spacing={2}>
        <FormControl sx={{ width: '100%' }}>
          <Controller
            name={'logoImage'}
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 1
                }}
              >
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
                      onChange(!!e.target.files && e.target.files[0]);
                    }}
                    type="file"
                    id="logo-image"
                    accept="image/png, image/jpeg"
                    name="logoImageFile"
                    multiple
                    hidden
                  />
                </Button>
                {value && value.name !== 'undefined' && (
                  <Stack direction={'row'} spacing={1} mt={2}>
                    <ImageIcon />
                    <Typography>{value.name}</Typography>
                  </Stack>
                )}
              </Box>
            )}
          />
        </FormControl>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'end'
          }}
        >
          <NERFailButton sx={{ mx: 1 }} form={'edit-organization-logo'} onClick={onHideWrapper}>
            Cancel
          </NERFailButton>
          <NERSuccessButton sx={{ mx: 1 }} type="submit" form={'edit-organization-logo'}>
            Save
          </NERSuccessButton>
        </Box>
      </Stack>
    </form>
  );
};

export default EditLogoForm;
