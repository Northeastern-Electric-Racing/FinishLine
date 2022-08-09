/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Form, InputGroup, FormControl, Button } from 'react-bootstrap';
import {
  exampleAdminUser,
  exampleAppAdminUser,
  exampleLeadershipUser,
  exampleMemberUser,
  exampleGuestUser
} from '../../../test-support/test-data/users.stub';

interface LoginDevProps {
  devSetRole: (role: string) => void;
  devFormSubmit: (e: any) => any;
}

/**
 * Form for dev users to do login on the dev environment.
 */
const LoginDev: React.FC<LoginDevProps> = ({ devSetRole, devFormSubmit }) => {
  const usersList = [
    exampleAppAdminUser,
    exampleAdminUser,
    exampleLeadershipUser,
    exampleMemberUser,
    exampleGuestUser
  ];
  return (
    <Form className="pt-3" onSubmit={devFormSubmit}>
      <InputGroup>
        <InputGroup.Append>
          <InputGroup.Text id="user-select">Select User</InputGroup.Text>
        </InputGroup.Append>
        <FormControl
          onChange={(e: any) => devSetRole(e.target.value)}
          aria-describedby="user-select"
          as="select"
          custom
        >
          {usersList.map((user) => (
            <option key={user.role}>{user.role}</option>
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
