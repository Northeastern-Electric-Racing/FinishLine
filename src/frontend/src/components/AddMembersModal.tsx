import { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { RoleEnum, User } from 'shared';
import { useAllUsers, useUpdateUserRole } from '../hooks/users.hooks';
import { useToast } from '../hooks/toasts.hooks';
import { fullNamePipe } from '../utils/pipes';
import NERModal from './NERModal';
import NERAutocomplete from './NERAutocomplete';
import LoadingIndicator from './LoadingIndicator';

interface AddMembersModalProps {
  open: boolean;
  onHide: () => void;
}

const AddMembersModal: React.FC<AddMembersModalProps> = ({ open, onHide }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { isLoading, data: users } = useAllUsers();
  const updateUserRole = useUpdateUserRole();
  const toast = useToast();
  const theme = useTheme();

  const guestUsers = users?.filter((user) => user.role === RoleEnum.GUEST) || [];

  const userToAutocompleteOption = (user: User): { label: string; id: string } => {
    return { label: `${fullNamePipe(user)} (${user.email})`, id: user.userId };
  };

  const handleUserSelect = (_event: React.SyntheticEvent<Element, Event>, value: { label: string; id: string } | null) => {
    if (value) {
      const user = guestUsers.find((user) => user.userId === value.id);
      setSelectedUser(user || null);
    } else {
      setSelectedUser(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser) return;

    try {
      await updateUserRole.mutateAsync({ userId: selectedUser.userId, role: RoleEnum.MEMBER });
      toast.success(`Successfully promoted ${fullNamePipe(selectedUser)} to Member!`);
      setSelectedUser(null);
      onHide();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to promote user: ${error.message}`);
      }
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    onHide();
  };

  if (isLoading) {
    return (
      <NERModal open={open} onHide={handleClose} title="Add Members">
        <LoadingIndicator />
      </NERModal>
    );
  }

  return (
    <NERModal
      open={open}
      onHide={handleClose}
      title="Promote Guest to Member"
      onSubmit={handleSubmit}
      disabled={!selectedUser || updateUserRole.isLoading}
      submitText="Submit"
    >
      <Box sx={{ minWidth: 400, p: 2 }}>
        <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary }}>
          Select a guest user to promote to member status. As a leadership member, you can only promote guests to members.
        </Typography>

        {guestUsers.length === 0 ? (
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic' }}>
            No guest users available to promote.
          </Typography>
        ) : (
          <NERAutocomplete
            id="guest-users-autocomplete"
            onChange={handleUserSelect}
            options={guestUsers.map(userToAutocompleteOption)}
            size="small"
            placeholder="Select a guest user to promote"
            value={selectedUser ? userToAutocompleteOption(selectedUser) : null}
          />
        )}
      </Box>
    </NERModal>
  );
};

export default AddMembersModal;
