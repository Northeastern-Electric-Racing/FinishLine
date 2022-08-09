/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { createContext, useContext } from 'react';
import { Form, InputGroup } from 'react-bootstrap';

interface EditableDetailProps {
  title: string;
  type: string;
  value: string;
  fieldName?: string;
  readOnly?: Boolean;
  suffix?: string;
  min?: number;
  max?: number;
  options?: string[];
  setter?: any;
}

const FormContext = createContext({
  editMode: true,
  setField: (e: string, s: string) => null
});

const EditableDetail: React.FC<EditableDetailProps> = ({
  title,
  type,
  value,
  readOnly,
  suffix,
  fieldName,
  min,
  max,
  options,
  setter
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { editMode, setField } = useContext(FormContext);
  let detailInput = (
    <InputGroup aria-required>
      <Form.Control
        required={true}
        type={type}
        defaultValue={value}
        placeholder={value}
        onChange={(e) => setter(e.target.value)}
        min={min}
        max={max}
        readOnly={!!readOnly}
      />
      {suffix ? <InputGroup.Text>{suffix}</InputGroup.Text> : ''}
    </InputGroup>
  );

  if (type === 'select') {
    detailInput = (
      <InputGroup aria-required>
        <Form.Control as="select">
          <option>{value}</option>
          {options?.map((option) => (
            <option>{option}</option>
          ))}
        </Form.Control>
      </InputGroup>
    );
  }

  if (suffix && suffix !== '%') {
    suffix = ' ' + suffix;
  }

  return (
    <Form.Group aria-required>
      <b>{`${title}: `}</b>
      {editMode ? detailInput : `${value}${suffix ? `${suffix}` : ''}`}
      <br />
    </Form.Group>
  );
};

export default EditableDetail;
