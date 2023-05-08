/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { NavLink } from 'react-router-dom';
import { MUILinkItem } from '../../utils/types';
import { routes } from '../../utils/routes';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';
import { useTheme } from '@emotion/react';
import { CSSProperties } from 'react';
import { nerThemeOptions } from '../../utils/themes';

interface NavPageLinkProps {
  linkItems: MUILinkItem[];
}

const NavPageLinks: React.FC<NavPageLinkProps> = ({ linkItems }: NavPageLinkProps) => {
  const navLinks = linkItems.map((item) => (
    <NavLink
      key={item.name}
      to={item.route}
      exact={item.route === routes.HOME}
      style={(isActive): CSSProperties => {
        return {
          textDecoration: 'none',
          color: isActive ? '#ef4345' : 'white',
          backgroundColor: isActive ? 'white' : 'transparent',
          display: 'flex',
          flexDirection: 'row',
          gap: '8px',
          borderRadius: '8px',
          padding: '8px',
          margin: '8px'
        };
      }}
    >
      {item.icon}
      <Typography>{item.name}</Typography>
    </NavLink>
  ));
  return <Box>{navLinks}</Box>;
};

export default NavPageLinks;
