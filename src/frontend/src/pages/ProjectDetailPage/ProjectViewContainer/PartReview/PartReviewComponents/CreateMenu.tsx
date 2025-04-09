import AddIcon from '@mui/icons-material/Add';
import FilterIcon from '@mui/icons-material/Filter';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import { useState } from 'react';
import { useCurrentUser } from '../../../../../hooks/users.hooks';
import { Box, Button, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import { isGuest } from 'shared';

const CreateMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const dropdownOpen = Boolean(anchorEl);
  const user = useCurrentUser();
  return (
    <Box>
      <Button
        disabled={isGuest(user.role)}
        onClick={handleClick}
        sx={{
          border: 1
        }}
      >
        <AddIcon fontSize="small" />
        <Typography fontSize={'.75rem'} align="center">
          NEW
        </Typography>
      </Button>
      <Menu open={dropdownOpen} anchorEl={anchorEl} onClose={handleDropdownClose}>
        <MenuItem
          onClick={() => {
            handleDropdownClose();
          }}
        >
          <ListItemIcon>
            <FilterIcon />
          </ListItemIcon>
          New Submission
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDropdownClose();
          }}
        >
          <ListItemIcon>
            <EditNoteOutlinedIcon />
          </ListItemIcon>
          New Review
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDropdownClose();
          }}
        >
          <ListItemIcon>
            <PostAddOutlinedIcon />
          </ListItemIcon>
          New Part
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CreateMenu;
