/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Form, InputGroup, FormControl, Button } from 'react-bootstrap';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAllUsers } from '../../hooks/users.hooks';
import { fullNamePipe } from '../../utils/Pipes';
interface LoginDevProps {
  devSetUser: (userId: number) => void;
  devFormSubmit: (e: any) => any;
}

/**
 * Form for dev users to do login on the dev environment.
 */
const LoginDev: React.FC<LoginDevProps> = ({ devSetUser, devFormSubmit }) => {
  if (process.env.NODE_ENV !== 'development') return <></>;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { isLoading, data: usersList } = useAllUsers();

  if (!usersList || isLoading) return <LoadingIndicator />;

  return (
    <Form className="pt-3" onSubmit={devFormSubmit}>
      <InputGroup>
        <InputGroup.Append>
          <InputGroup.Text id="user-select">Select User</InputGroup.Text>
        </InputGroup.Append>
        <FormControl
          onChange={(e: any) => devSetUser(parseInt(e.target.value))}
          aria-describedby="user-select"
          as="select"
          custom
        >
          {usersList
            .sort((a, b) => a.userId - b.userId)
            .map((user) => (
              <option key={user.role} value={user.userId}>
                {fullNamePipe(user)} ({user.role.toLowerCase()})
              </option>
            ))}
        </FormControl>
        <InputGroup.Append>
          <Button variant="primary" type="submit">
            Log In
          </Button>
        </InputGroup.Append>
      </InputGroup>
    </Form>
  );
};

export default LoginDev;
