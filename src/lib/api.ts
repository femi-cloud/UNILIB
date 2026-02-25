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
  
  // Log les données envoyées
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
      // NE PAS mettre Content-Type pour FormData
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


import { AppConfig } from '../config/appConfig';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || AppConfig.API_BASE_URL || 'http://127.0.0.1:8000/api';

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
  // Ensure a username exists (backend expects `username` field)
const payload = { 
    ...data, 
    username: data.username || data.email.split('@')[0],
    promotion: data.promotion || '',  // Valeur par défaut vide
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
    // SimpleJWT expects `username` + `password` by default. Use email as username.
    body: JSON.stringify({email, password }),
  });
  
  const data = await handleResponse(response);
  
  // Stocker les tokens
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

// RESOURCES

// Mapping frontend → backend pour les filtres
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
    // Extraire juste le numéro (S1 → 1)
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
  
  // Convertir les valeurs du FormData pour matcher le backend
  const titre = formData.get('titre');
  const matiere = formData.get('matiere');
  const type = formData.get('type');
  const filiere = formData.get('filiere');
  const promotion = formData.get('promotion');
  const semestre = formData.get('semestre');
  const fichier = formData.get('fichier');
  const description = formData.get('description') || '';
  
  // Créer un nouveau FormData avec les bons noms de champs
  const backendFormData = new FormData();
  backendFormData.append('titre', titre as string);
  backendFormData.append('matiere', matiere as string);
  backendFormData.append('type_ressource', mapTypeToBackend(type as string));
  backendFormData.append('filiere', mapFiliereToBackend(filiere as string));
  backendFormData.append('promotion', mapPromotionToBackend(promotion as string));
  backendFormData.append('semestre', (semestre as string).replace('S', '')); // S1 → 1
  backendFormData.append('fichier', fichier as File);
  backendFormData.append('description', description as string);
  
  const response = await fetch(`${API_URL}/resources/`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      // NE PAS mettre Content-Type pour FormData
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

// REFRESH TOKEN
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