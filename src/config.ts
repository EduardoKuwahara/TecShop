// Configuração da API baseada no ambiente
const isDevelopment = process.env.NODE_ENV === 'development' || __DEV__;

// URL base para desenvolvimento (local)
const DEVELOPMENT_API_URL = 'http://10.226.241.139:3001/api';

// URL base para produção (Vercel)
const PRODUCTION_API_URL = 'https://tec-shop-mocha.vercel.app/api';

// Força usar Vercel em produção - descomente a linha abaixo para sempre usar Vercel
// export const API_BASE_URL = PRODUCTION_API_URL;

// Usar variável de ambiente se disponível, senão usar baseado no ambiente
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || PRODUCTION_API_URL;
// Descomente a linha abaixo se quiser usar ambiente local:
// export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (isDevelopment ? DEVELOPMENT_API_URL : PRODUCTION_API_URL);

console.log('API URL configurada:', API_BASE_URL);
console.log('Ambiente de desenvolvimento:', isDevelopment);