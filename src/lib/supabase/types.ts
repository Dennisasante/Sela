// Hand-authored to match supabase/migrations/*.sql. Once the project is
// linked, regenerate with:
//   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/types.ts
//
// NOTE: these must be `type` aliases, not `interface`s — interfaces don't
// structurally satisfy the `Record<string, unknown>` constraint Supabase's
// generic client types rely on, which silently collapses every Row/Insert
// type to `never`.

export type AccountType = "mobile_money" | "bank" | "cash" | "investment" | "other";
export type IncomeCategory = "stable" | "gig" | "product";
export type ProjectStatus = "active" | "completed" | "cancelled";
export type BillRecurrence = "weekly" | "monthly" | "quarterly" | "yearly";
export type BillStatus = "pending" | "paid" | "overdue" | "partially_paid";
export type LoanDirection = "borrowed" | "lent";
export type LoanStatus = "outstanding" | "repaid" | "partially_repaid";
export type LoanTransactionType = "disbursement" | "repayment";
export type EventStatus = "active" | "closed";
export type SavingsBaseType = "all_income" | "stable_only" | "gig_only" | "custom";
export type SavingsPeriod = "monthly";
export type GoalPriority = "low" | "medium" | "high";
export type GoalStatus = "active" | "paused" | "cancelled";
export type AlertMetric = "total_spend" | "category_spend" | "total_income";
export type AlertDirection = "above" | "below";
export type RecurringIncomeStatus = "active" | "paused" | "cancelled";
export type IncomeOccurrenceStatus = "expected" | "partial" | "received" | "skipped" | "missed";
export type MilestoneStatus = "pending" | "paid";

type BaseRow = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type Account = BaseRow & {
  name: string;
  type: AccountType;
  provider: string | null;
  currency: string;
  opening_balance: number;
  is_active: boolean;
};

export type AccountBalance = {
  account_id: string;
  user_id: string;
  name: string;
  type: AccountType;
  currency: string;
  is_active: boolean;
  opening_balance: number;
  balance: number;
};

export type IncomeSource = BaseRow & {
  name: string;
  category: IncomeCategory;
  is_recurring: boolean;
  notes: string | null;
  phone: string | null;
  email: string | null;
  company: string | null;
};

export type RecurringIncome = BaseRow & {
  source_id: string;
  expected_amount: number;
  currency: string;
  expected_day_of_month: number;
  default_account_id: string | null;
  start_date: string;
  status: RecurringIncomeStatus;
};

export type IncomeOccurrence = BaseRow & {
  recurring_income_id: string;
  expected_date: string;
  expected_amount: number;
  currency: string;
  status: IncomeOccurrenceStatus;
  income_entry_id: string | null;
  received_amount: number | null;
  received_date: string | null;
};

export type Project = BaseRow & {
  source_id: string | null;
  title: string;
  description: string | null;
  total_amount: number;
  currency: string;
  status: ProjectStatus;
  started_at: string | null;
  due_at: string | null;
};

export type ProjectMilestone = BaseRow & {
  project_id: string;
  label: string;
  amount: number;
  currency: string;
  due_date: string | null;
  status: MilestoneStatus;
  income_entry_id: string | null;
};

export type Event = BaseRow & {
  name: string;
  budgeted_amount: number;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  status: EventStatus;
};

export type ExpenseCategory = BaseRow & {
  name: string;
  is_default: boolean;
  icon: string;
  color: string;
  archived_at: string | null;
};

export type Loan = BaseRow & {
  direction: LoanDirection;
  counterparty: string;
  amount: number;
  currency: string;
  date: string;
  status: LoanStatus;
  notes: string | null;
};

export type LoanTransaction = BaseRow & {
  loan_id: string;
  account_id: string;
  type: LoanTransactionType;
  amount: number;
  currency: string;
  date: string;
  notes: string | null;
};

export type Bill = BaseRow & {
  payee: string;
  amount: number;
  currency: string;
  is_recurring: boolean;
  recurrence: BillRecurrence | null;
  due_date: string;
  status: BillStatus;
  category_id: string | null;
  default_account_id: string | null;
  provider: string | null;
  is_subscription: boolean;
  is_active: boolean;
};

export type IncomeEntry = BaseRow & {
  source_id: string | null;
  project_id: string | null;
  loan_id: string | null;
  account_id: string;
  amount: number;
  currency: string;
  date: string;
  description: string | null;
  include_in_tax_base: boolean;
  product_sale_id: string | null;
};

export type ProductSale = BaseRow & {
  income_entry_id: string;
  product_name: string;
  quantity: number;
  selling_price_per_unit: number;
  cost_price_per_unit: number;
  delivery_fee: number;
  sale_date: string;
};

export type Expense = BaseRow & {
  account_id: string;
  category_id: string | null;
  amount: number;
  currency: string;
  date: string;
  description: string | null;
  payee: string | null;
  is_gift: boolean;
  event_id: string | null;
  bill_id: string | null;
  loan_id: string | null;
  project_id: string | null;
};

export type Transfer = BaseRow & {
  from_account_id: string;
  to_account_id: string | null;
  amount: number;
  currency: string;
  date: string;
  description: string | null;
  goal_id: string | null;
};

export type SavingsRule = BaseRow & {
  name: string;
  percentage: number;
  base_type: SavingsBaseType;
  custom_source_ids: string[] | null;
  period: SavingsPeriod;
  is_active: boolean;
};

export type SavingsGoal = BaseRow & {
  name: string;
  target_account_id: string | null;
  target_amount: number;
  target_date: string | null;
  priority: GoalPriority;
  category: string | null;
  status: GoalStatus;
  notes: string | null;
};

export type AlertThreshold = BaseRow & {
  metric: AlertMetric;
  category_id: string | null;
  period: SavingsPeriod;
  direction: AlertDirection;
  threshold_amount: number;
  is_active: boolean;
};

export type CategoryBudget = BaseRow & {
  category_id: string;
  monthly_limit: number;
  currency: string;
};

export type PushSubscriptionRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
};

type TableDef<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type NullableKeys<T> = {
  [K in keyof T]: null extends T[K] ? K : never;
}[keyof T];

type GeneratedKeys = "id" | "user_id" | "created_at" | "updated_at";

type WithOptionalOwnerFields<T extends BaseRow> = Omit<
  T,
  GeneratedKeys | NullableKeys<T>
> &
  Partial<Pick<T, NullableKeys<T>>> & {
    id?: string;
    user_id?: string;
  };

export type Database = {
  public: {
    Tables: {
      accounts: TableDef<Account, WithOptionalOwnerFields<Account>>;
      income_sources: TableDef<IncomeSource, WithOptionalOwnerFields<IncomeSource>>;
      recurring_income: TableDef<
        RecurringIncome,
        WithOptionalOwnerFields<RecurringIncome>
      >;
      income_occurrences: TableDef<
        IncomeOccurrence,
        WithOptionalOwnerFields<IncomeOccurrence>
      >;
      projects: TableDef<Project, WithOptionalOwnerFields<Project>>;
      project_milestones: TableDef<
        ProjectMilestone,
        WithOptionalOwnerFields<ProjectMilestone>
      >;
      events: TableDef<Event, WithOptionalOwnerFields<Event>>;
      expense_categories: TableDef<
        ExpenseCategory,
        WithOptionalOwnerFields<ExpenseCategory>
      >;
      loans: TableDef<Loan, WithOptionalOwnerFields<Loan>>;
      loan_transactions: TableDef<
        LoanTransaction,
        WithOptionalOwnerFields<LoanTransaction>
      >;
      bills: TableDef<Bill, WithOptionalOwnerFields<Bill>>;
      income_entries: TableDef<IncomeEntry, WithOptionalOwnerFields<IncomeEntry>>;
      product_sales: TableDef<ProductSale, WithOptionalOwnerFields<ProductSale>>;
      expenses: TableDef<Expense, WithOptionalOwnerFields<Expense>>;
      transfers: TableDef<Transfer, WithOptionalOwnerFields<Transfer>>;
      savings_rules: TableDef<SavingsRule, WithOptionalOwnerFields<SavingsRule>>;
      savings_goals: TableDef<SavingsGoal, WithOptionalOwnerFields<SavingsGoal>>;
      alert_thresholds: TableDef<
        AlertThreshold,
        WithOptionalOwnerFields<AlertThreshold>
      >;
      category_budgets: TableDef<
        CategoryBudget,
        WithOptionalOwnerFields<CategoryBudget>
      >;
      push_subscriptions: TableDef<
        PushSubscriptionRow,
        Omit<PushSubscriptionRow, "id" | "user_id" | "created_at"> & {
          id?: string;
          user_id?: string;
        }
      >;
    };
    Views: {
      account_balances: {
        Row: AccountBalance;
        Relationships: [];
      };
    };
    Functions: {
      mark_bill_paid: {
        Args: {
          p_bill_id: string;
          p_account_id?: string | null;
          p_amount?: number | null;
          p_date?: string;
        };
        Returns: Expense;
      };
    };
  };
};
