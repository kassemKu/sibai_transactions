type DateTime = string;

export type Nullable<T> = T | null;

export interface Team {
  id: number;
  name: string;
  personal_team: boolean;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface User {
  id: number;
  name: string;
  email: string;
  current_team_id: Nullable<number>;
  profile_photo_path: Nullable<string>;
  profile_photo_url: string;
  two_factor_enabled: boolean;
  email_verified_at: Nullable<DateTime>;
  is_active?: number;
  created_at: DateTime;
  updated_at: DateTime;
  roles?: any;
}

export interface Auth {
  user: {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    profile_photo_path: string | null;
    profile_photo_url: string | null;
    two_factor_enabled: boolean;
    two_factor_confirmed_at: string | null;
    is_active?: number;
    created_at: string;
    updated_at: string;
    permissions: Array<{
      id: number;
      name: string;
      display_name: string;
      description: string;
      created_at: string;
      updated_at: string;
    }>;
  };
}

export type InertiaSharedProps<T = {}> = T & {
  jetstream: {
    canCreateTeams: boolean;
    canManageTwoFactorAuthentication: boolean;
    canUpdatePassword: boolean;
    canUpdateProfileInformation: boolean;
    flash: any;
    hasAccountDeletionFeatures: boolean;
    hasApiFeatures: boolean;
    hasTeamFeatures: boolean;
    hasTermsAndPrivacyPolicyFeature: boolean;
    managesProfilePhotos: boolean;
    hasEmailVerification: boolean;
  };
  auth: Auth;
  errorBags: any;
  errors: any;
};

export interface Session {
  id: number;
  ip_address: string;
  is_current_device: boolean;
  agent: {
    is_desktop: boolean;
    platform: string;
    browser: string;
  };
  last_active: DateTime;
}

export interface ApiToken {
  id: number;
  name: string;
  abilities: string[];
  last_used_ago: Nullable<DateTime>;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface JetstreamTeamPermissions {
  canAddTeamMembers: boolean;
  canDeleteTeam: boolean;
  canRemoveTeamMembers: boolean;
  canUpdateTeam: boolean;
}

export interface Role {
  key: string;
  name: string;
  permissions: string[];
  description: string;
}

export interface TeamInvitation {
  id: number;
  team_id: number;
  email: string;
  role: Nullable<string>;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface Currency {
  id: number;
  name: string;
  code: string;
  rate_to_usd: string;
  buy_rate_to_usd: string;
  sell_rate_to_usd: string;
  profit_margin_percent: string;
  is_crypto: number;
  created_at: string;
  updated_at: string;
}

export type CurrenciesResponse = Currency[];

export interface Customer {
  id: number;
  name: string;
  phone?: string;
}

export interface Transaction {
  id: number;
  cash_session_id: number;
  user_id: number;
  assigned_to: User | null;
  customer_id: number | null;
  from_currency_id: number;
  to_currency_id: number;
  original_amount: number;
  converted_amount: number;
  from_rate_to_usd: string | number;
  to_rate_to_usd: string | number;
  status: 'pending' | 'completed' | 'canceled';
  created_at: string;
  updated_at: string;
  notes?: string;
  from_currency: Currency;
  to_currency: Currency;
  created_by: User;
  customer?: Customer;
  closed_by?: User;
  // Profit fields
  profit_from_usd?: number;
  profit_to_usd?: number;
  total_profit_usd?: number;
  usd_intermediate?: number;
  // Currency rates snapshot
  from_currency_rates_snapshot?: {
    rate_to_usd: number;
    buy_rate_to_usd: number;
    sell_rate_to_usd: number;
  };
  to_currency_rates_snapshot?: {
    rate_to_usd: number;
    buy_rate_to_usd: number;
    sell_rate_to_usd: number;
  };
}

export interface SessionOpeningBalance {
  id: number;
  opening_balance: string;
  cash_session_id: number;
  currency_id: number;
  created_at: string;
  updated_at: string;
}

export interface CashBalance {
  id: number;
  opening_balance: string;
  total_in: string;
  total_out: string;
  closing_balance: string;
  actual_closing_balance: string;
  difference: string;
  cash_session_id: number;
  currency_id: number;
  created_at: string;
  updated_at: string;
  currency: Currency; // ✅ Now loaded from backend
}

export interface CashierBalance {
  currency_id: number;
  amount: number;
  currency?: Currency;
}

export interface Cashier {
  id: number;
  name: string;
  email: string;
  system_balances: CashierBalance[];
  has_active_session: boolean;
}

export interface CashSession {
  id: number;
  opened_at: string;
  closed_at: Nullable<string>;
  opened_by: User;
  closed_by: Nullable<User>;
  open_exchange_rates: string; // JSON string
  close_exchange_rates: Nullable<string>; // JSON string
  status: 'active' | 'pending' | 'closed';
  created_at: string;
  updated_at: string;
  opening_balances: SessionOpeningBalance[];
  cash_balances: CashBalance[];
  transactions: Transaction[];
  casher_cash_sessions?: CasherCashSession[];
}

export interface CasherCashSession {
  id: number;
  opened_at: string;
  closed_at: Nullable<string>;
  opened_by: User;
  closed_by: Nullable<User>;
  opening_balances: Array<{
    currency_id: number;
    amount: string;
    currency?: Currency;
  }>;
  system_balances?: Array<{
    currency_id: number;
    name: string;
    code: string;
    opening_balance: string;
    total_in: string;
    total_out: string;
    system_balance: string;
  }>;
  actual_closing_balances?: Array<{
    currency_id: number;
    amount: string;
  }>;
  cash_session_id: number;
  casher_id: number;
  status: 'active' | 'pending' | 'closed';
  created_at: string;
  updated_at: string;
  casher: User;
}

export interface CashSessionsResponse {
  current_page: number;
  data: CashSession[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}
