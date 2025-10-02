FROM node:20-slim

WORKDIR /app

# Copia só os manifests primeiro (garante cache correto)
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do projeto
COPY . .

# Define variável de ambiente para a API
ENV VITE_API_URL=http://localhost:8000/api/v1

# Expõe porta usada pelo Vite
EXPOSE 5173

# Comando padrão: inicia servidor Vite
CMD ["npm", "run", "dev", "--", "--host"]
