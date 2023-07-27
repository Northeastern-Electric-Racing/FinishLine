/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { NavLink } from 'react-router-dom';
import { NavPageLinkItemProps } from '../../utils/types';
import { routes } from '../../utils/routes';
import { Typography } from '@mui/material';

const NavPageLink: React.FC<NavPageLinkItemProps> = ({ open, name, route, icon }) => {
  return (
    <NavLink
      key={name}
      to={route}
      exact={route === routes.HOME}
      style={(isActive) => {
        return {
          textDecoration: 'none',
          color: isActive ? '#ef4345' : 'white',
          backgroundColor: isActive ? 'white' : 'transparent',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: open ? 'flex-start' : 'center',
          gap: '8px',
          borderRadius: '8px',
          padding: '8px',
          margin: '8px'
        };
      }}
    >
      {icon}
      {open && <Typography>{name}</Typography>}
    </NavLink>
  );
};

export default NavPageLink;
