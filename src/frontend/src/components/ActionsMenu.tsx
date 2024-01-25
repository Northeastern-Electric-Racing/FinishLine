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
  dividerTop?: boolean;
};

interface ActionsMenuProps {
  buttons: ButtonInfo[];
  title?: string;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({ buttons, title = 'Actions' }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const dropdownOpen = Boolean(anchorEl);

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
      <Menu
        open={dropdownOpen}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        onClose={handleDropdownClose}
      >
        {buttons.flatMap((button, index) => {
          return [
            button.dividerTop && <Divider key={`${index}-divider`} />,
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
          ];
        })}
      </Menu>
    </Box>
  );
};

export default ActionsMenu;
