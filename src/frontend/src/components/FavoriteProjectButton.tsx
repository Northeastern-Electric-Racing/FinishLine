/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { IconButton } from '@mui/material';
import { isGuest, WbsNumber, wbsPipe } from 'shared';
import { useCurrentUser } from '../hooks/users.hooks';
import StarIcon from '@mui/icons-material/Star';
import { useToggleProjectFavorite } from '../hooks/projects.hooks';
import { useToast } from '../hooks/toasts.hooks';

interface FavoriteProjectButtonProps {
  wbsNum: WbsNumber;
  projectIsFavorited: boolean;
}

const FavoriteProjectButton = ({ wbsNum, projectIsFavorited }: FavoriteProjectButtonProps) => {
  const user = useCurrentUser();
  const toast = useToast();
  const { mutateAsync: mutateAsyncToggleProjectFavorite } = useToggleProjectFavorite(wbsNum);

  const onClick = async () => {
    try {
      await mutateAsyncToggleProjectFavorite();
      toast.info(`Successfully ${projectIsFavorited ? 'un' : ''}favorited project ${wbsPipe(wbsNum)}!`);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  return (
    <IconButton
      onClick={onClick}
      disabled={isGuest(user.role)}
      sx={{
        color: projectIsFavorited ? 'Gold' : 'lightgray',
        ml: 2,
        mt: '3px',
        maxHeight: '37.05px',
        maxWidth: '37.05px'
      }}
    >
      <StarIcon fontSize="large" />
    </IconButton>
  );
};

export default FavoriteProjectButton;
