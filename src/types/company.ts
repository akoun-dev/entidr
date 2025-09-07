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
  // Identité visuelle
  logo?: string;
  // Informations légales
  legal_form?: string;
  registration_number?: string;
  vat_number?: string;
  share_capital?: string;
  legal_representative?: string;
  legal_info?: string;
};

// Explicit module export
export default {};
