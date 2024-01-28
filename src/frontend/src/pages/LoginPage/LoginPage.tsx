/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import LoginDev from './LoginDev';
import { FormEvent } from 'react';

interface LoginPageProps {
  devSetUser: (userId: number) => void;
  devFormSubmit: (e: FormEvent) => void;
  prodSuccess: (res: GoogleLoginResponse | GoogleLoginResponseOffline) => void;
  prodFailure: (res: GoogleLoginResponse | GoogleLoginResponseOffline) => void;
}

/**
 * Page for unauthenticated users to do login.
 */
const LoginPage: React.FC<LoginPageProps> = ({ devSetUser, devFormSubmit, prodSuccess, prodFailure }) => {
  const googleAuthClientId = import.meta.env.VITE_REACT_APP_GOOGLE_AUTH_CLIENT_ID;

  const googleLogin = (
    <GoogleLogin
      clientId={googleAuthClientId!}
      //jsSrc={'accounts.google.com/gsi/client.js'}
      buttonText="Login"
      onSuccess={prodSuccess}
      onFailure={prodFailure}
      cookiePolicy={'single_host_origin'}
      isSignedIn={true}
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
