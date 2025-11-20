import { WbsElementPreview } from 'shared';
import { RequestEventChange } from '../../../../utils/gantt.utils';
import { GanttProjectCreateModal } from './GanttProjectCreateModal';
import { GanttTimeLineChangeModal } from './GanttTimeLineChangeModal';

export interface GanttRequestChangeModalProps {
  change: RequestEventChange<WbsElementPreview>;
  handleClose: (didCancel: boolean) => void;
  open: boolean;
}

export const GanttRequestChangeModal = ({ change, handleClose, open }: GanttRequestChangeModalProps) => {
  switch (change.type) {
    case 'create-task':
      return <GanttProjectCreateModal change={change} handleClose={handleClose} open={open} />;
    case 'edit-task':
      return <GanttTimeLineChangeModal change={change} handleClose={handleClose} open={open} />;
  }
};
