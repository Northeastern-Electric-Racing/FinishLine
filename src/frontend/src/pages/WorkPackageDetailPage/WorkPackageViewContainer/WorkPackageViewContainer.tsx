/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation, useRouteMatch } from 'react-router-dom';
import { isGuest, WbsElementStatus, WorkPackage } from 'shared';
import { wbsPipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';
import ActivateWorkPackageModalContainer from '../ActivateWorkPackageModalContainer/ActivateWorkPackageModalContainer';
import WorkPackageDetails from './WorkPackageDetails';
import ChangesList from '../../../components/ChangesList';
import PageTitle from '../../../layouts/PageTitle/PageTitle';
import StageGateWorkPackageModalContainer from '../StageGateWorkPackageModalContainer/StageGateWorkPackageModalContainer';
import CheckList from '../../../components/CheckList';
import { NERButton } from '../../../components/NERButton';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Menu, MenuItem, Tab, Tabs } from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import EditIcon from '@mui/icons-material/Edit';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import Delete from '@mui/icons-material/Delete';
import DeleteWorkPackage from '../DeleteWorkPackageModalContainer/DeleteWorkPackage';
import { useCurrentUser } from '../../../hooks/users.hooks';

interface WorkPackageViewContainerProps {
  workPackage: WorkPackage;
  enterEditMode: () => void;
  allowEdit: boolean;
  allowActivate: boolean;
  allowStageGate: boolean;
  allowRequestChange: boolean;
  allowDelete: boolean;
}

const WorkPackageViewContainer: React.FC<WorkPackageViewContainerProps> = ({
  workPackage,
  enterEditMode,
  allowEdit,
  allowActivate,
  allowStageGate,
  allowRequestChange,
  allowDelete
}) => {
  const user = useCurrentUser();
  const [showActivateModal, setShowActivateModal] = useState<boolean>(false);
  const [showStageGateModal, setShowStageGateModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dropdownOpen = Boolean(anchorEl);
  const tabUrlValues = useMemo(() => ['overview', 'scope', 'changes'], []);

  const match = useRouteMatch<{ wbsNum: string; tabValueString: string }>(`${routes.PROJECTS}/:wbsNum/:tabValueString`);
  const tabValueString = match?.params?.tabValueString;
  const wbsNum = wbsPipe(workPackage.wbsNum);

  // Default to the "overview" tab
  const initialTab: number = tabUrlValues.indexOf(tabValueString ?? 'overview');
  const [tabValue, setTabValue] = useState<number>(initialTab);

  // Change tab when the browser forward/back button is pressed
  const { pathname } = useLocation();
  useEffect(() => {
    const newTabValue: number = tabUrlValues.indexOf(tabValueString ?? 'overview');
    setTabValue(newTabValue);
  }, [pathname, setTabValue, tabUrlValues, tabValueString]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue);
  };

  const checkListDisabled = workPackage.status !== WbsElementStatus.Active || isGuest(user.role);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const handleClickEdit = () => {
    enterEditMode();
    handleDropdownClose();
  };

  const handleClickActivate = () => {
    setShowActivateModal(true);
    handleDropdownClose();
  };

  const handleClickStageGate = () => {
    setShowStageGateModal(true);
    handleDropdownClose();
  };

  const handleClickDelete = () => {
    setShowDeleteModal(true);
    handleDropdownClose();
  };

  const editButton = (
    <MenuItem onClick={handleClickEdit} disabled={!allowEdit}>
      <ListItemIcon>
        <EditIcon fontSize="small" />
      </ListItemIcon>
      Edit
    </MenuItem>
  );
  const activateButton = (
    <MenuItem onClick={handleClickActivate} disabled={!allowActivate}>
      <ListItemIcon>
        <KeyboardDoubleArrowUpIcon fontSize="small" />
      </ListItemIcon>
      Activate
    </MenuItem>
  );
  const stageGateButton = (
    <MenuItem onClick={handleClickStageGate} disabled={!allowStageGate}>
      <ListItemIcon>
        <DoneOutlineIcon fontSize="small" />
      </ListItemIcon>
      Stage Gate
    </MenuItem>
  );
  const deleteButton = (
    <MenuItem onClick={handleClickDelete} disabled={!allowDelete}>
      <ListItemIcon>
        <Delete fontSize="small" />
      </ListItemIcon>
      Delete
    </MenuItem>
  );
  const createCRButton = (
    <MenuItem
      component={RouterLink}
      to={routes.CHANGE_REQUESTS_NEW_WITH_WBS + wbsPipe(workPackage.wbsNum)}
      disabled={!allowRequestChange}
      onClick={handleDropdownClose}
    >
      <ListItemIcon>
        <SyncAltIcon fontSize="small" />
      </ListItemIcon>
      Request Change
    </MenuItem>
  );
  const projectActionsDropdown = (
    <div>
      <NERButton
        endIcon={<ArrowDropDownIcon style={{ fontSize: 28 }} />}
        variant="contained"
        id="work-package-actions-dropdown"
        onClick={handleClick}
      >
        Actions
      </NERButton>
      <Menu open={dropdownOpen} anchorEl={anchorEl} onClose={handleDropdownClose}>
        {editButton}
        {workPackage.status === WbsElementStatus.Inactive ? activateButton : ''}
        {workPackage.status === WbsElementStatus.Active ? stageGateButton : ''}
        {createCRButton}
        {deleteButton}
      </Menu>
    </div>
  );

  const projectWbsString: string = wbsPipe({ ...workPackage.wbsNum, workPackageNumber: 0 });

  return (
    <>
      <PageTitle
        title={`${wbsPipe(workPackage.wbsNum)} - ${workPackage.name}`}
        previousPages={[
          { name: 'Projects', route: routes.PROJECTS },
          { name: `${projectWbsString} - ${workPackage.projectName}`, route: `${routes.PROJECTS}/${projectWbsString}` }
        ]}
        actionButton={projectActionsDropdown}
      />
      <Tabs
        sx={{ borderBottom: 1, borderColor: 'divider' }}
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        aria-label="task-list-tabs"
      >
        <Tab
          label="overview"
          aria-label="overview"
          value={0}
          component={RouterLink}
          to={`${routes.PROJECTS}/${wbsNum}/overview`}
        />
        <Tab label="scope" aria-label="scope" value={1} component={RouterLink} to={`${routes.PROJECTS}/${wbsNum}/scope`} />
        <Tab
          label="changes"
          aria-label="changes"
          value={2}
          component={RouterLink}
          to={`${routes.PROJECTS}/${wbsNum}/changes`}
        />
      </Tabs>
      {tabValue === 0 ? (
        <>
          <WorkPackageDetails workPackage={workPackage} />
        </>
      ) : tabValue === 1 ? (
        <>
          <CheckList
            title={'Expected Activities'}
            items={workPackage.expectedActivities
              .filter((ea) => !ea.dateDeleted)
              .map((ea) => {
                return { ...ea, resolved: !!ea.userChecked, user: ea.userChecked, dateAdded: ea.dateAdded };
              })}
            isDisabled={checkListDisabled}
          />
          <CheckList
            title={'Deliverables'}
            items={workPackage.deliverables
              .filter((del) => !del.dateDeleted)
              .map((del) => {
                return { ...del, resolved: !!del.userChecked, user: del.userChecked, dateAdded: del.dateAdded };
              })}
            isDisabled={checkListDisabled}
          />
        </>
      ) : (
        <ChangesList changes={workPackage.changes} />
      )}
      {console.log('Hi Laith (remove me when you actually add your changes')}
      {showActivateModal && (
        <ActivateWorkPackageModalContainer
          wbsNum={workPackage.wbsNum}
          modalShow={showActivateModal}
          handleClose={() => setShowActivateModal(false)}
        />
      )}
      {showStageGateModal && (
        <StageGateWorkPackageModalContainer
          wbsNum={workPackage.wbsNum}
          modalShow={showStageGateModal}
          handleClose={() => setShowStageGateModal(false)}
        />
      )}
      {showDeleteModal && (
        <DeleteWorkPackage
          wbsNum={workPackage.wbsNum}
          modalShow={showDeleteModal}
          handleClose={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
};

export default WorkPackageViewContainer;
