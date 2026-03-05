import { AppConfig } from '../config/appConfig';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || AppConfig.API_BASE_URL || 'http://127.0.0.1:8000/api';

export interface UserType {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  username: string;
  filiere: string;
  promotion?: string;
  semestre?: string;
  role: string;
}

// HELPERS
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Une erreur est survenue' }));
    throw new Error(error.detail || error.message || 'Erreur serveur');
  }
  return response.json();
};

// AUTHENTICATION

export const register = async (data: {
  username: string;
  email: string;
  password: string;
  nom: string;
  prenom: string;
  filiere: string;
  promotion?: string;
  semestre?: string;
  role?: string;
  verification_code?: string;
}) => {
  const payload = { 
    ...data, 
    username: data.username || data.email.split('@')[0],
    promotion: data.promotion || '',
    semestre: data.semestre || ''
  };

  const response = await fetch(`${API_URL}/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({email, password }),
  });
  
  const data = await handleResponse(response);
  
  if (data.access) localStorage.setItem('access_token', data.access);
  if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
  
  return data;
};

export const getCurrentUser = async () => {
  const response = await fetch(`${API_URL}/auth/me/`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('unilib_session');
};

export const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error('No refresh token');
  
  const response = await fetch(`${API_URL}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  
  const data = await handleResponse(response);
  localStorage.setItem('access_token', data.access);
  return data;
};

// DASHBOARD

export const getDashboardStats = async () => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${API_URL}/auth/dashboard-stats/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
};

// RESOURCES

const mapFiliereToBackend = (filiere: string): string => {
  const mapping: Record<string, string> = {
    'Toutes': 'toutes',
    'Genie Logiciel': 'genie_logiciel',
    'Intelligence Artificielle': 'intelligence_artificielle',
    'Securite Informatique': 'securite_informatique',
    'SEiot': 'seiot',
    'Internet Multimedia': 'internet_multimedia',
  };
  return mapping[filiere] || filiere.toLowerCase().replace(/ /g, '_');
};

const mapPromotionToBackend = (promotion: string): string => {
  const mapping: Record<string, string> = {
    'L1': 'l1',
    'L2': 'l2',
    'L3': 'l3',
    'M1': 'm1',
    'M2': 'm2',
  };
  return mapping[promotion] || promotion.toLowerCase();
};

const mapTypeToBackend = (type: string): string => {
  const mapping: Record<string, string> = {
    'Cours': 'cours',
    'TD': 'td',
    'TP': 'tp',
    'Examen': 'examen',
    'Rattrapage': 'rattrapage',
    'Correction': 'correction',
  };
  return mapping[type] || type.toLowerCase();
};

export const getResources = async (filters?: {
  filiere?: string;
  promotion?: string;
  semestre?: string;
  type?: string;
  search?: string;
}) => {
  const params = new URLSearchParams();
  
  if (filters?.filiere && filters.filiere !== "Tous") {
    params.append('filiere', mapFiliereToBackend(filters.filiere));
  }
  if (filters?.promotion && filters.promotion !== "Tous") {
    params.append('promotion', mapPromotionToBackend(filters.promotion));
  }
  if (filters?.semestre && filters.semestre !== "Tous") {
    params.append('semestre', filters.semestre.replace('S', ''));
  }
  if (filters?.type && filters.type !== "Tous") {
    params.append('type_ressource', mapTypeToBackend(filters.type));
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }
  
  const url = `${API_URL}/resources/?${params.toString()}`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const uploadResource = async (formData: FormData) => {
  const token = localStorage.getItem('access_token');
  
  const titre = formData.get('titre');
  const matiere = formData.get('matiere');
  const type = formData.get('type');
  const filiere = formData.get('filiere');
  const promotion = formData.get('promotion');
  const semestre = formData.get('semestre');
  const fichier = formData.get('fichier');
  const description = formData.get('description') || '';
  
  const backendFormData = new FormData();
  backendFormData.append('titre', titre as string);
  backendFormData.append('matiere', matiere as string);
  backendFormData.append('type_ressource', mapTypeToBackend(type as string));
  backendFormData.append('filiere', mapFiliereToBackend(filiere as string));
  backendFormData.append('promotion', mapPromotionToBackend(promotion as string));
  backendFormData.append('semestre', (semestre as string).replace('S', ''));
  backendFormData.append('fichier', fichier as File);
  backendFormData.append('description', description as string);
  
  const response = await fetch(`${API_URL}/resources/`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: backendFormData,
  });
  
  return handleResponse(response);
};

export const deleteResource = async (id: string | number) => {
  const response = await fetch(`${API_URL}/resources/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Échec de la suppression');
  }
  
  return { success: true };
};

// COURS PRATIQUES

export const getCoursPratiques = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_URL}/cours-pratiques/`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });
  return handleResponse(response);
};

export const uploadCoursPratique = async (formData: FormData) => {
  const token = localStorage.getItem('access_token');
  
  console.log('📤 Upload cours pratique...');
  
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`${key}: ${value.name} (${value.size} bytes)`);
    } else {
      console.log(`${key}: ${value}`);
    }
  }
  
  const response = await fetch(`${API_URL}/cours-pratiques/`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Erreur serveur' }));
    console.error('❌ Erreur upload:', error);
    throw new Error(error.detail || 'Upload échoué');
  }
  
  const data = await response.json();
  console.log('✅ Upload réussi:', data);
  return data;
};

export const deleteCoursPratique = async (id: string) => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${API_URL}/cours-pratiques/${id}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });
  
  if (!response.ok && response.status !== 204) {
    throw new Error('Échec de la suppression');
  }
  
  return { success: true };
};

// EMPLOI DU TEMPS

export const getEmploiDuTemps = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_URL}/emploi-temps/`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });
  return handleResponse(response);
};

export const getEmploiDuTempsActif = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_URL}/emploi-temps/actif/`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch emploi du temps');
  }
  return response.json();
};

export const uploadEmploiDuTemps = async (formData: FormData) => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${API_URL}/emploi-temps/`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: formData,
  });
  
  return handleResponse(response);
};

export const deleteEmploiDuTemps = async (id: string) => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${API_URL}/emploi-temps/${id}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });
  
  if (!response.ok) {
    throw new Error('Échec de la suppression');
  }
  
  return { success: true };
};

// PROFILE

export const updateProfile = async (data: Partial<UserType>) => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${API_URL}/auth/profile/`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  return handleResponse(response);
};

export const changePassword = async (oldPassword: string, newPassword: string) => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${API_URL}/auth/change-password/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
    }),
  });
  
  return handleResponse(response);
};

export const deleteAccount = async () => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${API_URL}/auth/delete-account/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok && response.status !== 204) {
    throw new Error('Échec de la suppression du compte');
  }
  
  return { success: true };
};

// NOTIFICATIONS
export const getNotifications = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_URL}/auth/notifications/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const markNotificationRead = async (id: number) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_URL}/auth/notifications/${id}/read/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// src/lib/api.ts

export const sendAIMessage = async (
  message: string, 
  includeResources: boolean = true,
  conversationHistory: Array<{role: string, content: string}> = []  // ✅ Ajout
): Promise<{ response: string; context_used: boolean }> => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${API_URL}/ai/chat/`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      message, 
      include_resources: includeResources,
      history: conversationHistory  // ✅ Ajout
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erreur serveur' }));
    throw new Error(error.error || error.detail || 'Erreur de l\'assistant IA');
  }
  
  return response.json();
};