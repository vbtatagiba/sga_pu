// Configuração da API
const API_BASE_URL = 'http://127.0.0.1:8000';

// Endpoints da API
export const API_ENDPOINTS = {
  // Endpoints de atendimentos
  ATENDIMENTOS: `${API_BASE_URL}/api/atendimentos`, // Base para GET por ID, PUT, DELETE e actions de detalhe
  PAINEL_CHAMADAS: `${API_BASE_URL}/api/atendimentos/painel_chamadas/`,
  CHAMAR_PROXIMO: `${API_BASE_URL}/api/atendimentos/chamar_proximo/`,
  GERAR_SENHA: `${API_BASE_URL}/api/atendimentos/gerar_senha/`,
  ATENDIMENTOS_CHAMADOS_ATIVOS: `${API_BASE_URL}/api/atendimentos/chamados_ativos/`,
  ULTIMAS_CHAMADAS: `${API_BASE_URL}/api/atendimentos/ultimas_chamadas/`,

  // Endpoints de serviços
  SERVICOS: `${API_BASE_URL}/api/servicos/`,
};

export default API_ENDPOINTS; 