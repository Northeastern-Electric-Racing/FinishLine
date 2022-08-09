/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { ThemeName } from 'shared';
import { FormInput } from '../user-settings';
import themes from '../../../../themes';

interface UserSettingsEditProps {
  currentSettings: FormInput;
  onSubmit: (data: FormInput) => Promise<void>;
}

const schema = yup.object().shape({
  defaultTheme: yup
    .mixed<ThemeName>()
    .oneOf(
      themes.map((t) => t.name),
      'Invalid theme chosen'
    )
    .required('Default theme is required')
});

const UserSettingsEdit: React.FC<UserSettingsEditProps> = ({ currentSettings, onSubmit }) => {
  const { register, handleSubmit, formState } = useForm<FormInput>({
    defaultValues: currentSettings,
    resolver: yupResolver(schema)
  });

  return (
    <Form
      id={'update-user-settings'}
      onSubmit={handleSubmit(async (data: FormInput) => await onSubmit(data))}
    >
      <Row>
        <Col xs={5} sm={4} md={3} lg={2} xl={2}>
          <Form.Group controlId="updateUserSettings-defaultTheme">
            <Form.Label>Default Theme</Form.Label>
            <Form.Control
              custom
              as="select"
              {...register('defaultTheme')}
              isInvalid={formState.errors.defaultTheme?.message !== undefined}
            >
              {themes.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              {formState.errors.defaultTheme?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default UserSettingsEdit;
