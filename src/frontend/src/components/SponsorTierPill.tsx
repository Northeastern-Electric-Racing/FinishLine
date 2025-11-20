import Chip from '@mui/material/Chip';
import { SponsorTier } from 'shared/src/types/finance-types';

const SponsorTierPill = ({ tier }: { tier: SponsorTier }) => {
  return (
    <Chip
      label={tier.name}
      variant="filled"
      sx={{
        fontSize: 23,
        fontWeight: 500,
        color: 'white',
        backgroundColor: tier.colorHexCode,
        width: 125,
        height: 40,
        borderRadius: 15
      }}
    />
  );
};

export default SponsorTierPill;
