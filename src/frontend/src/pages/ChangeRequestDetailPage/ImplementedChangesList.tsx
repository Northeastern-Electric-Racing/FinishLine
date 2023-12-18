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
import DynamicTooltip from '../../components/DynamicTooltip';

interface ImplementedChangesListProps {
  changes: ImplementedChange[];
  overallDateImplemented?: Date;
}

const ImplementedChangesList: React.FC<ImplementedChangesListProps> = ({ changes, overallDateImplemented }) => {
  return (
    <h1>
    <Typography
    sx = {{fontWeight: 'bold', fontSize: 30, fontFamily: 'oswald,sans-serif'}}> Implemented Changes</Typography>
          {<>{overallDateImplemented ? datePipe(overallDateImplemented) : emDashPipe('')}</>}
      <List>
        {changes.map((ic, idx) => (
          <ListItem key={idx}>
            <DynamicTooltip title={`${fullNamePipe(ic.implementer)} - ${datePipe(ic.dateImplemented)}`}>
              {
                <Typography>
                  [
                  {
                    <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(ic.wbsNum)}`}>
                      {wbsPipe(ic.wbsNum)}
                    </Link>
                  }
                  ] {ic.detail}
                </Typography>
              }
            </DynamicTooltip>
          </ListItem>
        ))}
      </List>
      </h1>
  );
};

export default ImplementedChangesList;
