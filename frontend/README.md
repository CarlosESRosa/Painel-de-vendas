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

## 🧩 Componentes

### Classes Utilitárias
- `.btn-primary` - Botão primário com estilo padrão
- `.btn-secondary` - Botão secundário com estilo padrão
- `.card` - Container de card com sombra e borda
- `.input-field` - Campo de input com estilo padrão

### Sombras
- `.shadow-soft` - Sombra suave para cards e elementos
- `.shadow-glow` - Sombra com brilho para elementos destacados

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
│   ├── App.tsx          # Componente principal com tela de teste
│   ├── main.tsx         # Ponto de entrada da aplicação
│   └── index.css        # Estilos globais e configuração do Tailwind
├── tailwind.config.js   # Configuração do Tailwind CSS
├── postcss.config.js    # Configuração do PostCSS
├── package.json         # Dependências e scripts
└── README.md           # Este arquivo
```

## 🎯 Próximos Passos

- [ ] Implementar roteamento com React Router
- [ ] Criar componentes reutilizáveis
- [ ] Implementar autenticação
- [ ] Conectar com a API backend
- [ ] Adicionar testes unitários
- [ ] Implementar tema escuro/claro

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

## 📝 Licença

Este projeto faz parte do sistema Painel de Vendas.
