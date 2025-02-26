/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Chip from '@mui/material/Chip';
import { SponsorTier } from 'shared/src/types/finance-types';

const SponsorTierPill = ({ tier }: { tier: SponsorTier }) => {
  return (
    <Chip
      size="small"
      label={tier.name}
      variant="filled"
      sx={{
        fontSize: 12,
        color: 'white',
        backgroundColor: tier.colorHexCode,
        width: 125
      }}
    />
  );
};

export default SponsorTierPill;
