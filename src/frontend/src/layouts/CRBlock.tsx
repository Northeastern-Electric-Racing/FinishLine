/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';

interface CRBlockProps {
  title: string;
}

/**
 * Custom component for a consistent page-building block.
 * @param title The title of the block on the page
 * @param children The children of the block
 */
const CRBlock: React.FC<CRBlockProps> = ({ title, children }) => {
  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography sx={{ fontWeight: 'bold', fontSize: '22px' }}>{title}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography sx={{ fontSize: '15px' }}>{children}</Typography>
      </Grid>
    </Grid>
  );
};

export default CRBlock;
