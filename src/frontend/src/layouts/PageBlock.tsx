/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ReactNode, useState } from 'react';
import { SxProps, Theme, useTheme } from '@mui/material';

interface PageBlockProps {
  title: string;
  headerRight?: ReactNode;
  style?: SxProps<Theme>;
  defaultClosed?: boolean;
}

/**
 * Custom component for a consistent page-building block.
 * @param title The title of the block on the page
 * @param headerRight The optional stuff to display on the right side of the header
 * @param children The children of the pageblock
 * @param style Optional styling for the pageblock
 * @param defaultClosed Sets the pageblock to be closed (collapsed) by default.
 */
const PageBlock: React.FC<PageBlockProps> = ({ title, headerRight, children, style, defaultClosed }) => {
  const theme = useTheme();
  const [collapsed, setCollapsed] = useState(defaultClosed);

  return (
    <Card sx={{ my: 2, background: theme.palette.background.paper, ...style }} variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'row', mb: 1 }}>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {headerRight}
          {collapsed ? (
            <ExpandMoreIcon sx={{ ml: 2 }} onClick={() => setCollapsed(false)} />
          ) : (
            <ExpandLessIcon sx={{ ml: 2 }} onClick={() => setCollapsed(true)} />
          )}
        </Box>
        <Collapse in={!collapsed}>{children}</Collapse>
      </CardContent>
    </Card>
  );
};

export default PageBlock;
