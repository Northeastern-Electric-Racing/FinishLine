/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import ProjectDetailCard from '../../components/ProjectDetailCard';
import { Box, Grid, Typography } from '@mui/material';
import { Project } from 'shared';
import { useState } from 'react';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface ProjectsOverviewCardsProps {
  projects: Project[];
  title: string;
  favoriteProjectsSet: Set<string>;
  emptyMessage?: string;
}

const ProjectsOverviewCards: React.FC<ProjectsOverviewCardsProps> = ({
  projects,
  title,
  favoriteProjectsSet,
  emptyMessage
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 2 }}>
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
      </Box>
      {emptyMessage && !projects.length ? (
        <Typography sx={{ mt: 2 }}>{emptyMessage}</Typography>
      ) : (
        !collapsed && (
          <Grid
            container
            spacing={3}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              overflow: 'auto',
              justifyContent: 'flex-start'
            }}
          >
            {projects
              .sort((a, b) => {
                const aEndDate = a.endDate?.getTime() || Number.MAX_SAFE_INTEGER;
                const bEndDate = b.endDate?.getTime() || Number.MAX_SAFE_INTEGER;
                return aEndDate - bEndDate;
              })
              .map((project) => (
                <Grid item>
                  <ProjectDetailCard project={project} projectIsFavorited={favoriteProjectsSet.has(project.id)} />
                </Grid>
              ))}
          </Grid>
        )
      )}
    </>
  );
};

export default ProjectsOverviewCards;
