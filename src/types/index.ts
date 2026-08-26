// ============================================================
// SIRIUS — Core Types
// ============================================================

export type Theme = 'light' | 'dark' | 'system';

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type Variant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'success'
  | 'destructive';

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export type ButtonType = 'button' | 'submit' | 'reset';

export interface BaseComponentProps {
  className?: string;
  id?: string;
}

export interface WithChildren {
  children: React.ReactNode;
}

export interface WithOptionalChildren {
  children?: React.ReactNode;
}

// ── Role / Navigation ──────────────────────────────────────

export type DemoRole = 'store' | 'warehouse';

export interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

// ── Demo identity ──────────────────────────────────────────

export interface DemoIdentity {
  name: string;
  subtitle: string;
  role: DemoRole;
}
