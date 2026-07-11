import MilestoneTable from './MilestoneTable';
import { useNewMemberMilestones } from '../../../hooks/recruitment.hooks';

const NewMemberMilestoneTable = () => (
  <MilestoneTable
    useMilestones={useNewMemberMilestones}
    createDefaults={{ isOnNewMemberDashboard: true, isOnRecruitingDashboard: false }}
    addButtonLabel="Add Onboarding Milestone"
  />
);

export default NewMemberMilestoneTable;
