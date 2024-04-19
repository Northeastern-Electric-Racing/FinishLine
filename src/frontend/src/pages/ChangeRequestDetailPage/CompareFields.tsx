import { Box, Typography } from '@mui/material';
import { DescriptionBullet } from 'shared';

export interface PotentialChange {
  field: string;
  content: string | DescriptionBullet[];
}

interface CompareFieldsProps {
  first: PotentialChange;
  second: PotentialChange;
  isProposed: boolean;
}

interface BulletListProps {
  bullets?: DescriptionBullet[]; // Make bullets optional
}

export const BulletList: React.FC<BulletListProps> = ({ bullets }) => {
  if (!bullets) return null; // Return null if bullets is undefined

  return (
    <ul style={{ paddingLeft: '25px', marginBottom: '0.5em' }}>
      {bullets
        .filter((bullet) => !bullet.dateDeleted)
        .map((bullet, idx) => (
          <li key={idx}>{bullet.detail}</li>
        ))}
    </ul>
  );
};

const CompareFields: React.FC<CompareFieldsProps> = ({ first, second, isProposed }: CompareFieldsProps) => {
  const renderContent = (content: string | DescriptionBullet[]) => {
    if (typeof content === 'string') {
      return (
        <Typography padding="5px" display="inline">
          {content}
        </Typography>
      );
    } else {
      return (
        <ul style={{ paddingLeft: '25px', marginBottom: '0.5em' }}>
          {content
            .filter((bullet) => !bullet.dateDeleted)
            .map((bullet, idx) => (
              <li key={idx}>{bullet.detail}</li>
            ))}
        </ul>
      );
    }
  };

  if (first.field === second.field && first.content === second.content) {
    return (
      <Typography>
        {first.field}: {first.content}
      </Typography>
    );
  } else if (!isProposed) {
    return (
      <Box sx={{ backgroundColor: '#8a4e4e', borderRadius: '5px', mb: '3px' }}>
        <Box
          sx={{ backgroundColor: '#ba5050', borderRadius: '5px', width: 'fit-content' }}
          component="span"
          display="inline"
        >
          <Typography fontWeight="bold" padding="3px" display="inline">
            {first.field}:
          </Typography>
        </Box>
        <Box component="span" display="inline">
          {renderContent(first.content)}
        </Box>
      </Box>
    );
  } else {
    return (
      <Box sx={{ backgroundColor: '#51915c', borderRadius: '5px', mb: '3px' }}>
        <Box
          sx={{ backgroundColor: '#43a854', borderRadius: '5px', width: 'fit-content' }}
          component="span"
          display="inline"
        >
          <Typography fontWeight="bold" padding="3px" display="inline">
            {second.field}:
          </Typography>
        </Box>
        <Box component="span" display="inline">
          {renderContent(second.content)}
        </Box>
      </Box>
    );
  }
};

export default CompareFields;
