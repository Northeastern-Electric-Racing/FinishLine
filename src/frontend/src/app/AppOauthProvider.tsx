import { GoogleOAuthProvider } from '@react-oauth/google';

const AppOAuthProvider: React.FC = (props) => {
  const googleAuthClientId = import.meta.env.VITE_REACT_APP_GOOGLE_AUTH_CLIENT_ID;

  return <GoogleOAuthProvider clientId={googleAuthClientId}>{props.children}</GoogleOAuthProvider>;
};

export default AppOAuthProvider;
