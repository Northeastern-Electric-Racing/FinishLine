/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useState } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { useUploadSingleReceipt } from '../../hooks/finance.hooks';
import { useToast } from '../../hooks/toasts.hooks';

const FinancePage = () => {
  const [file, setFile] = useState<File>();
  const [fileId, setFileId] = useState('');
  const [fileName, setFileName] = useState('');
  const [reimbursementRequestId, setReimbursementRequestId] = useState('');
  const toast = useToast();

  const { mutateAsync } = useUploadSingleReceipt();

  const onSubmit = async (event: any) => {
    event.preventDefault();
    try {
      const { googleFileId, name } = await mutateAsync({
        file: file!,
        id: reimbursementRequestId
      });
      if (typeof googleFileId === 'string') {
        setFileId(googleFileId);
      }
      if (typeof fileName === 'string') {
        setFileName(name);
      }
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  return (
    <div>
      <Typography>{fileName}</Typography>
      <iframe src={`https://drive.google.com/file/d/${fileId}/preview`} title="ollie"></iframe>
      <form onSubmit={onSubmit}>
        <Stack>
          <input
            onChange={(e) => {
              if (e.target.files) {
                setFile(e.target.files[0]);
              }
            }}
            type="file"
            accept="image/*"
            name="file"
          />
          <Typography>Reimbursement Request Id</Typography>
          <TextField onChange={(e) => setReimbursementRequestId(e.target.value)}></TextField>
          <Button type="submit"> Submit</Button>
        </Stack>
      </form>
    </div>
  );
};

export default FinancePage;
