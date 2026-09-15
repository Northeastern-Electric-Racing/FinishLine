/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React from 'react';
import { ProspectiveSponsor } from 'shared';
import { useCreateProspectiveSponsorTask, useProspectiveSponsorTasks } from '../../../hooks/finance.hooks';
import SponsorTasksModal from './SponsorTasksModal';

interface ProspectiveSponsorTasksModalProps {
  onClose: () => void;
  prospectiveSponsor: ProspectiveSponsor;
  canEdit?: boolean;
}

const ProspectiveSponsorTasksModal: React.FC<ProspectiveSponsorTasksModalProps> = ({
  onClose,
  prospectiveSponsor,
  canEdit = true
}) => {
  const { data: tasks } = useProspectiveSponsorTasks(prospectiveSponsor.prospectiveSponsorId);
  const { mutate: createTask } = useCreateProspectiveSponsorTask(prospectiveSponsor.prospectiveSponsorId);

  return <SponsorTasksModal onClose={onClose} tasks={tasks} createTask={createTask} canEdit={canEdit} />;
};

export default ProspectiveSponsorTasksModal;
