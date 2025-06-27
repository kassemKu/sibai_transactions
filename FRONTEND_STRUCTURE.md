# Frontend Structure Guide

## 📁 Folder Structure

```
resources/js/
├── Components/           # Reusable UI components
│   ├── UI/              # Generic UI components (Card, Button, Modal, etc.)
│   ├── Forms/           # Form-specific components
│   ├── Navigation/      # Navigation-related components
│   └── [FeatureName]/   # Feature-specific components
├── Layouts/             # Layout components
│   ├── RootLayout.tsx   # Main authenticated layout
│   ├── AuthLayout.tsx   # Authentication pages layout
│   └── GuestLayout.tsx  # Public pages layout
├── Pages/               # Inertia.js pages (route components)
│   ├── Auth/            # Authentication pages
│   ├── Dashboard/       # Dashboard-related pages
│   ├── Transactions/    # Transaction management pages
│   ├── Currencies/      # Currency management pages
│   └── Reports/         # Reporting pages
├── Hooks/               # Custom React hooks
├── Utils/               # Utility functions
├── Types/               # TypeScript type definitions
└── Constants/           # Application constants
```

## 🏗️ Component Architecture

### 1. Layout Components (`/Layouts`)

**RootLayout.tsx** - Main authenticated layout with:

- Sidebar navigation
- Top navigation bar
- Breadcrumbs support
- Header actions slot
- Responsive design

```tsx
// Usage example
<RootLayout
  title="Dashboard"
  breadcrumbs={[{ label: 'Dashboard' }]}
  headerActions={<PrimaryButton>New Transaction</PrimaryButton>}
>
  {/* Page content */}
</RootLayout>
```

### 2. UI Components (`/Components/UI`)

**Card Components:**

```tsx
import { Card, CardHeader, CardContent } from '@/Components/UI/Card';

<Card>
  <CardHeader
    title="Recent Transactions"
    description="Your latest activity"
    actions={<Button>View All</Button>}
  />
  <CardContent>{/* Card content */}</CardContent>
</Card>;
```

**StatsCard Component:**

```tsx
import StatsCard from '@/Components/UI/StatsCard';

<StatsCard
  title="Total Transactions"
  value="1,234"
  change="+12%"
  changeType="positive"
  icon={TransactionIcon}
/>;
```

### 3. Page Components (`/Pages`)

Each page should:

- Use appropriate layout
- Handle its own state management
- Import and use reusable components
- Follow consistent naming patterns

```tsx
// Example: Pages/Transactions/Index.tsx
export default function TransactionsIndex() {
  return (
    <RootLayout title="Transactions" breadcrumbs={[{ label: 'Transactions' }]}>
      {/* Page content */}
    </RootLayout>
  );
}
```

## 📝 Naming Conventions

### Files & Folders

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Pages**: PascalCase (e.g., `Dashboard.tsx`, `TransactionsList.tsx`)
- **Hooks**: camelCase starting with "use" (e.g., `useTransaction.ts`)
- **Utils**: camelCase (e.g., `formatCurrency.ts`)
- **Types**: PascalCase (e.g., `Transaction.ts`)

### Component Props

```tsx
interface ComponentProps {
  // Required props first
  title: string;
  data: Transaction[];

  // Optional props second
  className?: string;
  onSubmit?: (data: FormData) => void;

  // Boolean props with "is" or "has" prefix
  isLoading?: boolean;
  hasError?: boolean;
}
```

## 🎨 Styling Guidelines

### Tailwind CSS Classes Organization

```tsx
// Order: Layout → Spacing → Typography → Colors → States
className={classNames(
  // Layout
  'flex items-center justify-between',
  // Spacing
  'px-4 py-2 mb-4',
  // Typography
  'text-sm font-medium',
  // Colors
  'bg-white text-gray-900 border-gray-200',
  // States
  'hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500',
  // Conditional classes
  isActive && 'bg-indigo-50 text-indigo-600',
  className
)}
```

## 🔧 State Management Patterns

### Form Handling with Inertia

```tsx
import { useForm } from '@inertiajs/react';

export default function TransactionForm() {
  const form = useForm({
    amount: '',
    currency: 'USD',
    type: 'credit',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.post(route('transactions.store'), {
      onSuccess: () => {
        // Handle success
      },
    });
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

### Custom Hooks

```tsx
// hooks/useTransaction.ts
export function useTransaction(id: number) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  // Hook logic here

  return { transaction, loading, refetch };
}
```

## 🚀 Best Practices

### 1. Component Composition

- Keep components small and focused
- Use composition over inheritance
- Extract reusable logic into custom hooks

### 2. Type Safety

- Define interfaces for all props
- Use strict TypeScript configuration
- Leverage Inertia's type system

### 3. Performance

- Use React.memo for expensive components
- Implement proper key props for lists
- Lazy load heavy components

### 4. Accessibility

- Include proper ARIA labels
- Ensure keyboard navigation
- Use semantic HTML elements

### 5. Error Handling

```tsx
// Error boundaries for robust error handling
export default function ErrorBoundary({ children }: PropsWithChildren) {
  // Error boundary implementation
}
```

## 📋 Code Examples

### Creating a New Page

1. Create the page component in appropriate folder
2. Use the correct layout
3. Handle data fetching via Inertia props
4. Implement proper TypeScript interfaces

```tsx
// Pages/Transactions/Create.tsx
interface Props {
  currencies: Currency[];
  errors: Record<string, string>;
}

export default function CreateTransaction({ currencies, errors }: Props) {
  return (
    <RootLayout
      title="Create Transaction"
      breadcrumbs={[
        { label: 'Transactions', href: route('transactions.index') },
        { label: 'Create' },
      ]}
    >
      <Card>
        <CardHeader title="New Transaction" />
        <CardContent>{/* Transaction form */}</CardContent>
      </Card>
    </RootLayout>
  );
}
```

### Creating Reusable Components

```tsx
// Components/UI/StatusBadge.tsx
interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error';
  children: React.ReactNode;
}

export default function StatusBadge({ status, children }: StatusBadgeProps) {
  const statusStyles = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}
    >
      {children}
    </span>
  );
}
```

## 🔍 Testing Strategy

### Component Testing

- Test component rendering
- Test user interactions
- Test prop variations
- Mock external dependencies

### Integration Testing

- Test page components with layouts
- Test form submissions
- Test navigation flows

This structure provides a solid foundation for a scalable, maintainable React + Inertia.js application with TypeScript.
