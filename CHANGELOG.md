# 📋 Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Adicionado

- Sistema de CI/CD com GitHub Actions
- Análise de segurança com CodeQL
- Templates para Issues e Pull Requests
- Política de segurança e código de conduta
- Guia de contribuição completo

### Alterado

- README completamente reformulado para portfólio
- Configurações do VS Code otimizadas
- Script de inicialização automática

### Corrigido

- Configuração de portas entre frontend e backend
- Banco de dados configurado para SQLite

## [1.0.0] - 2024-09-01

### Adicionado

- **Sistema de Autenticação JWT**

  - Login com email e senha
  - Controle de acesso baseado em roles (ADMIN/SELLER)
  - Proteção de rotas com guards
  - Refresh automático de tokens

- **Gestão de Usuários**

  - Cadastro de vendedores e administradores
  - Sistema de comissões configurável
  - Controle de status (ativo/inativo)
  - Histórico de login

- **Gestão de Clientes**

  - CRUD completo de clientes
  - Validação de CPF brasileiro
  - Endereços completos com CEP
  - Histórico de compras

- **Gestão de Produtos**

  - Cadastro de produtos com SKU único
  - Controle de preços e status
  - Estoque virtual
  - Categorização

- **Sistema de Vendas**

  - Fluxo em etapas (Cliente → Itens → Pagamento)
  - Cálculo automático de totais
  - Múltiplos métodos de pagamento
  - Snapshots de preços para auditoria
  - Cálculo de comissões

- **Dashboard e Relatórios**

  - Métricas em tempo real
  - Gráficos interativos
  - Relatórios por período
  - Análise de comissões

- **Interface do Usuário**
  - Design responsivo com Tailwind CSS
  - Componentes reutilizáveis
  - Navegação intuitiva
  - Formulários validados

### Arquitetura

- **Backend**: NestJS com TypeScript
- **Frontend**: React 18 com TypeScript
- **Banco de Dados**: SQLite com Prisma ORM
- **Build Tool**: Vite para frontend
- **Testes**: Jest para backend

### Segurança

- Validação de entrada com class-validator
- Sanitização de dados
- Controle de acesso granular
- Logs de auditoria

## [0.9.0] - 2024-08-28

### Adicionado

- Estrutura básica do projeto
- Configuração inicial do NestJS
- Schema básico do banco de dados
- Componentes básicos do React

### Alterado

- Migração de PostgreSQL para SQLite
- Otimização de performance
- Melhorias na validação

## [0.8.0] - 2024-08-22

### Adicionado

- Sistema de migrações do Prisma
- Seeds para dados de teste
- Configuração de ambiente

### Corrigido

- Problemas de compatibilidade
- Bugs na validação de dados

## [0.7.0] - 2024-08-17

### Adicionado

- Sistema de vendas básico
- Gestão de produtos
- Autenticação inicial

### Alterado

- Refatoração da arquitetura
- Melhorias na estrutura do banco

## [0.6.0] - 2024-08-10

### Adicionado

- Estrutura do frontend
- Componentes básicos
- Roteamento da aplicação

### Corrigido

- Problemas de build
- Dependências desatualizadas

## [0.5.0] - 2024-08-03

### Adicionado

- Configuração inicial do Prisma
- Schema do banco de dados
- Migrações básicas

### Alterado

- Estrutura do projeto reorganizada

## [0.4.0] - 2024-07-25

### Adicionado

- Estrutura básica do NestJS
- Módulos principais
- Configuração de ambiente

### Corrigido

- Problemas de configuração
- Dependências conflitantes

## [0.3.0] - 2024-07-18

### Adicionado

- Setup inicial do projeto
- Configuração do TypeScript
- Estrutura de pastas

### Alterado

- Organização do código
- Configurações de build

## [0.2.0] - 2024-07-10

### Adicionado

- Repositório inicial
- README básico
- Licença MIT

### Alterado

- Estrutura inicial do projeto

## [0.1.0] - 2024-07-01

### Adicionado

- Criação do repositório
- Primeiro commit
- Estrutura básica

---

## 🔗 Links Úteis

- [Documentação da API](http://localhost:3000/docs)
- [Repositório no GitHub](https://github.com/seu-usuario/painel-de-vendas)
- [Issues](https://github.com/seu-usuario/painel-de-vendas/issues)
- [Pull Requests](https://github.com/seu-usuario/painel-de-vendas/pulls)

## 📝 Notas de Versão

### Breaking Changes

- **v1.0.0**: Migração completa para SQLite
- **v0.9.0**: Refatoração da arquitetura de autenticação
- **v0.8.0**: Mudanças no schema do banco de dados

### Deprecações

- **v1.1.0**: Suporte ao PostgreSQL será removido
- **v1.2.0**: API v1 será descontinuada

### Compatibilidade

- **Node.js**: 18.0.0+
- **npm**: 9.0.0+
- **Navegadores**: Chrome 90+, Firefox 88+, Safari 14+

---

**📅 Para mais detalhes sobre cada versão, consulte as [releases](https://github.com/seu-usuario/painel-de-vendas/releases) no GitHub.**
