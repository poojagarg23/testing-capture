# Child Component Template

## Consistent Container Pattern

All child components that will be rendered in the main content area should follow this pattern:

### Required Container Structure

```tsx
const YourComponent: React.FC = () => {
  // Component logic here

  return (
    {/*
      CONSISTENT CHILD COMPONENT CONTAINER PATTERN:
      - Main container: w-full h-full bg-white rounded-2xl shadow-lg px-4 sm:px-6 py-6 flex flex-col
      - This pattern should be used by all child components (PatientList, Charges, Profile, etc.)
      - Provides: full width/height, white background, rounded corners, shadow, responsive padding
      - Uses flex-col for proper height management and scrolling behavior
      - Works with App.tsx layout: hamburger spacing, sidebar layout, responsive design, and ultra-wide centering
      - Supports collapsible sidebar: main content automatically adjusts when sidebar collapses
    */}
      <div className="w-full h-full bg-white rounded-2xl shadow-lg px-4 sm:px-6  py-2 md:py-6 flex flex-col">
      {/* Fixed content sections (headers, filters, etc.) */}
      <div className="flex-shrink-0">
        {/* Search bars, filters, buttons, etc. */}
      </div>

      {/* Scrollable content area - CRITICAL for proper height constraint */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {/*
          Table or other scrollable content goes here
          - flex-1: Takes remaining available space
          - min-h-0: Allows container to shrink below content size
          - overflow-hidden: Prevents content from breaking out of container
        */}
        <Table {...props} />
      </div>

      {/* Optional fixed footer */}
      <div className="flex-shrink-0">
        {/* Footer content if needed */}
      </div>
    </div>
  );
};
```

## Collapsible Sidebar System

The application features a collapsible sidebar that maximizes screen real estate while maintaining easy navigation access.

### Sidebar States

**Expanded State (Default):**

- Full logo display (`logo1.png`)
- Icons with text labels
- Normal width (10% of container)
- Complete navigation experience

**Collapsed State:**

- Small logo display (`logo_single.png`)
- Icons only (no text labels)
- Narrow width (80px)
- Tooltips on hover for accessibility

### Sidebar Implementation

```tsx
// App.tsx - Sidebar state management
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

<SideBar
  open={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
  collapsed={sidebarCollapsed}
  onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
/>;
```

### Layout Adaptation

The layout automatically adapts to sidebar state:

```css
/* Dynamic sidebar width */
.sidebar-container {
  width: sidebarCollapsed ? '80px' : 'var(--sidebar-width-percent)';
  transition: all 0.3s ease;
}

/* Main content uses flex-1 for automatic adjustment */
.main-content {
  flex: 1; /* Automatically takes remaining space */
}
```

### Benefits

- **Space Efficiency**: Collapsed sidebar provides ~12% more space for main content
- **Quick Access**: Icons remain visible for fast navigation
- **Smooth Transitions**: 300ms animations for professional feel
- **Responsive Design**: Only available on desktop (mobile unchanged)
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Design System & CSS Variables

The project uses a comprehensive design system with CSS variables and utility classes defined in `src/index.css`. Always prefer these over hardcoded values for consistency.

### Typography Classes (from index.css)

```css
/* Font Family Classes */
.font-gotham          /* font-family: 'Gotham', sans-serif */
.font-gotham-bold     /* font-family: 'Gotham'; font-weight: bold */
.font-gotham-medium   /* font-family: 'Gotham'; font-weight: 500 */
.font-gotham-normal   /* font-family: 'Gotham'; font-weight: normal */
```

**Usage Examples:**

- **Tabs**: `font-gotham-bold` (Profile.tsx, AddSinglePatient.tsx)
- **Buttons**: `font-gotham-bold` (Button component)
- **Labels**: `font-gotham` (MyProfile.tsx form labels)
- **Body text**: `font-gotham-medium` (MyProfile.tsx data display)

### Color Classes (from index.css)

```css
/* Text Colors */
.text-primary    /* #127dc3 - Primary blue */
.text-secondary  /* #2b353d - Dark gray/charcoal */
.text-muted      /* rgba(43, 53, 61, 0.6) - Muted gray */

/* Background Colors */
.bg-primary-gradient  /* Blue gradient (36,165,223) to (18,125,195) */
.bg-subtle           /* rgba(43, 45, 66, 0.05) - Light background */
.bg-subtle-2         /* rgba(43, 53, 61, 0.05) - Alternative light background */

/* Border Colors */
.border-subtle  /* rgba(43, 45, 66, 0.05) - Subtle border */
.border-input   /* rgba(43, 53, 61, 0.1) - Input border */
```

**Usage Examples:**

- **Tab text**: `text-secondary` (Profile.tsx tabs)
- **Form labels**: `text-muted` (MyProfile.tsx)
- **Primary buttons**: `bg-primary-gradient` (Button component)
- **Edit buttons**: `text-[#127DC3]` (MyProfile.tsx edit buttons)

### Button Classes (from index.css)

```css
/* Button Base */
.btn-base      /* Base button styling with Gotham font */

/* Button Variants */
.btn-primary   /* Blue gradient button */
.btn-secondary /* Green gradient button */
.btn-tertiary  /* Red gradient button */
.btn-dark      /* Dark gray button */
.btn-white     /* White button with border */
```

**Usage Examples:**

- **Primary actions**: `.btn-primary` (MyProfile.tsx Save buttons)
- **Add/Create actions**: `.btn-secondary` (PatientList.tsx "Add Patients")
- **Cancel actions**: `.btn-white` (MyProfile.tsx Cancel buttons)

### Layout Utility Classes (from index.css)

```css
/* Flexbox Utilities */
.flex-center       /* display: flex; align-items: center; justify-content: center */
.flex-center-start /* display: flex; align-items: center */

/* Interactive Elements */
.icon-interactive  /* Cursor pointer with hover/active states */
.click-effect      /* Hover scale and active scale effects */

/* Status Indicators */
.status-indicator  /* Base status indicator styling */
.status-success    /* Green status indicator */
.status-error      /* Red status indicator */

/* Icon Sizing */
.icon-size-sm      /* 20px x 20px icons */
.icon-size-md      /* 40px x 40px icons */
```

**Usage Examples:**

- **Icon buttons**: `.icon-interactive` (PatientList.tsx clear filters)
- **Status badges**: `.status-indicator .status-success` (PatientList.tsx notes)
- **Small icons**: `.icon-size-sm` (PatientList.tsx open icons)

## Tab System Patterns

The project uses two main tab patterns. Choose based on your needs:

### Tab Navigation Pattern

Used in: `Profile.tsx`, `Charges.tsx`, `AddSinglePatient.tsx`

```tsx
{
  /* Tab Navigation */
}
<div className="flex border-b border-gray-200 mb-6">
  <button
    onClick={() => handleTabChange('Tab1')}
    className={`px-6 py-3 text-sm font-medium transition-colors duration-200 border-b-2 font-gotham-bold ${
      activeTab === 'Tab1'
        ? 'text-secondary border-secondary opacity-100'
        : 'text-secondary border-transparent opacity-30 hover:opacity-50'
    }`}
  >
    Tab 1
  </button>
  <button
    onClick={() => handleTabChange('Tab2')}
    className={`px-6 py-3 text-sm font-medium transition-colors duration-200 border-b-2 font-gotham-bold ${
      activeTab === 'Tab2'
        ? 'text-secondary border-secondary opacity-100'
        : 'text-secondary border-transparent opacity-30 hover:opacity-50'
    }`}
  >
    Tab 2
  </button>
</div>;
```

**Features:**

- Simple and clean design
- Uses design system colors (`text-secondary`, `border-secondary`)
- Consistent opacity states (100%, 30%, 50% on hover)
- Font: `font-gotham-bold`
- Responsive and accessible
- Consistent across all components

## Modal Pattern

Use the reusable `CustomModal` component for all modal interactions:

```tsx
import CustomModal from '../reusable/CustomModal';

// In your component
const [isModalOpen, setIsModalOpen] = useState(false);
const [modalTitle, setModalTitle] = useState('Modal Title');

<CustomModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title={modalTitle}
  useFixedWidth={true} // true for forms (600px), false for auto width
>
  <div className="space-y-6">
    {/* Modal content */}
    <div className="flex justify-end gap-4 pt-4">
      <button className="btn-white rounded-full px-6 py-2 text-secondary font-gotham-bold text-sm border border-[rgba(43,53,61,0.1)]">
        Cancel
      </button>
      <button className="btn-primary rounded-full px-6 py-2 text-white font-gotham-bold text-sm">
        Save
      </button>
    </div>
  </div>
</CustomModal>;
```

**Usage Examples:**

- **MyProfile.tsx**: Edit forms with fixed width
- **PatientList.tsx**: Patient upload with dynamic width
- **GetMultiplePatientsData.tsx**: Multi-step forms

## Form Patterns

### Input Fields

```tsx
<div className="flex flex-col gap-2">
  <label className="font-gotham text-sm text-muted">Field Label</label>
  <input
    type="text"
    className="w-full border border-input rounded-lg px-3 py-2 font-gotham text-base text-secondary"
    value={value}
    onChange={handleChange}
  />
</div>
```

### Dropdown/Select Fields

```tsx
<div className="flex flex-col gap-2">
  <label className="font-gotham text-sm text-muted">Select Label</label>
  <select className="w-full border border-input rounded-lg px-3 py-2 font-gotham text-base text-secondary">
    <option value="">Select Option</option>
    <option value="option1">Option 1</option>
  </select>
</div>
```

**Used in:** MyProfile.tsx form modals

## Icon Patterns

### Edit Buttons with Icons

```tsx
<button className="flex items-center gap-2 text-[#127DC3] font-gotham-medium text-sm hover:opacity-75 transition-opacity">
  <img src={iconPath} alt="Edit" className="w-6 h-6" />
  Edit
</button>
```

**Used in:** MyProfile.tsx edit buttons with profile-edit-pencil.svg

### Interactive Icons

```tsx
<IconComponent
  className="w-9 h-9 text-gray-600 icon-interactive"
  onClick={handleClick}
  title="Icon Action"
/>
```

**Used in:** PatientList.tsx clear filters icon

## Reusable Components

The project includes a comprehensive set of reusable components in `src/components/reusable/custom/`. Always use these instead of creating custom implementations.

### Button Component

**Location:** `src/components/reusable/custom/Button.tsx`

```tsx
import Button from '../reusable/custom/Button';

// Primary button (blue gradient)
<Button variant="primary" icon="/src/assets/icons/plus-icon.svg">
  Add Patients
</Button>

// Secondary button (green gradient)
<Button variant="secondary">
  Save Changes
</Button>

// White button with border
<Button variant="white" paddingLevel={3}>
  Cancel
</Button>

// Button with loading state
<Button variant="primary" loading={isLoading} loadingText="Saving...">
  Save Changes
</Button>

// Button with custom padding
<Button variant="primary" paddingLevel={5} className="w-full">
  Full Width Button
</Button>
```

**Props:**

- `variant`: `'primary' | 'secondary' | 'tertiary' | 'danger' | 'dark' | 'white'`
- `icon`: String path or React SVG component
- `size`: `'default' | 'small' | 'large'`
- `paddingLevel`: `1 | 2 | 3 | 4 | 5` (horizontal padding control)
- `loading`: Boolean (shows spinner and disables button)
- `loadingText`: String (custom loading text)
- `className`: Additional CSS classes
- Standard button HTML attributes

**Features:**

- Built-in loading states with spinner
- Multiple variants and sizes
- Icon support
- Custom padding levels
- Consistent styling with design system

**Usage Examples:**

- **PatientList.tsx**: "Add Patients" button (secondary variant)
- **MyProfile.tsx**: Save/Cancel buttons in modals
- **MacroMate**: Add/Import buttons with loading states
- **General**: Primary actions, form submissions

### Dropdown Component

**Location:** `src/components/reusable/custom/Dropdown.tsx`

```tsx
import Dropdown from '../reusable/custom/Dropdown';

// Single selection dropdown
<Dropdown
  options={[
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' }
  ]}
  value={selectedValue}
  onChange={(val) => setSelectedValue(val)}
  placeholder="Select option"
  variant="variant_1"
  maxWidth="300px"
/>

// Multiple selection dropdown
<Dropdown
  options={providerOptions}
  value={selectedProviders}
  onChange={(val) => setSelectedProviders(val)}
  placeholder="All Providers"
  multiple
  className="rounded-full"
  variant="variant_1"
/>

// Full width dropdown for modals
<Dropdown
  options={companyOptions}
  value={selectedCompany}
  onChange={(val) => setSelectedCompany(val)}
  placeholder="Select Company"
  fullWidth
  variant="variant_2"
/>
```

**Props:**

- `options`: Array of `{ label: string, value: string | number }`
- `value`: Single value or array for multiple selection
- `onChange`: Callback function
- `multiple`: Boolean for multi-selection
- `variant`: `'variant_1'` (rounded pill) or `'variant_2'` (larger, rounded)
- `fullWidth`: Boolean for modal usage
- `maxWidth`: String (e.g., "300px")
- `disabled`: Boolean
- `placeholder`: String

**Usage Examples:**

- **PatientList.tsx**: Facility and provider filters (variant_1, multiple)
- **MyProfile.tsx**: Company selection in modals (variant_2, fullWidth)
- **General**: Any dropdown/select functionality

### InputField Component

**Location:** `src/components/reusable/custom/InputField.tsx`

```tsx
import InputField from '../reusable/custom/InputField';

// Basic input with label
<InputField
  label="First Name"
  placeholder="Enter first name"
  value={firstName}
  onChange={(e) => setFirstName(e.target.value)}
  required
/>

// Date input with icon
<InputField
  label="Date of Birth"
  type="date"
  value={dob}
  onChange={(e) => setDob(e.target.value)}
  required
/>

// Input with error state
<InputField
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error="Please enter a valid email"
  required
/>

// Read-only input
<InputField
  label="Patient ID"
  value={patientId}
  readOnly
/>
```

**Props:**

- `label`: String (optional)
- `required`: Boolean (shows red asterisk)
- `error`: String (shows error message)
- `icon`: React node (positioned on the right)
- `className`: Additional CSS classes
- Standard input HTML attributes

**Features:**

- Consistent height: 52px (mobile) / 56px (desktop)
- Figma-based styling with rounded corners
- Focus states with blue ring
- Error handling with red border
- Read-only state with gray background

**Usage Examples:**

- **PatientDetails.tsx**: Patient information forms
- **MyProfile.tsx**: Profile edit modals
- **General**: Any form input needs

### SearchBar Component

**Location:** `src/components/reusable/custom/SearchBar.tsx`

```tsx
import SearchBar from '../reusable/custom/SearchBar';
import SearchIcon from '../../assets/icons/search.svg?react';

<SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Search patients..."
  icon={<SearchIcon className="w-5 h-5 opacity-30" />}
  className="rounded-full w-full sm:w-auto sm:flex-1"
/>;
```

**Props:**

- `value`: String
- `onChange`: Function `(val: string) => void`
- `placeholder`: String
- `icon`: React node (positioned on the left)
- `className`: Additional CSS classes

**Features:**

- Rounded pill design
- Icon support on the left
- Neutral background with subtle border
- Focus states
- Max width: 711px

**Usage Examples:**

- **PatientList.tsx**: Patient search functionality
- **General**: Any search/filter functionality

### ToggleButton Component

**Location:** `src/components/reusable/custom/ToggleButton.tsx`

```tsx
import ToggleButton from '../reusable/custom/ToggleButton';

// Edit mode toggle with default icon
<ToggleButton
  checked={isEditMode}
  onChange={() => setIsEditMode(!isEditMode)}
  title="Toggle Edit Mode"
/>

// Notification toggle with tick icon
<ToggleButton
  checked={emailNotifications}
  onChange={handleEmailToggle}
  title="Toggle email notifications"
  width="w-12"
  height="h-6"
  toggleIconName="tick"
  colorVariant="green"
/>

// Status toggle (plain variant)
<ToggleButton
  checked={patient.status === 'active'}
  onChange={() => handleStatusToggle(patient)}
  title={`Toggle status (${patient.status})`}
  width="w-12"
  height="h-6"
  variant="plain"
/>

// Custom sizing with default icon
<ToggleButton
  checked={enabled}
  onChange={() => setEnabled(!enabled)}
  width="w-16"
  height="h-8"
  toggleIconName="default"
  showIcon={true}
/>
```

**Props:**

- `checked`: Boolean
- `onChange`: Function `() => void`
- `variant`: `'icon'` (default) or `'plain'`
- `width`: String (Tailwind class, e.g., "w-14")
- `height`: String (Tailwind class, e.g., "h-7")
- `showIcon`: Boolean (for icon variant)
- `toggleIconName`: `'default' | 'tick'` (icon selection)
- `colorVariant`: `'blue' | 'green'` (color scheme)
- `title`: String (tooltip)
- `className`: Additional CSS classes

**Features:**

- Smooth animations
- Multiple color variants (blue gradient, green gradient)
- Icon or plain circle variants
- Custom icon selection (default toggle icon or tick icon)
- Customizable sizing
- Click effects

**Icon Options:**

- `'default'`: Standard toggle icon (chevron/arrow)
- `'tick'`: Checkmark icon for confirmation states

**Color Variants:**

- `'blue'`: Primary blue gradient (default)
- `'green'`: Green gradient for positive actions

**Usage Examples:**

- **PatientList.tsx**: Edit mode toggle, patient status toggles
- **SecurityAndPrivacy.tsx**: Notification settings with tick icons
- **ChargeReview.tsx**: Edit mode toggle
- **General**: Any on/off functionality

### YesNoToggle Component

**Location:** `src/components/reusable/YesNoToggle.tsx`

```tsx
import YesNoToggle from '../reusable/YesNoToggle';

// Basic Yes/No toggle
<YesNoToggle
  value={isActive}
  onChange={(val) => setIsActive(val)}
  label="Is Active?"
/>

// Required field with custom styling
<YesNoToggle
  value={hasInsurance}
  onChange={(val) => setHasInsurance(val)}
  label="Has Insurance Coverage?"
  required
  labelClassName="font-gotham-bold"
/>

// Form field with validation
<YesNoToggle
  value={agreedToTerms}
  onChange={(val) => setAgreedToTerms(val)}
  label="Do you agree to the terms and conditions?"
  required
/>
```

**Props:**

- `value`: Boolean (default: true)
- `onChange`: Function `(value: boolean) => void`
- `label`: String or React node (optional)
- `required`: Boolean (shows red asterisk)
- `labelClassName`: String (additional label classes)

**Features:**

- Clean pill-style design with rounded border
- Primary gradient for selected option
- Smooth transitions and hover effects
- Keyboard navigation support (Enter/Space)
- Consistent with design system colors
- Grid-based layout for equal button sizing
- Accessible with proper ARIA attributes

**Styling:**

- **Container**: White background with subtle border
- **Selected**: Primary blue gradient background
- **Unselected**: Light gray background with hover states
- **Typography**: Gotham Medium font
- **Spacing**: Consistent padding and margins

**Usage Examples:**

- **Forms**: Binary choice questions
- **Settings**: Enable/disable features
- **Surveys**: Yes/No questions
- **Preferences**: User preference toggles

### TimeInput Component

**Location:** `src/components/reusable/custom/TimeInput.tsx`

```tsx
import TimeInput from '../reusable/custom/TimeInput';

// Basic time input
<TimeInput
  value={startTime}
  onChange={(e) => setStartTime(e.target.value)}
/>

// Time input with label
<TimeInput
  label="Start Time"
  value={startTime}
  onChange={(e) => setStartTime(e.target.value)}
  required
/>

// Time input with custom width
<TimeInput
  label="End Time"
  value={endTime}
  onChange={(e) => setEndTime(e.target.value)}
  width="w-40"
/>

// Time input with error handling
<TimeInput
  label="Meeting Time"
  value={meetingTime}
  onChange={(e) => setMeetingTime(e.target.value)}
  error={timeError}
  required
/>

// Time range example
<div className="flex items-center space-x-2">
  <TimeInput
    value={startTime}
    onChange={(e) => setStartTime(e.target.value)}
  />
  <span className="text-sm font-gotham-medium text-secondary">and</span>
  <TimeInput
    value={endTime}
    onChange={(e) => setEndTime(e.target.value)}
  />
</div>
```

**Props:**

- `value`: String (time value in HH:MM format)
- `onChange`: Function `(e: React.ChangeEvent<HTMLInputElement>) => void`
- `label`: String (optional label)
- `required`: Boolean (shows red asterisk)
- `width`: String (Tailwind class, default: "w-32")
- `height`: String (Tailwind class, default: "h-10")
- `error`: String (error message to display)
- `className`: Additional CSS classes
- `id`: String (custom ID, auto-generated from label if not provided)
- All standard HTML input attributes

**Features:**

- Consistent styling with design system
- Rounded full border design
- Focus states with primary blue color
- Error state handling with red border
- Label support with proper accessibility
- Required field indicators
- Customizable sizing
- Auto-generated IDs for accessibility

**Styling:**

- **Border**: `border-[rgba(43,53,61,0.2)]` (design system border)
- **Focus**: Primary blue focus ring `#24A5DF`
- **Font**: Gotham Medium
- **Background**: White with rounded-full corners

**Usage Examples:**

- **SecurityAndPrivacy.tsx**: Notification time range settings
- **Scheduling forms**: Meeting/appointment time selection
- **General**: Any time input requirements

### PageHeader Component

**Location:** `src/components/reusable/custom/PageHeader.tsx`

```tsx
import PageHeader from '../reusable/custom/PageHeader';

// Simple header
<PageHeader title="MacroMate Clinical" />

// Header with back button (auto navigation)
<PageHeader
  title="Patient Details"
  showBackButton={true}
/>

// Header with custom back action
<PageHeader
  title="Edit Profile"
  showBackButton={true}
  onBack={() => setEditMode(false)}
/>

// Header with custom styling
<PageHeader
  title="Settings"
  showBackButton={true}
  className="border-b border-gray-200 mb-6"
  titleClassName="text-primary text-xl"
/>
```

**Props:**

- `title`: String (required)
- `showBackButton`: Boolean
- `onBack`: Function (optional, defaults to browser back)
- `className`: Additional CSS classes for container
- `titleClassName`: Additional CSS classes for title
- `backButtonClassName`: Additional CSS classes for back button

**Features:**

- Consistent typography (Gotham font)
- Responsive text sizing
- Animated back button with hover/active states
- Automatic browser navigation or custom callback
- Flexible styling options

**Usage Examples:**

- **PatientDetails.tsx**: Page headers with navigation
- **Modal headers**: Custom back actions
- **General**: Any page that needs a title and optional navigation

### Table Component

**Location:** `src/components/reusable/custom/Table.tsx`

```tsx
import Table, { TableColumn } from '../reusable/custom/Table';

const columns: TableColumn<Patient>[] = [
  {
    key: 'name',
    label: 'Name',
    render: (patient) => `${patient.firstName} ${patient.lastName}`,
    priority: 'high',
  },
  {
    key: 'dateOfBirth',
    label: 'DOB',
    render: (patient) => new Date(patient.dob).toLocaleDateString(),
    priority: 'medium',
  },
  {
    key: 'status',
    label: 'Status',
    priority: 'high',
  },
];

<Table
  columns={columns}
  data={patients}
  activeRecordsCount={patients.length}
  onSort={handleSort}
  sortOrder={sortOrder}
/>;
```

**Props:**

- `columns`: Array of column definitions
- `data`: Array of data objects
- `activeRecordsCount`: Number (for display)
- `onSort`: Function `(column: string) => void`
- `sortOrder`: Object `{ column: string | null, order: 'asc' | 'desc' | null }`

**Column Definition:**

- `key`: String (data property key)
- `label`: String (column header)
- `render`: Function (optional custom renderer)
- `priority`: `'high' | 'medium' | 'low'` (responsive hiding)

**Features:**

- Responsive design (hides low/medium priority columns on small screens)
- Sortable columns with visual indicators
- Custom cell rendering
- Drag and drop support (when enabled)
- Consistent styling with design system

**Usage Examples:**

- **PatientList.tsx**: Main patient table
- **ChargesTab.tsx**: Charges data table
- **General**: Any tabular data display

### Additional Components

**Other available components:**

- **Textarea**: Multi-line text input with consistent styling
- **SearchInput**: Alternative search input component
- **EditableField**: Inline editing functionality
- **EditableSelect**: Inline dropdown editing
- **EditableNameField**: Specialized name editing
- **DirectoryCard**: Card component for directory/list items
- **ActiveRecords**: Record count display component

## Component Usage Patterns

### Form Layouts

```tsx
{
  /* Consistent form layout */
}
<div className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <InputField
      label="First Name"
      value={firstName}
      onChange={(e) => setFirstName(e.target.value)}
      required
    />
    <InputField
      label="Last Name"
      value={lastName}
      onChange={(e) => setLastName(e.target.value)}
      required
    />
  </div>

  <Dropdown
    options={titleOptions}
    value={title}
    onChange={setTitle}
    placeholder="Select Title"
    fullWidth
  />

  <YesNoToggle value={isActive} onChange={setIsActive} label="Is this record active?" required />

  <div className="flex justify-end gap-4 pt-4">
    <Button variant="white" onClick={onCancel}>
      Cancel
    </Button>
    <Button variant="primary" onClick={onSave} loading={isSaving}>
      Save
    </Button>
  </div>
</div>;
```

### Filter Layouts

```tsx
{
  /* Consistent filter layout */
}
<div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
  <div className="flex flex-1 flex-wrap gap-4">
    <Dropdown
      options={facilityOptions}
      value={selectedFacilities}
      onChange={setSelectedFacilities}
      placeholder="All Facilities"
      multiple
      variant="variant_1"
      maxWidth="400px"
    />
    <Dropdown
      options={providerOptions}
      value={selectedProviders}
      onChange={setSelectedProviders}
      placeholder="All Providers"
      multiple
      variant="variant_1"
      maxWidth="300px"
    />
    <ToggleButton
      checked={isEditMode}
      onChange={() => setIsEditMode(!isEditMode)}
      title="Toggle Edit Mode"
    />
  </div>
</div>;
```

### Search and Action Layouts

```tsx
{
  /* Consistent search + action layout */
}
<div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
  <SearchBar
    value={searchQuery}
    onChange={setSearchQuery}
    placeholder="Search patients..."
    icon={<SearchIcon className="w-5 h-5 opacity-30" />}
    className="w-full sm:flex-1"
  />
  <Button variant="secondary" icon="/src/assets/icons/plus-icon.svg">
    Add Patients
  </Button>
</div>;
```

## Component Best Practices

### Do's ✅

- **Always use reusable components** instead of custom implementations
- **Use consistent props** across similar components
- **Follow the design system** colors and spacing
- **Use proper variants** for different contexts (variant_1 for filters, variant_2 for forms)
- **Include proper labels** and accessibility attributes
- **Use fullWidth prop** for modal components
- **Handle loading and error states** appropriately
- **Use YesNoToggle** for binary choices instead of checkboxes
- **Implement collapsible sidebar** for space optimization

### Don'ts ❌

- Don't create custom buttons when Button component exists
- Don't use native HTML selects when Dropdown component is available
- Don't hardcode input styling when InputField exists
- Don't use native HTML time inputs when TimeInput component is available
- Don't create custom toggle switches when ToggleButton exists
- Don't ignore the priority system in Table columns
- Don't forget to handle multiple selection in Dropdowns
- Don't skip error handling in form components
- Don't use checkboxes for simple Yes/No questions when YesNoToggle is available

### Component Selection Guide

**For buttons:** Use `Button` component with appropriate variant and loading states
**For dropdowns/selects:** Use `Dropdown` component with correct variant
**For text inputs:** Use `InputField` component with labels
**For time inputs:** Use `TimeInput` component with consistent styling
**For search functionality:** Use `SearchBar` component
**For toggles/switches:** Use `ToggleButton` component with icon options
**For Yes/No questions:** Use `YesNoToggle` component for better UX
**For tables:** Use `Table` component with column definitions
**For page titles:** Use `PageHeader` component
**For multi-line text:** Use `Textarea` component

## Current Implementation Examples

### Main Container Pattern

✅ **Implemented in:**

- `PatientList.tsx` - Table with filters and search
- `Charges.tsx` - Tabbed interface with content
- `Profile.tsx` - Tab navigation with outlet
- `MyProfile.tsx` - Form sections with modals

### Tab Patterns

✅ **Simple Border Tabs:**

- `Profile.tsx` - Details, Manage Absence, Security & Privacy
- `AddSinglePatient.tsx` - Details, Admissions, Notes, etc.

✅ **Advanced CSS Variable Tabs:**

- `Charges.tsx` - Charges, Charges History, Charge Review

### Modal Implementations

✅ **CustomModal Usage:**

- `MyProfile.tsx` - Edit Profile, Contact, Address modals
- `PatientList.tsx` - Add Patients modal
- `GetMultiplePatientsData.tsx` - Multi-step upload process

### Sidebar Implementation

✅ **Collapsible Sidebar:**

- `Sidebar.tsx` - Desktop collapsible navigation
- `App.tsx` - State management and layout adaptation
- Automatic main content adjustment
- Smooth animations and transitions

## Key Classes Explained

### Main Container Classes

- `w-full h-full`: Takes full width and height of the available space
- `bg-white`: White background
- `rounded-2xl`: Large rounded corners (16px)
- `shadow-lg`: Large shadow for depth
- `px-4 sm:px-6`: Responsive horizontal padding (16px on mobile, 24px on larger screens)
- `py-6`: Vertical padding (24px)
- `flex flex-col`: Vertical flexbox layout for proper height management

### Content Section Classes

- `flex-shrink-0`: Fixed sections (headers, filters) that don't shrink
- `flex-1 min-h-0 overflow-hidden`: Scrollable content area
  - `flex-1`: Takes all remaining available space
  - `min-h-0`: **CRITICAL** - Allows container to shrink below content size
  - `overflow-hidden`: Prevents content from breaking container bounds

## CSS Variables Reference

### Available CSS Variables (from :root in index.css)

```css
/* Primary Colors */
--primary-blue: #24a5df;
--primary-blue-dark: #127dc3;
--primary-green: #95e545;
--primary-green-dark: #7acc29;

/* Text Colors */
--text-primary: #2b353d;
--text-secondary: #6b7280;
--text-muted: #9ca3af;

/* Layout Spacing */
--section-gap: theme('spacing.6'); /* 24px */
--filter-gap: theme('spacing.4'); /* 16px */

/* Icon Sizes */
--icon-size-sm: 20px;
--icon-size-md: 40px;

/* Tab System */
--tab-text-active: #2b353d;
--tab-text-inactive: #2b353d;
--tab-underline: #2b353d;
--tab-opacity-inactive: 0.3;
--tab-opacity-hover: 0.5;
```

### Layout Variables

```css
/* Layout Width Distribution (Flexible system) */
--sidebar-width-percent: 10%;
--gap-width-percent: 5%;
--main-width-percent: 85%;

/* Layout Constraints */
--sidebar-max-width: 300px;
--sidebar-min-width: 250px;
--sidebar-collapsed-width: 80px;
--gap-max-width: 25px;
--container-max-width: 3000px;
```

## Height Constraint Flow

```
App.tsx (h-screen) - Fixed viewport height
  └── Centered Container (h-full) - Inherits full height
      └── Main Content (h-full) - Constrained to available height
          └── Child Component (h-full flex flex-col) - Manages internal layout
              ├── Header/Filters (flex-shrink-0) - Fixed height
              ├── Content Area (flex-1 min-h-0) - Scrollable, takes remaining space
              └── Footer (flex-shrink-0) - Fixed height (optional)
```

## Layout Hierarchy

```
App.tsx (Main Layout - h-screen)
├── Outer Container (flex h-screen justify-center for ultra-wide centering)
│   └── Centered Container (flex h-full max-w-[3000px] - centers layout on screens > 3000px)
│       ├── Hamburger Button (Mobile - fixed positioning)
│       ├── Sidebar (Dynamic width: 10% expanded / 80px collapsed)
│       │   ├── Toggle Button (Collapse/Expand control)
│       │   ├── Logo (Full/Small based on state)
│       │   ├── Navigation (Icons + Labels / Icons only)
│       │   └── Logout (Consistent with navigation state)
│       ├── Gap (5% width, max-w-[25px])
│       └── Main Content Area (flex-1 - takes remaining space)
│           └── Inner Wrapper (h-full pt-14 for mobile hamburger spacing)
│               └── Your Child Component (h-full flex flex-col - follows template pattern)
│                   ├── Fixed Header/Filters (flex-shrink-0)
│                   ├── Scrollable Content (flex-1 min-h-0 overflow-hidden)
│                   └── Optional Footer (flex-shrink-0)
```

## Best Practices

### Do's ✅

- Use design system classes from `index.css`
- Follow the consistent container pattern
- Use `CustomModal` for all modal interactions
- Prefer CSS variables over hardcoded values
- Use `font-gotham-bold` for tabs and buttons
- Use `text-secondary` for primary text
- Use `text-muted` for labels and secondary text
- Use simple border tabs for most cases
- Include proper spacing with `space-y-6`, `gap-4`, etc.
- Leverage collapsible sidebar for better space utilization
- Use `YesNoToggle` for binary choices instead of checkboxes
- Implement loading states in buttons for better UX

### Don'ts ❌

- Don't use `min-h-screen` in App.tsx (allows unlimited growth)
- Don't forget `min-h-0` on scrollable containers (prevents shrinking)
- Don't use `overflow-auto` on the main container (breaks height constraints)
- Don't hardcode colors when design system classes exist
- Don't create custom modal implementations
- Don't use different container patterns across components
- Don't forget responsive padding (`px-4 sm:px-6`)
- Don't ignore the collapsible sidebar functionality
- Don't use checkboxes for simple Yes/No questions

### Height Constraint Debugging

If your component is stretching beyond the viewport:

1. Check that App.tsx uses `h-screen` (not `min-h-screen`)
2. Ensure all parent containers have `h-full`
3. Verify scrollable content uses `flex-1 min-h-0 overflow-hidden`
4. Confirm fixed sections use `flex-shrink-0`

## Consistency Benefits

1. **Visual Consistency**: All pages look cohesive using design system classes
2. **Maintainability**: Easy to update styling via CSS variables
3. **Developer Experience**: Clear patterns and reusable classes
4. **Performance**: Consistent class usage enables better CSS optimization
5. **Scalability**: New components automatically inherit design system
6. **Accessibility**: Consistent focus states and interactions
7. **Responsive Design**: Works seamlessly from mobile to ultra-wide displays
8. **Space Optimization**: Collapsible sidebar maximizes content area
9. **User Experience**: Loading states and smooth animations provide professional feel
10. **Form Consistency**: YesNoToggle and other components ensure uniform interaction patterns
