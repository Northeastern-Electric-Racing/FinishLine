import { downloadFinanceImage } from '../apis/finance.api';

export const getImageUrl = async (imageFileId: string) => {
  const imageBlob = await downloadFinanceImage(imageFileId);
  return URL.createObjectURL(imageBlob);
};
