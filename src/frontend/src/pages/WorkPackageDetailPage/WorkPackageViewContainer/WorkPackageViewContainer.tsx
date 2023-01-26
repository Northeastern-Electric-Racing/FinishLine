/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RoleEnum, WbsElementStatus, WorkPackage } from 'shared';
import { wbsPipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';
import ActivateWorkPackageModalContainer from '../ActivateWorkPackageModalContainer/ActivateWorkPackageModalContainer';
import HorizontalList from '../../../components/HorizontalList';
import WorkPackageDetails from './WorkPackageDetails';
import ChangesList from '../../../components/ChangesList';
import PageTitle from '../../../layouts/PageTitle/PageTitle';
import StageGateWorkPackageModalContainer from '../StageGateWorkPackageModalContainer/StageGateWorkPackageModalContainer';
import CheckList from '../../../components/CheckList';
import { useCheckDescriptionBullet } from '../../../hooks/description-bullets.hooks';
import { NERButton } from '../../../components/NERButton';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Menu, MenuItem } from '@mui/material';
import { useAuth } from '../../../hooks/auth.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';

interface WorkPackageViewContainerProps {
  workPackage: WorkPackage;
  enterEditMode: () => void;
  allowEdit: boolean;
  allowActivate: boolean;
  allowStageGate: boolean;
  allowRequestChange: boolean;
}

const WorkPackageViewContainer: React.FC<WorkPackageViewContainerProps> = ({
  workPackage,
  enterEditMode,
  allowEdit,
  allowActivate,
  allowStageGate,
  allowRequestChange
}) => {
  const auth = useAuth();
  const [showActivateModal, setShowActivateModal] = useState<boolean>(false);
  const [showStageGateModal, setShowStageGateModal] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dropdownOpen = Boolean(anchorEl);
  const { isLoading } = useCheckDescriptionBullet();

  if (!auth.user) return <LoadingIndicator />;

  const checkListDisabled = workPackage.status !== WbsElementStatus.Active || auth.user.role === RoleEnum.GUEST;

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

  const editBtn = (
    <MenuItem onClick={handleClickEdit} disabled={!allowEdit}>
      Edit
    </MenuItem>
  );
  const activateBtn = (
    <MenuItem onClick={handleClickActivate} disabled={!allowActivate}>
      Activate
    </MenuItem>
  );
  const stageGateBtn = (
    <MenuItem onClick={handleClickStageGate} disabled={!allowStageGate}>
      Stage Gate
    </MenuItem>
  );
  const createCRBtn = (
    <MenuItem
      component={Link}
      to={routes.CHANGE_REQUESTS_NEW_WITH_WBS + wbsPipe(workPackage.wbsNum)}
      disabled={!allowRequestChange}
      onClick={handleDropdownClose}
    >
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
        {editBtn}
        {workPackage.status === WbsElementStatus.Inactive ? activateBtn : ''}
        {workPackage.status === WbsElementStatus.Active ? stageGateBtn : ''}
        {createCRBtn}
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
      <WorkPackageDetails workPackage={workPackage} />
      <HorizontalList
        title={'Dependencies'}
        items={workPackage.dependencies.map((dep) => (
          <strong>{wbsPipe(dep)}</strong>
        ))}
      />
      <CheckList
        title={'Expected Activities'}
        items={workPackage.expectedActivities
          .filter((ea) => !ea.dateDeleted)
          .map((ea) => {
            return { ...ea, resolved: !!ea.userChecked, user: ea.userChecked, dateAdded: ea.dateAdded };
          })}
        isDisabled={checkListDisabled || isLoading}
      />
      <CheckList
        title={'Deliverables'}
        items={workPackage.deliverables
          .filter((del) => !del.dateDeleted)
          .map((del) => {
            return { ...del, resolved: !!del.userChecked, user: del.userChecked, dateAdded: del.dateAdded };
          })}
        isDisabled={checkListDisabled || isLoading}
      />
      <ChangesList changes={workPackage.changes} />
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
    </>
  );
};

export default WorkPackageViewContainer;
