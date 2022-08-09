/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Nav, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { routes } from '../../routes';
import { useAuth } from '../../services/auth.hooks';
import { fullNamePipe } from '../../pipes';
import NavUserMenu from './nav-user-menu/nav-user-menu';
import NavNotificationsMenu from './nav-notifications-menu/nav-notifications-menu';
import styles from './nav-top-bar.module.css';

const NavTopBar: React.FC = () => {
  const auth = useAuth();

  return (
    <Navbar className={styles.mainBackground} variant="light" expand="md" fixed="top">
      <Navbar.Brand as="div">
        <Link className="d-flex" to={routes.HOME} style={{ textDecoration: 'none' }}>
          <img
            className={`d-inline-block align-top ${styles.logo}`}
            src={'/NER-Logo-App-Icon.png'}
            alt="Northeastern Electric Racing Logo"
          />{' '}
          <h3 className={styles.title}>NER PM Dashboard</h3>
        </Link>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="nav-top-bar-items" />
      <Navbar.Collapse id="nav-top-bar-items">
        <Nav className="ml-auto">
          <NavNotificationsMenu />
          <div className={styles.username}>{fullNamePipe(auth.user)}</div>
          <NavUserMenu />
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavTopBar;
