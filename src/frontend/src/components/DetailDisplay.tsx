import Typography from '@mui/material/Typography';

export interface DetailDisplayProps {
  label: string | number;
  content: string | number | JSX.Element | null;
  paddingRight?: number;
}

const DetailDisplay: React.FC<DetailDisplayProps> = ({ label, content, paddingRight = 0 }) => {
  return (
    <div>
      <Typography sx={{ fontWeight: 'bold', paddingRight: paddingRight }} display="inline">
        {label}
        {': '}
      </Typography>
      <Typography sx={{ fontWeight: 'normal', display: 'inline' }}>{content}</Typography>
    </div>
  );
};

export default DetailDisplay;
