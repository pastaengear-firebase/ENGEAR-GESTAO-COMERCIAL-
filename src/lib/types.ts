
import type { Seller, AreaOption, StatusOption, CompanyOption, ProposalStatusOption, ContactSourceOption, FollowUpDaysOptionValue } from './constants';
import type { ALL_SELLERS_OPTION } from './constants'; // Import específico
import type { User as FirebaseUser } from 'firebase/auth';


export interface Sale {
  id: string;
  seller: Seller;
  date: string; // ISO string
  company: CompanyOption;
  project: string;
  os: string;
  area: AreaOption;
  clientService: string;
  salesValue: number;
  status: StatusOption;
  payment: number;
  createdAt: number; // timestamp
  updatedAt?: number; // timestamp
}

export type User = FirebaseUser;

export type AuthContextType = {
  user: User | null;
  loading: boolean;
};

export type SalesFilters = {
  searchTerm?: string;
  selectedYear?: number | 'all';
};

export type SalesContextType = {
  sales: Sale[];
  filteredSales: Sale[];
  selectedSeller: Seller | typeof ALL_SELLERS_OPTION;
  setSelectedSeller: (seller: Seller | typeof ALL_SELLERS_OPTION) => void;
  addSale: (saleData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Sale>;
  addBulkSales: (newSales: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<void>;
  updateSale: (id: string, saleData: Partial<Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Sale | undefined>;
  deleteSale: (id: string) => Promise<void>;
  getSaleById: (id: string) => Sale | undefined;
  setFilters: (filters: Partial<SalesFilters>) => void;
  filters: SalesFilters;
  loading: boolean;
};

export type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: (pathname: string) => boolean;
};

export interface AppSettings {
  enableEmailNotifications: boolean;
  notificationEmails: string[];
  enableProposalEmailNotifications: boolean;
}

export type SettingsContextType = {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  loadingSettings: boolean;
};

export type QuoteDashboardFilters = Pick<SalesFilters, 'selectedYear'>;


export interface Quote {
  id: string;
  seller: Seller;
  clientName: string;
  proposalDate: string; // ISO string
  validityDate?: string; // ISO string, opcional
  company: CompanyOption;
  area: AreaOption;
  contactSource: ContactSourceOption;
  description: string;
  proposedValue: number;
  status: ProposalStatusOption;
  notes?: string; // Opcional
  followUpDate?: string | null;
  followUpDone?: boolean;
  sendProposalNotification?: boolean;
  createdAt: number; // timestamp
  updatedAt?: number; // timestamp
}

export type QuotesContextType = {
  quotes: Quote[];
  selectedSeller: Seller | typeof ALL_SELLERS_OPTION;
  
  managementFilteredQuotes: Quote[]; 
  setManagementSearchTerm: (term: string) => void;
  managementSearchTerm: string;

  dashboardFilteredQuotes: Quote[]; 
  setDashboardFilters: (filters: Partial<QuoteDashboardFilters>) => void;
  dashboardFilters: QuoteDashboardFilters;
  
  addQuote: (quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'seller' | 'followUpDate' | 'followUpDone'> & { followUpDaysOffset?: FollowUpDaysOptionValue, sendProposalNotification?: boolean }) => Promise<Quote>;
  updateQuote: (id: string, quoteData: Partial<Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'seller' | 'followUpDate'>> & { followUpDaysOffset?: FollowUpDaysOptionValue, sendProposalNotification?: boolean, followUpDone?: boolean }) => Promise<Quote | undefined>;
  deleteQuote: (id: string) => Promise<void>;
  getQuoteById: (id: string) => Quote | undefined;
  toggleFollowUpDone: (quoteId: string) => Promise<void>; 
  loadingQuotes: boolean;
};
