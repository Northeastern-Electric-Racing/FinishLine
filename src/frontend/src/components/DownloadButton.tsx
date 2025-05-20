import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useDownloadFile } from '../hooks/part-review.hooks';

interface DownloadButtonProps {
  fileId: string;
  filename: string;
  stopPropagation?: boolean;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ fileId, filename = 'download', stopPropagation = false }) => {
  const { data: blobData } = useDownloadFile(fileId);

  const handleDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!blobData) return;
    const url = URL.createObjectURL(blobData);
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
