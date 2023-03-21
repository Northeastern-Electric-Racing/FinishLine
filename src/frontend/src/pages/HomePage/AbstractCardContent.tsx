import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import CardContent from '@mui/material/CardContent';
import { Link as RouterLink } from 'react-router-dom';
import { datePipe, wbsPipe, fullNamePipe, percentPipe } from '../../utils/pipes';
import { routes } from '../../utils/routes';
import { Typography } from '@mui/material';
import DetailDisplay from '../../components/DetailDisplay';

export class CardContentInfo {
  createUpcomingDeadlineCard(input1: any, input2: any) {
    return (
      <Card
        variant="outlined"
        key={wbsPipe(input1.wbsNum)}
        sx={{ minWidth: 'fit-content', mr: 3, background: input2.palette.background.default }}
      >
        <CardContent sx={{ padding: 3 }}>
          <Link
            variant="h6"
            component={RouterLink}
            to={`${routes.PROJECTS}/${wbsPipe(input1.wbsNum)}`}
            sx={{ marginBottom: 2 }}
          >
            {wbsPipe(input1.wbsNum)} - {input1.name}
          </Link>
          <DetailDisplay label="End Date" content={datePipe(input1.endDate)} paddingRight={2} />
          <DetailDisplay
            label="Progress"
            content={percentPipe(input1.progress) + ', ' + input1.timelineStatus}
            paddingRight={2}
          />
          <DetailDisplay label="Engineering Lead" content={fullNamePipe(input1.projectLead)} paddingRight={2} />
          <DetailDisplay label="Project Manager" content={fullNamePipe(input1.projectManager)} paddingRight={2} />
          <Typography>
            {input1.expectedActivities.length} Expected Activities, {input1.deliverables.length} Deliverables
          </Typography>
        </CardContent>
      </Card>
    );
  }

  createWorkPackageTimelineCard(input1: any, input2: any) {
    return (
      <Card
        variant="outlined"
        key={wbsPipe(input1.wbsNum)}
        sx={{ minWidth: 'fit-content', mr: 3, background: input2.palette.background.default }}
      >
        <CardContent sx={{ padding: 3 }}>
          <Link
            variant="h6"
            component={RouterLink}
            to={`${routes.PROJECTS}/${wbsPipe(input1.wbsNum)}`}
            sx={{ marginBottom: 2 }}
          >
            {wbsPipe(input1.wbsNum)} - {input1.name}
          </Link>
          <DetailDisplay label="End Date" content={datePipe(input1.endDate)} paddingRight={2} />
          <DetailDisplay label="Progress" content={percentPipe(input1.progress)} paddingRight={2} />
          <DetailDisplay label="Engineering Lead" content={fullNamePipe(input1.projectLead)} paddingRight={2} />
          <DetailDisplay label="Project Manager" content={fullNamePipe(input1.projectManager)} paddingRight={2} />
          <Typography>
            {input1.expectedActivities.length} Expected Activities, {input1.deliverables.length} Deliverables
          </Typography>
        </CardContent>
      </Card>
    );
  }
}
