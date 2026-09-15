/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import * as yup from 'yup';
import { Control, Controller, FieldErrors, FieldValues, useFieldArray, useWatch } from 'react-hook-form';
import { FormControl, Grid, FormHelperText, Button, MenuItem, Select, Typography, Box, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTheme } from '@mui/system';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { DatePicker } from '@mui/x-date-pickers';
import { useAllMembers } from '../../../hooks/users.hooks';
import React, { useState } from 'react';
import { AddCircle } from '@mui/icons-material';
import NERAutocomplete from '../../../components/NERAutocomplete';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import SponsorTaskCard from './SponsorTaskCard';
import { FirstContactMethod, ProspectiveSponsor, ProspectiveSponsorStatus } from 'shared';

export interface ProspectiveSponsorFormInputs {
  organizationName: string;
  status: ProspectiveSponsorStatus;
  lastContactDate?: Date;
  firstContactMethod?: FirstContactMethod;
  contactName?: string;
  contactorUserId?: string;
  highlightThresholdDays?: number;
  contactEmail?: string;
  contactPhone?: string;
  contactPosition?: string;
  notes?: string;
  tasks: {
    sponsorTaskId?: string;
    dueDate: Date;
    notifyDate?: Date;
    assigneeUserId?: string;
    notes: string;
    done?: boolean;
  }[];
}

interface ProspectiveSponsorFormProps {
  control: Control<ProspectiveSponsorFormInputs>;
  errors: FieldErrors<ProspectiveSponsorFormInputs>;
  defaultValues?: ProspectiveSponsor;
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
  status: yup.string().oneOf(Object.values(ProspectiveSponsorStatus)).required('Status is required'),
  lastContactDate: yup.date().when('status', {
    is: (s: string) => s !== ProspectiveSponsorStatus.NOT_IN_CONTACT,
    then: (schema) => schema.required('Last contact date is required'),
    otherwise: (schema) => schema.optional()
  }),
  firstContactMethod: yup.string().when('status', {
    is: (s: string) => s !== ProspectiveSponsorStatus.NOT_IN_CONTACT,
    then: (schema) =>
      schema
        .oneOf(Object.values(FirstContactMethod), 'Please select a contact method')
        .required('Please select how first contact was made'),
    otherwise: (schema) => schema.optional()
  }),
  contactName: yup.string().when('status', {
    is: (s: string) => s !== ProspectiveSponsorStatus.NOT_IN_CONTACT,
    then: (schema) => schema.required('Contact name is required'),
    otherwise: (schema) => schema.optional()
  }),
  contactorUserId: yup.string().when('status', {
    is: (s: string) => s !== ProspectiveSponsorStatus.NOT_IN_CONTACT,
    then: (schema) => schema.required('Contactor is required'),
    otherwise: (schema) => schema.optional()
  }),
  highlightThresholdDays: yup.number().positive('Must be positive').optional(),
  contactEmail: yup
    .string()
    .matches(/^$|^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Please enter a valid email address')
    .when('status', {
      is: (s: string) => s !== ProspectiveSponsorStatus.NOT_IN_CONTACT,
      then: (schema) =>
        schema.test('email-or-phone', 'At least one of email or phone is required', function (value) {
          return !!value || !!this.parent.contactPhone;
        }),
      otherwise: (schema) => schema.optional()
    }),
  contactPhone: yup
    .string()
    .matches(/^$|^[+]?[\d\s().-]{7,20}$/, 'Please enter a valid phone number')
    .when('status', {
      is: (s: string) => s !== ProspectiveSponsorStatus.NOT_IN_CONTACT,
      then: (schema) =>
        schema.test('phone-or-email', 'At least one of email or phone is required', function (value) {
          return !!value || !!this.parent.contactEmail;
        }),
      otherwise: (schema) => schema.optional()
    }),
  contactPosition: yup.string().optional(),
  notes: yup.string().trim().optional(),
  tasks: yup
    .array()
    .of(
      yup.object().shape({
        sponsorTaskId: yup.string().optional(),
        dueDate: yup.date().required('Due date is required'),
        notifyDate: yup.date().optional(),
        assigneeUserId: yup.string().optional(),
        notes: yup.string().required('Notes are required'),
        done: yup.boolean().optional()
      })
    )
    .required()
});

export const ProspectiveSponsorForm: React.FC<ProspectiveSponsorFormProps> = ({
  control,
  errors,
  defaultValues
}: ProspectiveSponsorFormProps) => {
  const theme = useTheme();

  const [datePickerOpenLastContact, setDatePickerOpenLastContact] = useState(false);

  const { isLoading: membersLoading, isError: membersIsError, error: membersError, data: members } = useAllMembers();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tasks'
  });

  const status = useWatch({ control, name: 'status' });
  const isNotInContact = status === ProspectiveSponsorStatus.NOT_IN_CONTACT;

  if (membersIsError) return <ErrorPage message={membersError?.message} />;
  if (membersLoading || !members) return <LoadingIndicator />;

  return (
    <Grid container justifyContent="space-between" alignItems="flex-start" spacing={3}>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345">
            Organization Name:*
          </Typography>
          <ReactHookTextField
            name="organizationName"
            control={control}
            sx={{ width: 1 }}
            placeholder="Enter Organization Name"
          />
          <FormHelperText error>{errors.organizationName?.message}</FormHelperText>
        </FormControl>
      </Grid>

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
                  .filter((s) => s !== ProspectiveSponsorStatus.ACCEPTED)
                  .map((s) => (
                    <MenuItem key={s} value={s}>
                      {statusDisplayNames[s]}
                    </MenuItem>
                  ))}
              </Select>
            )}
          />
          <FormHelperText error>{errors.status?.message}</FormHelperText>
        </FormControl>
      </Grid>

      {!isNotInContact && (
        <>
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
                    value={
                      members.find((m) => m.userId === value)
                        ? {
                            label:
                              members.find((m) => m.userId === value)!.firstName +
                              ' ' +
                              members.find((m) => m.userId === value)!.lastName,
                            id: value as string
                          }
                        : null
                    }
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
                <Tooltip
                  title="How did we first get in contact with this sponsor? Inbound means they reached out to us, outbound means we reached out to them."
                  arrow
                >
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
        </>
      )}

      <Grid item xs={12} sm={isNotInContact ? 12 : 6}>
        <FormControl fullWidth>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="h5" color="#EF4345">
              Highlight Threshold (Days):
            </Typography>
            <Tooltip
              title="If we haven't contacted this sponsor in more than this many days, the row will be highlighted in red as a reminder to follow up. Default is 10 days."
              arrow
            >
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

      {!isNotInContact && (
        <>
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
              <ReactHookTextField
                name="contactEmail"
                control={control}
                sx={{ width: 1 }}
                placeholder="Enter Contact Email"
              />
              <FormHelperText error>{errors.contactEmail?.message}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <Typography variant="h6" color="#EF4345">
                Contact Phone:
              </Typography>
              <ReactHookTextField
                name="contactPhone"
                control={control}
                sx={{ width: 1 }}
                placeholder="Enter Contact Phone"
              />
              <FormHelperText error>{errors.contactPhone?.message}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <Typography variant="h6" color="#EF4345">
                Contact Position:
              </Typography>
              <ReactHookTextField
                name="contactPosition"
                control={control}
                sx={{ width: 1 }}
                placeholder="Enter Contact Position"
              />
              <FormHelperText error>{errors.contactPosition?.message}</FormHelperText>
            </FormControl>
          </Grid>
        </>
      )}

      <Grid item xs={12}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345">
            Notes:
          </Typography>
          <ReactHookTextField
            name="notes"
            control={control}
            placeholder="Enter notes about what we expect to be offered, etc."
            multiline
            rows={3}
          />
          <FormHelperText error>{errors.notes?.message}</FormHelperText>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth>
          <Typography variant="h5" color="#EF4345" sx={{ mb: 1 }}>
            Tasks:
          </Typography>
          {fields.map((item, index) => (
            <Box key={item.id} sx={{ mt: 1 }}>
              <SponsorTaskCard
                control={control as unknown as Control<FieldValues>}
                errors={errors as unknown as FieldErrors<FieldValues>}
                fieldPrefix={`tasks.${index}`}
                members={members}
                onRemove={() => remove(index)}
                showDoneCheckbox
                isExistingTask={!!defaultValues?.tasks?.[index]?.sponsorTaskId}
                defaultAssigneeName={
                  defaultValues?.tasks?.[index]?.assignee
                    ? `${defaultValues.tasks[index].assignee!.firstName} ${defaultValues.tasks[index].assignee!.lastName}`
                    : undefined
                }
              />
            </Box>
          ))}
          <Button
            startIcon={<AddCircle />}
            onClick={() =>
              append({
                dueDate: new Date(),
                notifyDate: undefined,
                assigneeUserId: undefined,
                notes: '',
                done: false
              })
            }
            sx={{ mt: 2 }}
          >
            Add Task
          </Button>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default prospectiveSponsorSchema;
