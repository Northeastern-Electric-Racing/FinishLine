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
  title?: string;
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
const PageBlock: React.FC<PageBlockProps> = ({
  title,
  headerRight,
  children,
  style,
  defaultClosed,
}) => {
  const theme = useTheme();
  const [collapsed, setCollapsed] = useState(defaultClosed);
  return (
    <Card sx={{ my: 2, background: theme.palette.background.paper, ...style }} variant="outlined">
      <CardContent
        sx={
          collapsed
            ? {
                '&:last-child': {
                  paddingBottom: '8px'
                }
              }
            : {}
        }
      >
        {title && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography
              variant="h5"
              onClick={() => {
                setCollapsed(!collapsed);
              }}
              sx={{
                cursor: 'pointer'
              }}
            >
              {collapsed ? (
                <ExpandMoreIcon sx={{ ml: -1, paddingRight: 0.5 }} />
              ) : (
                <ExpandLessIcon sx={{ ml: -1, paddingRight: 0.5 }} />
              )}
              {title}
            </Typography>
            {headerRight}
          </Box>
        )}
        <Collapse in={!collapsed} sx={{ ml: 2 }}>
          {children}
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default PageBlock;
