import React, { useState } from 'react';
import EditFeaturedProjectsForm, { EditFeaturedProjectsFormInput } from './EditFeaturedProjectsForm';
import { useFeaturedProjects, useSetFeaturedProjects } from '../../../hooks/organizations.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { Box, Card, Chip, Typography, useTheme } from '@mui/material';
import { NERButton } from '../../../components/NERButton';
import { useToast } from '../../../hooks/toasts.hooks';
import { projectWbsNamePipe } from '../../../utils/pipes';

const EditFeaturedProjects = () => {
  const { data: featuredProjects, isLoading, isError, error } = useFeaturedProjects();
  const { mutateAsync: setFeaturedProjects, isLoading: setFeaturedProjectsIsLoading } = useSetFeaturedProjects();
  const [isEditMode, setIsEditMode] = useState(false);
  const theme = useTheme();
  const toast = useToast();

  if (isLoading || !featuredProjects || setFeaturedProjectsIsLoading || !setFeaturedProjects) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  const handleClose = () => {
    setIsEditMode(false);
  };

  const onSubmit = async (formInput: EditFeaturedProjectsFormInput) => {
    try {
      await setFeaturedProjects(formInput.featuredProjects);
      toast.success('Featured Projects updated successfully!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    handleClose();
  };

  return (
    <Card
      sx={{
        width: { xs: '100%', md: '50%' },
        background: 'transparent',
        padding: 2,
        ...(isEditMode && {
          background: theme.palette.background.paper,
          padding: 1.9,
          variant: 'outlined'
        })
      }}
      variant={isEditMode ? 'outlined' : undefined}
    >
      <Typography variant="h4" mb={1}>
        Featured Projects
      </Typography>
      {isEditMode ? (
        <EditFeaturedProjectsForm
          featuredProjects={featuredProjects}
          isEditMode={isEditMode}
          onSubmit={onSubmit}
          onHide={handleClose}
        />
      ) : (
        <Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              mt: 1,
              gap: 1.5
            }}
          >
            {featuredProjects.map((project) => (
              <Chip
                label={`${projectWbsNamePipe(project)}`}
                size="medium"
                sx={{
                  fontSize: 20,
                  backgroundColor: '#9b9a9b',
                  fontWeight: 'bold'
                }}
              />
            ))}
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'end'
            }}
          >
            <NERButton variant="contained" sx={{ my: 2 }} onClick={() => setIsEditMode(true)}>
              Update
            </NERButton>
          </Box>
        </Box>
      )}
    </Card>
  );
};

export default EditFeaturedProjects;
