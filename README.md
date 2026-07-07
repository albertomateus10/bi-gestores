

Sistema de gestão de indicadores comerciais para as 5 lojas da Marja Concessionárias (San Marino).

## 📊 Módulos

| Módulo | Descrição |
|---|---|
| **Login** | Autenticação por e-mail e senha (Firebase Auth) |
| **Dashboard** | Resumo geral com funil e gráficos |
| **🎯 Leads** | Funil completo: recebidos → fechados, metas e conversões |
| **👥 Vendedores** | Leads quentes, negócios travados, performance, motivo de perda, financeiro |
| **📦 Estoque** | Mix e giro de novos/seminovos, envelhecimento, avaliações |
| **📋 Plano de Ação** | Ações semanais com responsável, prazo e status |
| **👑 Admin** | Visão consolidada de todas as lojas (somente diretor) |

## 🏪 Lojas

- Matriz
- Zona Sul
- Gravataí
- Viamão
- Multimarcas

## 🔧 Configuração Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Crie um projeto chamado `marja-indicadores`
3. Ative **Authentication → Email/Senha**
4. Ative **Firestore Database** (modo produção)
5. Em **Configurações do projeto → Seus apps → Web**, copie as credenciais
6. Cole no arquivo `js/firebase-config.js`

### Regras do Firestore (copie no console Firebase):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários: lê/escreve somente o próprio perfil (admin lê todos)
    match /usuarios/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    // Dados das lojas: qualquer gerente aprovado ou admin lê e grava em qualquer loja
    match /lojas/{lojaId}/{document=**} {
      allow read, write: if request.auth != null && (
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.aprovado == true ||
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.role == 'admin'
      );
    }
  }
}
```

## 🚀 Deploy no Vercel

1. Faça upload do projeto para um repositório no GitHub
2. Acesse [vercel.com](https://vercel.com) e conecte o repositório
3. O `vercel.json` já está configurado — clique em **Deploy**

## 👥 Criação de Usuários

1. No Firebase Console → Authentication → Adicione os usuários com e-mail e senha
2. Copie os UIDs gerados
3. No Firestore → Crie documentos em `/usuarios/{uid}` com a estrutura:

```json
{
  "nome": "Nome do Gerente",
  "role": "gerente"        // gerente | admin
}
```

Para o administrador:
```json
{
  "nome": "Diretor",
  "role": "admin"
}
```
