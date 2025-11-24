import React, { useEffect, useState } from 'react';
import { Autocomplete, Box, Button, Checkbox, FormControl, FormHelperText, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Shop, User } from 'shared';
import { useToast } from '../../hooks/toasts.hooks';
import NERFormModal from '../../components/NERFormModal';
import ReactHookTextField from '../../components/ReactHookTextField';
import NERModal from '../../components/NERModal';
import PeopleIcon from '@mui/icons-material/People';
import { useAllUsers } from '../../hooks/users.hooks';
import { width } from '@mui/system';

export interface FilterFormValues {
  memberIds: string[];
  teamIds: string[];
  showInvited: boolean;
  showTeam: boolean;
}

export interface BaseFilterModalProps {
  open: boolean;
  onClose: () => void;
  filterValues?: FilterFormValues;
  setMemberIds: React.Dispatch<React.SetStateAction<string[]>>;
  setTeamIds: React.Dispatch<React.SetStateAction<string[]>>;
  setShowInvited: React.Dispatch<React.SetStateAction<boolean>>;
  setShowTeam: React.Dispatch<React.SetStateAction<boolean>>;
}

const FilterModal: React.FC<BaseFilterModalProps> = ({
  open,
  onClose,
  filterValues,
  setMemberIds,
  setTeamIds,
  setShowInvited,
  setShowTeam
}) => {
  const [dropDownOpen, setDropDownOpen] = useState(false);

  const MemberDropdown = () => {
    const memberIds = filterValues?.memberIds ?? [];
    const { isLoading, isError, error, data: allUsers } = useAllUsers();

    return (
      <Box sx={{ width: '100%', display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        {!dropDownOpen &&
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
                  {user?.firstName ?? 'John'} {user?.lastName ?? 'Doe'}
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
        {!dropDownOpen && (
          <Button
            variant="contained"
            onClick={() => setDropDownOpen(true)}
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

        {dropDownOpen && (
          <Autocomplete
            multiple
            open={dropDownOpen}
            disableCloseOnSelect
            onClose={(_, reason) => {
              if (reason !== 'toggleInput') {
                setDropDownOpen(false);
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Checkbox
          checked={filterValues?.showTeam ?? false}
          onChange={(e) => {
            setShowTeam(e.target.checked);
          }}
          sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
        />
        <Typography variant="body2" sx={{ fontSize: 14, color: 'white' }}>
          Show Events I For Teams I Am On
        </Typography>
      </Box>
    </NERModal>
  );
};

export default FilterModal;
