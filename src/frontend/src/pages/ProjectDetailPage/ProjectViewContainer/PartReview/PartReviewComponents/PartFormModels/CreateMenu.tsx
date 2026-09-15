import AddIcon from '@mui/icons-material/Add';
import FilterIcon from '@mui/icons-material/Filter';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import { useState } from 'react';
import { useCurrentUser } from '../../../../../../hooks/users.hooks';
import { Box, Button, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import { PartPreview, WbsNumber, isGuest } from 'shared';
import CreatePartModal from './CreatePartModal';
import CreateSubmissionModal from './CreateSubmissionModal';
import CreateReviewModal from './CreateReviewModal';

type CreateMenuProps = {
  wbsNum: WbsNumber;
  partsInProject: PartPreview[];
};

const CreateMenu: React.FC<CreateMenuProps> = ({ wbsNum, partsInProject }: CreateMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showAddSubmission, setShowAddSubmission] = useState(false);
  const [showCreatePart, setShowCreatePart] = useState(false);
  const [showCreateReivew, setShowCreateReview] = useState(false);

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
      <CreatePartModal
        open={showCreatePart}
        handleClose={() => setShowCreatePart(false)}
        partsInProject={partsInProject}
        wbsNum={wbsNum}
      />
      <CreateSubmissionModal
        open={showAddSubmission}
        handleClose={() => setShowAddSubmission(false)}
        partsInProject={partsInProject}
      />
      <CreateReviewModal
        open={showCreateReivew}
        handleClose={() => setShowCreateReview(false)}
        partsInProject={partsInProject}
      />
      <Button
        disabled={isGuest(user.role)}
        onClick={handleClick}
        sx={{
          border: 1,
          height: '2.25rem'
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
            setShowAddSubmission(true);
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
            setShowCreateReview(true);
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
            setShowCreatePart(true);
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
