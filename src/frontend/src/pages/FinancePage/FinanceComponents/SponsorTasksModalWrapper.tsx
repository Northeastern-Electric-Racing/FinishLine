import React from 'react';
import { Sponsor } from 'shared';
import { useCreateSponsorTask, useGetSponsorTasks } from '../../../hooks/finance.hooks';
import SponsorTasksModal from './SponsorTasksModal';

interface SponsorTasksModalWrapperProps {
  onClose: () => void;
  sponsor: Sponsor;
}

const SponsorTasksModalWrapper: React.FC<SponsorTasksModalWrapperProps> = ({ onClose, sponsor }) => {
  const { data: tasks } = useGetSponsorTasks(sponsor.sponsorId);
  const { mutate: createTask } = useCreateSponsorTask(sponsor.sponsorId);

  return <SponsorTasksModal onClose={onClose} tasks={tasks} createTask={createTask} />;
};

export default SponsorTasksModalWrapper;
