/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ImplementedChange } from 'shared';
import { datePipe, emDashPipe, fullNamePipe, wbsPipe } from '../../../../pipes';
import { routes } from '../../../../routes';
import BulletList from '../../../../components/bullet-list/bullet-list';

interface ImplementedChangesListProps {
  changes: ImplementedChange[];
  overallDateImplemented?: Date;
}

const ImplementedChangesList: React.FC<ImplementedChangesListProps> = ({
  changes,
  overallDateImplemented
}) => {
  return (
    <BulletList
      title={'Implemented Changes'}
      headerRight={
        <>{overallDateImplemented ? datePipe(overallDateImplemented) : emDashPipe('')}</>
      }
      list={changes.map((ic) => (
        <>
          [<Link to={`${routes.PROJECTS}/${wbsPipe(ic.wbsNum)}`}>{wbsPipe(ic.wbsNum)}</Link>]{' '}
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
    />
  );
};

export default ImplementedChangesList;
