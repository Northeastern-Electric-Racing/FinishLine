/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { NavDropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

const NavNotificationsMenu: React.FC = () => {
  return (
    <NavDropdown
      className="m-auto"
      title={<FontAwesomeIcon icon={faBell} inverse />}
      id="notifications-dropdown"
      alignRight
    >
      <NavDropdown.ItemText>
        0 Notifications <strong>*Coming Soon*</strong>
      </NavDropdown.ItemText>
    </NavDropdown>
  );
};

export default NavNotificationsMenu;
