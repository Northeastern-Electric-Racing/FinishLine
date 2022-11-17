/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WbsElementStatus, WorkPackage } from 'shared';
import { wbsPipe } from '../../../utils/Pipes';
import { routes } from '../../../utils/Routes';
import ActivateWorkPackageModalContainer from '../ActivateWorkPackageModalContainer/ActivateWorkPackageModalContainer';
import HorizontalList from '../../../components/HorizontalList';
import WorkPackageDetails from './WorkPackageDetails';
import ChangesList from '../../../components/ChangesList';
import PageTitle from '../../../layouts/PageTitle/PageTitle';
import StageGateWorkPackageModalContainer from '../StageGateWorkPackageModalContainer/StageGateWorkPackageModalContainer';
import CheckList from '../../../components/CheckList';
import { NERButton } from '../../../components/NERButton';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Menu, MenuItem } from '@mui/material';

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
  const [showActivateModal, setShowActivateModal] = useState<boolean>(false);
  const [showStageGateModal, setShowStageGateModal] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dropdownOpen = Boolean(anchorEl);

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
          { name: projectWbsString, route: `${routes.PROJECTS}/${projectWbsString}` }
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
            return { ...ea, resolved: !!ea.userChecked };
          })}
        isDisabled={workPackage.status !== WbsElementStatus.Active}
      />
      <CheckList
        title={'Deliverables'}
        items={workPackage.deliverables
          .filter((del) => !del.dateDeleted)
          .map((del) => {
            return { ...del, resolved: !!del.userChecked };
          })}
        isDisabled={workPackage.status !== WbsElementStatus.Active}
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
