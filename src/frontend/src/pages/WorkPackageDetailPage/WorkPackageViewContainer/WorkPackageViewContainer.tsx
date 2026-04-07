/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { WbsElementStatus, WorkPackage } from 'shared';
import { wbsPipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';
import ActivateWorkPackageModalContainer from '../ActivateWorkPackageModalContainer/ActivateWorkPackageModalContainer';
import WorkPackageDetails from './WorkPackageDetails';
import ChangesList from '../../../components/ChangesList';
import StageGateWorkPackageModalContainer from '../StageGateWorkPackageModalContainer/StageGateWorkPackageModalContainer';
import EditIcon from '@mui/icons-material/Edit';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import Delete from '@mui/icons-material/Delete';
import DeleteWorkPackage from '../DeleteWorkPackageModalContainer/DeleteWorkPackage';
import { useGetManyWorkPackages } from '../../../hooks/work-packages.hooks';
import PageLayout from '../../../components/PageLayout';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import ScopeTab from './ScopeTab';
import FullPageTabs from '../../../components/FullPageTabs';
import ChangeRequestTab from '../../../components/ChangeRequestTab';
import ActionsMenu, { ButtonInfo } from '../../../components/ActionsMenu';
import { TaskListContent } from '../../ProjectDetailPage/ProjectViewContainer/TaskList/v2/TaskListContent';

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
  const [showActivateModal, setShowActivateModal] = useState<boolean>(false);
  const [showStageGateModal, setShowStageGateModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data: dependencies, isError, isLoading, error } = useGetManyWorkPackages(workPackage.blockedBy);
  const wbsNum = wbsPipe(workPackage.wbsNum);
  const [tabValue, setTabValue] = useState<number>(0);

  if (!dependencies || isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

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

  const stageGateButton: ButtonInfo = {
    title: 'Stage Gate',
    onClick: handleClickStageGate,
    disabled: !allowStageGate,
    icon: <DoneOutlineIcon fontSize="small" />
  };

  const activateButton: ButtonInfo = {
    title: 'Activate',
    onClick: handleClickActivate,
    disabled: !allowActivate,
    icon: <KeyboardDoubleArrowUpIcon fontSize="small" />
  };

  const projectActionsDropdown = (
    <div style={{ marginTop: '10px' }}>
      <ActionsMenu
        buttons={[
          {
            title: 'Edit',
            onClick: handleClickEdit,
            disabled: !allowEdit,
            icon: <EditIcon fontSize="small" />
          },
          ...(workPackage.status === WbsElementStatus.Inactive ? [activateButton] : []),
          ...(workPackage.status === WbsElementStatus.Active ? [stageGateButton] : []),
          {
            title: 'Request Change',
            component: RouterLink,
            to: routes.CHANGE_REQUESTS_NEW_WITH_WBS + wbsPipe(workPackage.wbsNum),
            onClick: handleDropdownClose,
            disabled: !allowRequestChange,
            icon: <SyncAltIcon fontSize="small" />
          },
          {
            title: 'Delete',
            onClick: handleClickDelete,
            disabled: !allowDelete,
            icon: <Delete fontSize="small" />,
            dividerTop: true
          }
        ]}
      />
    </div>
  );

  const projectWbsString: string = wbsPipe({ ...workPackage.wbsNum, workPackageNumber: 0 });

  return (
    <PageLayout
      title={`${wbsPipe(workPackage.wbsNum)} - ${workPackage.name}`}
      previousPages={[
        { name: 'Projects', route: routes.PROJECTS },
        { name: `${projectWbsString} - ${workPackage.projectName}`, route: `${routes.PROJECTS}/${projectWbsString}` }
      ]}
      headerRight={projectActionsDropdown}
      tabs={
        <FullPageTabs
          setTab={setTabValue}
          tabsLabels={[
            { tabUrlValue: 'overview', tabName: 'Overview' },
            { tabUrlValue: 'tasks', tabName: 'Tasks' },
            { tabUrlValue: 'scope', tabName: 'Scope' },
            { tabUrlValue: 'changes', tabName: 'Changes' },
            { tabUrlValue: 'change-requests', tabName: 'Change Requests' }
          ]}
          baseUrl={`${routes.PROJECTS}/${wbsNum}`}
          defaultTab="overview"
          id="wp-detail-tabs"
        />
      }
    >
      {tabValue === 0 ? (
        <WorkPackageDetails workPackage={workPackage} dependencies={dependencies} />
      ) : tabValue === 1 ? (
        !allowEdit ? null : (
          <TaskListContent wbsNum={workPackage.wbsNum} wbsElementId={workPackage.wbsElementId} />
        )
      ) : tabValue === 2 ? (
        <ScopeTab workPackage={workPackage} />
      ) : tabValue === 3 ? (
        <ChangesList changes={workPackage.changes} />
      ) : (
        <ChangeRequestTab wbsElement={workPackage} />
      )}
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
    </PageLayout>
  );
};

export default WorkPackageViewContainer;
