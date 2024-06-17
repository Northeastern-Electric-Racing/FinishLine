import { WorkPackageTemplate } from 'shared';
import { Box, Typography } from '@mui/material';

interface WorkPackageTemplateProps {
  workPackageTemplates: WorkPackageTemplate[];
  currentWorkPackageTemplate?: WorkPackageTemplate;
  setCurrentWorkPackageTemplate: (value: WorkPackageTemplate) => void;
}

export const WorkPackageTemplateSection: React.FC<WorkPackageTemplateProps> = ({
  workPackageTemplates,
  currentWorkPackageTemplate,
  setCurrentWorkPackageTemplate
}: WorkPackageTemplateProps) => {
  return (
    <>
      <Typography variant="h5">Templates</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', cursor: 'pointer' }}>
        {workPackageTemplates.map((template) => (
          <Box
            key={template.workPackageTemplateId}
            onClick={() => {
              setCurrentWorkPackageTemplate(template);
            }}
            sx={{
              width: { xs: '10em', sm: '12em', md: '15em', lg: '18em' },
              height: { xs: '4em', sm: '5em', md: '6em', lg: '7em' },
              borderRadius: '10px',
              backgroundColor: 'transparent',
              border: 1,
              borderColor:
                currentWorkPackageTemplate?.workPackageTemplateId === template.workPackageTemplateId ? 'red' : 'gray',
              borderWidth: 3,
              padding: 1,
              paddingLeft: 2,
              marginRight: 3,
              marginTop: 2,
              marginBottom: 2
            }}
          >
            <Typography sx={{ fontWeight: 'bold', fontSize: { xs: '0.8em', sm: '1em', md: '1.2em', lg: '1.4em' } }}>
              {template.templateName}
            </Typography>
            <Typography sx={{ fontSize: { xs: '0.6em', sm: '0.8em', md: '1em', lg: '1.2em' } }}>
              {template.templateNotes}
            </Typography>
          </Box>
        ))}
      </Box>
    </>
  );
};
