import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

interface DownloadButtonProps {
  blob: Blob;
  filename?: string;
  mimeType?: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ blob, filename = 'download' }) => {
  const handleDownload = () => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      sx={{
        borderRadius: 1,
        maxWidth: 'fit-content'
      }}
    >
      <Tooltip title={`Download ${filename}`}>
        <IconButton
          onClick={handleDownload}
          aria-label="download file"
          sx={{
            color: 'white',
            padding: 0,
            mr: 2,
            backgroundColor: '#333',
            borderRadius: '50%',
            width: '2rem',
            height: '2rem',
            '&:hover': {
              backgroundColor: '#444'
            }
          }}
        >
          <DownloadIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default DownloadButton;
