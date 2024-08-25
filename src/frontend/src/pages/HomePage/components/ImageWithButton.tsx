import React from 'react';
import { Typography, Box } from '@mui/material';
import { NERButton } from '../../../components/NERButton';

interface ImageWithButtonProps {
  title: string;
  imageSrc: string;
  buttonText: string;
  onClick: () => void;
}

const ImageWithButton: React.FC<ImageWithButtonProps> = ({ title, imageSrc, buttonText, onClick }) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-block', width: '100%', textAlign: 'center' }}>
      <Box component="img" src={imageSrc} alt={buttonText} sx={{ width: '100%', height: 'auto', opacity: 0.5 }} />
      <Box
        sx={{
          position: 'absolute',
          top: 70,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <Typography variant="h3" sx={{ mb: 2, fontFamily: 'oswald', fontWeight: 1 }}>
          {title}
        </Typography>
        <NERButton variant="contained" onClick={onClick} sx={{ mt: 1, width: 'auto', color: 'white' }}>
          {buttonText}
        </NERButton>
      </Box>
    </Box>
  );
};

export default ImageWithButton;
