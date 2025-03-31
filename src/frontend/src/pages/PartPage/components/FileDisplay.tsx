import { Box, Typography } from '@mui/material';
import { Part_Review_Popup } from 'shared';

interface FileDisplayProps {
  fileLink: string;
  popUps: Part_Review_Popup[];
  addPopup: (x: number, y: number, title: string, description: string) => void;
}

const FileDisplay: React.FC<FileDisplayProps> = ({ fileLink, popUps, addPopup }: FileDisplayProps) => {
  return (
    <Box>
      <Typography>{fileLink}</Typography>
      <Typography>{popUps.length}</Typography>
    </Box>
  );
};

export default FileDisplay;
