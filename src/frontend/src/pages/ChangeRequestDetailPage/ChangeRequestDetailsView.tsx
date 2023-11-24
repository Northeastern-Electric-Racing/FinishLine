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
import { datePipe, fullNamePipe, wbsPipe, projectWbsPipe } from '../../utils/pipes';
import ActivationDetails from './ActivationDetails';
import StageGateDetails from './StageGateDetails';
import ImplementedChangesList from './ImplementedChangesList';
import StandardDetails from './StandardDetails';
import ReviewChangeRequest from './ReviewChangeRequest';
import PageBlock from '../../layouts/PageBlock';
import ReviewNotes from './ReviewNotes';
import ProposedSolutionsList from './ProposedSolutionsList';
import { NERButton } from '../../components/NERButton';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Grid, Menu, MenuItem, Typography, Link, Divider, ListItemIcon } from '@mui/material';
import DeleteChangeRequest from './DeleteChangeRequest';
import EditIcon from '@mui/icons-material/Edit';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { useSingleProject } from '../../hooks/projects.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageLayout from '../../components/PageLayout';

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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dropdownOpen = Boolean(anchorEl);
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

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const unreviewedActionsDropdown = (
    <div>
      <NERButton
        endIcon={<ArrowDropDownIcon style={{ fontSize: 28 }} />}
        variant="contained"
        id="unreviewed-cr-actions-dropdown"
        onClick={handleClick}
      >
        Actions
      </NERButton>
      <Menu open={dropdownOpen} anchorEl={anchorEl} onClose={handleDropdownClose}>
        <MenuItem onClick={handleReviewOpen} disabled={!isUserAllowedToReview}>
          Review
        </MenuItem>
        <Divider />
        <MenuItem disabled={!isUserAllowedToDelete} onClick={handleDeleteOpen}>
          Delete
        </MenuItem>
      </Menu>
    </div>
  );

  const implementCrDropdown = (
    <div>
      <NERButton
        endIcon={<ArrowDropDownIcon style={{ fontSize: 28 }} />}
        variant="contained"
        id="implement-cr-dropdown"
        onClick={handleClick}
      >
        Implement Change Request
      </NERButton>
      <Menu
        open={dropdownOpen}
        anchorEl={anchorEl}
        onClose={handleDropdownClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <MenuItem
          to={`${routes.PROJECTS_NEW}?crId=${changeRequest.crId}&wbs=${projectWbsPipe(changeRequest.wbsNum)}`}
          component={RouterLink}
          onClick={handleDropdownClose}
          disabled={!isUserAllowedToImplement}
        >
          <ListItemIcon>
            <CreateNewFolderIcon fontSize="small" />
          </ListItemIcon>
          Create New Project
        </MenuItem>
        <MenuItem
          component={RouterLink}
          to={`${routes.WORK_PACKAGE_NEW}?crId=${changeRequest.crId}&wbs=${projectWbsPipe(changeRequest.wbsNum)}`}
          disabled={!isUserAllowedToImplement || !isProject(changeRequest.wbsNum)}
          onClick={handleDropdownClose}
        >
          <ListItemIcon>
            <PostAddIcon fontSize="small" />
          </ListItemIcon>
          Create New Work Package
        </MenuItem>
        <MenuItem
          component={RouterLink}
          to={`${routes.PROJECTS}/${wbsPipe(changeRequest.wbsNum)}?crId=${changeRequest.crId}&edit=${true}`}
          disabled={!isUserAllowedToImplement}
          onClick={handleDropdownClose}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit {changeRequest.wbsNum.workPackageNumber === 0 ? 'Project' : 'Work Package'}
        </MenuItem>
      </Menu>
    </div>
  );

  const actionDropdown = changeRequest.accepted ? implementCrDropdown : unreviewedActionsDropdown;

  return (
    <PageLayout
      title={`Change Request #${changeRequest.crId}`}
      previousPages={[{ name: 'Change Requests', route: routes.CHANGE_REQUESTS }]}
      headerRight={actionDropdown}
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
