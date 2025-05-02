import { Typography, Breadcrumbs, Grid, Box } from '@mui/material';
import { Part, validateWBS, wbsPipe } from 'shared';
import PageLayout from '../../components/PageLayout';
import { routes } from '../../utils/routes';
import { useParams } from 'react-router-dom';
import { useSinglePart } from '../../hooks/part-review.hooks';
import { useSingleProject } from '../../hooks/projects.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useState } from 'react';
import PDFViewer from './Components/PdfDisplay';
import { useCurrentUser } from '../../hooks/users.hooks';
import PartSubmissionDetails from './Components/PartSubmissionDetails';
import PartPageOverview from './Components/PartPageOverview';
import PartHistoryView from './Components/PartHistoryView';

const PartPage: React.FC = () => {
  interface ParamTypes {
    wbsNum: string;
    indexNum: string;
  }
  const { wbsNum, indexNum } = useParams<ParamTypes>();

  const user = useCurrentUser();

  const {
    data: project,
    isLoading: projectLoading,
    isError: projectIsError,
    error: projectError
  } = useSingleProject(validateWBS(wbsNum));

  const {
    data: partWithAllReviews,
    isLoading: partLoading,
    isError: partIsError,
    error: partError
  } = useSinglePart(wbsNum, parseInt(indexNum));

  const [subIndex, setSubIndex] = useState<number>(0);
  const [reviewIndex, setReviewIndex] = useState<number>(-1);

  if (projectLoading || !project || partLoading || !partWithAllReviews) return <LoadingIndicator />;
  if (projectIsError) return <ErrorPage message={projectError?.message} />;
  if (partIsError) return <ErrorPage message={partError?.message} />;

  const pdfLoadingError = (child: JSX.Element) => {
    return (
      <Box
        sx={{
          width: '75vh',
          height: '75vh',
          border: 2,
          borderColor: 'grey.50',
          overflow: 'hidden',
          position: 'relative',
          bgcolor: 'grey.500'
        }}
      >
        <Box
          style={{
            display: 'grid',
            placeItems: 'center',
            height: '75vh'
          }}
        >
          {child}
        </Box>
      </Box>
    );
  };

  const part: Part = {
    ...partWithAllReviews,
    submissions: partWithAllReviews.submissions.map((sub) => {
      return {
        ...sub,
        review: sub.reviews.filter((review) => {
          return !!review.completedAt || review.userCreated.userId === user.userId;
        })
      };
    })
  };

  const hasNext = () => {
    return !(subIndex === part.submissions.length - 1 && reviewIndex === part.submissions[subIndex].reviews.length - 1);
  };

  const hasPrev = () => {
    return !(subIndex === 0 && reviewIndex === -1);
  };

  const next = () => {
    if (reviewIndex === part.submissions[subIndex].reviews.length - 1) {
      setSubIndex(subIndex + 1);
      setReviewIndex(-1);
    } else {
      setReviewIndex(reviewIndex + 1);
    }
  };

  const prev = () => {
    if (reviewIndex === -1) {
      const temp = subIndex;
      setSubIndex(temp - 1);
      setReviewIndex(part.submissions[temp - 1].reviews.length - 1);
    } else {
      setReviewIndex(reviewIndex - 1);
    }
  };

  const pageTitle = `${project.abbreviation ?? project.name}_${part.commonName}_${part.index.toString().padStart(5, '0')}`;

  return (
    <PageLayout
      title={pageTitle}
      previousPages={[
        { name: 'Projects', route: routes.PROJECTS },
        { name: `${wbsPipe(project.wbsNum)} - ${project.name}`, route: `${routes.PROJECTS}/${wbsNum}` },
        { name: 'Files', route: `${routes.PROJECTS}/${wbsNum}/parts-review` }
      ]}
    >
      <Breadcrumbs sx={{ mb: 2 }}></Breadcrumbs>
      <Grid container px={2} gap={5}>
        <Grid item maxWidth={'50%'}>
          {part.submissions.length === 0 && pdfLoadingError(<Typography>No Submissions Yet</Typography>)}
          {part.submissions.length !== 0 && (
            <PDFViewer
              submission={part.submissions[subIndex]}
              submissionIdx={subIndex}
              review={reviewIndex === -1 ? undefined : part.submissions[subIndex].reviews[reviewIndex]}
              hasNext={hasNext}
              next={next}
              hasPrev={hasPrev}
              prev={prev}
            />
          )}
        </Grid>
        <Grid item maxWidth={'50%'}>
          <PartPageOverview part={part} />
          {part.submissions.length !== 0 && (
            <PartSubmissionDetails submission={part.submissions[subIndex]} reviewIndex={reviewIndex} />
          )}
          <PartHistoryView part={part} />
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default PartPage;
