import { Grid } from '@mui/system';
import { Part } from 'shared';
import { completePartHistory } from '../../../utils/part.utils';

// Take in part shared type
// and then to test it you can make your own test part and pass it into your component.
interface PartHistoryViewProps {
  part: Part;
}

const PartHistoryView: React.FC<PartHistoryViewProps> = ({ part }: PartHistoryViewProps) => {
  const historyEntries = completePartHistory(part);

  return <Grid> /* History Entries */ </Grid>;
};

export default PartHistoryView;
