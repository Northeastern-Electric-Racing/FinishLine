import { Box, Typography, Breadcrumbs } from '@mui/material';
import { validateWBS, wbsPipe } from 'shared';
import PageLayout from '../../components/PageLayout';
import { routes } from '../../utils/routes';
import { useParams } from 'react-router-dom';
import { usePartsFromProject, useSinglePart } from '../../hooks/part-review.hooks';
import { useSingleProject } from '../../hooks/projects.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PartActionsMenu from './Components/PartActionsMenu';

const PartPage: React.FC = () => {
  interface ParamTypes {
    wbsNum: string;
    indexNum: string;
  }
  const { wbsNum, indexNum } = useParams<ParamTypes>();

  const {
    data: project,
    isLoading: projectLoading,
    isError: projectIsError,
    error: projectError
  } = useSingleProject(validateWBS(wbsNum));

  const {
    data: part,
    isLoading: partLoading,
    isError: partIsError,
    error: partError
  } = useSinglePart(wbsNum, parseInt(indexNum));

  if (projectLoading || !project || partLoading || !part) return <LoadingIndicator />;
  if (projectIsError) return <ErrorPage message={projectError?.message} />;
  if (partIsError) return <ErrorPage message={partError?.message} />;

  const pageTitle = `${project.abbreviation ?? project.name}_${part.commonName}_${part.index.toString().padStart(5, '0')}`;

  return (
    <PageLayout
      title={pageTitle}
      previousPages={[
        { name: 'Projects', route: routes.PROJECTS },
        { name: `${wbsPipe(project.wbsNum)} - ${project.name}`, route: `${routes.PROJECTS}/${wbsNum}` },
        { name: 'Files', route: `${routes.PROJECTS}/${wbsNum}/parts-review` }
      ]}
      // headerRight={<PartActionsMenu part={part} partsInProject={} wbsNum={wbsNum} />}
    >
      <Box>
        <Typography>Part: {part.commonName}</Typography>
        <Typography>Number of submissions: {part.submissions.length}</Typography>
        <Breadcrumbs sx={{ mb: 2 }}></Breadcrumbs>
      </Box>
    </PageLayout>
  );
};

export default PartPage;
