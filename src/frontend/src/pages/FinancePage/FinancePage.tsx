/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useState } from 'react';
import { Button, Typography } from '@mui/material';
import { useUploadSinglePicture } from '../../hooks/finance.hooks';

const FinancePage = () => {
  const [file, setFile] = useState<File>();
  const [fileId, setFileId] = useState('');
  const [fileName, setFileName] = useState('');

  const { mutateAsync } = useUploadSinglePicture();

  const onSubmit = async (event: any) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('image', file!);
    const { id, name } = await mutateAsync(formData);
    if (typeof id === 'string') {
      setFileId(id);
    }
    if (typeof fileName === 'string') {
      setFileName(name);
    }
  };

  return (
    <div>
      <Typography>{fileName}</Typography>
      <iframe src={`https://drive.google.com/file/d/${fileId}/preview`} title="ollie"></iframe>
      <form onSubmit={onSubmit}>
        <input
          onChange={(e) => {
            if (e.target.files) {
              setFile(e.target.files[0]);
            }
          }}
          type="file"
          accept="image/*"
        ></input>
        <Button type="submit"> Submit</Button>
      </form>
    </div>
  );
};

export default FinancePage;
