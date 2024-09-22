import { Button } from '@mui/material';
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
            handleFileChange(e);
          }}
          type="file"
          accept="image/*"
          name="addedImage"
          hidden
        />
      </Button>
      {addedImage && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            mt: 2
          }}
        >
          <Box
            component="img"
            src={addedImage ? URL.createObjectURL(addedImage) : ''}
            alt="Image Preview"
            sx={{ maxWidth: '300px', maxHeight: '300px', mb: 1 }}
          />
          <Box sx={{ display: 'flex', width: 'fit-content' }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => setAddedImage(undefined)}
              sx={{ textTransform: 'none', mt: 1, mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => onSubmit(dataTypeId)}
              sx={{
                textTransform: 'none',
                mt: 1
              }}
            >
              Submit
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};

export default NERUploadButton;
