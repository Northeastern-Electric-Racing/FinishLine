/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { ReactNode } from 'react';
import { useTheme } from '@mui/material';

interface PageBlockProps {
  title: string;
  headerRight?: ReactNode;
  cardContainerStyle?: string;
  cardBodyStyle?: string;
}

/**
 * Custom component for a consistent page-building block.
 * @param title The title of the block on the page
 * @param headerRight The optional stuff to display on the right side of the header
 * @param cardContainerStyle Can be used to override the default card container style
 */
const PageBlock: React.FC<PageBlockProps> = ({ title, headerRight, children }) => {
  const theme = useTheme();

  return (
    <Card sx={{ my: 2, background: theme.palette.background.paper }} variant="outlined">
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
