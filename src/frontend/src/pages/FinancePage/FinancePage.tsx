/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useState } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { useUploadSingleReceipt } from '../../hooks/finance.hooks';
import PageLayout from '../../components/PageLayout';

const FinancePage = () => {
  const [file, setFile] = useState<File>();
  const [fileId, setFileId] = useState('');
  const [fileName, setFileName] = useState('');
  const [reimbursementRequestId, setReimbursementRequestId] = useState('');

  const { mutateAsync } = useUploadSingleReceipt(reimbursementRequestId);

  const onSubmit = async (event: any) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('image', file!);
    const { googleFileId, name } = await mutateAsync(formData);
    if (typeof googleFileId === 'string') {
      setFileId(googleFileId);
    }
    if (typeof fileName === 'string') {
      setFileName(name);
    }
  };

  return (
    <PageLayout title="Finance">
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
          />
          <Typography>Reimbursement Request Id</Typography>
          <TextField onChange={(e) => setReimbursementRequestId(e.target.value)}></TextField>
          <Button type="submit"> Submit</Button>
        </Stack>
      </form>
    </PageLayout>
  );
};

export default FinancePage;
