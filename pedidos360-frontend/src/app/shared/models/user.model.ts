export interface UserData {
  name: string;
  email: string;
  roles: string[];
  initials: string;
  oid?: string;  // Object ID from Azure AD
  tid?: string;  // Tenant ID
}
