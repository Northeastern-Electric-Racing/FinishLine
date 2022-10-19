/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import GoogleLogin from 'react-google-login';
import { Card } from 'react-bootstrap';
import LoginDev from './LoginDev';
import { Theme } from '../../utils/Types';

const styles = {
  card: {
    width: '25em'
  }
};

interface LoginPageProps {
  devSetUser: (userId: number) => void;
  devFormSubmit: (e: any) => any;
  prodSuccess: (res: any) => any;
  prodFailure: (res: any) => any;
  theme: Theme;
}

/**
 * Page for unauthenticated users to do login.
 */
const LoginPage: React.FC<LoginPageProps> = ({ devSetUser, devFormSubmit, prodSuccess, prodFailure, theme }) => {
  return (
    <Card bg={theme.cardBg} className={'mx-auto mt-sm-5 '} style={styles.card}>
      <Card.Body>
        <Card.Title>FinishLine by NER</Card.Title>
        <Card.Text>Login Required. Students must use their Husky Google account.</Card.Text>
        <GoogleLogin
          clientId={process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID!}
          //jsSrc={'accounts.google.com/gsi/client.js'}
          buttonText="Login"
          onSuccess={prodSuccess}
          onFailure={prodFailure}
          cookiePolicy={'single_host_origin'}
          isSignedIn={true}
        />
        {process.env.NODE_ENV === 'development' ? <LoginDev devSetUser={devSetUser} devFormSubmit={devFormSubmit} /> : ''}
      </Card.Body>
      <Card.Footer className="text-muted">
        By using this app, you consent to cookies and tracking for purposes including security and improving the app.
      </Card.Footer>
    </Card>
  );
};

export default LoginPage;
