/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Card, CardContent, Link, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { ImplementedChange } from 'shared';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../../../utils/routes';
import DynamicTooltip from '../../../components/DynamicTooltip';
import { datePipe, fullNamePipe } from '../../../utils/pipes';

interface ProjectChangesListProps {
  changes: ImplementedChange[];
}

const styles = {
  bulletList: {
    paddingLeft: '35px',
    marginBottom: '0em'
  }
};

const ProjectChangesList: React.FC<ProjectChangesListProps> = ({ changes }) => {
  const theme = useTheme();

  return (
    <Card sx={{ my: 2, background: theme.palette.background.paper }} variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography
            variant="h5"
            sx={{
              cursor: 'pointer'
            }}
          >
            Changes
          </Typography>
        </Box>
        <Box>
          <ul style={styles.bulletList}>
            {changes.map((ic, idx) => (
              <li key={idx}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
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
                </div>
              </li>
            ))}
          </ul>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectChangesList;
