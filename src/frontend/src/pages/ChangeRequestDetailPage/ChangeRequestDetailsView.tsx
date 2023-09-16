/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ReactElement, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  ActivationChangeRequest,
  ChangeRequest,
  ChangeRequestType,
  StageGateChangeRequest,
  StandardChangeRequest,
  isProject
} from 'shared';
import { routes } from '../../utils/routes';
import { datePipe, fullNamePipe, wbsPipe } from '../../utils/pipes';
import ActivationDetails from './ActivationDetails';
import StageGateDetails from './StageGateDetails';
import ImplementedChangesList from './ImplementedChangesList';
import StandardDetails from './StandardDetails';
import ReviewChangeRequest from './ReviewChangeRequest';
import PageBlock from '../../layouts/PageBlock';
import ReviewNotes from './ReviewNotes';
import ProposedSolutionsList from './ProposedSolutionsList';
import { Grid, Typography, Link } from '@mui/material';
import DeleteChangeRequest from './DeleteChangeRequest';
import { useSingleProject } from '../../hooks/projects.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageLayout from '../../components/PageLayout';
import ChangeRequestActionMenu from './ChangeRequestActionMenu';

const buildDetails = (cr: ChangeRequest): ReactElement => {
  switch (cr.type) {
    case ChangeRequestType.Activation:
      return <ActivationDetails cr={cr as ActivationChangeRequest} />;
    case ChangeRequestType.StageGate:
      return <StageGateDetails cr={cr as StageGateChangeRequest} />;
    default:
      return <StandardDetails cr={cr as StandardChangeRequest} />;
  }
};

const buildProposedSolutions = (cr: ChangeRequest): ReactElement => {
  if (cr.type !== ChangeRequestType.Activation && cr.type !== ChangeRequestType.StageGate) {
    return (
      <PageBlock title={'Proposed Solutions'}>
        <ProposedSolutionsList
          proposedSolutions={(cr as StandardChangeRequest).proposedSolutions}
          crReviewed={cr.accepted}
          crId={cr.crId}
        />
      </PageBlock>
    );
  } else {
    return <></>;
  }
};

interface ChangeRequestDetailsProps {
  isUserAllowedToReview: boolean;
  isUserAllowedToImplement: boolean;
  isUserAllowedToDelete: boolean;
  changeRequest: ChangeRequest;
}

const ChangeRequestDetailsView: React.FC<ChangeRequestDetailsProps> = ({
  isUserAllowedToReview,
  isUserAllowedToImplement,
  isUserAllowedToDelete,
  changeRequest
}: ChangeRequestDetailsProps) => {
  const [reviewModalShow, setReviewModalShow] = useState<boolean>(false);
  const handleReviewClose = () => setReviewModalShow(false);
  const handleReviewOpen = () => setReviewModalShow(true);
  const [deleteModalShow, setDeleteModalShow] = useState<boolean>(false);
  const handleDeleteClose = () => setDeleteModalShow(false);
  const handleDeleteOpen = () => setDeleteModalShow(true);
  const {
    data: project,
    isLoading,
    isError,
    error
  } = useSingleProject({
    carNumber: changeRequest.wbsNum.carNumber,
    projectNumber: changeRequest.wbsNum.projectNumber,
    workPackageNumber: 0
  });
  if (isError) return <ErrorPage message={error?.message} />;
  if (!project || isLoading) return <LoadingIndicator />;

  const { name: projectName } = project;

  return (
    <PageLayout
      title={`Change Request #${changeRequest.crId}`}
      previousPages={[{ name: 'Change Requests', route: routes.CHANGE_REQUESTS }]}
      headerRight={
        <ChangeRequestActionMenu
          isUserAllowedToReview={isUserAllowedToReview}
          isUserAllowedToImplement={isUserAllowedToImplement}
          isUserAllowedToDelete={isUserAllowedToDelete}
          changeRequest={changeRequest}
          handleReviewOpen={handleReviewOpen}
          handleDeleteOpen={handleDeleteOpen}
        />
      }
    >
      <PageBlock title={'Change Request Details'} headerRight={<b>{changeRequest.status}</b>}>
        <Grid container spacing={1}>
          <Grid item xs={2}>
            <Typography sx={{ maxWidth: '140px', fontWeight: 'bold' }}>Type: </Typography>
          </Grid>
          <Grid item xs={10}>
            {changeRequest.type}
          </Grid>
          <Grid item xs={2}>
            <Typography sx={{ fontWeight: 'bold' }}>WBS #: </Typography>
          </Grid>
          <Grid item xs={10}>
            <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(changeRequest.wbsNum)}`}>
              {wbsPipe(changeRequest.wbsNum)} - {projectName}
              {isProject(changeRequest.wbsNum) ? '' : ' - ' + changeRequest.wbsName}
            </Link>
          </Grid>
          <Grid item xs={3} md={2}>
            <Typography sx={{ fontWeight: 'bold' }}>Submitted By: </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography>{fullNamePipe(changeRequest.submitter)}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography>{datePipe(changeRequest.dateSubmitted)}</Typography>
          </Grid>
        </Grid>
      </PageBlock>
      {buildDetails(changeRequest)}
      {buildProposedSolutions(changeRequest)}
      <ReviewNotes
        reviewer={changeRequest.reviewer}
        reviewNotes={changeRequest.reviewNotes}
        dateReviewed={changeRequest.dateReviewed}
      />
      <ImplementedChangesList
        changes={changeRequest.implementedChanges || []}
        overallDateImplemented={changeRequest.dateImplemented}
      />
      {reviewModalShow && (
        <ReviewChangeRequest modalShow={reviewModalShow} handleClose={handleReviewClose} cr={changeRequest} />
      )}
      {deleteModalShow && (
        <DeleteChangeRequest modalShow={deleteModalShow} handleClose={handleDeleteClose} cr={changeRequest} />
      )}
    </PageLayout>
  );
};

export default ChangeRequestDetailsView;
