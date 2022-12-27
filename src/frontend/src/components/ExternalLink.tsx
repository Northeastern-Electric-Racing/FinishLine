/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

interface ExternalLinkProps {
  icon?: IconProp;
  link: string;
  description: string;
}

// Common component for all external links to open in new tab
const ExternalLink: React.FC<ExternalLinkProps> = ({ icon, link, description }) => {
  return (
    <div key={description} className="d-flex flex-row align-items-center px-3">
      {icon !== undefined ? <FontAwesomeIcon icon={icon} size="lg" className="pr-1" data-testid={'icon'} /> : ' '}
      <Link href={link} sx={{ pl: 1 }} target="_blank" rel="noopener noreferrer">
        <Typography>{description}</Typography>
      </Link>
    </div>
  );
};

export default ExternalLink;
