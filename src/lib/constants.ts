
export const DEFAULT_LOGIN_CREDENTIALS = {
  username: 'ENGEAR',
  password: '1313', // Mantido para referência, não usado para login ativo
};

export const EMAIL_RECOVERY_ADDRESS = 'pastaengear@gmail.com'; // Mantido para referência

export const SELLERS = ['SERGIO', 'RODRIGO'] as const;
export type Seller = (typeof SELLERS)[number];
export const ALL_SELLERS_OPTION = 'EQUIPE COMERCIAL';

export const COMPANY_OPTIONS = ['ENGEAR', 'CLIMAZONE'] as const;
export type CompanyOption = (typeof COMPANY_OPTIONS)[number];

export const AREA_OPTIONS = [
  'INST. AC',
  'MANUT. AC',
  'PRÉ',
  'CI',
  'GÁS',
  'SAS',
  'AQG',
  'EXAUST',
  'LOCAÇÃO',
] as const;
export type AreaOption = (typeof AREA_OPTIONS)[number];

export const STATUS_OPTIONS = ["Á INICAR", "EM ANDAMENTO", "FINALIZADO", "CANCELADO"] as const;
export type StatusOption = (typeof STATUS_OPTIONS)[number];

export const PROPOSAL_STATUS_OPTIONS = ["Pendente", "Enviada", "Em Negociação", "Aceita", "Recusada", "Cancelada"] as const;
export type ProposalStatusOption = (typeof PROPOSAL_STATUS_OPTIONS)[number];

export const CONTACT_SOURCE_OPTIONS = ["E-mail", "Telefone", "Presencial", "Indicação", "Website", "Outro"] as const;
export type ContactSourceOption = (typeof CONTACT_SOURCE_OPTIONS)[number];

export const FOLLOW_UP_DAYS_OPTIONS = [
  { label: 'Não agendar', value: 0 },
  { label: '5 dias', value: 5 },
  { label: '10 dias', value: 10 },
  { label: '15 dias', value: 15 },
] as const;
export type FollowUpDaysOptionValue = (typeof FOLLOW_UP_DAYS_OPTIONS)[number]['value'];

export const PROPOSAL_NOTIFICATION_EMAILS = [
  'carlosroberto@engearpb.com.br',
  'gitana@engearpb.com.br',
  'sergio@engearpb.com.br',
  'rodrigobarros@engearpb.com.br',
  'vendas@engearpb.com.br',
  'pastaengear@gmail.com',
] as const;


export const LOCAL_STORAGE_AUTH_KEY = 'salesAppAuthState'; // No longer actively used for auth logic, but kept for context structure
export const LOCAL_STORAGE_SALES_KEY = 'salesAppData';
export const LOCAL_STORAGE_SETTINGS_KEY = 'salesAppSettings';
export const LOCAL_STORAGE_QUOTES_KEY = 'salesAppQuotesData';
export const LOCAL_STORAGE_SELECTED_SELLER_KEY = 'salesAppSelectedSeller';
export const LOCAL_STORAGE_PLANNER_KEY = 'salesAppPlannerData'; // New Key for Planner

// Constantes para o sistema de acesso com senha única
export const APP_ACCESS_GRANTED_KEY = 'app_engear_access_granted';
export const DEFAULT_ACCESS_PASSWORD = '1313';

// Constantes para o Planner
export const PLANNER_STATUS_OPTIONS = ["Pendente", "Em Análise", "Em Desenvolvimento", "Aguardando Cliente", "Concluído", "Cancelado"] as const;
export type PlannerStatusOption = (typeof PLANNER_STATUS_OPTIONS)[number];

export const PLANNER_PRIORITY_OPTIONS = ["Alta", "Média", "Baixa"] as const;
export type PlannerPriorityOption = (typeof PLANNER_PRIORITY_OPTIONS)[number];


// Constantes que não são mais usadas (relacionadas ao sistema de login anterior)
// export const COOKIE_AUTH_FLAG = 'salesAppAuthFlag';
// export const COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 dias
// export const EXPIRE_COOKIE_STRING = 'Thu, 01 Jan 1970 00:00:00 GMT';
// export const SESSION_STORAGE_LOGIN_FLAG = 'salesAppJustLoggedIn';
