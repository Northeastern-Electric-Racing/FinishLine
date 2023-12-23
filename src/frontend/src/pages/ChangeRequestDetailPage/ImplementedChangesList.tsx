/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ImplementedChange } from 'shared';
import { datePipe, fullNamePipe, wbsPipe } from '../../utils/pipes';
import { routes } from '../../utils/routes';
import { Link, ListItem, List, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DynamicTooltip from '../../components/DynamicTooltip';
import InfoBlock from '../../components/InfoBlock';

interface ImplementedChangesListProps {
  changes: ImplementedChange[];
  overallDateImplemented?: Date;
}

const ImplementedChangesList: React.FC<ImplementedChangesListProps> = ({ changes, overallDateImplemented }) => {
  return (
    <InfoBlock title={`Implemented Changes${overallDateImplemented ? ' — ' + datePipe(overallDateImplemented) : ''}`}>
      <List>
        {changes.length === 0 ? (
          <Typography>— — There are no implemented changes for this change request.</Typography>
        ) : (
          changes.map((ic, idx) => (
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
          ))
        )}
      </List>
    </InfoBlock>
  );
};

export default ImplementedChangesList;
