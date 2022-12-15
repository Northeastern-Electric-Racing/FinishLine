/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ImplementedChange } from 'shared';
import { datePipe, emDashPipe, fullNamePipe, wbsPipe } from '../../utils/pipes';
import { routes } from '../../utils/routes';
import { Link, ListItem, List, Tooltip, Typography } from '@mui/material';
import PageBlock from '../../layouts/PageBlock';

interface ImplementedChangesListProps {
  changes: ImplementedChange[];
  overallDateImplemented?: Date;
}

const ImplementedChangesList: React.FC<ImplementedChangesListProps> = ({ changes, overallDateImplemented }) => {
  return (
    <PageBlock
      title={'Implemented Changes'}
      headerRight={<>{overallDateImplemented ? datePipe(overallDateImplemented) : emDashPipe('')}</>}
    >
      <List>
        {changes.map((ic, idx) => (
          <ListItem key={idx}>
            <Tooltip
              id="tooltip"
              title={
                <Typography>
                  {fullNamePipe(ic.implementer)} - {datePipe(ic.dateImplemented)}
                </Typography>
              }
              placement="right"
            >
              <Typography>
                [{<Link href={`${routes.PROJECTS}/${wbsPipe(ic.wbsNum)}`}>{wbsPipe(ic.wbsNum)}</Link>}] {ic.detail}
              </Typography>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </PageBlock>
  );
};

export default ImplementedChangesList;
