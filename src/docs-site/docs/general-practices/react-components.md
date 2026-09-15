---
title: React Components
description: Guide for building and organizing React components in FinishLine. Covers shared vs page-specific component decisions, prop interface design, MUI sx styling, styled() MUI extensions, stateless component patterns, and the container/view split. Use when creating new React components, refactoring UI code, deciding where a component belongs, or when asked about component architecture or styling conventions.
skill: true
skill_name: react-components
---

# React Component Architecture

> **Summary:** FinishLine organizes React components into a shared library (`src/frontend/src/components/`) and page-specific directories (`src/frontend/src/pages/{Feature}/`). Shared components are stateless, prop-driven building blocks. Page components compose them into features, own state, and handle data fetching.

## Overview

FinishLine's frontend is built from two layers of components. The **shared component library** contains reusable, stateless UI primitives — buttons, form fields, modals, display blocks, layout shells, and data presentation widgets. These components know nothing about business logic; they receive data through props and notify parents through callbacks.

**Page-level components** live in feature directories under `src/frontend/src/pages/`. They compose shared components into complete features, own local state (edit mode, modal visibility, active tab), fetch data via React Query hooks, and handle user interactions. Complex pages often use a **container/view split** where a container component manages data fetching and state while a view component handles pure rendering.

Before building any new component, always check `src/frontend/src/components/` first. The shared library already covers common patterns — detail displays, modals, form fields, buttons, search bars, loading states, progress bars, tabs, and more. Duplicating existing functionality is a common mistake for new developers.

## Architecture

```
src/frontend/src/
├── components/           ← Shared library
│   ├── NERButton.tsx         (styled MUI)
│   ├── NERFormModal.tsx      (form wrapper)
│   ├── NERAutocomplete.tsx   (controlled input)
│   ├── DetailDisplay.tsx     (label + value)
│   ├── PageLayout.tsx        (page shell)
│   ├── LoadingIndicator.tsx  (loading state)
│   ├── SearchBar.tsx         (search input)
│   ├── Toast/                (multi-file)
│   │   ├── Toast.tsx
│   │   └── ToastProvider.tsx
│   └── ...
└── pages/                ← Feature pages
    └── ProjectDetailPage/
        ├── ProjectPage.tsx          (entry)
        ├── DeleteProject.tsx        (container)
        ├── DeleteProjectView.tsx    (view)
        ├── ProjectForm/             (edit mode)
        └── ProjectViewContainer/    (read mode)
            ├── ProjectViewContainer.tsx
            ├── ProjectDetails.tsx
            ├── WorkPackageSummary.tsx
            └── ...
```

**Data flow in a typical page:**

```
┌──────────┐  React Query  ┌───────────┐
│   Page   │──────────────▶│ Container │
│  (entry) │   hook data   │  (state)  │
└──────────┘               └─────┬─────┘
                                 │ props
                           ┌─────▼─────┐
                           │   View    │
                           │ (render)  │
                           └─────┬─────┘
                                 │ composes
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              PageLayout   DetailDisplay  NERButton
              (shared)      (shared)      (shared)
```

## Component Categories

FinishLine has three distinct component categories. Each has different rules.

### 1. Shared Functional Components

Standard React functional components in `src/frontend/src/components/`. These are the most common type. They accept a typed props interface, render MUI components, and return JSX.

**Examples:** `DetailDisplay`, `NERAutocomplete`, `PageLayout`, `SearchBar`, `InfoBlock`, `NERFormModal`, `ActionsMenu`, `LoadingIndicator`

### 2. Styled MUI Extensions

Components created with MUI's `styled()` utility that extend a base MUI component with FinishLine-specific theming. These are thin wrappers — often under 30 lines — that set colors, sizes, and hover states to match the FinishLine design system (red: `#ef4345`).

**Examples:** `NERButton`, `NERSuccessButton`, `NERFailButton`, `NERSwitch`, `NERProgressBar`

### 3. Page-Specific Components

Components that live in a page's directory and are only used by that feature. These include entry-point page components, container/view pairs, and feature-specific sub-components like `WorkPackageSummary` or `ProjectDetails`.

**Examples:** `ProjectPage`, `DeleteProject` / `DeleteProjectView`, `ProjectViewContainer`, `ProjectDetails`

## File Locations and Naming

**Shared components:** `src/frontend/src/components/{ComponentName}.tsx`

- Single-file components: `NERAutocomplete.tsx`, `DetailDisplay.tsx`
- Multi-file components (rare): `Toast/Toast.tsx`, `Toast/ToastProvider.tsx`, `Link/LinkView.tsx`
- Use a subdirectory only when the component has multiple closely related files

**Page components:** `src/frontend/src/pages/{FeaturePage}/{ComponentName}.tsx`

- Entry point: `{Feature}Page.tsx` (e.g., `ProjectPage.tsx`)
- Containers: `{Action}{Feature}.tsx` (e.g., `DeleteProject.tsx`)
- Views: `{Action}{Feature}View.tsx` (e.g., `DeleteProjectView.tsx`)
- Sub-components: descriptive name (e.g., `ProjectDetails.tsx`, `WorkPackageSummary.tsx`)
- Subdirectories for complex tab content (e.g., `ProjectViewContainer/`, `ProjectForm/`)

**Naming conventions:**

- PascalCase for all component files and component names
- File name MUST match the default export name
- Prefix shared components with `NER` when they wrap/extend MUI components (e.g., `NERButton`, `NERFormModal`, `NERAutocomplete`)
- Do NOT prefix page-specific components with `NER`

## Prop Design Conventions

### TypeScript Interfaces (Required)

Every component that accepts props MUST define a named TypeScript interface. Never use inline type annotations on the function parameter.

```tsx
// ✅ CORRECT — named interface
interface DetailDisplayProps {
  label: string;
  content: string;
  paddingRight?: number;
  copyButton?: boolean;
}

const DetailDisplay: React.FC<DetailDisplayProps> = ({
  label, content, paddingRight = 0, copyButton = false
}) => { ... };

// ❌ WRONG — inline type
const DetailDisplay: React.FC<{
  label: string; content: string;
}> = ({ label, content }) => { ... };

// ❌ WRONG — no type at all
const DetailDisplay = ({ label, content }) => { ... };
```

**Interface naming:** `{ComponentName}Props` — always. For exported prop types that other files need, export the interface from the component file.

### Required vs Optional Props

- Props that the component cannot render without are **required** (no `?`)
- Style overrides, feature flags, and callbacks with sensible defaults are **optional** (`?`) with default values in destructuring
- Use `= defaultValue` in the parameter destructuring, not `defaultProps`

```tsx
interface SearchBarProps {
  searchText: string;                        // required
  setSearchText: (text: string) => void;     // required
  placeholder?: string;                      // optional
}

export const SearchBar = ({
  searchText,
  setSearchText,
  placeholder = 'Search...'
}: SearchBarProps) => { ... };
```

### Style Override with `sx`

Shared components that render MUI elements MUST accept an optional `sx` prop to allow callers to apply style overrides:

```tsx
interface NERAutocompleteProps {
  id: string;
  options: { label: string; id: string }[];
  onChange: (event: React.SyntheticEvent, value: { ... } | null) => void;
  sx?: SxProps<Theme>;           // ← always optional
  // ...
}
```

The component spreads or merges `sx` into its root element's styles:

```tsx
const autocompleteStyle = {
  backgroundColor: theme.palette.background.default,
  width: '100%',
  ...sx // caller overrides win
};
```

### Callback Props

Components that respond to user interactions MUST expose callbacks as props rather than performing side effects internally. Name callbacks descriptively:

- `onChange`, `onClick`, `onSubmit` — for standard DOM-like events
- `onHide`, `onClose` — for dismissal actions
- `setSearchText`, `setTab` — for controlled state (matching the `useState` setter convention)
- `enterEditMode`, `handleClose` — for domain-specific actions

### Children

Components that act as layout wrappers (e.g., `PageLayout`, `InfoBlock`, `NERFormModal`) accept `children: ReactNode`. Use `React.FC<Props>` which includes `children` implicitly, or declare it explicitly in the interface.

### Extending MUI Props

When wrapping an MUI component, extend its prop type to preserve pass-through capabilities:

```tsx
interface NERButtonProps extends ButtonProps {
  whiteVariant?: boolean;
}
```

## Styling Rules

### MUI `sx` Prop (Preferred)

All styling MUST use MUI's `sx` prop. The `sx` prop supports theme-aware values, responsive breakpoints, and pseudo-selectors.

```tsx
// ✅ CORRECT — sx prop
<Typography sx={{ fontWeight: 'bold', paddingRight: 2 }}>
  {label}
</Typography>

<Box sx={{
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  background: theme.palette.background.paper,
  borderRadius: 4,
  padding: 1
}}>
```

### `styled()` for Reusable Theme Extensions

Use MUI's `styled()` utility when creating a reusable component that permanently overrides an MUI component's default styling. This is appropriate for design-system primitives, not one-off styling.

```tsx
import { Button, styled } from '@mui/material';

const NERSuccessButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.success.main,
  color: theme.palette.success.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.success.dark
  }
})) as typeof Button;

export default NERSuccessButton;
```

Use `styled()` when:

- The component is a permanent design-system token (brand buttons, switches, progress bars)
- The styles are static and theme-derived, not dynamic from props
- Multiple consumers will use the same styled version

### What to Avoid

- **NEVER use inline `style={{}}`** — use `sx` instead. Legacy components with `style` should be migrated to `sx` when touched.
- **NEVER use CSS modules for new components** — `LoadingIndicator` uses CSS modules as a legacy pattern. New components MUST use `sx` or `styled()`.
- **NEVER use CSS-in-JS libraries** (styled-components, emotion's `css` prop directly) — use MUI's built-in `sx` and `styled()` APIs only.

### FinishLine Brand Colors

When referencing brand colors in `styled()` components, use `#ef4345` (FinishLine red). In functional components, prefer theme palette values:

```tsx
// In styled() components — direct hex is acceptable
backgroundColor: '#ef4345';

// In functional components — prefer theme
const theme = useTheme();
theme.palette.primary.main;
theme.palette.error.main;
theme.palette.success.main;
```

## Statelessness and State Management

### Shared Components: Stateless by Default

Shared components MUST prefer statelessness. They receive data via props and notify parents via callbacks. They do NOT:

- Fetch data (no React Query hooks)
- Manage form state (receive `control` from parent via React Hook Form)
- Track UI state that belongs to the parent (modal open/close, edit mode)

```tsx
// ✅ CORRECT — stateless, parent controls everything
interface SearchBarProps {
  searchText: string;
  setSearchText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ searchText, setSearchText, placeholder = 'Search...' }: SearchBarProps) => {
  return (
    <Search>
      <StyledInputBase value={searchText} onChange={(e) => setSearchText(e.target.value)} />
    </Search>
  );
};
```

The only state allowed in shared components is **transient UI state** that is purely internal to the component's rendering (e.g., `anchorEl` for a dropdown menu position in `ActionsMenu`).

### Page Components: Own Their State

Page-level components are where state lives. They use `useState` for UI state, React Query hooks for server data, and React Hook Form for form state:

```tsx
const ProjectPage: React.FC<ProjectPageProps> = ({ wbsNum }) => {
  const [editMode, setEditMode] = useState(false);
  const { isLoading, isError, data, error } = useSingleProject(wbsNum);

  if (isError) return <ErrorPage message={error.message} />;
  if (isLoading || !data) return <LoadingIndicator />;

  if (editMode) {
    return <ProjectEditContainer project={data} exitEditMode={() => setEditMode(false)} />;
  }
  return <ProjectViewContainer project={data} enterEditMode={() => setEditMode(true)} />;
};
```

### The `useEffect` Rule

`useEffect` MUST NOT be used unless it is for one of these cases:

1. **External subscriptions** — WebSocket connections, event listeners on `window`/`document`
2. **Timers** — `setTimeout`, `setInterval`, `requestAnimationFrame`
3. **Non-React library integration** — initializing a chart library, D3 bindings, imperative DOM APIs

Do NOT use `useEffect` for:

- Deriving state from props (use computed values or `useMemo`)
- Syncing React state with other React state (restructure state instead)
- Responding to prop changes (use event handlers or key-based remounting)

> **Legacy note:** Some existing components (e.g., `FullPageTabs`) use `useEffect` to sync with browser navigation state. This is acceptable in legacy code but MUST NOT be replicated in new components. New components should use router hooks or event handlers directly.

## The Container/View Pattern

For components with complex interactions (forms, delete confirmations, multi-step workflows), split into a **container** that manages logic and a **view** that handles rendering.

### Container

- Handles data fetching and mutation hooks
- Manages loading/error states
- Calls toast notifications on success/error
- Passes data and callbacks down as props

```tsx
// DeleteProject.tsx (container)
interface DeleteProjectProps {
  modalShow: boolean;
  handleClose: () => void;
  wbsNum: WbsNumber;
}

const DeleteProject: React.FC<DeleteProjectProps> = ({ modalShow, handleClose, wbsNum }) => {
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useDeleteProject();

  const handleConfirm = async ({ wbsNum }: DeleteProjectInputs) => {
    try {
      await mutateAsync(validateWBS(wbsNum));
      handleClose();
      toast.success(`Project #${wbsPipe(wbsNum)} Deleted!`);
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
    }
  };

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  return <DeleteProjectView project={wbsNum} modalShow={modalShow} onHide={handleClose} onSubmit={handleConfirm} />;
};
```

### View

- Pure rendering only — no hooks other than `useForm`
- Receives all data and callbacks via props
- Owns form setup (schema, `useForm`, validation) when it is a form view

```tsx
// DeleteProjectView.tsx (view)
interface DeleteProjectViewProps {
  project: WbsNumber;
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: DeleteProjectInputs) => Promise<void>;
}

const DeleteProjectView: React.FC<DeleteProjectViewProps> = ({
  project, modalShow, onHide, onSubmit
}) => {
  const { handleSubmit, control, reset, formState } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { wbsNum: '' },
    mode: 'onChange'
  });

  return (
    <NERFormModal open={modalShow} onHide={onHide} ...>
      {/* form content */}
    </NERFormModal>
  );
};
```

### When to Use Container/View

Use the container/view split when a component does **both** data fetching/mutation **and** has non-trivial rendering logic. Simple components that just display fetched data (like `ProjectDetails`) can combine both in one file — the split is for managing complexity, not a rigid rule.

## When to Create a Shared Component

A component belongs in `src/frontend/src/components/` when:

1. **Two or more pages need it** — if you find yourself copying a component between page directories, extract it to shared
2. **It is a general UI pattern** — detail displays, modals, buttons, form fields, status pills, search inputs, loading states
3. **It has no domain-specific business logic** — shared components know about visual presentation, not Work Packages or Change Requests

A component stays in its page directory when:

1. **Only one feature uses it** — `WorkPackageSummary` is only relevant to the project detail page
2. **It contains feature-specific business logic** — `BOMTab` composes shared components but encodes BOM-specific display rules
3. **It is a container** — containers with data-fetching hooks and mutation logic are always page-specific

**When in doubt:** Start page-specific. Extract to shared when a second consumer appears. Premature extraction creates unused abstractions.

## Step-by-Step: Creating a New Shared Component

1. **Check the existing library.** Search `src/frontend/src/components/` for similar functionality. If something close exists, extend it with new props rather than creating a duplicate.

2. **Define the props interface.** Name it `{ComponentName}Props`. Include `sx?: SxProps<Theme>` if the component renders MUI elements. Make props that have sensible defaults optional.

3. **Write a stateless functional component.** Use `React.FC<Props>` typing. Destructure props with defaults. Do not add state unless absolutely necessary for transient UI behavior.

4. **Style with `sx`.** Use the `sx` prop on MUI components. Use `useTheme()` for theme-aware values. Merge caller's `sx` override into the root element.

5. **Export as default.** One component per file, default export, file name matches component name.

```tsx
import { Box, Typography, SxProps, Theme, useTheme } from '@mui/material';

interface StatusBadgeProps {
  label: string;
  color: 'success' | 'error' | 'warning';
  sx?: SxProps<Theme>;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ label, color, sx }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.5,
        py: 0.5,
        borderRadius: 2,
        backgroundColor: theme.palette[color].light,
        ...sx
      }}
    >
      <Typography sx={{ fontSize: 13, fontWeight: 'bold', color: theme.palette[color].dark }}>{label}</Typography>
    </Box>
  );
};

export default StatusBadge;
```

## Key Rules

- Every component that accepts props MUST define a named `{ComponentName}Props` interface — NEVER use inline types
- Shared components MUST be stateless — receive data via props, notify parents via callbacks
- NEVER use `useEffect` unless it is for an external subscription, timer, or non-React library integration
- ALWAYS use MUI `sx` prop for styling — NEVER use inline `style={{}}`
- ALWAYS check `src/frontend/src/components/` before building a new component
- Shared components MUST NOT contain data-fetching hooks (React Query) or mutation logic
- ALWAYS accept `sx?: SxProps<Theme>` on shared components that render MUI elements
- One component per file, default export, file name matches component name
- Prefix shared MUI wrapper components with `NER` (e.g., `NERButton`, `NERModal`)

## Common Mistakes

- **Building a component that already exists.** The shared library has 50+ components. Search before creating. Common ones missed: `DetailDisplay` (label-value pairs), `InfoBlock` (titled sections), `NERFormModal` (form dialogs), `ActionsMenu` (dropdown action buttons).

- **Using `useEffect` to derive state.** If you need to compute something from props, use a local variable or `useMemo`. If you need to "reset" state when a prop changes, use a `key` prop on the component instead.

- **Using inline `style` instead of `sx`.** MUI's `sx` supports theme values, responsive breakpoints, and pseudo-selectors. Inline `style` does not.

- **Putting data-fetching in a shared component.** Shared components render data — they don't fetch it. If your shared component needs a React Query hook, it should be a page component instead, or the data should be passed as a prop.

- **Defining props inline.** Always create a named interface. This makes props discoverable, exportable, and consistent across the codebase.

- **Creating a shared component too early.** Start page-specific. Extract when a second page needs the same component. Unused shared components are clutter.

## Reference Files

**Shared components (good examples of prop design and statelessness):**

- `src/frontend/src/components/NERAutocomplete.tsx` — Controlled input with full props interface, `sx` override, form error integration
- `src/frontend/src/components/DetailDisplay.tsx` — Minimal stateless display component with optional features
- `src/frontend/src/components/PageLayout.tsx` — Layout shell with children, optional header elements, breadcrumbs
- `src/frontend/src/components/SearchBar.tsx` — Controlled search with `styled()` sub-components and callback pattern
- `src/frontend/src/components/ActionsMenu.tsx` — Shared component with allowable transient UI state (menu anchor)

**Styled MUI extensions:**

- `src/frontend/src/components/NERSuccessButton.tsx` — Clean `styled()` theme extension
- `src/frontend/src/components/NERSwitch.tsx` — Complex `styled()` with pseudo-selectors

**Page components (good examples of composition and container/view):**

- `src/frontend/src/pages/ProjectDetailPage/ProjectPage.tsx` — Entry point with loading/error handling and edit mode toggle
- `src/frontend/src/pages/ProjectDetailPage/DeleteProject.tsx` — Container with mutation logic and toast handling
- `src/frontend/src/pages/ProjectDetailPage/DeleteProjectView.tsx` — Pure form view with `NERFormModal` and React Hook Form
- `src/frontend/src/pages/ProjectDetailPage/ProjectViewContainer/ProjectViewContainer.tsx` — Complex page composing many shared components

## Checklist

- [ ] Searched `src/frontend/src/components/` for existing components before creating new ones
- [ ] Props interface is named `{ComponentName}Props` (not inline)
- [ ] Component is `React.FC<Props>` with default export matching file name
- [ ] Shared component is stateless (no data fetching, no `useEffect`, no owned UI state beyond transient menu anchors)
- [ ] Styling uses `sx` prop, not inline `style`
- [ ] Shared components that render MUI elements accept optional `sx?: SxProps<Theme>`
- [ ] Callbacks are exposed as props, not handled internally
- [ ] `styled()` is only used for permanent design-system tokens, not one-off styling
- [ ] Page components handle loading/error states with `LoadingIndicator` and `ErrorPage`
- [ ] Complex interactions use the container/view split

## Migration Notes

> This section describes how this pattern differs from older code in the
> codebase. New code MUST follow the patterns above. When modifying existing
> files, update them to match these patterns where practical.

**Inline `style` → `sx`:** Some older components (e.g., `WarningBanner`) use `style={{}}` instead of MUI's `sx` prop. When touching these files, migrate to `sx`.

**CSS Modules → `sx`/`styled()`:** `LoadingIndicator` uses a CSS module (`loading-indicator.module.css`). New components MUST NOT use CSS modules. When significantly refactoring components that use CSS modules, migrate to `sx` or `styled()`.

**`useEffect` for router sync:** `FullPageTabs` uses `useEffect` to sync tab state with the browser URL. This is acceptable as legacy code but MUST NOT be replicated. New components should use router hooks or event handlers directly.
