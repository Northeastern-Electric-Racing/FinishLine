/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 *
 */

import { ListItem, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Box, Card, List } from '@mui/material';
import React from 'react';

const QuestionsBlock: React.FC = () => {
  const theme = useTheme();

  return (
    <Card sx={{ background: theme.palette.background.paper, borderRadius: '10px' }}>
      <Box margin={2}>
        <Typography variant="h5">Questions?</Typography>
        <Typography sx={{ mt: 1, mb: -1 }}>Feel free to contact:</Typography>
        <List sx={{ listStyleType: 'disc', pl: 2 }}>
          <ListItem sx={{ display: 'list-item', padding: 0 }}>President - Catherine Kennedy (email)</ListItem>
          <ListItem sx={{ display: 'list-item', padding: 0 }}>Chief Mechanical Engineer - Sofia Varner (email)</ListItem>
          <ListItem sx={{ display: 'list-item', padding: 0 }}>Chief Software Engineer - Reid Chandler (email)</ListItem>
        </List>
      </Box>
    </Card>
  );
};

export default QuestionsBlock;
