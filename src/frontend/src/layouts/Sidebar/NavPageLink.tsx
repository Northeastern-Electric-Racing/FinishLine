/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { NavLink } from 'react-router-dom';
import { LinkItem } from '../../utils/types';
import { routes } from '../../utils/routes';
import { Typography, useTheme } from '@mui/material';

export interface NavPageLinkItemProps extends LinkItem {
  open?: boolean;
}

const NavPageLink: React.FC<NavPageLinkItemProps> = ({ name, route, icon }) => {
  const theme = useTheme();
  return (
    <NavLink
      key={name}
      to={route}
      exact={route === routes.HOME}
      style={(isActive) => {
        return {
          textDecoration: 'none',
          color: isActive ? '#ef4345' : theme.palette.text.primary,
          backgroundColor: isActive ? 'white' : 'transparent',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          gap: '8px',
          borderRadius: '8px',
          padding: '8px',
          margin: '8px'
        };
      }}
    >
      {icon}
      <Typography>{name}</Typography>
    </NavLink>
  );
};

export default NavPageLink;
