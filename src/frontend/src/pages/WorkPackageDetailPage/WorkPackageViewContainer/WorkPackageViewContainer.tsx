/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Dropdown, DropdownButton } from 'react-bootstrap';
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

  const editBtn = (
    <Dropdown.Item as={Button} onClick={enterEditMode} disabled={!allowEdit}>
      Edit
    </Dropdown.Item>
  );
  const activateBtn = (
    <Dropdown.Item as={Button} onClick={() => setShowActivateModal(true)} disabled={!allowActivate}>
      Activate
    </Dropdown.Item>
  );
  const stageGateBtn = (
    <Dropdown.Item
      as={Button}
      onClick={() => setShowStageGateModal(true)}
      disabled={!allowStageGate}
    >
      Stage Gate
    </Dropdown.Item>
  );
  const createCRBtn = (
    <Dropdown.Item
      as={Link}
      to={routes.CHANGE_REQUESTS_NEW_WITH_WBS + wbsPipe(workPackage.wbsNum)}
      disabled={!allowRequestChange}
    >
      Request Change
    </Dropdown.Item>
  );
  const projectActionsDropdown = (
    <DropdownButton id="work-package-actions-dropdown" title="Actions">
      {editBtn}
      {workPackage.status === WbsElementStatus.Inactive ? activateBtn : ''}
      {workPackage.status === WbsElementStatus.Active ? stageGateBtn : ''}
      {createCRBtn}
    </DropdownButton>
  );

  const projectWbsString: string = wbsPipe({ ...workPackage.wbsNum, workPackageNumber: 0 });

  return (
    <Container fluid>
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
      />
      <CheckList
        title={'Deliverables'}
        items={workPackage.deliverables
          .filter((del) => !del.dateDeleted)
          .map((del) => {
            return { ...del, resolved: !!del.userChecked };
          })}
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
    </Container>
  );
};

export default WorkPackageViewContainer;
