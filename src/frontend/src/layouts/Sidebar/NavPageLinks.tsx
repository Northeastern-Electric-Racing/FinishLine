/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LinkItem } from '../../utils/Types';
import { routes } from '../../utils/Routes';
import styles from '../../stylesheets/layouts/sidebar/nav-page-links.module.css';

interface NavPageLinkProps {
  linkItems: LinkItem[];
}

const NavPageLinks: React.FC<NavPageLinkProps> = ({ linkItems }: NavPageLinkProps) => {
  const genNavItems = (linkItems: LinkItem[]) => {
    return linkItems.map((item) => {
      return (
        <NavLink
          key={item.name}
          to={item.route}
          className={styles.row}
          activeClassName={styles.activeLink}
          exact={item.route === routes.HOME}
        >
          {item.icon ? (
            <FontAwesomeIcon
              icon={item.icon!}
              size="2x"
              className={styles.iconsAndText + ' ' + styles.icon}
            />
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
