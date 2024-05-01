import React from 'react';
import { Typography } from '@mui/material';
import { useEditWorkPackageTemplate } from '../../hooks/work-packages.hooks';
import { WorkPackageTemplateApiInputs } from '../../apis/work-packages.api';

const Home = () => {
  const { mutateAsync } = useEditWorkPackageTemplate("32"); 

  const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
    try {
      const payload: WorkPackageTemplateApiInputs = {
        templateName: 'Example Template Name',
        templateNotes: 'Example Template Notes',
        duration: 7,
        stage: null,
        blockedBy: [],
        expectedActivities: [],
        deliverables: [],
        workPackageName: 'Example Work Package Name',
      };

      await mutateAsync(payload); 
    } catch (error) {
      console.error('Error editing work package template:', error);
    }
  };

  return (
    <div>
      <Typography variant="h3" marginLeft="auto" sx={{ marginTop: 2, textAlign: 'center', pt: 3, padding: 0 }}>
        Welcome!
      </Typography>
      <button onClick={handleClick}>Edit Work Package Template</button>
    </div>
  );
};

export default Home;
