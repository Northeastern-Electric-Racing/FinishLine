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
  StandardChangeRequest
} from 'shared';
import { routes } from '../../utils/routes';
import { datePipe, fullNamePipe, wbsPipe, projectWbsPipe } from '../../utils/pipes';
import ActivationDetails from './ActivationDetails';
import StageGateDetails from './StageGateDetails';
import ImplementedChangesList from './ImplementedChangesList';
import StandardDetails from './StandardDetails';
import ReviewChangeRequest from './ReviewChangeRequest';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import PageBlock from '../../layouts/PageBlock';
import ReviewNotes from './ReviewNotes';
import ProposedSolutionsList from './ProposedSolutionsList';
import { NERButton } from '../../components/NERButton';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Grid, Menu, MenuItem, Typography, Link } from '@mui/material';

const convertStatus = (cr: ChangeRequest): string => {
  if (cr.dateImplemented) {
    return 'Implemented';
  }
  if (cr.dateReviewed && cr.accepted) {
    return 'Accepted';
  }
  if (cr.dateReviewed && !cr.accepted) {
    return 'Denied';
  }
  return 'Open';
};

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
  changeRequest: ChangeRequest;
}

const ChangeRequestDetailsView: React.FC<ChangeRequestDetailsProps> = ({
  isUserAllowedToReview,
  isUserAllowedToImplement,
  changeRequest
}: ChangeRequestDetailsProps) => {
  const [modalShow, setModalShow] = useState<boolean>(false);
  const handleClose = () => setModalShow(false);
  const handleOpen = () => setModalShow(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dropdownOpen = Boolean(anchorEl);

  const reviewBtn = (
    <NERButton variant="contained" onClick={handleOpen} disabled={!isUserAllowedToReview}>
      Review
    </NERButton>
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

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
      <Menu open={dropdownOpen} anchorEl={anchorEl} onClose={handleDropdownClose}>
        <MenuItem
          component={RouterLink}
          to={routes.PROJECTS_NEW}
          onClick={handleDropdownClose}
          disabled={!isUserAllowedToImplement}
        >
          Create New Project
        </MenuItem>
        <MenuItem
          component={RouterLink}
          to={`${routes.WORK_PACKAGE_NEW}?crId=${changeRequest.crId}&wbs=${projectWbsPipe(changeRequest.wbs.wbsNum)}`}
          disabled={!isUserAllowedToImplement}
          onClick={handleDropdownClose}
        >
          Create New Work Package
        </MenuItem>
        <MenuItem
          component={RouterLink}
          to={`${routes.PROJECTS}/${wbsPipe(changeRequest.wbs.wbsNum)}?crId=${changeRequest.crId}&edit=${true}`}
          disabled={!isUserAllowedToImplement}
          onClick={handleDropdownClose}
        >
          Edit {changeRequest.wbs.wbsNum.workPackageNumber === 0 ? 'Project' : 'Work Package'}
        </MenuItem>
      </Menu>
    </div>
  );

  let actionDropdown = <></>;
  if (changeRequest.accepted === undefined) actionDropdown = reviewBtn;
  if (changeRequest.accepted!) actionDropdown = implementCrDropdown;

  return (
    <>
      <PageTitle
        title={`Change Request #${changeRequest.crId}`}
        previousPages={[{ name: 'Change Requests', route: routes.CHANGE_REQUESTS }]}
        actionButton={actionDropdown}
      />
      <PageBlock title={'Change Request Details'} headerRight={<b>{convertStatus(changeRequest)}</b>}>
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
            <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(changeRequest.wbs.wbsNum)}`}>
              {wbsPipe(changeRequest.wbs.wbsNum)}
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
      {modalShow && <ReviewChangeRequest modalShow={modalShow} handleClose={handleClose} cr={changeRequest} />}
    </>
  );
};

export default ChangeRequestDetailsView;
