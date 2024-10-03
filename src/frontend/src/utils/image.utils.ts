import { downloadGoogleImage } from '../apis/finance.api';

export const getImageUrl = async (imageFileId: string) => {
  const imageBlob = await downloadGoogleImage(imageFileId);
  return URL.createObjectURL(imageBlob);
};
