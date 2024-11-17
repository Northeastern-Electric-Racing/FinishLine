/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 *
 */

import { ListItem, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Box, Card, Grid, List } from '@mui/material';
import React from 'react';

const QuestionsSection: React.FC = () => {
  const theme = useTheme();

  return (
    <Card sx={{ my: 2, background: theme.palette.background.paper }}>
      <Box sx={{ mt: 2, ml: 2 }}>
        <Typography variant="h5">Questions?</Typography>
        <Grid item xs={6} md={6}>
          <Typography sx={{ mt: 1, mb: -1 }}>Feel free to contact:</Typography>
          <List sx={{ listStyleType: 'disc', pl: 2 }}>
            <ListItem sx={{ display: 'list-item', padding: 0 }}>President - Catherine Kennedy (email)</ListItem>
            <ListItem sx={{ display: 'list-item', padding: 0 }}>Chief Mechanical Engineer - Sofia Varner (email)</ListItem>
            <ListItem sx={{ display: 'list-item', padding: 0 }}>Chief Software Engineer - Reid Chandler (email)</ListItem>
          </List>
        </Grid>
      </Box>
    </Card>
  );
};

export default QuestionsSection;
