/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';

interface InfoBlockProps {
  title: string;
}

/**
 * Custom component for a consistent page-building block.
 * @param title The title of the block on the page
 * @param children The children of the block
 */
const InfoBlock: React.FC<InfoBlockProps> = ({ title, children }) => {
  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>{title}</Typography>
      </Grid>
      <Grid item xs={12}>
        {children}
      </Grid>
    </Grid>
  );
};

export default InfoBlock;
