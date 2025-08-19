# Frontend - Painel de Vendas

## 🚀 Tecnologias Utilizadas

- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS 3.4 LTS** para estilização
- **React Router** para navegação
- **Heroicons** para ícones
- **Axios** para requisições HTTP (preparado para instalação)

## 🎨 Paleta de Cores

### Cores Principais
- **Primary**: Azul tecnológico (#3B82F6, #1D4ED8, #1E40AF)
- **Secondary**: Cinza moderno (#6B7280, #374151, #1F2937)
- **Success**: Verde tecnológico (#10B981, #059669, #047857)
- **Warning**: Laranja vibrante (#F59E0B, #D97706, #B45309)
- **Danger**: Vermelho moderno (#EF4444, #DC2626, #B91C1C)
- **Info**: Roxo tecnológico (#8B5CF6, #7C3AED, #6D28D9)

### Gradientes
- **gradient-primary**: `from-primary-500 to-primary-600`
- **gradient-accent**: `from-accent-500 to-accent-600`
- **gradient-tech**: `from-secondary-800 to-primary-600`

## 🧩 Componentes e Classes Utilitárias

### Botões
- `.btn-primary`: Botão principal azul
- `.btn-secondary`: Botão secundário cinza
- `.btn-ghost`: Botão transparente
- `.btn-accent`: Botão de destaque laranja

### Cards
- `.card`: Card padrão com sombra suave
- `.card-tech`: Card com borda tecnológica
- `.glass-card`: Card com efeito glassmorphism

### Inputs
- `.input-field`: Campo de entrada padrão
- Componente `Input` reutilizável com variantes

### Navegação
- `.nav-link`: Link de navegação
- `.nav-link-active`: Link ativo
- Componente `Tabs` com variantes (default, pills, underline)

### Tabelas
- Componente `Table` reutilizável com loading e estados vazios
- Hover com contraste aprimorado (bg-primary-50)

### Paginação
- Componente `Pagination` com navegação e seletor de itens por página

### Badges
- `.badge`: Badge padrão
- `.badge-primary`, `.badge-success`, `.badge-warning`, `.badge-danger`

### Animações
- `.animate-fade-in`: Fade in suave
- `.animate-slide-up`: Slide up com fade
- `.animate-pulse-glow`: Pulsação com brilho

## 🧭 Sistema de Navegação

### Rotas Disponíveis
- `/` - Dashboard (protegida)
- `/login` - Tela de login
- `/vendas` - Lista de vendas (protegida)
- `/vendas/nova` - Nova venda (protegida)
- `/vendas/editar/:id` - Editar venda (protegida)
- `/clientes` - Lista de clientes (protegida)
- `/vendedores` - Lista de vendedores (protegida)

### Componente Layout
- Header fixo com navegação responsiva
- Sidebar colapsível para dispositivos móveis
- Área de conteúdo principal com `<Outlet />`

## 🔐 Sistema de Autenticação

### AuthContext
- Gerenciamento de estado de autenticação
- Login/logout com persistência em localStorage
- Validação de token JWT
- Proteção de rotas

### Serviços de API
- `AuthService`: Autenticação e perfil do usuário
- `SalesService`: Operações CRUD de vendas
- Base de API configurável com interceptors

### Rotas Protegidas
- `ProtectedRoute`: Componente que verifica autenticação
- Redirecionamento automático para login

## 📊 Funcionalidades

### Tela de Vendas
- Lista paginada de vendas com filtros inteligentes
- **Filtros com Debounce**: Nome do cliente com delay de 2 segundos
- **Filtros Instantâneos**: Data e status de pagamento
- **Filtros Complementares**: Todos os filtros funcionam em conjunto
- **Filtro por Nome**: Busca por nome do cliente usando LIKE (contém)
- Tabs agrupados por status de pagamento com contadores fixos (não afetados pelos filtros)
- Tabela responsiva com hover aprimorado e método de pagamento
- Paginação com seletor de itens por página
- Navegação para nova venda e edição
- Botão para limpar todos os filtros
- Indicador visual dos filtros ativos

### Sistema de Filtros Inteligente
- **Debounce de 2 segundos** para filtro de nome do cliente
- **Aplicação instantânea** para filtros de data e status
- **Filtros complementares** que funcionam em conjunto
- **Filtro por nome**: Busca por nome do cliente usando parâmetro 'q' (LIKE)
- **Contadores fixos**: Tabs mostram sempre o total real de cada status
- **Reset automático** da paginação ao aplicar filtros
- **Indicadores visuais** de quais filtros estão ativos

### Componentes Reutilizáveis
- **Input**: Campo de entrada com variantes e validação
- **Tabs**: Navegação por abas com contadores e cores
- **Table**: Tabela com loading, estados vazios e hover
- **Pagination**: Navegação de páginas com informações

### Hooks Personalizados
- **useDebounce**: Hook para implementar delay em filtros de texto

### Tela de Nova Venda
- **Fluxo de Estágios**: Sistema de 4 estágios para criação de vendas
- **Estágio Cliente**: Formulário completo de cadastro de cliente
- **Validação**: Validação em tempo real com formatação automática (CPF, telefone, CEP)
- **Integração**: Criação automática de venda após cadastro do cliente
- **Redirecionamento**: Navegação automática para edição da venda criada

### Componentes de Estágio
- **StageCard**: Componente visual para representar estágios da venda
- **Estados Visuais**: 
  - **Ativo**: Gradiente azul escuro (600-700) com ícone específico da etapa e indicador de progresso
  - **Completo**: Gradiente verde escuro (600-700) com ícone específico da etapa e badge de check
  - **Bloqueado**: Gradiente cinza escuro (600-700) com ícone específico da etapa e badge de cadeado
- **Ícones**: Cada estágio mantém seu ícone representativo (usuário, sacola, cartão, documento) independente do status
- **Layout**: Cards retangulares compactos (h-24) com layout horizontal ícone + texto
- **Indicadores**: Badges flutuantes menores mostrando status (check, progresso, bloqueado)
- **Contraste**: Fundos escuros para melhor legibilidade do texto branco
- **Interatividade**: Hover effects apenas para estágios ativos (sem animação para bloqueados)
- **Responsivo**: Layout adaptável para diferentes tamanhos de tela

### Formulário de Cliente
- **Dados Pessoais**: Nome, CPF, email, telefone
- **Endereço Completo**: CEP, cidade, bairro, rua, número, estado
- **Formatação Automática**: CPF (000.000.000-00), telefone ((00) 00000-0000), CEP (00000-000)
- **Validação**: Campos obrigatórios, formato de email, CPF válido
- **Tratamento de Erros**: Mensagens de erro específicas para cada campo

## 🗄️ Dados de Exemplo

### Seeds de Vendas
- **30 vendas realistas** com diferentes cenários
- **15 vendas PAGAS** (PAID) com produtos variados
- **10 vendas PENDENTES** (PENDING) aguardando confirmação
- **5 vendas CANCELADAS** (CANCELLED) por diversos motivos
- **Produtos realistas**: Monitores, periféricos, móveis, equipamentos
- **Clientes variados**: 20 clientes com dados completos
- **Vendedores**: Admin e Vendedor com comissões de 5%

### Status de Pagamento
- **PAID** → "Pago" (verde)
- **PENDING** → "A receber" (laranja)
- **CANCELED** → "Cancelado" (vermelho)

### Métodos de Pagamento
- **PIX** → "PIX"
- **CARTAO** → "Cartão"
- **DINHEIRO** → "Dinheiro"
- **BOLETO** → "Boleto"

## 🏗️ Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/           # Componentes reutilizáveis
│   │   │   ├── Input.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── index.ts
│   │   ├── Header.tsx    # Header da aplicação
│   │   ├── Layout.tsx    # Layout principal
│   │   └── ProtectedRoute.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   └── useDebounce.ts # Hook para debounce
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Vendas.tsx
│   │   ├── NovaVenda.tsx
│   │   ├── EditarVenda.tsx
│   │   ├── Clientes.tsx
│   │   └── Vendedores.tsx
│   ├── services/
│   │   ├── api.ts        # Cliente HTTP base
│   │   ├── api.axios.ts  # Implementação Axios
│   │   ├── auth.service.ts
│   │   └── sales.service.ts
│   ├── types/
│   │   ├── api.types.ts
│   │   └── sales.types.ts
│   ├── config/
│   │   └── api.config.ts
│   ├── App.tsx
│   └── main.tsx
├── tailwind.config.js
└── package.json
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Backend NestJS rodando na porta 3000

### Instalação
```bash
cd frontend
npm install
```

### Desenvolvimento
```bash
npm run dev
```

### Build
```bash
npm run build
```

## 📱 Responsividade

- Header colapsível para dispositivos móveis
- Grid responsivo para filtros
- Tabela com scroll horizontal em telas pequenas
- Navegação adaptativa

## 🎯 Próximos Passos

### Funcionalidades Pendentes
- [ ] Formulário completo de nova venda
- [ ] Formulário de edição de venda
- [ ] Modal de confirmação para exclusão
- [ ] Filtros avançados (período de datas)
- [ ] Exportação de dados
- [ ] Dashboard com gráficos e métricas

### Melhorias de UX
- [ ] Loading states para ações
- [ ] Toast notifications
- [ ] Confirmações antes de ações destrutivas
- [ ] Validação em tempo real
- [ ] Auto-save em formulários

### Integração com Backend
- [ ] Migração completa para Axios
- [ ] Tratamento de erros aprimorado
- [ ] Cache de dados
- [ ] Sincronização offline

## 🔧 Configurações

### Tailwind CSS
- Configuração customizada com paleta de cores
- Animações e transições personalizadas
- Sombras e efeitos especiais
- Fonte Inter para UI e JetBrains Mono para código

### API
- Configuração base para desenvolvimento/produção
- Headers padrão e interceptors
- Timeout e retry configuráveis
- Suporte a CORS e credenciais

### TypeScript
- Configuração estrita para melhor qualidade de código
- Interfaces tipadas para todas as APIs
- Props tipadas para todos os componentes

## 🗃️ Backend Integration

### Seeds de Dados
- Execute o seed do backend para criar dados de exemplo:
```bash
cd sales-api
npx prisma db seed
```

### Estrutura de Vendas
- Cada venda inclui produtos, cliente, vendedor e status
- Cálculo automático de comissões (5%)
- Histórico completo de pagamentos
- Relacionamentos com clientes e produtos
