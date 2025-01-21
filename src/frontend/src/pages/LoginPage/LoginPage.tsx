/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import LoginDev from './LoginDev';
import { FormEvent } from 'react';

interface LoginPageProps {
  devSetUser: (userId: string) => void;
  devFormSubmit: (e: FormEvent) => void;
  prodSuccess: (credentialResponse: CredentialResponse) => void;
  prodFailure: () => void;
}

/**
 * Page for unauthenticated users to do login.
 */
const LoginPage: React.FC<LoginPageProps> = ({ devSetUser, devFormSubmit, prodSuccess, prodFailure }) => {
  const googleLogin = (
    <GoogleLogin
      //jsSrc={'accounts.google.com/gsi/client.js'}
      onSuccess={prodSuccess}
      onError={prodFailure}
      text="signin"
      auto_select
    />
  );

  const loginDev = <LoginDev devSetUser={devSetUser} devFormSubmit={devFormSubmit} />;

  return (
    <Card sx={{ marginX: 'auto', maxWidth: '25em', marginTop: 5 }}>
      <CardContent>
        <Typography variant="h5">FinishLine by NER</Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Login Required. Students must use their Husky Google account.
        </Typography>
        {import.meta.env.MODE === 'development' ? loginDev : googleLogin}
      </CardContent>
      <CardActions>
        <Typography variant="caption">
          By using this app, you consent to cookies and tracking for purposes including security and improving the app.
        </Typography>
      </CardActions>
    </Card>
  );
};

export default LoginPage;
