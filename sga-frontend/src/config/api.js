// Configuração da API
const API_BASE_URL = 'http://10.1.218.112:8000';

// Endpoints da API
export const API_ENDPOINTS = {
  // Endpoints de atendimentos
  PAINEL_CHAMADAS: `${API_BASE_URL}/api/atendimentos/painel_chamadas/`,
  CHAMAR_PROXIMO: `${API_BASE_URL}/api/atendimentos/chamar_proximo/`,
  GERAR_SENHA: `${API_BASE_URL}/api/atendimentos/gerar_senha/`,
  
  // Endpoints de serviços
  SERVICOS: `${API_BASE_URL}/api/servicos/`,
};

export default API_ENDPOINTS; 