/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { ReactNode } from 'react';
import { SxProps, Theme, useTheme } from '@mui/material';

interface PageBlockProps {
  title: string;
  headerRight?: ReactNode;
  style?: SxProps<Theme>;
}

/**
 * Custom component for a consistent page-building block.
 * @param title The title of the block on the page
 * @param headerRight The optional stuff to display on the right side of the header
 * @param children The children of the pageblock
 * @param style Optional styling for the pageblock
 */
const PageBlock: React.FC<PageBlockProps> = ({ title, headerRight, children, style }) => {
  const theme = useTheme();

  return (
    <Card sx={{ my: 2, background: theme.palette.background.paper, ...style }} variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {headerRight}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
};

export default PageBlock;
