/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Avatar } from '@mui/material';
import { useUserSlackPhotoUrl } from '../hooks/users.hooks';

interface UserAvatarProps {
  userId: string;
  firstName: string;
  lastName: string;
  size?: number;
}

/**
 * Shows a user's Slack profile photo, or their initials when no photo is available.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({ userId, firstName, lastName, size = 32 }) => {
  const { data: photoUrl } = useUserSlackPhotoUrl(userId);

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <Avatar
      variant="square"
      src={photoUrl ?? undefined}
      alt={`${firstName} ${lastName}`}
      sx={{ width: size, height: size, fontSize: size / 2.5 }}
    >
      {initials}
    </Avatar>
  );
};
