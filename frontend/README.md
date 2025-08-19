# Frontend - Painel de Vendas

Este é o frontend do sistema de Painel de Vendas, desenvolvido com React, TypeScript, Vite, Tailwind CSS e Heroicons.

## 🚀 Tecnologias Utilizadas

- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS 3.4** (versão LTS) para estilização
- **Heroicons** para ícones
- **Inter** como fonte principal

## 🎨 Paleta de Cores

O projeto utiliza uma paleta de cores personalizada e consistente:

### Cores Principais
- **Primary (Azul)**: `primary-50` a `primary-950` - Para ações principais, botões e destaque
- **Secondary (Cinza)**: `secondary-50` a `secondary-950` - Para textos, bordas e fundos
- **Accent (Rosa)**: `accent-50` a `accent-950` - Para elementos de destaque e call-to-actions

### Cores Semânticas
- **Success (Verde)**: `success-50` a `success-950` - Para sucessos e confirmações
- **Warning (Amarelo)**: `warning-50` a `warning-950` - Para avisos e alertas
- **Danger (Vermelho)**: `danger-50` a `danger-950` - Para erros e ações perigosas

## 🧩 Componentes e Classes Utilitárias

### 🎨 Botões
- `.btn-primary` - Botão primário com efeito glow
- `.btn-secondary` - Botão secundário com sombra tech
- `.btn-ghost` - Botão transparente para navegação
- `.btn-accent` - Botão de destaque laranja

### 📱 Cards e Containers
- `.card` - Container padrão com sombra suave
- `.card-tech` - Container tecnológico com borda azul
- `.glass-card` - Card com efeito glassmorphism

### 🔍 Campos de Input
- `.input-field` - Campo com sombra interna e foco tech
- `.input-field:focus` - Estado de foco com sombra tech

### 🧭 Navegação
- `.nav-link` - Link de navegação padrão
- `.nav-link-active` - Link de navegação ativo

### 🏷️ Badges
- `.badge-primary`, `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-info`

### ✨ Animações
- `.animate-fade-in` - Fade in suave
- `.animate-slide-up` - Slide up para menus
- `.animate-pulse-glow` - Pulsar com glow

### 🌈 Gradientes
- `.gradient-primary` - Gradiente azul
- `.gradient-accent` - Gradiente laranja
- `.gradient-tech` - Gradiente tecnológico multicolor

## 🧭 Sistema de Navegação

### 📱 Header Responsivo
- **Logo**: Carrinho de compras com gradiente + nome "Painel de Vendas"
- **Navegação Desktop**: Links Dashboard, Vendas, Clientes, Vendedores
- **Navegação Mobile**: Menu hambúrguer com animações
- **Perfil**: Informações do usuário logado + botão de logout
- **Fixado**: Header sempre visível no topo
- **Responsivo**: Se adapta a todos os tamanhos de tela

### 🔐 Sistema de Autenticação
- **Tela de Login**: Design moderno com validação
- **Contexto de Auth**: Gerenciamento de estado do usuário
- **Rotas Protegidas**: Acesso restrito apenas para usuários autenticados
- **Login Demo**: Acesso rápido para demonstração
- **Persistência**: Dados do usuário salvos no localStorage
- **Integração com API**: Conexão real com backend NestJS
- **Validação de Token**: Verificação automática de expiração
- **Tratamento de Erros**: Mensagens específicas da API

### 🛣️ Rotas Disponíveis
- `/login` - Tela de login (pública)
- `/` - Dashboard (protegida)
- `/vendas` - Página de Vendas (protegida)
- `/clientes` - Página de Clientes (protegida)
- `/vendedores` - Página de Vendedores (protegida)

## 📱 Funcionalidades da Tela de Teste

A tela de teste demonstra:

1. **Header** com logo, título e ações do usuário
2. **Navegação** com abas interativas
3. **Barra de busca** com ícone
4. **Cards de estatísticas** com métricas e ícones
5. **Lista de vendas recentes** com status e ícones
6. **Demonstração da paleta de cores** completa
7. **Botões de exemplo** com todas as variações

## 🚀 Como Executar

### Instalação das Dependências
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
```

### Preview do Build
```bash
npm run preview
```

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.tsx        # Header responsivo com navegação
│   │   ├── Layout.tsx        # Layout principal com Header
│   │   └── ProtectedRoute.tsx # Componente de rota protegida
│   ├── config/
│   │   └── api.config.ts     # Configurações da API
│   ├── contexts/
│   │   └── AuthContext.tsx   # Contexto de autenticação
│   ├── pages/
│   │   ├── Login.tsx         # Tela de login
│   │   ├── Dashboard.tsx     # Página Dashboard
│   │   ├── Vendas.tsx        # Página Vendas
│   │   ├── Clientes.tsx      # Página Clientes
│   │   └── Vendedores.tsx    # Página Vendedores
│   ├── services/
│   │   ├── api.ts            # Cliente HTTP base
│   │   └── auth.service.ts   # Serviço de autenticação
│   ├── types/
│   │   ├── index.ts          # Tipos TypeScript gerais
│   │   └── api.types.ts      # Tipos da API
│   ├── App.tsx               # App principal com roteamento
│   ├── main.tsx              # Ponto de entrada da aplicação
│   └── index.css             # Estilos globais e Tailwind
├── tailwind.config.js        # Configuração do Tailwind CSS
├── postcss.config.js         # Configuração do PostCSS
├── package.json              # Dependências e scripts
└── README.md                # Este arquivo
```

## 🎯 Próximos Passos

- [x] ✅ Configurar Tailwind CSS com paleta personalizada
- [x] ✅ Criar Header responsivo
- [x] ✅ Implementar navegação com React Router
- [x] ✅ Criar páginas básicas
- [x] ✅ Implementar sistema de autenticação
- [x] ✅ Criar tela de login moderna
- [ ] Conectar com a API backend
- [ ] Adicionar testes unitários
- [ ] Implementar tema escuro/claro
- [ ] Adicionar gráficos e dashboards
- [ ] Implementar CRUD completo

## 🔧 Configurações

### Tailwind CSS
- Configurado com paleta de cores personalizada
- Fonte Inter como padrão
- Sombras customizadas
- Componentes utilitários

### PostCSS
- Autoprefixer para compatibilidade
- Otimizações de CSS

### Vite
- Configuração otimizada para React + TypeScript
- Hot Module Replacement (HMR)
- Build otimizado para produção

### React Router
- Navegação SPA com rotas aninhadas
- Layout compartilhado entre páginas
- Rotas protegidas com autenticação
- Navegação programática

### 🔌 Integração com API
- **Serviços HTTP**: Cliente fetch com interceptors
- **Autenticação JWT**: Bearer token em headers
- **Configuração Centralizada**: URLs e endpoints configuráveis
- **Tratamento de Erros**: Mapeamento de erros da API
- **Validação de Token**: Verificação automática de validade
- **Tipos TypeScript**: Interfaces baseadas na API real

## 📝 Licença

Este projeto faz parte do sistema Painel de Vendas.
