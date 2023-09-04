/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Link } from '@mui/material';
import Typography from '@mui/material/Typography';
import { ImplementedChange } from 'shared';
import { fullNamePipe, datePipe } from '../utils/pipes';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../utils/routes';
import DynamicTooltip from './DynamicTooltip';

interface ChangesListProps {
  changes: ImplementedChange[];
}

const ChangesList: React.FC<ChangesListProps> = ({ changes }) => {
  return (
    <Box>
      <ul style={{ paddingLeft: '5px', marginBottom: '0em', listStyleType: 'none' }}>
        {changes.map((ic, idx) => (
          <li key={idx}>
            <Box style={{ display: 'flex', flexDirection: 'row' }}>
              <div style={{ marginRight: '4px' }}>
                [
                <Link component={RouterLink} to={`${routes.CHANGE_REQUESTS}/${ic.changeRequestId}`}>
                  #{ic.changeRequestId}
                </Link>
                ]
              </div>
              <DynamicTooltip title={`${fullNamePipe(ic.implementer)} - ${datePipe(ic.dateImplemented)}`}>
                <Typography component="span">{ic.detail}</Typography>
              </DynamicTooltip>
            </Box>
          </li>
        ))}
      </ul>
    </Box>
  );
};

export default ChangesList;
