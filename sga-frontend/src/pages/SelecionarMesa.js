import React, { useState } from "react";
import { Button, Typography, Paper, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const SelecionarMesa = () => {
  const [mesaSelecionada, setMesaSelecionada] = useState(localStorage.getItem("mesa") || "");
  const navigate = useNavigate();

  const selecionarMesa = (mesa) => {
    localStorage.setItem("mesa", mesa); // Armazenando a mesa no localStorage
    setMesaSelecionada(mesa);
    navigate("/chamador"); // Redireciona para o chamador após a seleção
  };

  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        padding: 2
      }}
    >
      <Paper sx={{ padding: 3, textAlign: 'center', width: '100%', maxWidth: 400 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
          Selecione sua Mesa
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant={mesaSelecionada === "1" ? "contained" : "outlined"}
            color={mesaSelecionada === "1" ? "primary" : "default"}
            onClick={() => selecionarMesa("1")}
            sx={{ fontSize: 18, width: 150, padding: 2 }}
          >
            Mesa 1
          </Button>
          <Button
            variant={mesaSelecionada === "2" ? "contained" : "outlined"}
            color={mesaSelecionada === "2" ? "primary" : "default"}
            onClick={() => selecionarMesa("2")}
            sx={{ fontSize: 18, width: 150, padding: 2 }}
          >
            Mesa 2
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SelecionarMesa;
