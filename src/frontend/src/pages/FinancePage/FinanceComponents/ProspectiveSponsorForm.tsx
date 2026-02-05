/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import * as yup from 'yup';
import { Control, Controller, FieldErrors, useFieldArray } from 'react-hook-form';
import {
  FormControl,
  Grid,
  FormHelperText,
  IconButton,
  MenuItem,
  Select,
  Typography,
  TextField,
  Box,
  Tooltip
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTheme } from '@mui/system';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { DatePicker } from '@mui/x-date-pickers';
import { useAllMembers } from '../../../hooks/users.hooks';
import React, { useState } from 'react';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import NERAutocomplete from '../../../components/NERAutocomplete';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { FirstContactMethod, ProspectiveSponsor, ProspectiveSponsorStatus } from 'shared';

export interface ProspectiveSponsorFormInputs {
  organizationName: string;
  lastContactDate: Date;
  firstContactMethod: FirstContactMethod;
  contactName: string;
  contactorUserId: string;
  highlightThresholdDays?: number;
  contactEmail?: string;
  contactPhone?: string;
  contactPosition?: string;
  status?: ProspectiveSponsorStatus;
  tasks: {
    sponsorTaskId?: string;
    dueDate: Date;
    notifyDate?: Date;
    assigneeUserId?: string;
    notes: string;
  }[];
}

interface ProspectiveSponsorFormProps {
  control: Control<ProspectiveSponsorFormInputs>;
  errors: FieldErrors<ProspectiveSponsorFormInputs>;
  defaultValues?: ProspectiveSponsor;
  isEditMode?: boolean;
}

const firstContactMethodDisplayNames: Record<FirstContactMethod, string> = {
  [FirstContactMethod.INBOUND_FORM]: 'Inbound Form',
  [FirstContactMethod.INBOUND_EMAIL]: 'Inbound Email',
  [FirstContactMethod.OUTBOUND_EMAIL]: 'Outbound Email',
  [FirstContactMethod.OTHER]: 'Other'
};

const statusDisplayNames: Record<ProspectiveSponsorStatus, string> = {
  [ProspectiveSponsorStatus.IN_PROGRESS]: 'In Progress',
  [ProspectiveSponsorStatus.DECLINED]: 'Declined',
  [ProspectiveSponsorStatus.NOT_IN_CONTACT]: 'Not In Contact',
  [ProspectiveSponsorStatus.NO_RESPONSE]: 'No Response',
  [ProspectiveSponsorStatus.ACCEPTED]: 'Accepted'
};

export const prospectiveSponsorSchema = yup.object().shape({
  organizationName: yup.string().required('Organization name is required'),
  lastContactDate: yup.date().required('Last contact date is required'),
  firstContactMethod: yup
    .string()
    .oneOf(Object.values(FirstContactMethod), 'Please select a contact method')
    .required('Please select how first contact was made'),
  contactName: yup.string().required('Contact name is required'),
  contactorUserId: yup.string().required('Contactor is required'),
  highlightThresholdDays: yup.number().positive('Must be positive').optional(),
  contactEmail: yup.string().email('Invalid email').optional(),
  contactPhone: yup.string().optional(),
  contactPosition: yup.string().optional(),
  status: yup.string().oneOf(Object.values(ProspectiveSponsorStatus)).optional(),
  tasks: yup
    .array()
    .of(
      yup.object().shape({
        sponsorTaskId: yup.string().optional(),
        dueDate: yup.date().required('Due date is required'),
        notifyDate: yup.date().optional(),
        assigneeUserId: yup.string().optional(),
        notes: yup.string().required('Notes are required')
      })
    )
    .required()
});

export const ProspectiveSponsorForm: React.FC<ProspectiveSponsorFormProps> = ({
  control,
  errors,
  defaultValues,
  isEditMode = false
}: ProspectiveSponsorFormProps) => {
  const theme = useTheme();

  const [datePickerOpenLastContact, setDatePickerOpenLastContact] = useState(false);
  const [datePickerOpenDue, setDatePickerOpenDue] = useState(false);
  const [datePickerOpenNotify, setDatePickerOpenNotify] = useState(false);

  const { isLoading: membersLoading, isError: membersIsError, error: membersError, data: members } = useAllMembers();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tasks'
  });

  if (membersIsError) return <ErrorPage message={membersError?.message} />;
  if (membersLoading || !members) return <LoadingIndicator />;

  return (
    <Grid container justifyContent="space-between" alignItems="flex-start" spacing={3}>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345">
            Organization Name:*
          </Typography>
          <ReactHookTextField name="organizationName" control={control} sx={{ width: 1 }} placeholder="Enter Organization Name" />
          <FormHelperText error>{errors.organizationName?.message}</FormHelperText>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345">
            Contactor:*
          </Typography>
          <Controller
            control={control}
            name="contactorUserId"
            render={({ field: { onChange, value } }) => (
              <NERAutocomplete
                sx={{ width: '100%', backgroundColor: theme.palette.grey[750] }}
                id="contactor-autocomplete"
                value={members.find((m) => m.userId === value) ? { label: members.find((m) => m.userId === value)!.firstName + ' ' + members.find((m) => m.userId === value)!.lastName, id: value } : null}
                onChange={(_event, newValue) => onChange(newValue ? newValue.id : '')}
                options={members.map((m) => ({ label: m.firstName + ' ' + m.lastName, id: m.userId }))}
                size="small"
                placeholder="Select Contactor"
              />
            )}
          />
          <FormHelperText error>{errors.contactorUserId?.message}</FormHelperText>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345">
            Last Contact Date:*
          </Typography>
          <Controller
            name="lastContactDate"
            control={control}
            render={({ field: { onChange, value } }) => (
              <DatePicker
                value={value ? new Date(value) : null}
                open={datePickerOpenLastContact}
                onClose={() => setDatePickerOpenLastContact(false)}
                onOpen={() => setDatePickerOpenLastContact(true)}
                onChange={(newValue) => onChange(newValue ?? new Date())}
                slotProps={{
                  textField: {
                    error: !!errors.lastContactDate,
                    helperText: errors.lastContactDate?.message,
                    onClick: () => setDatePickerOpenLastContact(true)
                  }
                }}
              />
            )}
          />
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="h5" color="#EF4345">
              First Contact Method:*
            </Typography>
            <Tooltip title="How did we first get in contact with this sponsor? Inbound means they reached out to us, outbound means we reached out to them." arrow>
              <InfoOutlinedIcon sx={{ fontSize: 16, color: 'gray', cursor: 'help' }} />
            </Tooltip>
          </Box>
          <Controller
            control={control}
            name="firstContactMethod"
            render={({ field: { onChange, value } }) => (
              <Select
                displayEmpty
                value={value || ''}
                onChange={onChange}
                renderValue={(selected) => {
                  if (!selected) return <Typography sx={{ color: 'gray' }}>Select Method</Typography>;
                  return firstContactMethodDisplayNames[selected as FirstContactMethod];
                }}
              >
                {Object.values(FirstContactMethod).map((method) => (
                  <MenuItem key={method} value={method}>
                    {firstContactMethodDisplayNames[method]}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          <FormHelperText error>{errors.firstContactMethod?.message}</FormHelperText>
        </FormControl>
      </Grid>

      {isEditMode && (
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Typography variant="h5" color="#EF4345">
              Status:*
            </Typography>
            <Controller
              control={control}
              name="status"
              render={({ field: { onChange, value } }) => (
                <Select
                  displayEmpty
                  value={value || ''}
                  onChange={onChange}
                  renderValue={(selected) => {
                    if (!selected) return <Typography sx={{ color: 'gray' }}>Select Status</Typography>;
                    return statusDisplayNames[selected as ProspectiveSponsorStatus];
                  }}
                >
                  {Object.values(ProspectiveSponsorStatus)
                    .filter((status) => status !== ProspectiveSponsorStatus.ACCEPTED)
                    .map((status) => (
                      <MenuItem key={status} value={status}>
                        {statusDisplayNames[status]}
                      </MenuItem>
                    ))}
                </Select>
              )}
            />
            <FormHelperText error>{errors.status?.message}</FormHelperText>
          </FormControl>
        </Grid>
      )}

      <Grid item xs={12} sm={isEditMode ? 6 : 12}>
        <FormControl fullWidth>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="h5" color="#EF4345">
              Highlight Threshold (Days):
            </Typography>
            <Tooltip title="If we haven't contacted this sponsor in more than this many days, the row will be highlighted in red as a reminder to follow up. Default is 10 days." arrow>
              <InfoOutlinedIcon sx={{ fontSize: 16, color: 'gray', cursor: 'help' }} />
            </Tooltip>
          </Box>
          <ReactHookTextField
            name="highlightThresholdDays"
            type="number"
            control={control}
            sx={{ width: 1 }}
            placeholder="10"
          />
          <FormHelperText error>{errors.highlightThresholdDays?.message}</FormHelperText>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h5" color="#EF4345" sx={{ mb: 2 }}>
          Contact Information
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <Typography variant="h6" color="#EF4345">
            Contact Name:*
          </Typography>
          <ReactHookTextField name="contactName" control={control} sx={{ width: 1 }} placeholder="Enter Contact Name" />
          <FormHelperText error>{errors.contactName?.message}</FormHelperText>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <Typography variant="h6" color="#EF4345">
            Contact Email:
          </Typography>
          <ReactHookTextField name="contactEmail" control={control} sx={{ width: 1 }} placeholder="Enter Contact Email" />
          <FormHelperText error>{errors.contactEmail?.message}</FormHelperText>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <Typography variant="h6" color="#EF4345">
            Contact Phone:
          </Typography>
          <ReactHookTextField name="contactPhone" control={control} sx={{ width: 1 }} placeholder="Enter Contact Phone" />
          <FormHelperText error>{errors.contactPhone?.message}</FormHelperText>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <Typography variant="h6" color="#EF4345">
            Contact Position:
          </Typography>
          <ReactHookTextField name="contactPosition" control={control} sx={{ width: 1 }} placeholder="Enter Contact Position" />
          <FormHelperText error>{errors.contactPosition?.message}</FormHelperText>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345" sx={{ mb: 1 }}>
            Tasks:
          </Typography>
          {fields.map((item, index) => (
            <Box key={item.id} sx={{ display: 'flex', mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
              <Grid xs={12} sm={2.6}>
                <FormControl fullWidth>
                  <Typography variant="h6" color="#EF4345">
                    Due Date:*
                  </Typography>
                  <Controller
                    name={`tasks.${index}.dueDate`}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <DatePicker
                        value={value ? new Date(value) : null}
                        open={datePickerOpenDue}
                        onClose={() => setDatePickerOpenDue(false)}
                        onOpen={() => setDatePickerOpenDue(true)}
                        onChange={(newValue) => onChange(newValue ?? new Date())}
                        slotProps={{
                          textField: {
                            error: !!errors.tasks?.[index]?.dueDate,
                            helperText: errors.tasks?.[index]?.dueDate?.message,
                            onClick: () => setDatePickerOpenDue(true)
                          }
                        }}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid xs={12} sm={2.6}>
                <FormControl fullWidth>
                  <Typography variant="h6" color="#EF4345">
                    Notify Date:
                  </Typography>
                  <Controller
                    name={`tasks.${index}.notifyDate`}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <DatePicker
                        value={value ? new Date(value) : null}
                        open={datePickerOpenNotify}
                        onClose={() => setDatePickerOpenNotify(false)}
                        onOpen={() => setDatePickerOpenNotify(true)}
                        onChange={(newValue) => onChange(newValue ?? undefined)}
                        slotProps={{
                          textField: {
                            error: !!errors.tasks?.[index]?.notifyDate,
                            helperText: errors.tasks?.[index]?.notifyDate?.message,
                            onClick: () => setDatePickerOpenNotify(true)
                          }
                        }}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid xs={12} sm={2.75}>
                <FormControl fullWidth>
                  <Typography variant="h6" color="#EF4345">
                    Assign To:
                  </Typography>
                  <Controller
                    control={control}
                    name={`tasks.${index}.assigneeUserId`}
                    render={({ field: { onChange } }) => (
                      <NERAutocomplete
                        sx={{ width: '100%', backgroundColor: theme.palette.grey[750] }}
                        id={`task-${index}-assignee-autocomplete`}
                        onChange={(_event, newValue) => onChange(newValue ? newValue.id : undefined)}
                        options={members.map((m) => ({ label: m.firstName + ' ' + m.lastName, id: m.userId }))}
                        size="small"
                        placeholder={
                          defaultValues?.tasks?.[index]?.assignee
                            ? defaultValues.tasks[index].assignee!.firstName +
                              ' ' +
                              defaultValues.tasks[index].assignee!.lastName
                            : 'Select Member'
                        }
                      />
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid xs={12} sm={3.84}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FormControl fullWidth>
                    <Typography variant="h6" color="#EF4345">
                      Notes:*
                    </Typography>
                    <ReactHookTextField
                      name={`tasks.${index}.notes`}
                      control={control}
                      sx={{ width: 1 }}
                      placeholder="Enter notes"
                    />
                    <FormHelperText error>{errors.tasks?.[index]?.notes?.message}</FormHelperText>
                  </FormControl>
                  <Box sx={{ height: 17 }}>
                    <IconButton onClick={() => remove(index)}>
                      <RemoveCircleOutlineIcon sx={{ color: 'white' }} />
                    </IconButton>
                  </Box>
                </Box>
              </Grid>
            </Box>
          ))}
          <Box sx={{ mt: 2 }}>
            <IconButton
              onClick={() =>
                append({
                  dueDate: new Date(),
                  notifyDate: undefined,
                  assigneeUserId: undefined,
                  notes: ''
                })
              }
            >
              <AddCircleOutlineIcon />
              <Typography>Add Task</Typography>
            </IconButton>
          </Box>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default prospectiveSponsorSchema;
