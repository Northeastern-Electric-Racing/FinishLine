import { Button, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';

interface NERUploadButtonProps {
  dataTypeId: string;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (dataTypeId: string) => void;
  addedImage: File | undefined;
  setAddedImage: React.Dispatch<React.SetStateAction<File | undefined>>;
}

const NERUploadButton = ({ dataTypeId, handleFileChange, onSubmit, addedImage, setAddedImage }: NERUploadButtonProps) => {
  return (
    <>
      <Button
        variant="contained"
        color="success"
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
            console.log('e', e);
            handleFileChange(e);
          }}
          type="file"
          accept="image/*"
          name="addedImage"
          hidden
        />
      </Button>
      {addedImage && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">{addedImage.name}</Typography>
          <Button
            variant="contained"
            color="error"
            onClick={() => setAddedImage(undefined)}
            sx={{ textTransform: 'none', mt: 1, mr: 1 }}
          >
            Remove
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => onSubmit(dataTypeId)}
            sx={{
              width: 'fit-content',
              textTransform: 'none',
              mt: 1
            }}
          >
            Submit
          </Button>
        </Box>
      )}
    </>
  );
};

export default NERUploadButton;
