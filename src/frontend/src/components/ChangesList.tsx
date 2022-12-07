/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Link } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { ImplementedChange } from 'shared';
import { fullNamePipe, datePipe } from '../utils/Pipes';
import { routes } from '../utils/Routes';
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
          [<Link to={`${routes.CHANGE_REQUESTS}/${ic.changeRequestId}`}>#{ic.changeRequestId}</Link>]{' '}
          <Tooltip
            id="tooltip"
            title={
              <>
                <Typography variant="body2">
                  {fullNamePipe(ic.implementer)} - {datePipe(ic.dateImplemented)}
                </Typography>
              </>
            }
            placement="right"
            arrow
          >
            <Typography component="span">{ic.detail}</Typography>
          </Tooltip>
        </>
      ))}
      readOnly={true}
      defaultClosed
    />
  );
};

export default ChangesList;
