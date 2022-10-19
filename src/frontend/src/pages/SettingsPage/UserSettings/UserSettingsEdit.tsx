/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { ThemeName } from 'shared';
import { FormInput } from './UserSettings';
import { themeChoices } from '../../../utils/Types';

interface UserSettingsEditProps {
  currentSettings: FormInput;
  onSubmit: (data: FormInput) => Promise<void>;
}

const schema = yup.object().shape({
  defaultTheme: yup
    .mixed<ThemeName>()
    .oneOf(['DARK', 'LIGHT'], 'Invalid theme chosen')
    .required('Default theme is required'),
  slackId: yup.string().optional()
});

const UserSettingsEdit: React.FC<UserSettingsEditProps> = ({ currentSettings, onSubmit }) => {
  const { register, handleSubmit, formState } = useForm<FormInput>({
    defaultValues: currentSettings,
    resolver: yupResolver(schema)
  });
  return (
    <Form id={'update-user-settings'} onSubmit={handleSubmit(async (data: FormInput) => await onSubmit(data))}>
      <Row>
        <Col xs={4} sm={3} md={2} lg={2} xl={2}>
          <Form.Group controlId="updateUserSettings-defaultTheme">
            <Form.Label>Default Theme</Form.Label>
            <Form.Control
              custom
              as="select"
              {...register('defaultTheme')}
              isInvalid={formState.errors.defaultTheme?.message !== undefined}
            >
              {themeChoices.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid">{formState.errors.defaultTheme?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={7} sm={6} md={5} lg={4} xl={3}>
          <Form.Group controlId="updateUserSettings-defaultTheme">
            <Form.Label>
              {'Slack Id '}
              <a href="https://www.workast.com/help/article/how-to-find-a-slack-user-id/">(How to find your Slack ID)</a>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={1}
              cols={50}
              {...register('slackId')}
              placeholder="Enter Id Here"
              isInvalid={formState.errors.slackId?.message !== undefined}
            />
            <Form.Control.Feedback type="invalid">{formState.errors.slackId?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default UserSettingsEdit;
