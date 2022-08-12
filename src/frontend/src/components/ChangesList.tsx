/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ImplementedChange } from 'shared';
import { fullNamePipe, datePipe } from '../utils/pipes';
import { routes } from '../utils/routes';
import BulletList from './BulletList';

interface ChangesListProps {
  changes: ImplementedChange[];
}

const ChangesList: React.FC<ChangesListProps> = ({ changes }) => {
  return (
    <BulletList
      title={'Changes'}
      list={changes.map((ic) => (
        <>
          [<Link to={`${routes.CHANGE_REQUESTS}/${ic.changeRequestId}`}>#{ic.changeRequestId}</Link>
          ]{' '}
          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip id="tooltip">
                {fullNamePipe(ic.implementer)} - {datePipe(ic.dateImplemented)}
              </Tooltip>
            }
          >
            <span>{ic.detail}</span>
          </OverlayTrigger>
        </>
      ))}
      readOnly={true}
    />
  );
};

export default ChangesList;
