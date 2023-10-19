import Box from '@mui/material/Box';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
import { WbsElementStatus } from 'shared';
import OverdueWorkPackageAlert from './OverdueWorkPackageAlert';
import { useCurrentUser } from '../../hooks/users.hooks';

const OverdueWorkPackageAlerts: React.FC = () => {
  const user = useCurrentUser();
  const workPackages = useAllWorkPackages({ status: WbsElementStatus.Active });
  const currentDate = new Date();

  return (
    <Box>
      {workPackages.data
        ?.filter((wp) => wp.projectLead?.userId === user.userId)
        ?.filter((wp) => new Date(wp.endDate) < currentDate)
        .map((wp) => (
          <OverdueWorkPackageAlert wp={wp} />
        ))}
    </Box>
  );
};

export default OverdueWorkPackageAlerts;
