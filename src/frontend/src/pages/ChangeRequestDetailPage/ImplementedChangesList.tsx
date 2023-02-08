/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ImplementedChange } from 'shared';
import { datePipe, emDashPipe, fullNamePipe, wbsPipe } from '../../utils/pipes';
import { routes } from '../../utils/routes';
import { Link, ListItem, List, Typography } from '@mui/material';
import PageBlock from '../../layouts/PageBlock';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import { useWindowSize } from '../../hooks/changes-list.hooks';
import DynamicTooltip from '../../components/DynamicTooltip';

interface ImplementedChangesListProps {
  changes: ImplementedChange[];
  overallDateImplemented?: Date;
}

const ImplementedChangesList: React.FC<ImplementedChangesListProps> = ({ changes, overallDateImplemented }) => {
  const [bodyWidth, setBodyWidth] = useState<number>(window.document.body.offsetWidth);

  window.document.body.addEventListener('resize', () => {
    setBodyWidth(window.document.body.offsetWidth);
  });

  let [innerWidth, position] = useWindowSize(bodyWidth) as [number, 'top' | 'right'];

  return (
    <PageBlock
      title={'Implemented Changes'}
      headerRight={<>{overallDateImplemented ? datePipe(overallDateImplemented) : emDashPipe('')}</>}
    >
      <List>
        {changes.map((ic, idx) => (
          <ListItem key={idx}>
            <DynamicTooltip
              id="tooltip"
              title={
                <Typography>
                  {fullNamePipe(ic.implementer)} - {datePipe(ic.dateImplemented)}
                </Typography>
              }
              placement={position}
              innerWidth={innerWidth}
              arrow
            >
              <Typography>
                [
                {
                  <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(ic.wbsNum)}`}>
                    {wbsPipe(ic.wbsNum)}
                  </Link>
                }
                ] {ic.detail}
              </Typography>
            </DynamicTooltip>
          </ListItem>
        ))}
      </List>
    </PageBlock>
  );
};

export default ImplementedChangesList;
