import Typography from '@mui/material/Typography';

export const formatKeyValue = (key: string | null, value: any) => {
  return formatKeyValueSpaced(key, value);
};

export const formatKeyValueSpaced = (key: any, value: any, padding: number | null = 0) => {
  return (
    <div>
      <Typography sx={{ fontWeight: 'bold', paddingRight: padding }} display="inline">
        {key}
        {': '}
      </Typography>
      <Typography sx={{ fontWeight: 'normal', display: 'inline' }}>{value}</Typography>
    </div>
  );
};
