/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Link } from 'react-router-dom';
import { Project, isGuest, isAdmin } from 'shared';
import { wbsPipe } from '../../../utils/pipes';
import ProjectDetails from './ProjectDetails';
import { routes } from '../../../utils/routes';
import { NERButton } from '../../../components/NERButton';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import EditIcon from '@mui/icons-material/Edit';
import ListItemIcon from '@mui/material/ListItemIcon';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import { Grid, Menu, MenuItem, Typography } from '@mui/material';
import { useState } from 'react';
import { useSetProjectTeam } from '../../../hooks/projects.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import ProjectDetailTabs from './ProjectDetailTabs';
import DeleteProject from '../DeleteProject';
import GroupIcon from '@mui/icons-material/Group';
import DeleteIcon from '@mui/icons-material/Delete';
import { ScopeTab } from './ScopeTab';
import ProjectGantt from './ProjectGantt';
import ProjectChangesList from './ProjectChangesList';
import TaskList from './TaskList/TaskList';
import { useCurrentUser, useUsersFavoriteProjects } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import PageBreadcrumbs from '../../../layouts/PageTitle/PageBreadcrumbs';
import FavoriteProjectButton from '../../../components/FavoriteProjectButton';

interface ProjectViewContainerProps {
  project: Project;
  enterEditMode: () => void;
}

const ProjectViewContainer: React.FC<ProjectViewContainerProps> = ({ project, enterEditMode }) => {
  const user = useCurrentUser();
  const toast = useToast();
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
  const { teamAsLeadId } = user;
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
      await mutateAsyncSetProjectTeam(teamAsLeadId);
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

  const assignToMyTeamButton = (
    <MenuItem disabled={project.team?.teamId === teamAsLeadId} onClick={handleAssignToMyTeam}>
      <ListItemIcon>
        <GroupIcon fontSize="small" />
      </ListItemIcon>
      Assign to My Team
    </MenuItem>
  );

  const DeleteButton = () => (
    <MenuItem onClick={handleClickDelete} disabled={!isAdmin(user.role)}>
      <ListItemIcon>
        <DeleteIcon fontSize="small" />
      </ListItemIcon>
      Delete
    </MenuItem>
  );

  const projectActionsDropdown = (
    <Grid container>
      <Grid item></Grid>
      <Grid item>
        <NERButton
          endIcon={<ArrowDropDownIcon style={{ fontSize: 28 }} />}
          variant="contained"
          id="project-actions-dropdown"
          onClick={handleClick}
        >
          Actions
        </NERButton>
      </Grid>
      <Menu open={dropdownOpen} anchorEl={anchorEl} onClose={handleDropdownClose}>
        <EditButton />
        <CreateChangeRequestButton />
        {teamAsLeadId && assignToMyTeamButton}
        <DeleteButton />
      </Menu>
    </Grid>
  );

  const pageTitle = `${wbsPipe(project.wbsNum)} - ${project.name}`;

  return (
    <>
      <>
        <PageBreadcrumbs currentPageTitle={pageTitle} previousPages={[{ name: 'Projects', route: routes.PROJECTS }]} />
        <Grid container alignItems="center" sx={{ mb: 2 }}>
          <Grid item>
            <Typography variant="h4" fontSize={30}>
              {pageTitle}
            </Typography>
          </Grid>
          <Grid item>
            <FavoriteProjectButton wbsNum={project.wbsNum} projectIsFavorited={projectIsFavorited} />
          </Grid>
          <Grid item sx={{ mx: 0 }} xs>
            <Grid container direction="row-reverse">
              <Grid item>{projectActionsDropdown}</Grid>
            </Grid>
          </Grid>
        </Grid>
      </>
      <ProjectDetailTabs project={project} setTab={setTab} />
      {tab === 0 ? (
        <ProjectDetails project={project} />
      ) : tab === 1 ? (
        <TaskList project={project} />
      ) : tab === 2 ? (
        <ScopeTab project={project} />
      ) : tab === 3 ? (
        <ProjectGantt workPackages={project.workPackages} />
      ) : (
        <ProjectChangesList changes={project.changes} />
      )}
      {deleteModalShow && (
        <DeleteProject modalShow={deleteModalShow} handleClose={handleDeleteClose} wbsNum={project.wbsNum} />
      )}
    </>
  );
};

export default ProjectViewContainer;
