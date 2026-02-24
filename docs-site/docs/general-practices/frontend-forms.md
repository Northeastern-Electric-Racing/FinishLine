---
title: Frontend Forms
description: Guide for building forms in FinishLine using React Hook Form with MUI components and the NERFormModal abstraction. Covers useForm setup, Controller wrapping, create vs edit mode, form-modal reset lifecycle, and shared form field components. Use when creating new forms, adding form fields, building create/edit modals, working with React Hook Form, or debugging form state issues. NEVER use useEffect to sync form state.
skill: true
skill_name: frontend-forms
---

# Frontend Forms

> **Summary:** FinishLine forms use React Hook Form with Yup validation, MUI
> components wrapped via `Controller`, and the `NERFormModal` component for
> modal-based forms. The parent component owns the mutation; the form just
> calls `onSubmit` with validated data.

## Overview

All forms in FinishLine follow a consistent pattern built on three libraries:
React Hook Form for state management, Yup for schema validation, and MUI for
UI components. The key architectural decision is a strict separation between
the **form component** (which handles layout, validation, and data collection)
and the **parent component** (which owns the mutation hook and handles API
calls).

For modal-based forms (the most common pattern), FinishLine provides
`NERFormModal` — a wrapper around `NERModal` that handles the form element,
submit-then-reset, and reset-on-close lifecycle automatically. For full-page
forms (like the Work Package editor), the form element is rendered directly.

React Hook Form's `defaultValues` and `reset` function are the **only**
mechanisms for initializing and updating form state. `useEffect` MUST NEVER
be used to synchronize form fields with props, reset forms, or respond to
data changes.

## Architecture

### Modal Form Data Flow

```
┌──────────────┐    onSubmit    ┌──────────────┐
│ CreateXModal │◀── (data) ──── │  XFormModal  │
│ or EditXModal│                │ (shared form)│
├──────────────┤                ├──────────────┤
│ owns mutation│                │ useForm()    │
│ hook         │── defaultValues│ Controller   │
│ passes       │── onSubmit ──▶ │ Yup schema   │
│ mutateAsync  │                │ NERFormModal │
└──────────────┘                └──────────────┘
       │
       ▼
  React Query
  mutation hook
```

### Full-Page Form Data Flow

```
┌──────────────┐   mutateAsync  ┌──────────────┐
│ CreateXForm  │── + schema ───▶│  XFormView   │
│ or EditXForm │                │              │
├──────────────┤                ├──────────────┤
│ owns mutation│                │ useForm()    │
│ fetches data │── defaultValues│ <form> tag   │
│ builds schema│── onSubmit ──▶ │ Controller   │
└──────────────┘                └──────────────┘
```

## File Locations

- **NERFormModal:** `src/frontend/src/components/NERFormModal.tsx`
- **NERModal (base):** `src/frontend/src/components/NERModal.tsx`
- **NERDraggableFormModal:** `src/frontend/src/components/NERDraggableFormModal.tsx`
- **ReactHookTextField:** `src/frontend/src/components/ReactHookTextField.tsx`
- **ReactHookEditableList:** `src/frontend/src/components/ReactHookEditableList.tsx`
- **Modal forms:** `src/frontend/src/pages/{Feature}/{Components}/XFormModal.tsx`
- **Full-page forms:** `src/frontend/src/pages/{Feature}Form/XFormView.tsx`

## Core Concepts

### NERFormModal

`NERFormModal` wraps `NERModal` and provides automatic form lifecycle
management. It accepts these key props:

- `reset` — The `reset` function from `useForm`. Called on close AND
  after successful submit.
- `handleUseFormSubmit` — The `handleSubmit` function from `useForm`.
  Used to wrap the submit handler with validation.
- `onFormSubmit` — Your submit callback. Receives validated form data.
- `formId` — Connects the internal `<form>` to the modal's submit button.

NERFormModal internally:

1. Wraps `onFormSubmit` to call `reset()` after the submit callback
2. Calls `reset()` when the modal is closed via `onHide`
3. Renders a `<form>` element with `noValidate` and `e.stopPropagation()`

### useForm Setup

Every form calls `useForm` with a Yup resolver and typed `defaultValues`:

```tsx
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface MyFormValues {
  name: string;
  description?: string;
  amount: number;
  isActive: boolean;
}

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup.string().optional(),
  amount: yup.number().required('Amount is required'),
  isActive: yup.boolean().required()
});

const {
  handleSubmit,
  control,
  reset,
  formState: { errors }
} = useForm<MyFormValues>({
  resolver: yupResolver(schema),
  defaultValues: {
    name: defaultValues?.name ?? '',
    description: defaultValues?.description ?? '',
    amount: defaultValues?.amount ?? 0,
    isActive: defaultValues?.isActive ?? false
  }
});
```

### Controller Pattern for MUI Components

MUI components are not compatible with `register` because they don't
expose a native `ref`. Use `Controller` to bridge React Hook Form and
MUI:

```tsx
<Controller
  name="name"
  control={control}
  render={({ field: { onChange, value } }) => (
    <TextField
      value={value}
      onChange={onChange}
      placeholder="Enter name"
      variant="standard"
      fullWidth
      error={!!errors.name}
    />
  )}
/>
<FormHelperText error>{errors.name?.message}</FormHelperText>
```

For checkboxes:

```tsx
<Controller
  name="isActive"
  control={control}
  render={({ field: { onChange, value } }) => (
    <Checkbox checked={value === true} onChange={(e) => onChange(e.target.checked)} />
  )}
/>
```

For `Select`:

```tsx
<Controller
  name="categoryId"
  control={control}
  render={({ field: { onChange, value } }) => (
    <Select value={value || ''} onChange={(e) => onChange(e.target.value)} variant="standard" displayEmpty>
      <MenuItem value="">
        <em>Select Category</em>
      </MenuItem>
      {categories.map((c) => (
        <MenuItem key={c.id} value={c.id}>
          {c.name}
        </MenuItem>
      ))}
    </Select>
  )}
/>
```

For `Autocomplete` (multi-select):

```tsx
<Controller
  name="memberIds"
  control={control}
  render={({ field: { onChange, value } }) => (
    <Autocomplete
      multiple
      options={memberOptions}
      getOptionLabel={(opt) => opt.label}
      isOptionEqualToValue={(opt, val) => opt.id === val.id}
      value={memberOptions.filter((o) => value?.includes(o.id))}
      onChange={(_, newVal) => onChange(newVal.map((v) => v.id))}
      renderInput={(params) => <TextField {...params} variant="standard" placeholder="Select Members" />}
    />
  )}
/>
```

## Step-by-Step: Creating a Modal Form

### Step 1: Define the Form Values Interface and Schema

Create the Yup schema and TypeScript interface for your form data.
The interface is used to type `useForm<T>` and the `onSubmit` callback.

```tsx
// In XFormModal.tsx
interface MyFormValues {
  name: string;
  code: number;
  allowed: boolean;
}

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  code: yup.number().typeError('Must be a number').required('Code is required'),
  allowed: yup.boolean().required()
});
```

### Step 2: Define the Form Modal Component Props

The shared form modal accepts: `showModal`, `handleClose`, an optional
`defaultValues` for edit mode, and an `onSubmit` callback.

```tsx
interface MyFormModalProps {
  showModal: boolean;
  handleClose: () => void;
  defaultValues?: ExistingEntity; // from shared types
  onSubmit: (data: MyFormValues) => void;
}
```

### Step 3: Set Up useForm with defaultValues

Initialize `useForm` with `yupResolver` and compute `defaultValues`
from the optional prop. Use `??` to provide empty defaults for create
mode.

```tsx
const MyFormModal = ({
  showModal,
  handleClose,
  defaultValues,
  onSubmit
}: MyFormModalProps) => {
  const toast = useToast();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<MyFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      code: defaultValues?.code ?? undefined,
      allowed: defaultValues?.allowed ?? false
    }
  });
```

### Step 4: Define the onFormSubmit Handler

This wraps the parent's `onSubmit` with error handling. The parent
owns the mutation; this component just passes data up.

```tsx
const onFormSubmit = async (data: MyFormValues) => {
  try {
    await onSubmit(data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error.message);
    }
  }
  handleClose();
};
```

### Step 5: Render NERFormModal with Form Fields

Pass `reset`, `handleSubmit`, and `onFormSubmit` to NERFormModal.
Use `Controller` to wrap each MUI field. Use `ReactHookTextField`
for simple text inputs.

```tsx
  return (
    <NERFormModal
      open={showModal}
      onHide={handleClose}
      title={!!defaultValues ? 'Edit Thing' : 'Create Thing'}
      reset={() => reset({
        name: '',
        code: undefined,
        allowed: false
      })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={
        !!defaultValues
          ? 'edit-thing-form'
          : 'create-thing-form'
      }
      showCloseButton
    >
      <Box display="flex" flexDirection="column" gap={2}>
        <FormControl fullWidth>
          <Typography color="#EF4345" variant="h5"
            sx={{ fontWeight: 'bold', fontSize: 20 }}>
            Name:*
          </Typography>
          <ReactHookTextField
            name="name"
            control={control}
            placeholder="Enter name"
            fullWidth
          />
          <FormHelperText error>
            {errors.name?.message}
          </FormHelperText>
        </FormControl>
        {/* More fields... */}
      </Box>
    </NERFormModal>
  );
};
```

### Step 6: Create Thin Wrapper Components

Create `CreateXModal` and `EditXModal` that own the mutation hook
and pass `mutateAsync` as `onSubmit`:

**CreateXModal.tsx:**

```tsx
const CreateThingModal = ({ showModal, handleClose }: CreateThingModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useCreateThing();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <ThingFormModal showModal={showModal} handleClose={handleClose} onSubmit={mutateAsync} />;
};
```

**EditXModal.tsx:**

```tsx
const EditThingModal = ({ showModal, handleClose, thing }: EditThingModalProps) => {
  const { isLoading, isError, error, mutateAsync } = useEditThing(thing.id);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  return <ThingFormModal showModal={showModal} handleClose={handleClose} onSubmit={mutateAsync} defaultValues={thing} />;
};
```

## Step-by-Step: Creating a Full-Page Form

Full-page forms (like Work Package create/edit) skip NERFormModal and
render the `<form>` element directly. The pattern is similar but uses
`PageLayout` instead of a modal.

### Step 1: Create the Form View Component

The form view accepts `defaultValues`, `onSubmit` (the mutation),
and a Yup `schema` from the parent:

```tsx
const ThingFormView: React.FC<ThingFormViewProps> = ({ exitActiveMode, onMutate, defaultValues, schema, breadcrumbs }) => {
  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<ThingFormPayload>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? ''
      // ...
    }
  });

  const onSubmit = async (data: ThingFormPayload) => {
    try {
      await onMutate(data);
      exitActiveMode();
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
    }
  };

  return (
    <form
      id="thing-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit(onSubmit)(e);
      }}
      noValidate
    >
      <PageLayout title="Create Thing">{/* Form fields using Controller */}</PageLayout>
    </form>
  );
};
```

### Step 2: Create the Wrapper Component

The wrapper fetches data and owns the mutation:

```tsx
const CreateThingForm: React.FC = () => {
  const { mutateAsync } = useCreateThing();
  const history = useHistory();

  const schema = yup.object().shape({
    name: yup.string().required('Name is required')
  });

  return (
    <ThingFormView
      onMutate={mutateAsync}
      exitActiveMode={() => history.push(routes.THINGS)}
      schema={schema}
      breadcrumbs={[{ name: 'Things', route: routes.THINGS }]}
    />
  );
};
```

## Shared Form Components

### ReactHookTextField

A pre-built `Controller`-wrapped `TextField`. Use for simple text,
number, and multiline inputs:

```tsx
import ReactHookTextField from '../../components/ReactHookTextField';

<ReactHookTextField
  name="fieldName"
  control={control}
  placeholder="Enter value"
  fullWidth
  label="Field Label" // optional
  type="number" // optional
  multiline // optional
  rows={3} // optional
  maxLength={300} // optional, word count
  required={false} // default true
  disabled={false} // default false
  errorMessage={errors.fieldName} // optional
/>;
```

### ReactHookEditableList

For dynamic lists of items using `useFieldArray`. Items can be added
and removed:

```tsx
import ReactHookEditableList from '../../components/ReactHookEditableList';

const { fields, append, remove } = useFieldArray({
  control,
  name: 'bullets'
});

<ReactHookEditableList name="bullets" ls={fields} register={register} append={append} remove={remove} bulletName="Bullet" />;
```

Each item in the field array MUST have a `detail` property:

```tsx
append({ bulletId: -1, detail: '' });
```

## Key Rules

- `useForm` MUST always be called with `defaultValues`. NEVER
  initialize a form without defaults — it causes uncontrolled-to-
  controlled component warnings and broken reset behavior.

- `useEffect` MUST NEVER be used to synchronize form state, reset
  forms, or respond to prop changes in form components. React Hook
  Form's `defaultValues` and `reset()` handle all of these cases.

- The form component MUST NOT own the mutation hook. The parent
  (CreateXModal / EditXModal) owns the mutation and passes
  `mutateAsync` as the `onSubmit` prop.

- The `reset` prop passed to `NERFormModal` MUST reset to empty/default
  values (for create mode), NOT to `defaultValues`. NERFormModal calls
  `reset()` both on close and after submit, so it needs to clear the
  form for the next use.

- Always use `e.stopPropagation()` in form submit handlers to prevent
  event bubbling when forms are nested inside modals or other forms.

- Use `noValidate` on all `<form>` elements to let Yup handle
  validation instead of browser-native validation.

- The `formId` prop on NERFormModal MUST match the `id` of the
  internal `<form>` element (NERFormModal handles this automatically).

- Create/Edit mode is determined by the presence of `defaultValues`.
  Use `!!defaultValues` to toggle titles and form IDs.

- Yup schemas can be defined either at module level (for static
  schemas) or inside the component (when the schema depends on props
  or state).

## Common Mistakes

- **Using `useEffect` to sync form state with props.** This causes
  stale data, infinite loops, and race conditions. Use
  `defaultValues` in `useForm()` for initial values. If you need to
  reset to new values after mount, call `reset(newValues)` directly
  in a handler — never in a `useEffect`.

- **Putting the mutation hook inside the form modal.** The form modal
  should be reusable for create and edit. The mutation belongs in the
  thin wrapper component (CreateXModal or EditXModal).

- **Forgetting to pass `reset` to NERFormModal.** Without it, closing
  and reopening the modal will show stale data from the previous
  session.

- **Passing `defaultValues` directly as the NERFormModal `reset`
  prop.** The `reset` prop should reset to empty/blank values so the
  form is clean when reused. Pass `() => reset({ name: '', ... })`.

- **Using `register` with MUI components.** MUI components need
  `Controller` because they don't expose native input refs. Only
  use `register` with plain HTML inputs or inside
  `ReactHookEditableList`.

- **Forgetting `e.stopPropagation()` on form submit.** Without this,
  submitting a form inside a modal can trigger parent form handlers,
  leading to double submissions or unexpected behavior.

## Reference Files

These files demonstrate the prescribed patterns well:

- `src/frontend/src/components/NERFormModal.tsx` — The core form
  modal abstraction with reset-on-close and submit-then-reset
- `src/frontend/src/pages/AdminToolsPage/FinanceConfig/AccountCodeFormModal.tsx`
  — Clean example of a shared create/edit form modal with Yup,
  Controller, and ReactHookTextField
- `src/frontend/src/pages/AdminToolsPage/FinanceConfig/CreateAccountCodeModal.tsx`
  — Clean create wrapper (mutation owner)
- `src/frontend/src/pages/AdminToolsPage/FinanceConfig/EditAccountCodeModal.tsx`
  — Clean edit wrapper (passes `defaultValues`)
- `src/frontend/src/pages/FinancePage/FinanceComponents/VendorFormModal.tsx`
  — Good example with multiple field types (text, checkbox,
  autocomplete multi-select)
- `src/frontend/src/pages/WorkPackageForm/WorkPackageFormView.tsx`
  — Full-page form pattern with `useFieldArray`
- `src/frontend/src/components/ReactHookTextField.tsx` — Shared
  Controller-wrapped TextField component
- `src/frontend/src/components/ReactHookEditableList.tsx` — Shared
  dynamic list component using `useFieldArray`

## Checklist

- [ ] Form uses `useForm` with `yupResolver` and typed `defaultValues`
- [ ] All MUI components are wrapped with `Controller` (not `register`)
- [ ] Yup schema validates all required fields with clear error messages
- [ ] `NERFormModal` receives `reset`, `handleUseFormSubmit`, and `onFormSubmit`
- [ ] `reset` prop resets to empty values, not to `defaultValues`
- [ ] Form component does NOT own the mutation hook
- [ ] Create wrapper passes `mutateAsync` as `onSubmit` (no `defaultValues`)
- [ ] Edit wrapper passes `mutateAsync` AND entity as `defaultValues`
- [ ] Create vs edit title/formId uses `!!defaultValues` check
- [ ] `showCloseButton` is set on the NERFormModal
- [ ] No `useEffect` is used for form state synchronization
- [ ] Form submit handler uses `e.stopPropagation()`
- [ ] `<form>` element has `noValidate` attribute
- [ ] Error messages display via `<FormHelperText error>`

## Migration Notes

> This section describes how this pattern differs from older code in the
> codebase. New code MUST follow the patterns above. When modifying existing
> files, update them to match these patterns where practical.

Some existing form components use `useEffect` to synchronize form state
with loaded data (e.g., `EventModal.tsx` uses `useEffect` to populate
Autocomplete selections from `initialValues` when `users` data loads).
The prescribed pattern avoids this entirely by computing all initial
values in the `defaultValues` object passed to `useForm`. When modifying
these files, replace `useEffect`-based synchronization with proper
`defaultValues` computation or direct `reset()` calls in event handlers.

Some older form modals also maintain parallel `useState` for values that
should be managed by React Hook Form (e.g., separate `useState` for
selected members alongside the form's member IDs). New forms MUST keep
all form state within React Hook Form — use `watch()` to read values
and `setValue()` to write them programmatically when needed.
