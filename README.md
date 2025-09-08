# Sistema de Painel de Vendas

Este é um projeto full-stack para gestão completa de vendas, clientes e comissões. O sistema permite que vendedores gerenciem vendas, clientes e produtos de forma eficiente.

## 🎥 Demonstração

> Interface moderna e responsiva para gestão de vendas empresariais

![Dashboard da aplicação](./demo.png)

## 🚀 Tecnologias Utilizadas

### Backend

- NestJS com TypeScript
- SQLite (banco de dados)
- Prisma (ORM)
- JWT para autenticação
- Class Validator para validação
- Swagger para documentação

### Frontend

- React com TypeScript
- Vite
- Tailwind CSS para estilização
- Context API para gerenciamento de estado
- React Hook Form para formulários

## 📋 Requisitos

- Node.js (versão 18+)
- npm ou yarn
- Git

## 🏗️ Estrutura do Projeto

```
.
├── sales-api/          # Backend NestJS + TypeScript
└── frontend/           # Frontend React + TypeScript
```

## 🚀 Rodando o Projeto

### 1. Clone o repositório

### 2. Configure o Backend:

```bash
cd sales-api
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run start:dev
```

### 3. Configure o Frontend:

Em um novo terminal:

```bash
cd frontend
npm install
npm run dev
```

## 🔗 Endpoints da API

### Autenticação

- `POST /auth/signin` - Login de vendedor
- `GET /auth/me` - Dados do usuário autenticado

### Clientes

- `GET /clients` - Listar clientes
- `POST /clients` - Criar cliente
- `PUT /clients/:id` - Atualizar cliente
- `DELETE /clients/:id` - Remover cliente

### Produtos

- `GET /products` - Listar produtos
- `POST /products` - Criar produto
- `PUT /products/:id` - Atualizar produto

### Vendas

- `POST /sales` - Criar venda
- `PATCH /sales/:id/items` - Adicionar itens
- `PATCH /sales/:id/pay` - Finalizar pagamento
- `GET /sales` - Listar vendas

## 🖥️ Acessando a Aplicação

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Documentação API: http://localhost:3000/docs

## 🛠️ Comandos Úteis

### Desenvolvimento

- Backend: `cd sales-api && npm run start:dev`
- Frontend: `cd frontend && npm run dev`
- Prisma Studio: `cd sales-api && npm run prisma:studio`

### Testes

- Backend: `cd sales-api && npm run test`
- E2E: `cd sales-api && npm run test:e2e`

## 🔍 Funcionalidades Implementadas

### Backend

- Autenticação JWT com controle de roles
- CRUD completo de clientes, produtos e vendas
- Sistema de comissões automático
- Validação de dados com Class Validator
- Arquitetura modular NestJS

### Frontend

- Sistema de autenticação completo
- Dashboard com métricas de vendas
- Gestão de clientes e produtos
- Processo de vendas em etapas
- Design responsivo com Tailwind CSS

## 🚨 Solução de Problemas

1. Se o banco não estiver funcionando:

   - Execute: `cd sales-api && npx prisma generate && npx prisma db push`

2. Se o frontend não conectar ao backend:

   - Verifique se o backend está rodando na porta 3000
   - Confirme se a URL da API está correta em `frontend/src/config/api.config.ts`

3. Se as dependências não instalarem:

   - Delete `node_modules` e `package-lock.json`
   - Execute `npm install` novamente

## 📝 Notas Adicionais

- O sistema usa SQLite para facilitar o desenvolvimento
- Todas as senhas são criptografadas com bcrypt
- O sistema mantém snapshots de preços para auditoria
- Comissões são calculadas automaticamente baseadas em percentuais configuráveis
