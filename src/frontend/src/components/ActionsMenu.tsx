import { Box } from '@mui/system';
import { ReactElement, useState } from 'react';
import { NERButton } from './NERButton';
import { ArrowDropDown } from '@mui/icons-material';
import { ListItemIcon, Menu, MenuItem } from '@mui/material';

export type ButtonInfo = {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactElement;
};

interface ActionsMenuProps {
  buttons: ButtonInfo[];
  title?: string;
  divider?: ReactElement;
}

interface menuButtonProps {
  divider?: ReactElement;
  index: number;
  button: ButtonInfo;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({ buttons, title = 'Actions', divider = <></> }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const dropdownOpen = Boolean(anchorEl);

  const menuButton: React.FC<menuButtonProps> = ({ divider = <></>, index, button }): ReactElement => {
    return (
      <div>
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
        {divider}
      </div>
    );
  };

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
          if (index === buttons.length - 1) {
            return <>{menuButton({ index, button })}</>;
          }
          return <>{menuButton({ divider, index, button })}</>;
        })}
      </Menu>
    </Box>
  );
};

export default ActionsMenu;
