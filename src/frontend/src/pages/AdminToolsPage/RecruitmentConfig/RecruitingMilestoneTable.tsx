import MilestoneTable from './MilestoneTable';
import { useRecruitingMilestones } from '../../../hooks/recruitment.hooks';

const RecruitingMilestoneTable = () => (
  <MilestoneTable
    useMilestones={useRecruitingMilestones}
    createDefaults={{ isOnNewMemberDashboard: false, isOnRecruitingDashboard: true }}
    addButtonLabel="Add Recruiting Milestone"
  />
);

export default RecruitingMilestoneTable;
