/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Chip from '@mui/material/Chip';
import { brown, grey, yellow, lightBlue, blue, green, pink } from '@mui/material/colors';
import { displayEnum } from '../utils/pipes';

export enum SponsorTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
  SUPER_DIAMOND = 'SUPER_DIAMOND'
}

const determineTierPillColor = (tier: SponsorTier) => {
  switch (tier) {
    case SponsorTier.BRONZE:
      return brown[700];
    case SponsorTier.SILVER:
      return grey[600];
    case SponsorTier.GOLD:
      return yellow[600];
    case SponsorTier.PLATINUM:
      return lightBlue[600];
    case SponsorTier.DIAMOND:
      return blue[600];
    case SponsorTier.SUPER_DIAMOND:
      return green[600];
    default:
      return pink[600];
  }
};

const SponsorTierPill = ({ tier }: { tier: SponsorTier }) => {
  const tierColor = determineTierPillColor(tier);
  return (
    <Chip
      size="small"
      label={displayEnum(tier)}
      variant="filled"
      sx={{
        fontSize: 12,
        color: 'white',
        backgroundColor: tierColor,
        width: 125
      }}
    />
  );
};

export default SponsorTierPill;
