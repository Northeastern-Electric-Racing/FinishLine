import { Box, Typography } from '@mui/material';
import { useAllProjectTemplates } from '../../../hooks/wbs-templates.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { ProjectTemplate } from 'shared';

interface ProjectTemplateSectionProps {
  selectedProjectTemplate?: ProjectTemplate;
  setSelectedProjectTemplate: (template?: ProjectTemplate) => void;
}

const ProjectTemplateSection: React.FC<ProjectTemplateSectionProps> = ({
  selectedProjectTemplate,
  setSelectedProjectTemplate
}) => {
  const { data: projectTemplates, isLoading, isError, error } = useAllProjectTemplates();

  if (isLoading || !projectTemplates) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return <ErrorPage message={error?.message} />;
  }

  return (
    <>
      <Typography variant="h5">Templates</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', cursor: 'pointer' }}>
        {projectTemplates.map((template) => (
          <Box
            key={template.projectTemplateId}
            onClick={() => {
              if (selectedProjectTemplate?.projectTemplateId === template.projectTemplateId) {
                setSelectedProjectTemplate(undefined);
              } else {
                setSelectedProjectTemplate(template);
              }
            }}
            sx={{
              width: '15em',
              height: '6em',
              borderRadius: '10px',
              backgroundColor: 'transparent',
              border: 1,
              borderColor: selectedProjectTemplate?.projectTemplateId === template.projectTemplateId ? 'red' : 'gray',
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

export default ProjectTemplateSection;
