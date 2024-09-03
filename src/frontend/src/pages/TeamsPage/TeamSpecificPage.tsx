import { Box, Grid, Menu, MenuItem, Stack } from '@mui/material';
import { useArchiveTeam, useSingleTeam } from '../../hooks/teams.hooks';
import { useParams } from 'react-router-dom';
import TeamMembersPageBlock from './TeamMembersPageBlock';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import PageBlock from '../../layouts/PageBlock';
import ActiveProjectCardView from './ProjectCardsView';
import DescriptionPageBlock from './DescriptionPageBlock';
import { routes } from '../../utils/routes';
import PageLayout from '../../components/PageLayout';
import { Delete } from '@mui/icons-material';
import { NERButton } from '../../components/NERButton';
import { useCurrentUser } from '../../hooks/users.hooks';
import { isAdmin } from 'shared';
import React, { useState } from 'react';
import DeleteTeamModal from './DeleteTeamModal';
import SetTeamTypeModal from './SetTeamTypeModal';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { TeamPill } from './TeamPill';
import { useToast } from '../../hooks/toasts.hooks';

interface ParamTypes {
  teamId: string;
}

const TeamSpecificPage: React.FC = () => {
  const toast = useToast();
  const { teamId } = useParams<ParamTypes>();
  const { isLoading, isError, data, error } = useSingleTeam(teamId);
  const user = useCurrentUser();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTeamTypeModal, setShowTeamTypeModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dropdownOpen = Boolean(anchorEl);
  const { mutateAsync: archiveTeam } = useArchiveTeam(teamId);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading || !data) return <LoadingIndicator />;

  const DeleteButton = () => (
    <NERButton
      variant="contained"
      startIcon={<Delete />}
      onClick={() => setShowDeleteModal(true)}
      disabled={!isAdmin(user.role)}
    >
      Delete
    </NERButton>
  );

  const SetTeamTypeButton = () => (
    <NERButton variant="contained" onClick={() => setShowTeamTypeModal(true)} disabled={!isAdmin(user.role)}>
      Set Team Type
    </NERButton>
  );

  interface ArchiveTeamButtonProps {
    archive: boolean;
  }

  const handleArchive = async () => {
    try {
      await archiveTeam(teamId);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  const ArchiveTeamButton: React.FC<ArchiveTeamButtonProps> = ({ archive }) => (
    <NERButton variant="contained" onClick={() => handleArchive()} disabled={!isAdmin(user.role)}>
      {archive ? 'Unarchive Team' : 'Archive Team'}
    </NERButton>
  );

  const TeamActionsDropdown = () => (
    <Box>
      <NERButton
        endIcon={<ArrowDropDownIcon style={{ fontSize: 28 }} />}
        variant="contained"
        id="team-actions-dropdown"
        onClick={handleClick}
      >
        Actions
      </NERButton>
      <Menu
        open={dropdownOpen}
        anchorEl={anchorEl}
        onClose={handleDropdownClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem onClick={handleDropdownClose}>
          <ArchiveTeamButton archive={!!data.dateArchived} />
        </MenuItem>
        <MenuItem onClick={handleDropdownClose}>
          <DeleteButton />
        </MenuItem>
      </Menu>
    </Box>
  );

  return (
    <PageLayout
      headerRight={
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <SetTeamTypeButton />
          {TeamActionsDropdown()}
        </Stack>
      }
      title={`Team ${data.teamName}`}
      chips={
        data.dateArchived ? (
          <Box display="flex" gap="20px">
            <TeamPill displayText="Archived" />
          </Box>
        ) : null
      }
      previousPages={[{ name: 'Teams', route: routes.TEAMS }]}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TeamMembersPageBlock team={data} />
          <PageBlock title={'Active Projects'}>
            <Grid container spacing={2}>
              {data.projects
                .filter((project) => project.status === 'ACTIVE')
                .map((project) => (
                  <Grid item key={project.id}>
                    <ActiveProjectCardView project={project} />
                  </Grid>
                ))}
            </Grid>
          </PageBlock>
          <DescriptionPageBlock team={data} />
        </Grid>
      </Grid>
      <DeleteTeamModal teamId={teamId} showModal={showDeleteModal} onHide={() => setShowDeleteModal(false)} />
      <SetTeamTypeModal teamId={teamId} showModal={showTeamTypeModal} onHide={() => setShowTeamTypeModal(false)} />
    </PageLayout>
  );
};

export default TeamSpecificPage;
