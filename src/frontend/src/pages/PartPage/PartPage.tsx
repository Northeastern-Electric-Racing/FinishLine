import { Box, Typography, Breadcrumbs } from '@mui/material';
import { Part, validateWBS, wbsPipe } from 'shared';
import PageLayout from '../../components/PageLayout';
import { routes } from '../../utils/routes';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { usePartsFromProject, useSinglePart } from '../../hooks/part-review.hooks';
import { useSingleProject } from '../../hooks/projects.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PartActionsMenu from './Components/PartActionsMenu';
import { useEffect, useState } from 'react';
import { useCurrentUser } from '../../hooks/users.hooks';

const PartPage: React.FC = () => {
  interface ParamTypes {
    wbsNum: string;
    indexNum: string;
  }
  const { wbsNum, indexNum } = useParams<ParamTypes>();

  //location and history to maintain url with params for submission and review index
  const location = useLocation();
  const history = useHistory();

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
  const [part, setPart] = useState<Part | null>(null);

  //if the url parameters are not valid, set default values. If they are use those
  useEffect(() => {
    if (!partWithAllReviews) return;
    const searchParams = new URLSearchParams(location.search);

    const submissionParam = searchParams.get('submissionIndex');
    const reviewParam = searchParams.get('reviewIndex');

    //update the part in usage to only include reviews that are either not in progress or made by the current user
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
    setPart(part);

    setSubIndex(part.submissions.length - 1);
    if (part.submissions[part.submissions.length - 1].reviews.length > 0) {
      setReviewIndex(part.submissions[part.submissions.length - 1].reviews.length - 1);
    }

    if (submissionParam !== null) {
      const parsedSubIndex = parseInt(submissionParam);
      if (!isNaN(parsedSubIndex) && parsedSubIndex >= 0 && parsedSubIndex <= part.submissions.length - 1) {
        setSubIndex(parsedSubIndex);
        setReviewIndex(-1);
        if (reviewParam !== null) {
          const parsedReviewIndex = parseInt(reviewParam);
          if (
            !isNaN(parsedReviewIndex) &&
            parsedReviewIndex >= -1 &&
            parsedReviewIndex <= part.submissions[parsedSubIndex].reviews.length - 1
          ) {
            setReviewIndex(parsedReviewIndex);
          }
        }
      }
    }
  }, [partWithAllReviews, location.search, user]);

  if (projectLoading || !project || partLoading || !partWithAllReviews || !part) return <LoadingIndicator />;
  if (projectIsError) return <ErrorPage message={projectError?.message} />;
  if (partIsError) return <ErrorPage message={partError?.message} />;

  //updates the url params
  const updateURL = (newSubIndex: number, newReviewIndex: number) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('submissionIndex', newSubIndex.toString());
    if (newReviewIndex !== -1) {
      searchParams.set('reviewIndex', newReviewIndex.toString());
    } else {
      searchParams.delete('reviewIndex');
    }
    history.replace(`${location.pathname}?${searchParams.toString()}`);
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
