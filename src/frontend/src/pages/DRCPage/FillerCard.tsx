import { Card, CardContent } from '@mui/material';

const FillerCard: React.FC = () => {
  return (
    <Card sx={{ borderRadius: 2, minWidth: 150, maxWidth: 150, minHeight: 90, maxHeight: 90 }}>
      <CardContent></CardContent>
    </Card>
  );
};
export default FillerCard;
