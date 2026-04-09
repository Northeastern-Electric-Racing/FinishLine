import { Box, Grid, ListItemIcon, Menu, MenuItem, Stack } from '@mui/material';
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
import { NERButton } from '../../components/NERButton';
import { useCurrentUser } from '../../hooks/users.hooks';
import { isAdmin, isGuest, ReimbursementRequestData, WbsElementStatus } from 'shared';
import React, { useState } from 'react';
import DeleteTeamModal from './DeleteTeamModal';
import SetTeamTypeModal from './SetTeamTypeModal';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { TeamPill } from './TeamPill';
import { useToast } from '../../hooks/toasts.hooks';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import SpendingBar from '../FinancePage/FinanceComponents/SpendingBar';
import { useGetSpendingBarTeamData } from '../../hooks/finance.hooks';
import WarningBanner from '../../components/WarningBanner';

interface ParamTypes {
  teamId: string;
}

const getTotalMoneySpent = (data: ReimbursementRequestData) =>
  data.approved + data.pendingApproval + data.reimbursed + data.addedToSabo;

const TeamSpecificPage: React.FC = () => {
  const toast = useToast();
  const { teamId } = useParams<ParamTypes>();
  const { isLoading, isError, data, error } = useSingleTeam(teamId);
  const user = useCurrentUser();
  const [showDeleteModal, setDeleteModalShow] = useState(false);
  const [showTeamTypeModal, setShowTeamTypeModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dropdownOpen = Boolean(anchorEl);
  const { mutateAsync: archiveTeam } = useArchiveTeam(teamId);
  const handleClickDelete = () => {
    setDeleteModalShow(true);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const {
    isLoading: spendingBarIsLoading,
    isError: spendingBarIsError,
    data: spendingBar,
    error: spendingBarError
  } = useGetSpendingBarTeamData({
    startDate: undefined,
    endDate: undefined,
    teamId
  });

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading || !data || !spendingBar || spendingBarIsLoading) return <LoadingIndicator />;
  if (spendingBarIsError) return <ErrorPage message={spendingBarError?.message} />;

  const budget = spendingBar.data.reduce((sum, project) => sum + project.spendingInfo.totalBudget, 0);

  const DeleteButton = () => (
    <MenuItem onClick={handleClickDelete} disabled={!isAdmin(user.role)}>
      <ListItemIcon>
        <DeleteIcon fontSize="small" />
      </ListItemIcon>
      Delete
    </MenuItem>
  );

  const SetDivisionButton = () => (
    <NERButton variant="contained" onClick={() => setShowTeamTypeModal(true)} disabled={!isAdmin(user.role)}>
      Set Division
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
    <MenuItem onClick={handleArchive} disabled={!isAdmin(user.role)}>
      <ListItemIcon>
        <ArchiveIcon fontSize="small" />
      </ListItemIcon>
      {archive ? 'Unarchive Team' : 'Archive Team'}
    </MenuItem>
  );

  const TeamActionsDropdown = (
    <Box ml={2}>
      <NERButton
        endIcon={<ArrowDropDownIcon style={{ fontSize: 28 }} />}
        variant="contained"
        id="project-actions-dropdown"
        onClick={handleClick}
        disabled={isGuest(user.role)}
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
        <ArchiveTeamButton archive={!!data.dateArchived} />
        <DeleteButton />
      </Menu>
    </Box>
  );
  const totalBudget = data.projects.reduce((sum, project) => sum + (project.budget || 0), 0);

  const amountUsed = spendingBar.data.reduce((sum, data) => sum + getTotalMoneySpent(data.spendingInfo), 0);

  const overBudget = totalBudget < amountUsed;

  const amountOver = amountUsed - totalBudget;

  return (
    <PageLayout
      headerRight={
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <SetDivisionButton />
          {TeamActionsDropdown}
        </Stack>
      }
      title={`${data.teamName} ${data.teamType ? `- ${data.teamType?.name}` : ''}`}
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
                .filter((project) => project.status === WbsElementStatus.Active)
                .map((project) => (
                  <Grid item key={project.id}>
                    <ActiveProjectCardView project={project} />
                  </Grid>
                ))}
            </Grid>
          </PageBlock>
          <PageBlock title={'Budget'}>
            <Box sx={{ width: 250 }}>{overBudget && <WarningBanner amount={amountOver} />}</Box>
            <SpendingBar data={spendingBar.data} title={'Total Budget: $' + budget} edit={false} />
          </PageBlock>
          <PageBlock title={'All Projects'}>
            <Grid container spacing={2}>
              {data.projects.map((project) => (
                <Grid item key={project.id}>
                  <ActiveProjectCardView project={project} />
                </Grid>
              ))}
            </Grid>
          </PageBlock>
          <DescriptionPageBlock team={data} />
        </Grid>
      </Grid>
      <DeleteTeamModal teamId={teamId} showModal={showDeleteModal} onHide={() => setDeleteModalShow(false)} />
      <SetTeamTypeModal teamId={teamId} showModal={showTeamTypeModal} onHide={() => setShowTeamTypeModal(false)} />
    </PageLayout>
  );
};

export default TeamSpecificPage;
