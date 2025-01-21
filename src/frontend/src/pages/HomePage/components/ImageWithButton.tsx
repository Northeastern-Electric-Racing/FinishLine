import React from 'react';
import { Typography, Box } from '@mui/material';
import { NERButton } from '../../../components/NERButton';

interface ImageWithButtonProps {
  title: string;
  imageSrc: string;
  buttonText: string;
  onClick: () => void;
  showUploadInput?: boolean;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  secondaryButton?: {
    text: string;
    onClick: () => void;
    color?: 'success' | 'error' | 'primary';
  };
}

const ImageWithButton: React.FC<ImageWithButtonProps> = ({
  title,
  imageSrc,
  buttonText,
  onClick,
  showUploadInput,
  onFileChange,
  secondaryButton
}) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-block', width: '100%', textAlign: 'center' }}>
      <Box
        component="img"
        src={imageSrc || 'https://via.placeholder.com/400x300?text=No+Image'}
        alt={buttonText}
        sx={{
          width: '40vw',
          height: '40vh',
          objectFit: 'cover',
          opacity: 0.5
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
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
        {showUploadInput ? (
          <NERButton variant="contained" component="label" sx={{ mt: 1, width: 'auto', color: 'white' }}>
            {buttonText}
            <input onChange={onFileChange} type="file" accept="image/*" hidden />
          </NERButton>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <NERButton variant="contained" onClick={onClick} sx={{ mt: 1, width: 'auto', color: 'white' }}>
              {buttonText}
            </NERButton>
            {secondaryButton && (
              <NERButton
                variant="contained"
                onClick={secondaryButton.onClick}
                color={secondaryButton.color || 'primary'}
                sx={{ mt: 1, width: 'auto', color: 'white' }}
              >
                {secondaryButton.text}
              </NERButton>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ImageWithButton;
