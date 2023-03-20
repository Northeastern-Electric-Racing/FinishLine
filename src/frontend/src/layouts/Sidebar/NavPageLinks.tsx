/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { NavLink } from 'react-router-dom';
import { IconButton } from '@mui/material';
import { LinkItem } from '../../utils/types';
import { routes } from '../../utils/routes';
import styles from '../../stylesheets/layouts/sidebar/nav-page-links.module.css';

interface NavPageLinkProps {
  linkItems: LinkItem[];
}

const NavPageLinks: React.FC<NavPageLinkProps> = ({ linkItems }: NavPageLinkProps) => {
  const genNavItems = (linkItems: LinkItem[]) => {
    return linkItems.map((item) => {
      const IconComponent = item.icon;
      return (
        <NavLink
          key={item.name}
          to={item.route}
          className={styles.row}
          activeClassName={styles.activeLink}
          exact={item.route === routes.HOME}
        >
          {IconComponent ? (
            <IconButton className={styles.iconsAndText + ' ' + styles.icon}>
              <IconComponent fontSize="large" />
            </IconButton>
          ) : (
            ''
          )}
          <p className={styles.iconsAndText + ' ' + styles.text}>{item.name}</p>
        </NavLink>
      );
    });
  };
  return <div className={styles.navPageLinks}>{genNavItems(linkItems)}</div>;
};

export default NavPageLinks;
