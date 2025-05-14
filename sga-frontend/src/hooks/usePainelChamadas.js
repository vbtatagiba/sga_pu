// hooks/usePainelChamadas.js
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_KEYS } from '../config/api-keys';
import API_ENDPOINTS from '../config/api';

const validateMesaData = (data) => {
  if (!data) return null;
  return {
    id: data.id,
    senha: data.senha || null,
    servico_nome: data.servico_nome || 'Serviço não especificado'
  };
};

export const usePainelChamadas = () => {
  const [dadosPainel, setDadosPainel] = useState({
    mesa1: null,
    mesa2: null,
    mesa3: null,
    historico: []
  });
  const [lendo, setLendo] = useState(false);
  const [autoplayPermitido, setAutoplayPermitido] = useState(false);
  const [senhasParaFalar, setSenhasParaFalar] = useState([]);
  const [horaAtual, setHoraAtual] = useState(new Date());

  const falandoRef = useRef(false);
  const senhasParaFalarRef = useRef([]);
  const audioPlayerRef = useRef(null);

  const API_KEY = API_KEYS.GOOGLE_CLOUD_API_KEY;

  const falarSenha = async (senha, mesa, servico) => {
    if (!senha) return;
    const texto = `Senha ${senha}, Mesa ${mesa}, Serviço ${servico}`;

    try {
      const response = await axios.post(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`,
        {
          input: { text: texto },
          voice: { languageCode: 'pt-BR', name: 'pt-BR-Wavenet-B' },
          audioConfig: { audioEncoding: 'MP3' }
        }
      );

      const audio = new Audio(`data:audio/mp3;base64,${response.data.audioContent}`);
      audio.muted = !autoplayPermitido;

      await audio.play();
      audio.muted = false;

      return new Promise(resolve => {
        audio.onended = resolve;
        audio.onerror = resolve;
      });
    } catch (error) {
      console.error("Erro na síntese de fala:", error);
      return Promise.resolve();
    }
  };

  const processarFila = async () => {
    if (senhasParaFalarRef.current.length === 0 || falandoRef.current) return;

    falandoRef.current = true;
    setLendo(true);

    while (senhasParaFalarRef.current.length > 0) {
      const proximaSenha = senhasParaFalarRef.current[0];

      await new Promise(resolve => {
        falarSenha(proximaSenha.senha, proximaSenha.mesa, proximaSenha.servico).finally(() => {
          senhasParaFalarRef.current = senhasParaFalarRef.current.slice(1);
          setSenhasParaFalar(senhasParaFalarRef.current);
          resolve();
        });
      });

      await axios.put(`${API_ENDPOINTS.ATENDIMENTO}/${proximaSenha.id}/iniciar-atendimento/`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    falandoRef.current = false;
    setLendo(false);
  };

  const verificarNovasSenhas = (novosDados) => {
    const novasSenhasParaFalar = [];

    ['mesa1', 'mesa2', 'mesa3'].forEach(mesa => {
      const dadosMesa = novosDados[mesa];
      if (dadosMesa && (!dadosPainel[mesa] || dadosMesa.id !== dadosPainel[mesa].id)) {
        novasSenhasParaFalar.push({
          id: dadosMesa.id,
          senha: dadosMesa.senha,
          mesa: mesa.replace('mesa', ''),
          servico: dadosMesa.servico_nome || 'Serviço Geral'
        });
      }
    });

    if (novasSenhasParaFalar.length > 0) {
      const novaFila = [...senhasParaFalarRef.current, ...novasSenhasParaFalar];
      setSenhasParaFalar(novaFila);
      senhasParaFalarRef.current = novaFila;

      if (!falandoRef.current) {
        processarFila();
      }
    }
  };

  const fetchDadosPainel = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.ATENDIMENTOS_CHAMADOS_ATIVOS);

      if (!response?.data || typeof response.data !== 'object') return;

      const dadosBrutos = response.data;
      const dadosValidados = {
        mesa1: validateMesaData(dadosBrutos.mesa1),
        mesa2: validateMesaData(dadosBrutos.mesa2),
        mesa3: validateMesaData(dadosBrutos.mesa3),
        historico: Array.isArray(dadosBrutos.historico)
          ? dadosBrutos.historico.filter(item =>
              item?.id && item?.senha && item?.mesa && item?.servico_nome)
          : []
      };

      setDadosPainel(dadosValidados);
      verificarNovasSenhas(dadosValidados);
    } catch (error) {
      console.error("Erro ao buscar dados do painel:", error);
    }
  };

  useEffect(() => {
    const verificarAutoplay = async () => {
      try {
        const audio = new Audio();
        audio.muted = true;
        await audio.play();
        audio.pause();
        setAutoplayPermitido(true);
      } catch {
        console.log("Autoplay bloqueado");
      }
    };

    const fetchInterval = setInterval(fetchDadosPainel, 3000);
    const relogioInterval = setInterval(() => setHoraAtual(new Date()), 1000);

    verificarAutoplay();
    fetchDadosPainel();

    return () => {
      clearInterval(fetchInterval);
      clearInterval(relogioInterval);
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
    };
  }, []);

  return {
    dadosPainel,
    senhasParaFalar,
    horaAtual,
    autoplayPermitido,
    setAutoplayPermitido,
  };
};
