/*
 * This file is part of FinishLine by NER and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useToast } from '../hooks/toasts.hooks';

const CopyToClipboardButton = ({ msg }: { msg: string }) => {
  const toast = useToast();
  return (
    <IconButton
      size="small"
      color="primary"
      onClick={() => {
        navigator.clipboard.writeText(msg);
        toast.success('Copied to clipboard!');
      }}
    >
      <ContentCopyIcon style={{ fontSize: '13px' }} />
    </IconButton>
  );
};

export default CopyToClipboardButton;
