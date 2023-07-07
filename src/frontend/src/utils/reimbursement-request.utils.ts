export const downloadImage = async (fileId: string): Promise<File> => {
  const url = `https://drive.google.com/file/d/${fileId}/?alt=media`;
  const response = await fetch(url, { mode: 'no-cors' });
  const blob = await response.blob();

  const fileName = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '');

  const mimeType = blob.type;
  const file = new File([blob], fileName!, { type: mimeType });
  return file;
};
