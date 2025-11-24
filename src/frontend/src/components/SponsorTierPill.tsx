import Chip from '@mui/material/Chip';
import { SponsorTier } from 'shared/src/types/finance-types';

const SponsorTierPill = ({ tier }: { tier: SponsorTier }) => {
  return (
    <Chip
      label={tier.name}
      variant="filled"
      sx={{
        '& .MuiChip-label': {
          fontSize: 'inherit',
          lineHeight: '1em'
        },
        fontWeight: 500,
        color: 'white',
        backgroundColor: tier.colorHexCode,
        px: 1.25,
        py: 0.25,
        borderRadius: '999px',
        height: 'auto',
        minHeight: 0
      }}
    />
  );
};

export default SponsorTierPill;
