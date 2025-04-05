import { Grid } from '@mui/system';
import { Part } from 'shared';
import { completePartHistory } from '../../../utils/part.utils';

interface PartHistoryViewProps {
  part: Part;
}

const PartHistoryView: React.FC<PartHistoryViewProps> = ({ part }: PartHistoryViewProps) => {
  const historyEntries: string[] = completePartHistory(part);

  return (
    <Grid>
      {historyEntries.map((entry, index) => (
        <Grid key={index}>{entry}</Grid>
      ))}
    </Grid>
  );
};

export default PartHistoryView;
