/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ReactElement, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  ActivationChangeRequest,
  BudgetChangeRequest,
  ChangeRequest,
  ChangeRequestType,
  StandardChangeRequest
} from 'shared';
import { routes } from '../../utils/routes';
import { datePipe, displayEnum, fullNamePipe, wbsPipe } from '../../utils/pipes';
import ActivationDetails from './ActivationDetails';
import ImplementedChangesList from './ImplementedChangesList';
import StandardDetails from './StandardDetails';
import ReviewChangeRequest from './ReviewChangeRequest';
import ReviewNotes from './ReviewNotes';
import { Grid, Typography, Link, Box } from '@mui/material';
import DeleteChangeRequest from './DeleteChangeRequest';
import PageLayout from '../../components/PageLayout';
import ChangeRequestActionMenu from './ChangeRequestActionMenu';
import OtherChangeRequestsPopupTabs from './OtherChangeRequestsPopupTabs';
import ChangeRequestTypePill from '../../components/ChangeRequestTypePill';
import ChangeRequestStatusPill from '../../components/ChangeRequestStatusPill';
import DiffSection from './DiffSection/DiffSection';
import { hasProposedChanges } from '../../utils/change-request.utils';
import BudgetDetails from './BudgetDetails';

const buildDetails = (cr: ChangeRequest): ReactElement => {
  switch (cr.type) {
    case ChangeRequestType.Activation:
      return <ActivationDetails cr={cr as ActivationChangeRequest} />;
    case ChangeRequestType.StageGate:
      return <></>;
    case ChangeRequestType.Budget:
      return <BudgetDetails budgetChangeRequest={cr as BudgetChangeRequest} />;
    case ChangeRequestType.Leadership:
      return <></>;
    default:
      return <StandardDetails cr={cr as StandardChangeRequest} />;
  }
};
interface ChangeRequestDetailsProps {
  isUserAllowedToReview: boolean;
  reviewDisabledTooltip?: string;
  isUserAllowedToImplement: boolean;
  isUserAllowedToDelete: boolean;
  changeRequest: ChangeRequest;
}

const ChangeRequestDetailsView: React.FC<ChangeRequestDetailsProps> = ({
  isUserAllowedToReview,
  reviewDisabledTooltip,
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

  const isStandard =
    changeRequest.type !== ChangeRequestType.Activation &&
    changeRequest.type !== ChangeRequestType.StageGate &&
    changeRequest.type !== ChangeRequestType.Budget &&
    changeRequest.type !== ChangeRequestType.Leadership;

  const isActivation = changeRequest.type === ChangeRequestType.Activation;

  return (
    <PageLayout
      title={`Change Request #${changeRequest.identifier}`}
      chips={
        <Box display="flex" gap="20px">
          <ChangeRequestTypePill type={changeRequest.type} />
          <ChangeRequestStatusPill status={changeRequest.status} />
        </Box>
      }
      previousPages={[{ name: 'Change Requests', route: routes.CHANGE_REQUESTS }]}
      headerRight={
        <ChangeRequestActionMenu
          isUserAllowedToReview={isUserAllowedToReview}
          reviewDisabledTooltip={reviewDisabledTooltip}
          isUserAllowedToImplement={isUserAllowedToImplement}
          isUserAllowedToDelete={isUserAllowedToDelete}
          changeRequest={changeRequest}
          handleReviewOpen={handleReviewOpen}
          handleDeleteOpen={handleDeleteOpen}
        />
      }
    >
      <Grid container rowGap={3}>
        <Grid container columnSpacing={3}>
          <Grid item xs={'auto'}>
            {changeRequest.wbsNum && (
              <Typography sx={{ fontWeight: 'normal', fontSize: '21px' }}>
                <b>WBS: </b>
                <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(changeRequest.wbsNum)}`}>
                  {changeRequest.wbsName}
                </Link>
              </Typography>
            )}
            {changeRequest.category && (
              <Typography sx={{ fontWeight: 'normal', fontSize: '21px' }}>
                <b>Category: </b>
                {displayEnum(changeRequest.category.name)}
              </Typography>
            )}
            {changeRequest.accountCode && (
              <Typography sx={{ fontWeight: 'normal', fontSize: '21px' }}>
                <b>Account Code: </b>
                {`${changeRequest.accountCode.code} - ${changeRequest.accountCode.name}`}
              </Typography>
            )}
          </Grid>
          <Grid item xs={'auto'}>
            <Typography sx={{ fontWeight: 'normal', fontSize: '21px' }}>
              <b>Submitter: </b>
              {fullNamePipe(changeRequest.submitter)} on {datePipe(changeRequest.dateSubmitted)}
            </Typography>
          </Grid>
        </Grid>
        <Grid container rowSpacing={2}>
          <Grid container item xs={12} md={isStandard ? 5 : isActivation ? 6 : 12} height={'fit-content'}>
            {buildDetails(changeRequest)}

            <Grid item xs={12} md={isStandard ? 12 : isActivation ? 12 : 5} height={'fit-content'}>
              <ReviewNotes
                reviewer={changeRequest.reviewer}
                reviewNotes={changeRequest.reviewNotes}
                dateReviewed={changeRequest.dateReviewed}
              />
            </Grid>
            <Grid item md={isStandard ? 12 : isActivation ? 0 : 6} sx={{ mt: { xs: 2, md: isStandard ? 2 : 0 } }}>
              {!isActivation && (
                <ImplementedChangesList
                  changes={changeRequest.implementedChanges || []}
                  overallDateImplemented={changeRequest.dateImplemented}
                />
              )}
            </Grid>
          </Grid>
          <Grid item xs={isStandard ? 12 : 0} md={isStandard ? 7 : 0}>
            {hasProposedChanges(changeRequest as StandardChangeRequest) && (
              <DiffSection changeRequest={changeRequest as StandardChangeRequest} />
            )}
          </Grid>

          <Grid item xs={isActivation ? 12 : 0} md={isActivation ? 6 : 0}>
            {isActivation && (
              <ImplementedChangesList
                changes={changeRequest.implementedChanges || []}
                overallDateImplemented={changeRequest.dateImplemented}
              />
            )}
          </Grid>
        </Grid>
      </Grid>

      {reviewModalShow && (
        <ReviewChangeRequest modalShow={reviewModalShow} handleClose={handleReviewClose} cr={changeRequest} />
      )}
      {deleteModalShow && (
        <DeleteChangeRequest modalShow={deleteModalShow} handleClose={handleDeleteClose} cr={changeRequest} />
      )}
      <OtherChangeRequestsPopupTabs changeRequest={changeRequest} />
    </PageLayout>
  );
};

export default ChangeRequestDetailsView;
