/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';
import { ReactNode } from 'react';

interface InfoBlockProps {
  title: string;
  icon?: ReactNode;
}

/**
 * Custom component for a consistent page-building block.
 * @param title The title of the block on the page
 * @param children The children of the block
 */
const InfoBlock: React.FC<InfoBlockProps> = ({ title, icon, children }) => {
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} display="flex" gap="5px" alignItems="center">
        <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>{title}</Typography>
        {icon}
      </Grid>
      <Grid item xs={12}>
        {children}
      </Grid>
    </Grid>
  );
};

export default InfoBlock;
