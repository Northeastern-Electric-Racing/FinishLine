import { Box } from '@mui/system';
import { ReactElement, useState } from 'react';
import { NERButton } from './NERButton';
import { ArrowDropDown } from '@mui/icons-material';
import { Divider, ListItemIcon, Menu, MenuItem } from '@mui/material';

export type ButtonInfo = {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactElement;
};

interface ActionsMenuProps {
  buttons: ButtonInfo[];
  title?: string;
  divider?: boolean;
}

interface menuButtonProps {
  divider?: boolean;
  index: number;
  button: ButtonInfo;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({ buttons, title = 'Actions', divider = false }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const dropdownOpen = Boolean(anchorEl);

  const MenuButton: React.FC<menuButtonProps> = ({ divider = false, index, button }) => (
    <>
      <MenuItem
        key={index}
        onClick={() => {
          handleDropdownClose();
          button.onClick();
        }}
        disabled={button.disabled}
      >
        <ListItemIcon>{button.icon}</ListItemIcon>
        {button.title}
      </MenuItem>
      {divider ? <Divider /> : <></>}
    </>
  );

  return (
    <Box>
      <NERButton
        endIcon={<ArrowDropDown style={{ fontSize: 28 }} />}
        variant="contained"
        id="reimbursement-request-actions-dropdown"
        onClick={handleClick}
      >
        {title}
      </NERButton>
      <Menu open={dropdownOpen} anchorEl={anchorEl} onClose={handleDropdownClose}>
        {buttons.map((button, index) => {
          return index === buttons.length - 1 ? (
            <MenuButton index={index} button={button} />
          ) : (
            <MenuButton index={index} button={button} divider={divider} />
          );
        })}
      </Menu>
    </Box>
  );
};

export default ActionsMenu;
