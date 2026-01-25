import React, { useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import NERModal from '../../components/NERModal';
import PeopleIcon from '@mui/icons-material/People';
import { useAllUsers, useCurrentUser } from '../../hooks/users.hooks';
import { useAllTeams } from '../../hooks/teams.hooks';
import ErrorPage from '../ErrorPage';

export interface FilterArgs {
  memberIds: string[];
  teamIds: string[];
  showInvited: boolean;
  showTeam: boolean;
  allEventsMode: boolean;
}

export interface BaseFilterModalProps {
  open: boolean;
  onClose: () => void;
  filterValues?: FilterArgs;
  setMemberIds: (ids: string[]) => void;
  setTeamIds: (ids: string[]) => void;
  setShowInvited: (changed: boolean) => void;
  setShowTeam: (changed: boolean) => void;
  setAllEventsMode: (enabled: boolean) => void;
}

const FilterModal: React.FC<BaseFilterModalProps> = ({
  open,
  onClose,
  filterValues,
  setMemberIds,
  setTeamIds,
  setShowInvited,
  setShowTeam,
  setAllEventsMode
}) => {
  const [dropDownMembersOpen, setDropDownMembersOpen] = useState(false);
  const [dropDownTeamOpen, setDropDownTeamOpen] = useState(false);
  const currUser = useCurrentUser();
  const theme = useTheme();
  const allEventsMode = filterValues?.allEventsMode ?? false;

  const MemberDropdown = () => {
    const memberIds = filterValues?.memberIds ?? [];
    const { data: allUsers } = useAllUsers();

    return (
      <Box sx={{ width: '100%', display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        {!dropDownMembersOpen &&
          memberIds.map((id) => {
            const user = allUsers?.find((user) => user.userId === id);
            return (
              <Box
                key={id}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '999px',
                  px: 1.5,
                  py: 0.5,
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                <Box>
                  {user?.firstName ?? 'John'} {user?.lastName ?? 'Doe'} {user?.userId === currUser.userId && '(You)'}
                </Box>
                <Box
                  onClick={() => {
                    setMemberIds(memberIds.filter((mid) => mid !== id));
                  }}
                  style={{
                    cursor: 'pointer',
                    fontSize: '16px',
                    lineHeight: 1
                  }}
                >
                  ×
                </Box>
              </Box>
            );
          })}
        {!dropDownMembersOpen && (
          <Button
            variant="contained"
            onClick={() => setDropDownMembersOpen(true)}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            Add Members
          </Button>
        )}

        {dropDownMembersOpen && (
          <Autocomplete
            multiple
            open={dropDownMembersOpen}
            disableCloseOnSelect
            onClose={(_, reason) => {
              if (reason !== 'toggleInput') {
                setDropDownMembersOpen(false);
              }
            }}
            options={allUsers ?? []}
            getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
            value={allUsers?.filter((user) => memberIds.includes(user.userId)) ?? []}
            onChange={(_, newValue) => setMemberIds(newValue.map((user) => user.userId))}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search members..."
                autoFocus
                sx={{
                  mt: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiInputBase-root': {
                    color: 'white'
                  }
                }}
              />
            )}
            sx={{
              width: '100%',
              '& .MuiAutocomplete-option': {
                bgcolor: '#666',
                color: 'white',
                '&:hover': {
                  bgcolor: '#777'
                }
              }
            }}
          />
        )}
      </Box>
    );
  };

  const TeamDropdown = () => {
    const teamIds = filterValues?.teamIds ?? [];
    const { data: allTeams, isError: allTeamsIsError, error: allTeamsError } = useAllTeams();

    if (allTeamsIsError) <ErrorPage message={allTeamsError.message} />;

    const teamList =
      allTeams
        ?.filter((team) => {
          return (
            team.head.userId === currUser.userId ||
            team.leads.map((user) => user.userId).includes(currUser.userId) ||
            team.members.map((user) => user.userId).includes(currUser.userId)
          );
        })
        .map((team) => team.teamId) ?? [];

    return (
      <Box sx={{ width: '100%', display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        {!dropDownTeamOpen &&
          teamIds.map((id) => {
            const team = allTeams?.find((team) => team?.teamId === id);
            return (
              <Box
                key={id}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '999px',
                  px: 1.5,
                  py: 0.5,
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                <Box>{team?.teamName ?? 'Default Team'}</Box> {teamList.includes(id) && '(You)'}
                <Box
                  onClick={() => {
                    setTeamIds(teamIds.filter((mid) => mid !== id));
                    if (teamList.includes(id)) {
                      setShowTeam(false);
                    }
                  }}
                  style={{
                    cursor: 'pointer',
                    fontSize: '16px',
                    lineHeight: 1
                  }}
                >
                  ×
                </Box>
              </Box>
            );
          })}
        {!dropDownTeamOpen && (
          <Button
            variant="contained"
            onClick={() => setDropDownTeamOpen(true)}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            Add Teams
          </Button>
        )}

        {dropDownTeamOpen && (
          <Autocomplete
            multiple
            open={dropDownTeamOpen}
            disableCloseOnSelect
            onClose={(_, reason) => {
              if (reason !== 'toggleInput') {
                setDropDownTeamOpen(false);
              }
            }}
            options={allTeams ?? []}
            getOptionLabel={(team) => `${team.teamName}`}
            value={allTeams?.filter((team) => teamIds.includes(team.teamId)) ?? []}
            onChange={(_, newValue) => setTeamIds(newValue.map((team) => team.teamId))}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search teams..."
                autoFocus
                sx={{
                  mt: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiInputBase-root': {
                    color: 'white'
                  }
                }}
              />
            )}
            sx={{
              width: '100%',
              '& .MuiAutocomplete-option': {
                bgcolor: '#666',
                color: 'white',
                '&:hover': {
                  bgcolor: '#777'
                }
              }
            }}
          />
        )}
      </Box>
    );
  };

  return (
    <NERModal
      open={open}
      hideFormButtons={true}
      onHide={() => {
        onClose();
      }}
      title={'Filter Events'}
      formId="shop-form"
      showCloseButton
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={allEventsMode}
              onChange={(e) => setAllEventsMode(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: theme.palette.primary.main
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: theme.palette.primary.main
                }
              }}
            />
          }
          label={<Typography sx={{ fontSize: 16, color: 'white' }}>Show All Events</Typography>}
        />
      </Box>
      <Box sx={{ opacity: allEventsMode ? 0.5 : 1, pointerEvents: allEventsMode ? 'none' : 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon sx={{ color: 'white', mr: 1 }} />
          <Typography variant="h6">Attendees</Typography>
        </Box>
        <MemberDropdown />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Checkbox
            checked={filterValues?.showInvited ?? false}
            onChange={(e) => {
              setShowInvited(e.target.checked);
            }}
            sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
          />
          <Typography variant="body2" sx={{ fontSize: 14, color: 'white' }}>
            Show Events I Am Invited To
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon sx={{ color: 'white', mr: 1 }} />
          <Typography variant="h6">Team / Subteam</Typography>
        </Box>
        <TeamDropdown />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Checkbox
            checked={filterValues?.showTeam ?? false}
            onChange={(e) => {
              setShowTeam(e.target.checked);
            }}
            sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
          />
          <Typography variant="body2" sx={{ fontSize: 14, color: 'white' }}>
            Show Events For Teams I Am On
          </Typography>
        </Box>
      </Box>
    </NERModal>
  );
};

export default FilterModal;
