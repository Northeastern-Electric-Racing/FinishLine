/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { NavLink } from 'react-router-dom';
import { LinkItem } from '../../utils/types';
import { routes } from '../../utils/routes';
import { Box, Typography, useTheme, Collapse } from '@mui/material';

export interface NavPageLinkItemProps extends LinkItem {
  isSubmenuOpen?: boolean;
  onSubmenuClick?: () => void;
  isSubItem?: boolean;
}

const NavPageLink: React.FC<NavPageLinkItemProps> = ({
  name,
  route,
  icon,
  subItems,
  isSubmenuOpen,
  onSubmenuClick,
  isSubItem = false
}) => {
  const theme = useTheme();

  const renderLink = () => {
    const content = (
      <>
        {icon}
        <Typography
          sx={{
            fontSize: isSubItem ? '0.8rem' : '1rem'
          }}
        >
          {name}
        </Typography>
      </>
    );

    if (subItems) {
      return (
        <Box
          onClick={onSubmenuClick}
          sx={{
            textDecoration: 'none',
            color: theme.palette.text.primary,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '8px',
            padding: '8px',
            margin: '8px',
            cursor: 'pointer'
          }}
        >
          {content}
        </Box>
      );
    }

    return (
      <NavLink
        to={route}
        exact={route === routes.HOME}
        style={(isActive) => ({
          textDecoration: 'none',
          color: isActive ? '#ef4345' : theme.palette.text.primary,
          backgroundColor: isActive ? 'white' : 'transparent',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          gap: '8px',
          borderRadius: '8px',
          padding: isSubItem ? '2px' : '8px',
          margin: isSubItem ? '2px' : '8px',
          marginLeft: isSubItem ? '28px' : '8px'
        })}
      >
        {content}
      </NavLink>
    );
  };

  return (
    <Box>
      {renderLink()}
      {subItems && (
        <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
          {subItems.map((subItem) => (
            <NavPageLink {...subItem} isSubItem={true} />
          ))}
        </Collapse>
      )}
    </Box>
  );
};

export default NavPageLink;
