/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Link, useHistory } from 'react-router-dom';
import { Project, isGuest, isAdmin, isLeadership } from 'shared';
import { projectWbsPipe, wbsPipe } from '../../../utils/pipes';
import ProjectDetails from './ProjectDetails';
import { routes } from '../../../utils/routes';
import { NERButton } from '../../../components/NERButton';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import EditIcon from '@mui/icons-material/Edit';
import ListItemIcon from '@mui/material/ListItemIcon';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import { Box, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { useSetProjectTeam } from '../../../hooks/projects.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import DeleteProject from '../DeleteProject';
import GroupIcon from '@mui/icons-material/Group';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DeleteIcon from '@mui/icons-material/Delete';
import { ScopeTab } from './ScopeTab';
import ProjectGantt from './ProjectGantt';
import TaskList from './TaskList/TaskList';
import { useCurrentUser, useUsersFavoriteProjects } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import FavoriteProjectButton from '../../../components/FavoriteProjectButton';
import PageLayout from '../../../components/PageLayout';
import NERTabs from '../../../components/Tabs';
import ChangesList from '../../../components/ChangesList';
import BOMTab, { addMaterialCosts } from './BOMTab';
import SavingsIcon from '@mui/icons-material/Savings';

interface ProjectViewContainerProps {
  project: Project;
  enterEditMode: () => void;
}

const ProjectViewContainer: React.FC<ProjectViewContainerProps> = ({ project, enterEditMode }) => {
  const user = useCurrentUser();
  const toast = useToast();
  const history = useHistory();
  const { mutateAsync: mutateAsyncSetProjectTeam } = useSetProjectTeam(project.wbsNum);
  const { data: favoriteProjects, isLoading, isError, error } = useUsersFavoriteProjects(user.userId);
  const [deleteModalShow, setDeleteModalShow] = useState<boolean>(false);
  const handleDeleteClose = () => setDeleteModalShow(false);
  const handleClickDelete = () => {
    setDeleteModalShow(true);
  };
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tab, setTab] = useState(0);
  const dropdownOpen = Boolean(anchorEl);

  if (isLoading || !favoriteProjects) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  project.workPackages.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const { teamAsHeadId } = user;
  const projectIsFavorited = favoriteProjects.map((favoriteProject) => favoriteProject.id).includes(project.id);

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
      const successMessage = await mutateAsyncSetProjectTeam(teamAsHeadId);
      toast.success(successMessage.message);
      handleDropdownClose();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const EditButton = () => (
    <MenuItem onClick={handleClickEdit} disabled={isGuest(user.role)}>
      <ListItemIcon>
        <EditIcon fontSize="small" />
      </ListItemIcon>
      Edit
    </MenuItem>
  );

  const CreateChangeRequestButton = () => (
    <MenuItem
      component={Link}
      to={routes.CHANGE_REQUESTS_NEW_WITH_WBS + wbsPipe(project.wbsNum)}
      disabled={isGuest(user.role)}
      onClick={handleDropdownClose}
    >
      <ListItemIcon>
        <SyncAltIcon fontSize="small" />
      </ListItemIcon>
      Request Change
    </MenuItem>
  );

  const SuggestBudgetIncreaseButton = () => {
    const budgetIncrease = project.materials.reduce(addMaterialCosts, 0) - project.budget;
    return (
      <MenuItem
        onClick={() =>
          history.push(
            `${routes.CHANGE_REQUESTS_NEW}?wbsNum=${projectWbsPipe(project.wbsNum)}&budgetChange=${budgetIncrease}`
          )
        }
        disabled={!isLeadership(user.role) || budgetIncrease <= 0}
      >
        <ListItemIcon>
          <SavingsIcon fontSize="small" />
        </ListItemIcon>
        Suggest Budget Increase
      </MenuItem>
    );
  };

  const AssignToMyTeamButton = () => {
    const assignToTeamText = project.teams.map((team) => team.teamId).includes(teamAsHeadId!)
      ? 'Unassign from My Team'
      : 'Assign to My Team';

    return (
      <MenuItem onClick={handleAssignToMyTeam}>
        <ListItemIcon>
          <GroupIcon fontSize="small" />
        </ListItemIcon>
        {assignToTeamText}
      </MenuItem>
    );
  };

  const buildURLForCreateWorkPackage = () => {
    return `${routes.CHANGE_REQUESTS_NEW}?wbsNum=${projectWbsPipe(project.wbsNum)}&createWP=${true}`;
  };

  const CreateWorkPackageButton = () => {
    return (
      <MenuItem onClick={() => history.push(buildURLForCreateWorkPackage())} disabled={isGuest(user.role)}>
        <ListItemIcon>
          <ContentPasteIcon fontSize="small" />
        </ListItemIcon>
        Create Work Package
      </MenuItem>
    );
  };

  const DeleteButton = () => (
    <MenuItem onClick={handleClickDelete} disabled={!isAdmin(user.role)}>
      <ListItemIcon>
        <DeleteIcon fontSize="small" />
      </ListItemIcon>
      Delete
    </MenuItem>
  );

  const projectActionsDropdown = (
    <Box ml={2}>
      <NERButton
        endIcon={<ArrowDropDownIcon style={{ fontSize: 28 }} />}
        variant="contained"
        id="project-actions-dropdown"
        onClick={handleClick}
      >
        Actions
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
        <EditButton />
        <CreateChangeRequestButton />
        <SuggestBudgetIncreaseButton />
        {teamAsHeadId && <AssignToMyTeamButton />}
        <CreateWorkPackageButton />
        <DeleteButton />
      </Menu>
    </Box>
  );

  const pageTitle = `${wbsPipe(project.wbsNum)} - ${project.name}`;

  const headerRight = (
    <Box display="flex" justifyContent="flex-end">
      <FavoriteProjectButton wbsNum={project.wbsNum} projectIsFavorited={projectIsFavorited} />
      {projectActionsDropdown}
    </Box>
  );

  const wbsNum = wbsPipe(project.wbsNum);

  return (
    <PageLayout
      title={pageTitle}
      headerRight={headerRight}
      tabs={
        <NERTabs
          setTab={setTab}
          tabsLabels={[
            { tabUrlValue: 'overview', tabName: 'Overview' },
            { tabUrlValue: 'tasks', tabName: 'Tasks' },
            { tabUrlValue: 'bom', tabName: 'BOM' },
            { tabUrlValue: 'scope', tabName: 'Scope' },
            { tabUrlValue: 'changes', tabName: 'Changes' },
            { tabUrlValue: 'gantt', tabName: 'Gantt' }
          ]}
          baseUrl={`${routes.PROJECTS}/${wbsNum}`}
          defaultTab="overview"
          id="project-detail-tabs"
        />
      }
      previousPages={[{ name: 'Projects', route: routes.PROJECTS }]}
    >
      {tab === 0 ? (
        <ProjectDetails project={project} />
      ) : tab === 1 ? (
        <TaskList project={project} />
      ) : tab === 2 ? (
        <BOMTab project={project} />
      ) : tab === 3 ? (
        <ScopeTab project={project} />
      ) : tab === 4 ? (
        <ChangesList changes={project.changes} />
      ) : (
        <ProjectGantt workPackages={project.workPackages} />
      )}
      {deleteModalShow && (
        <DeleteProject modalShow={deleteModalShow} handleClose={handleDeleteClose} wbsNum={project.wbsNum} />
      )}
    </PageLayout>
  );
};

export default ProjectViewContainer;
