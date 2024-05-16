/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Project } from 'shared';
import { Box, Typography } from '@mui/material';

const styles = {
  bulletList: {
    paddingLeft: '35px',
    marginBottom: '0em'
  }
};

export const ScopeTab = ({ project }: { project: Project }) => {
  const descriptionBullets = project.descriptionBullets.map((bullet, index) => <li key={index}>{bullet}</li>);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', mt: 2 }}>
      <Box width="50%">
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography
              variant="h5"
              sx={{
                cursor: 'pointer'
              }}
            >
              Description Bullets
            </Typography>
          </Box>
          <ul style={styles.bulletList}>{descriptionBullets}</ul>
        </Box>
      </Box>
    </Box>
  );
};
