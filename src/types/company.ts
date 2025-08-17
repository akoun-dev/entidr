// Ensure TypeScript treats this as a module
export type Company = {
  name: string;
  trading_name?: string;
  description?: string;
  industry?: string;
  foundation_date?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
};

// Explicit module export
export default {};
