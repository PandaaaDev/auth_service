export interface Role {
  id: string;
  name: string;
  label: string;
}
export interface ACL {
  id: string;
  order: string;
  role: string;
  action: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';
}

export interface Module {
  id: string;
  label: string;
}
