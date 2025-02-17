/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Chip from '@mui/material/Chip';
import { Sponsor_Tier } from '@prisma/client';

const SponsorTierPill = ({ tier }: { tier: Sponsor_Tier }) => {
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
