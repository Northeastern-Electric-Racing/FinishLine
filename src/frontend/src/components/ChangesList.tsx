/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Link } from '@mui/material';
import Typography from '@mui/material/Typography';
import { ImplementedChange } from 'shared';
import { fullNamePipe, datePipe } from '../utils/pipes';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../utils/routes';
import BulletList from './BulletList';
import { useState } from 'react';
import { useWindowSize } from '../hooks/changes-list.hooks';
import DynamicTooltip from './DynamicTooltip';

interface ChangesListProps {
  changes: ImplementedChange[];
}

const ChangesList: React.FC<ChangesListProps> = ({ changes }) => {
  const [bodyWidth, setBodyWidth] = useState<number>(window.document.body.offsetWidth);

  window.document.body.addEventListener('resize', () => {
    setBodyWidth(window.document.body.offsetWidth);
  });

  let [innerWidth, position] = useWindowSize(bodyWidth) as [number, 'top' | 'right'];

  return (
    <BulletList
      title={'Changes'}
      list={changes.map((ic) => (
        <>
          [
          <Link component={RouterLink} to={`${routes.CHANGE_REQUESTS}/${ic.changeRequestId}`}>
            #{ic.changeRequestId}
          </Link>
          ]{' '}
          <DynamicTooltip
            id="tooltip"
            title={
              <>
                <Typography variant="body2">
                  {fullNamePipe(ic.implementer)} - {datePipe(ic.dateImplemented)}
                </Typography>
              </>
            }
            placement={position}
            innerWidth={innerWidth}
            arrow
          >
            <Typography component="span">{ic.detail}</Typography>
          </DynamicTooltip>
        </>
      ))}
      readOnly={true}
      defaultClosed
    />
  );
};

export default ChangesList;
