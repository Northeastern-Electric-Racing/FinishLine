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
              width: '15em',
              height: '6em',
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
            <Typography sx={{ fontWeight: 'bold' }}>{template.templateName}</Typography>
            <Typography>{template.templateNotes}</Typography>
          </Box>
        ))}
      </Box>
    </>
  );
};
