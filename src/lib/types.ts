
import type { Seller, AreaOption, StatusOption, CompanyOption, ProposalStatusOption, ContactSourceOption, FollowUpDaysOptionValue } from './constants';
import type { ALL_SELLERS_OPTION } from './constants'; // Import específico


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

export interface User {
  username: string;
}

export type AuthenticatedState = {
  isAuthenticated: true;
  user: User;
}
export type UnauthenticatedState = {
  isAuthenticated: false;
  user: null;
}
export type AuthState = AuthenticatedState | UnauthenticatedState;

export type AuthContextType = AuthState & {
  login: (username: string, token?: string) => void;
  logout: () => void;
  loading: boolean;
};

export type SalesFilters = {
  searchTerm?: string;
  selectedYear?: number | 'all';
};

export type SalesContextType = {
  sales: Sale[];
  filteredSales: Sale[]; // Filtrado por selectedSeller, searchTerm, selectedYear (para dashboard)
  selectedSeller: Seller | typeof ALL_SELLERS_OPTION;
  setSelectedSeller: (seller: Seller | typeof ALL_SELLERS_OPTION) => void;
  addSale: (saleData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) => Sale;
  updateSale: (id: string, saleData: Partial<Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>>) => Sale | undefined;
  deleteSale: (id: string) => void;
  getSaleById: (id: string) => Sale | undefined;
  setFilters: (filters: Partial<SalesFilters>) => void; // Para filtros gerais, incluindo dashboard
  filters: SalesFilters;
  loading: boolean;
};

export type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: (pathname: string) => boolean;
};

// Tipos para Configurações
export interface AppSettings {
  enableEmailNotifications: boolean; // Para novas vendas
  notificationEmails: string[];      // Para novas vendas
  enableProposalEmailNotifications: boolean; // Para novas propostas
  // proposalNotificationEmails: string[]; // Se quisermos tornar isso configurável no futuro
}

export type SettingsContextType = {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  loadingSettings: boolean;
};

// Tipos para Propostas (Quotes)

// Filtros específicos para o dashboard de propostas
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
  followUpDate?: string | null; // Data ISO para o follow-up, pode ser null ou undefined
  followUpDone?: boolean; // Indica se o follow-up foi realizado
  sendProposalNotification?: boolean; // Indica se a notificação deve ser enviada
  createdAt: number; // timestamp
  updatedAt?: number; // timestamp
}

export type QuotesContextType = {
  quotes: Quote[]; // Todas as propostas
  selectedSeller: Seller | typeof ALL_SELLERS_OPTION; // Vem do SalesContext, mas é útil ter aqui
  
  // Para a página Gerenciar Propostas (filtra por searchTerm e selectedSeller)
  managementFilteredQuotes: Quote[]; 
  setManagementSearchTerm: (term: string) => void;
  managementSearchTerm: string;

  // Para o Dashboard (filtra por selectedSeller e selectedYear)
  dashboardFilteredQuotes: Quote[]; 
  setDashboardFilters: (filters: Partial<QuoteDashboardFilters>) => void;
  dashboardFilters: QuoteDashboardFilters;
  
  addQuote: (quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'seller' | 'followUpDate' | 'followUpDone'> & { followUpDaysOffset?: FollowUpDaysOptionValue, sendProposalNotification?: boolean }) => Quote;
  updateQuote: (id: string, quoteData: Partial<Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'seller' | 'followUpDate'>> & { followUpDaysOffset?: FollowUpDaysOptionValue, sendProposalNotification?: boolean, followUpDone?: boolean }) => Quote | undefined;
  deleteQuote: (id: string) => void;
  getQuoteById: (id: string) => Quote | undefined;
  toggleFollowUpDone: (quoteId: string) => void; 
  loadingQuotes: boolean;
};

