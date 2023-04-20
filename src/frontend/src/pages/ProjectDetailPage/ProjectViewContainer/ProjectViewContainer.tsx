/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Link } from 'react-router-dom';
import { WorkPackage, Project, isGuest, isAdmin } from 'shared';
import { wbsPipe } from '../../../utils/pipes';
import ChangesList from '../../../components/ChangesList';
import DescriptionList from '../../../components/DescriptionList';
import WorkPackageSummary from './WorkPackageSummary';
import PageTitle from '../../../layouts/PageTitle/PageTitle';
import PageBlock from '../../../layouts/PageBlock';
import ProjectDetails from './ProjectDetails';
import RulesList from './RulesList';
import { routes } from '../../../utils/routes';
import ProjectGantt from './ProjectGantt';
import { NERButton } from '../../../components/NERButton';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import EditIcon from '@mui/icons-material/Edit';
import ListItemIcon from '@mui/material/ListItemIcon';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import { Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { useSetProjectTeam, useToggleProjectFavorite } from '../../../hooks/projects.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import TaskList from './TaskList/TaskList';
import DeleteProject from '../DeleteProject';
import GroupIcon from '@mui/icons-material/Group';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import { useCurrentUser } from '../../../hooks/users.hooks';

interface ProjectViewContainerProps {
  project: Project;
  enterEditMode: () => void;
}

const ProjectViewContainer: React.FC<ProjectViewContainerProps> = ({ project, enterEditMode }) => {
  const user = useCurrentUser();
  const toast = useToast();
  const { mutateAsync: mutateAsyncSetProjectTeam } = useSetProjectTeam(project.wbsNum);
  const { mutateAsync: mutateAsyncToggleProjectFavorite } = useToggleProjectFavorite(project.wbsNum);
  const [deleteModalShow, setDeleteModalShow] = useState<boolean>(false);
  const handleDeleteClose = () => setDeleteModalShow(false);
  const handleClickDelete = () => {
    setDeleteModalShow(true);
  };
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dropdownOpen = Boolean(anchorEl);

  project.workPackages.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const { teamAsLeadId } = user;
  const projectIsFavorited = !!user.favoritedProjectsId?.includes(project.id);
  console.log(projectIsFavorited);

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

  const handleClickFavorite = async () => {
    try {
      await mutateAsyncToggleProjectFavorite();
      handleDropdownClose();
      toast.info(`Successfully ${projectIsFavorited ? '' : 'un'}favorited project ${wbsPipe(project.wbsNum)}!`);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const editBtn = (
    <MenuItem onClick={handleClickEdit} disabled={isGuest(user.role)}>
      <ListItemIcon>
        <EditIcon fontSize="small" />
      </ListItemIcon>
      Edit
    </MenuItem>
  );

  const favoriteFilledBtn = (
    <MenuItem onClick={handleClickFavorite} disabled={isGuest(user.role)}>
      <ListItemIcon>
        <StarIcon fontSize="small" stroke={'black'} strokeWidth={1} sx={{ color: 'Gold' }} />
      </ListItemIcon>
      Unfavorite
    </MenuItem>
  );

  const favoriteNotFilledBtn = (
    <MenuItem onClick={handleClickFavorite} disabled={isGuest(user.role)}>
      <ListItemIcon>
        <StarIcon fontSize="small" stroke={'black'} strokeWidth={1} />
      </ListItemIcon>
      Favorite
    </MenuItem>
  );

  const createCRBtn = (
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

  const deleteButton = (
    <MenuItem onClick={handleClickDelete} disabled={!isAdmin(user.role)}>
      <ListItemIcon>
        <DeleteIcon fontSize="small" />
      </ListItemIcon>
      Delete
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
        {projectIsFavorited ? favoriteFilledBtn : favoriteNotFilledBtn}
        {teamAsLeadId && assignToMyTeamButton}
        {deleteButton}
      </Menu>
    </div>
  );

  return (
    <>
      <PageTitle
        title={`${wbsPipe(project.wbsNum)} - ${project.name}`}
        previousPages={[{ name: 'Projects', route: routes.PROJECTS }]}
        actionButton={projectActionsDropdown}
      />
      <ProjectDetails project={project} />
      <TaskList project={project} />
      <PageBlock title={'Summary'}>{project.summary}</PageBlock>
      <ProjectGantt workPackages={project.workPackages} />
      <DescriptionList title={'Goals'} items={project.goals.filter((goal) => !goal.dateDeleted)} />
      <DescriptionList title={'Features'} items={project.features.filter((feature) => !feature.dateDeleted)} />
      <DescriptionList
        title={'Other Constraints'}
        items={project.otherConstraints.filter((constraint) => !constraint.dateDeleted)}
      />
      <RulesList rules={project.rules} />
      <PageBlock title={'Work Packages'}>
        {project.workPackages.map((ele: WorkPackage) => (
          <div key={wbsPipe(ele.wbsNum)} className="mt-3">
            <WorkPackageSummary workPackage={ele} />
          </div>
        ))}
      </PageBlock>
      <ChangesList changes={project.changes} />
      {deleteModalShow && (
        <DeleteProject modalShow={deleteModalShow} handleClose={handleDeleteClose} wbsNum={project.wbsNum} />
      )}
    </>
  );
};

export default ProjectViewContainer;
