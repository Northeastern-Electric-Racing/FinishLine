/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Link, Stack, Typography } from '@mui/material';
import { ImplementedChange } from 'shared';
import { datePipe, fullNamePipe } from '../utils/pipes';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../utils/routes';

interface ChangesListProps {
  changes: ImplementedChange[];
}

const URL_REGEX = /(https?:\/\/\S+)/g;

const renderDetailWithLinks = (detail: string) =>
  detail.split(URL_REGEX).map((segment, idx) => {
    if (!/^https?:\/\//.test(segment)) return segment;
    const trailing = segment.match(/[.,;:!?)\]"'`]+$/)?.[0] ?? '';
    const url = trailing ? segment.slice(0, -trailing.length) : segment;
    return (
      <span key={idx}>
        <Link href={url} target="_blank" rel="noopener noreferrer" underline="hover">
          {url}
        </Link>
        {trailing}
      </span>
    );
  });

const ChangesList: React.FC<ChangesListProps> = ({ changes }) => {
  return (
    <Stack component="ul" spacing={0.75} sx={{ p: 0, m: 0, listStyleType: 'none' }}>
      {changes.map((ic, idx) => (
        <Box
          component="li"
          key={idx}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { sm: 'baseline' },
            gap: 1,
            px: 1.25,
            py: 0.75,
            borderRadius: 1,
            backgroundColor: (theme) => theme.palette.action.hover
          }}
        >
          <Link
            component={RouterLink}
            to={`${routes.CHANGE_REQUESTS}/${ic.changeRequestId}`}
            underline="hover"
            sx={{ fontWeight: 600, flexShrink: 0 }}
          >
            #{ic.changeRequestIdentifier}
          </Link>
          <Typography component="span" sx={{ wordBreak: 'break-word' }}>
            {renderDetailWithLinks(ic.detail)}
            <Typography component="span" sx={{ color: 'text.secondary', ml: 0.75 }}>
              — {fullNamePipe(ic.implementer)}
            </Typography>
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', whiteSpace: 'nowrap', flexShrink: 0, ml: 'auto' }}
          >
            {datePipe(ic.dateImplemented)}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};

export default ChangesList;
