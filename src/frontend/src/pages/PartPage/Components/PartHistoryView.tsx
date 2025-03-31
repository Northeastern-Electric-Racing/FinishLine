import { Grid } from '@mui/system';
import { Part } from 'shared';
import { completePartHistory } from '../../../utils/part.utils';

interface PartHistoryViewProps {
  part: Part;
}

const PartHistoryView: React.FC<PartHistoryViewProps> = ({ part }: PartHistoryViewProps) => {
  const historyEntries = completePartHistory(part);

  return <Grid> /* History Entries */ </Grid>;
};

export default PartHistoryView;
