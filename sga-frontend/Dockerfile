# Estágio de build
FROM node:16-alpine as build

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
RUN npm install

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Estágio de produção
FROM nginx:alpine

# Copiar configuração do nginx (ajustado para porta 3000)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build do estágio anterior
COPY --from=build /app/build /usr/share/nginx/html

# Expor porta 3000
EXPOSE 3000

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
