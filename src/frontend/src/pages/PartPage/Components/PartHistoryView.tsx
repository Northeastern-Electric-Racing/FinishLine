import { Grid } from '@mui/system';
import { Part } from 'shared';
import { completePartHistory } from '../../../utils/part.utils';
import ScrollablePageBlock from '../../HomePage/components/ScrollablePageBlock';

interface PartHistoryViewProps {
  part: Part;
}

const PartHistoryView: React.FC<PartHistoryViewProps> = ({ part }: PartHistoryViewProps) => {
  const historyEntries: string[] = completePartHistory(part);

  return (
    <ScrollablePageBlock>
      <Grid>
        {historyEntries.map((entry, index) => (
          <Grid key={index}>{entry}</Grid>
        ))}
      </Grid>
    </ScrollablePageBlock>
  );
};

export default PartHistoryView;
