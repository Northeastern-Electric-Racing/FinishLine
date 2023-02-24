/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Link } from 'react-router-dom';
import { WorkPackage, Project } from 'shared';
import { wbsPipe } from '../../../utils/pipes';
import { useAuth } from '../../../hooks/auth.hooks';
import ChangesList from '../../../components/ChangesList';
import DescriptionList from '../../../components/DescriptionList';
import WorkPackageSummary from './WorkPackageSummary';
import PageTitle from '../../../layouts/PageTitle/PageTitle';
import PageBlock from '../../../layouts/PageBlock';
import ProjectDetails from './ProjectDetails';
import RulesList from './RulesList';
import RiskLog from './RiskLog';
import { routes } from '../../../utils/routes';
import ProjectGantt from './ProjectGantt';
import { NERButton } from '../../../components/NERButton';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useSetProjectTeam } from '../../../hooks/projects.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import TaskList from './TaskList';

interface ProjectViewContainerProps {
  proj: Project;
  enterEditMode: () => void;
}

const ProjectViewContainer: React.FC<ProjectViewContainerProps> = ({ proj, enterEditMode }) => {
  const auth = useAuth();
  const toast = useToast();
  const { mutateAsync } = useSetProjectTeam(proj.wbsNum);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (!auth.user) return <LoadingIndicator />;

  const dropdownOpen = Boolean(anchorEl);
  proj.workPackages.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const { teamAsLeadId } = auth.user;

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

  const handleAssignToMyTeam = async () => {
    try {
      await mutateAsync(teamAsLeadId);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
    handleDropdownClose();
  };

  const isGuest = auth.user.role === 'GUEST';

  const editBtn = (
    <MenuItem onClick={handleClickEdit} disabled={isGuest}>
      Edit
    </MenuItem>
  );

  const createCRBtn = (
    <MenuItem
      component={Link}
      to={routes.CHANGE_REQUESTS_NEW_WITH_WBS + wbsPipe(proj.wbsNum)}
      disabled={isGuest}
      onClick={handleDropdownClose}
    >
      Request Change
    </MenuItem>
  );

  const assignToMyTeamButton = (
    <MenuItem disabled={proj.team?.teamId === teamAsLeadId} onClick={handleAssignToMyTeam}>
      Assign to My Team
    </MenuItem>
  );

  const projectActionsDropdown = (
    <div>
      <NERButton
        endIcon={<ArrowDropDownIcon style={{ fontSize: 28 }} />}
        variant="contained"
        id="project-actions-dropdown"
        onClick={handleClick}
      >
        Actions
      </NERButton>
      <Menu open={dropdownOpen} anchorEl={anchorEl} onClose={handleDropdownClose}>
        {editBtn}
        {createCRBtn}
        {teamAsLeadId && assignToMyTeamButton}
      </Menu>
    </div>
  );

  return (
    <>
      <PageTitle
        title={`${wbsPipe(proj.wbsNum)} - ${proj.name}`}
        previousPages={[{ name: 'Projects', route: routes.PROJECTS }]}
        actionButton={projectActionsDropdown}
      />
      <ProjectDetails project={proj} />
      <TaskList tasks={proj.tasks} />
      <PageBlock title={'Summary'}>{proj.summary}</PageBlock>
      <RiskLog projectId={proj.id} wbsNum={proj.wbsNum} projLead={proj.projectLead} projManager={proj.projectManager} />
      <ProjectGantt workPackages={proj.workPackages} />
      <DescriptionList title={'Goals'} items={proj.goals.filter((goal) => !goal.dateDeleted)} />
      <DescriptionList title={'Features'} items={proj.features.filter((feature) => !feature.dateDeleted)} />
      <DescriptionList
        title={'Other Constraints'}
        items={proj.otherConstraints.filter((constraint) => !constraint.dateDeleted)}
      />
      <RulesList rules={proj.rules} />
      <PageBlock title={'Work Packages'}>
        {proj.workPackages.map((ele: WorkPackage) => (
          <div key={wbsPipe(ele.wbsNum)} className="mt-3">
            <WorkPackageSummary workPackage={ele} />
          </div>
        ))}
      </PageBlock>
      <ChangesList changes={proj.changes} />
    </>
  );
};

export default ProjectViewContainer;
