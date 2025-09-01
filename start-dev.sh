#!/bin/bash

echo "🚀 Iniciando Painel de Vendas em modo desenvolvimento..."

# Função para limpar processos ao sair
cleanup() {
    echo "🛑 Parando servidores..."
    pkill -f "npm run start:dev" 2>/dev/null
    pkill -f "npm run dev" 2>/dev/null
    exit 0
}

# Capturar Ctrl+C para limpeza
trap cleanup SIGINT

echo "📦 Instalando dependências do backend..."
cd sales-api
npm install

echo "🗄️ Configurando banco de dados..."
npx prisma generate
npx prisma db push

echo "🔧 Iniciando backend na porta 3000..."
npm run start:dev &
BACKEND_PID=$!

echo "⏳ Aguardando backend inicializar..."
sleep 8

# Testar se o backend está rodando
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Backend rodando em http://localhost:3000"
else
    echo "❌ Erro: Backend não conseguiu inicializar"
    exit 1
fi

echo "📦 Instalando dependências do frontend..."
cd ../frontend
npm install

echo "🎨 Iniciando frontend na porta 5173..."
npm run dev &
FRONTEND_PID=$!

echo "⏳ Aguardando frontend inicializar..."
sleep 5

# Testar se o frontend está rodando
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend rodando em http://localhost:5173"
else
    echo "❌ Erro: Frontend não conseguiu inicializar"
    exit 1
fi

echo ""
echo "🎉 Projeto iniciado com sucesso!"
echo "📱 Frontend: http://localhost:5173"
echo "🔌 Backend:  http://localhost:3000"
echo "📚 API Docs: http://localhost:3000/docs"
echo ""
echo "Pressione Ctrl+C para parar os servidores"

# Aguardar indefinidamente
wait
