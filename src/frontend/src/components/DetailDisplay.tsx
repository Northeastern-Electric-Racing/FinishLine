/*
 * This file is part of FinishLine by NER and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Typography from '@mui/material/Typography';

interface DetailDisplayProps {
  label: string;
  content: string;
  paddingRight?: number;
}

const DetailDisplay: React.FC<DetailDisplayProps> = ({ label, content, paddingRight = 0 }) => {
  return (
    <div>
      <Typography sx={{ fontWeight: 'bold', paddingRight: paddingRight }} display="inline">
        {label}
        {': '}
      </Typography>
      <Typography sx={{ fontWeight: 'normal', display: 'inline' }}>{content}</Typography>
    </div>
  );
};

export default DetailDisplay;
