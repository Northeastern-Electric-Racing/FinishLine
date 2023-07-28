/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Stack, SxProps } from '@mui/material';
import Link from '@mui/material/Link';
import { ReactNode } from 'react';

interface ExternalLinkProps {
  icon?: ReactNode;
  link: string;
  description: string;
  sx?: SxProps;
}

// Common component for all external links to open in new tab
const ExternalLink: React.FC<ExternalLinkProps> = ({ icon, link, description, sx }) => {
  return (
    <Stack direction="row" alignItems="center">
      {icon}
      <Link href={link} sx={{ ...sx, pl: 1 }} target="_blank" rel="noopener noreferrer">
        {description}
      </Link>
    </Stack>
  );
};

export default ExternalLink;
