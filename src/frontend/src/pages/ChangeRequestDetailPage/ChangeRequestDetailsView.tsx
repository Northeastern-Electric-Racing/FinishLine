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
  DescriptionBullet,
  StageGateChangeRequest,
  StandardChangeRequest,
  isProject
} from 'shared';
import { routes } from '../../utils/routes';
import { datePipe, fullNamePipe, wbsPipe } from '../../utils/pipes';
import ActivationDetails from './ActivationDetails';
import ImplementedChangesList from './ImplementedChangesList';
import StandardDetails from './StandardDetails';
import ReviewChangeRequest from './ReviewChangeRequest';
import ReviewNotes from './ReviewNotes';
import ProposedSolutionsList from './ProposedSolutionsList';
import { Grid, Typography, Link, Box } from '@mui/material';
import DeleteChangeRequest from './DeleteChangeRequest';
import { useSingleProject } from '../../hooks/projects.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageLayout from '../../components/PageLayout';
import ChangeRequestActionMenu from './ChangeRequestActionMenu';
import OtherChangeRequestsPopupTabs from './OtherChangeRequestsPopupTabs';
import ChangeRequestTypePill from '../../components/ChangeRequestTypePill';
import ChangeRequestStatusPill from '../../components/ChangeRequestStatusPill';
import NERTabs from '../../components/Tabs';

const buildDetails = (cr: ChangeRequest): ReactElement => {
  switch (cr.type) {
    case ChangeRequestType.Activation:
      return <ActivationDetails cr={cr as ActivationChangeRequest} />;
    case ChangeRequestType.StageGate:
      return <></>;
    default:
      return <StandardDetails cr={cr as StandardChangeRequest} />;
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
  const [tabIndex, setTabIndex] = useState<number>(0);
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

  const isStandard =
    changeRequest.type !== ChangeRequestType.Activation && changeRequest.type !== ChangeRequestType.StageGate;

  const isActivation = changeRequest.type === ChangeRequestType.Activation;

  console.log((changeRequest as StandardChangeRequest).projectProposedChanges);

  interface BulletListProps {
    bullets?: DescriptionBullet[]; // Make bullets optional
  }

  const BulletList: React.FC<BulletListProps> = ({ bullets }) => {
    if (!bullets) return null; // Return null if bullets is undefined

    return (
      <ul style={{ paddingLeft: '25px', marginBottom: '0.5em' }}>
        {bullets
          .filter((bullet) => !bullet.dateDeleted)
          .map((bullet, idx) => (
            <li key={idx}>{bullet.detail}</li>
          ))}
      </ul>
    );
  };

  interface PotentialChange {
    field: String;
    content: String | DescriptionBullet;
  }

  const compareFields = (first: PotentialChange, second: PotentialChange, original: boolean) => {
    if (first.field === second.field && first.content.toString() === second.content.toString()) {
      return <Typography>{/*{first.field}: {first.content}*/}hf</Typography>;
    } else if (!original) {
      return (
        <Box sx={{ backgroundColor: '#8a4e4e', borderRadius: '5px' }}>
          <Box
            sx={{ backgroundColor: '#ba5050', borderRadius: '5px', width: 'fit-content' }}
            component="span"
            display="inline"
          >
            <Typography fontWeight="bold" padding="3px" display="inline">
              {first.field}:
            </Typography>
          </Box>
          <Box component="span" display="inline">
            <Typography padding="5px" display="inline">
              {first.content}
            </Typography>
          </Box>
        </Box>
      );
    } else {
      return (
        <Box sx={{ backgroundColor: '#51915c', borderRadius: '5px' }}>
          <Box
            sx={{ backgroundColor: '#43a854', borderRadius: '5px', width: 'fit-content' }}
            component="span"
            display="inline"
          >
            <Typography fontWeight="bold" padding="3px" display="inline">
              {second.field}:
            </Typography>
          </Box>
          <Box component="span" display="inline">
            <Typography padding="5px" display="inline">
              {second.content}
            </Typography>
          </Box>
        </Box>
      );
    }
  };

  return (
    <PageLayout
      title={`Change Request #${changeRequest.crId}`}
      chips={
        <Box display="flex" gap="20px">
          <ChangeRequestTypePill type={changeRequest.type} />
          <ChangeRequestStatusPill status={changeRequest.status} />
        </Box>
      }
      tabs={
        <NERTabs
          setTab={setTabIndex}
          tabsLabels={[
            { tabUrlValue: 'details', tabName: 'Details' },
            { tabUrlValue: 'proposedChanges', tabName: 'Proposed Changes' }
          ]}
          baseUrl={`${routes.CHANGE_REQUESTS}/${changeRequest.crId}`}
          defaultTab="details"
          id="change-review-tabs"
        />
      }
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
      {tabIndex === 0 ? (
        <Grid container rowGap={3}>
          <Grid container columnSpacing={3}>
            <Grid item xs={'auto'}>
              <Typography sx={{ fontWeight: 'normal', fontSize: '21px' }}>
                <b>WBS: </b>
                <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(changeRequest.wbsNum)}`}>
                  {wbsPipe(changeRequest.wbsNum)} - {projectName}
                  {isProject(changeRequest.wbsNum) ? '' : ' - ' + changeRequest.wbsName}
                </Link>
              </Typography>
            </Grid>
            <Grid item xs={'auto'}>
              <Typography sx={{ fontWeight: 'normal', fontSize: '21px' }}>
                <b>Submitter: </b>
                {fullNamePipe(changeRequest.submitter)} on {datePipe(changeRequest.dateSubmitted)}
              </Typography>
            </Grid>
          </Grid>
          <Grid container rowSpacing={2}>
            <Grid container item xs={12} md={isStandard ? 7 : isActivation ? 6 : 12} height={'fit-content'}>
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
            <Grid item xs={isStandard ? 12 : 0} md={isStandard ? 5 : 0}>
              {isStandard && (
                <ProposedSolutionsList
                  proposedSolutions={(changeRequest as StandardChangeRequest).proposedSolutions}
                  crReviewed={changeRequest.accepted}
                  crId={changeRequest.crId}
                />
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
      ) : (
        <Grid container columnSpacing={4}>
          {/*show previous fields*/}
          <Grid item xs={6}>
            <Box sx={{ backgroundColor: '#2C2C2C', borderRadius: '10px', padding: 1.4, mb: 3 }}>
              <Typography>Name: {changeRequest.wbsName}</Typography>
              <Typography>
                {compareFields(
                  {
                    field: 'Status',
                    content: `${changeRequest.status}`
                  },
                  {
                    field: 'Status',
                    content: `${(changeRequest as StandardChangeRequest).projectProposedChanges?.status}`
                  },
                  false
                )}
              </Typography>
              <Typography>Project Lead: {changeRequest.status}</Typography>
              <Typography>Project Manager: {changeRequest.wbsName}</Typography>
            </Box>
          </Grid>
          {/*show fields of proposed changes*/}
          <Grid item xs={6}>
            <Box sx={{ backgroundColor: '#2C2C2C', borderRadius: '10px', padding: 1.4, mb: 3 }}>
              <Typography>Name: {changeRequest.wbsName}</Typography>
              <Typography>
                {compareFields(
                  {
                    field: 'Status',
                    content: `${changeRequest.status}`
                  },
                  {
                    field: 'Status',
                    content: `${(changeRequest as StandardChangeRequest).projectProposedChanges?.status}`
                  },
                  true
                )}
              </Typography>
              <Typography>
                Project Lead: {(changeRequest as StandardChangeRequest).projectProposedChanges?.projectLead?.firstName}{' '}
                {(changeRequest as StandardChangeRequest).projectProposedChanges?.projectLead?.lastName}
              </Typography>
              <Typography>
                Project Manager: {(changeRequest as StandardChangeRequest).projectProposedChanges?.projectManager?.firstName}{' '}
                {(changeRequest as StandardChangeRequest).projectProposedChanges?.projectManager?.lastName}
              </Typography>
              <Typography>Budget: ${(changeRequest as StandardChangeRequest).projectProposedChanges?.budget}</Typography>
              <Typography>Summary: {(changeRequest as StandardChangeRequest).projectProposedChanges?.summary}</Typography>
              <Typography>
                Goals: <BulletList bullets={(changeRequest as StandardChangeRequest).projectProposedChanges?.goals} />
              </Typography>
              <Typography>
                Features:
                <BulletList bullets={(changeRequest as StandardChangeRequest).projectProposedChanges?.features} />
              </Typography>

              <Typography>
                Teams:{' '}
                {(changeRequest as StandardChangeRequest).projectProposedChanges?.teams.map((team, index, array) => (
                  <>
                    {team.teamName}
                    {index !== array.length - 1 && ', '}
                  </>
                ))}
              </Typography>

              <Typography>
                Constraints:
                <BulletList bullets={(changeRequest as StandardChangeRequest).projectProposedChanges?.otherConstrains} />
              </Typography>

              {/* */}
              <Typography>
                Start Date: {(changeRequest as StandardChangeRequest).workPackageProposedChanges?.startDate.toDateString}
              </Typography>
              <Typography>
                Duration: {(changeRequest as StandardChangeRequest).workPackageProposedChanges?.duration} weeks
              </Typography>
              <Typography>
                Blocked By:{' '}
                {(changeRequest as StandardChangeRequest).workPackageProposedChanges?.blockedBy.map((wbs, index, array) => (
                  <>
                    {wbs.workPackageNumber}
                    {index !== array.length - 1 && ', '}
                  </>
                ))}
              </Typography>
              <Typography>Stage: {(changeRequest as StandardChangeRequest).workPackageProposedChanges?.stage}</Typography>
            </Box>
          </Grid>
        </Grid>
      )}
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
