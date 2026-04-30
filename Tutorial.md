# Tutorial Completo: Sistema de Assinaturas com Asaas + Firebase

## 📋 Índice
1. [Setup Inicial](#setup-inicial)
2. [Configuração Firebase](#configuração-firebase)
3. [Configuração Asaas](#configuração-asaas)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Services - Backend Seguro](#services---backend-seguro)
6. [Telas do App](#telas-do-app)
7. [Cloud Functions](#cloud-functions)
8. [Deploy e Produção](#deploy-e-produção)
9. [Testes](#testes)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Setup Inicial

### 1. Criar projeto Expo
```bash
npx create-expo-app meu-app-pagamento
cd meu-app-pagamento
```

### 2. Instalar dependências
```bash
npm install firebase axios expo-router
npx expo install react-native-safe-area-context react-native-screens
```

### 3. Estrutura de pastas
```
meu-app-pagamento/
├── app/
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── cadastro.tsx
│   ├── home.tsx
│   └── assinatura.tsx
├── services/
│   ├── FirebaseConfig.ts
│   ├── AsaasConfig.ts
│   ├── CloudFunctionsService.ts
│   ├── SubscriptionService.ts
│   └── UserSubscriptionService.ts
├── functions/
│   ├── index.js
│   └── package.json
├── firebase.json
└── package.json
```

---

## 🔥 Configuração Firebase

### 1. Criar projeto Firebase
- Acesse [Firebase Console](https://console.firebase.google.com/)
- Criar novo projeto
- Ativar Authentication (Email/Senha)
- Criar Firestore Database
- Configurar Security Rules

### 2. Instalar Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 3. Inicializar Firebase no projeto
```bash
firebase init
# Selecionar: Functions, Firestore, Hosting
# Escolher projeto criado
```

### 4. Configurar FirebaseConfig.ts
```typescript
// services/FirebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
```

---

## 💳 Configuração Asaas

### 1. Criar conta Asaas
- Acesse [Asaas](https://asaas.com/)
- Criar conta (sandbox para testes)
- Gerar API Key

### 2. Configurar API Key
```bash
# Configurar secret nas Cloud Functions
firebase functions:secrets:set ASAAS_KEY
# Colar sua API Key de produção
```

### 3. Configurar Webhook (Opcional)
- No painel Asaas, configurar webhook para:
  ```
  https://sua-regiao-seu-projeto.cloudfunctions.net/asaasWebhook
  ```

---

## 📁 Estrutura do Projeto

### Services Principais

#### 1. AsaasConfig.ts (Interfaces)
```typescript
// services/AsaasConfig.ts
// Apenas interfaces TypeScript - SEM API KEY

export interface Customer {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  cpfCnpj: string;
}

export interface Subscription {
  customer: string;
  billingType: 'CREDIT_CARD';
  value: number;
  cycle: 'MONTHLY';
  description: string;
}

export interface SubscriptionResponse {
  id: string;
  customer: string;
  status: string;
  value: number;
  nextDueDate: string;
}

export default {};
```

#### 2. CloudFunctionsService.ts
```typescript
// services/CloudFunctionsService.ts
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from './FirebaseConfig';

const functions = getFunctions(app, 'us-central1');

export class CloudFunctionsService {
  static async createCustomer(customerData: any) {
    const createCustomerFunction = httpsCallable(functions, 'createCustomer');
    const result = await createCustomerFunction(customerData);
    return result.data;
  }

  static async createSubscription(subscriptionData: any) {
    const createSubscriptionFunction = httpsCallable(functions, 'createSubscription');
    const result = await createSubscriptionFunction(subscriptionData);
    return result.data;
  }

  static async getSubscriptionStatus() {
    const getSubscriptionStatusFunction = httpsCallable(functions, 'getSubscriptionStatus');
    const result = await getSubscriptionStatusFunction();
    return result.data;
  }

  static async cancelSubscription(subscriptionId: string) {
    const cancelSubscriptionFunction = httpsCallable(functions, 'cancelSubscription');
    const result = await cancelSubscriptionFunction({ subscriptionId });
    return result.data;
  }
}

export default CloudFunctionsService;
```

#### 3. SubscriptionService.ts
```typescript
// services/SubscriptionService.ts
import { SubscriptionResponse } from './AsaasConfig';
import CloudFunctionsService from './CloudFunctionsService';

const SUBSCRIPTION_VALUE = 5; // R$ 5,00 mensal
const SUBSCRIPTION_DESCRIPTION = 'Assinatura Mensal Premium';

export class SubscriptionService {
  static async createMonthlySubscription(
    customerId: string,
    creditCardData?: any,
    creditCardHolderInfo?: any
  ): Promise<SubscriptionResponse> {
    try {
      const result = await CloudFunctionsService.createSubscription({
        customerId,
        creditCardData,
        creditCardHolderInfo
      }) as any;
      
      return result.subscription;
    } catch (error) {
      console.error('Erro ao criar assinatura mensal:', error);
      throw error;
    }
  }

  static async hasActiveSubscription(): Promise<boolean> {
    try {
      const result = await CloudFunctionsService.getSubscriptionStatus() as any;
      return result.hasActiveSubscription;
    } catch (error) {
      console.error('Erro ao verificar assinatura ativa:', error);
      return false;
    }
  }

  static formatSubscriptionValue(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(SUBSCRIPTION_VALUE);
  }

  static getSubscriptionValue(): number {
    return SUBSCRIPTION_VALUE;
  }
}

export default SubscriptionService;
```

#### 4. UserSubscriptionService.ts
```typescript
// services/UserSubscriptionService.ts
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { auth, db } from './FirebaseConfig';

export interface UserSubscriptionData {
  uid: string;
  email: string;
  subscriptionId: string;
  subscriptionStatus: string;
  subscriptionValue: number;
  nextBillingDate: string;
  lastPaymentDate: string;
  customerId: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export class UserSubscriptionService {
  static async createUserSubscription(
    uid: string,
    email: string,
    subscriptionId: string,
    customerId: string
  ): Promise<void> {
    try {
      const subscriptionData: UserSubscriptionData = {
        uid,
        email,
        subscriptionId,
        subscriptionStatus: 'ACTIVE',
        subscriptionValue: 5, // R$ 5,00
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lastPaymentDate: new Date().toISOString(),
        customerId,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'userSubscriptions', uid), subscriptionData);
    } catch (error) {
      console.error('Erro ao criar assinatura do usuário:', error);
      throw error;
    }
  }

  static async getUserSubscriptionStatus(): Promise<UserSubscriptionData | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const docRef = doc(db, 'userSubscriptions', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as UserSubscriptionData;
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter status da assinatura:', error);
      return null;
    }
  }
}

export default UserSubscriptionService;
```

---

## 📱 Telas do App

### 1. _layout.tsx (Navegação)
```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Login' }} />
        <Stack.Screen name="cadastro" options={{ title: 'Cadastro' }} />
        <Stack.Screen name="assinatura" options={{ title: 'Assinatura' }} />
        <Stack.Screen name="home" options={{ title: 'Home' }} />
      </Stack>
    </>
  );
}
```

### 2. login.tsx
```typescript
// app/login.tsx
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/FirebaseConfig';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      router.replace('/home');
    } catch (error) {
      Alert.alert('Erro', 'Email ou senha incorretos');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Login</Text>
      
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      
      <TextInput
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />
      
      <TouchableOpacity onPress={handleLogin} style={{ backgroundColor: '#007AFF', padding: 15, borderRadius: 5 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Entrar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/cadastro')} style={{ marginTop: 20 }}>
        <Text style={{ color: '#007AFF', textAlign: 'center' }}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 3. home.tsx (Protegida)
```typescript
// app/home.tsx
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { auth } from '../services/FirebaseConfig';
import { useRouter } from 'expo-router';
import UserSubscriptionService from '../services/UserSubscriptionService';
import SubscriptionService from '../services/SubscriptionService';

export default function HomeScreen() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const status = await UserSubscriptionService.getUserSubscriptionStatus();
      if (!status || !status.isActive) {
        router.replace('/assinatura');
        return;
      }
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      router.replace('/assinatura');
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.replace('/');
  };

  if (!subscriptionStatus) {
    return <Text>Carregando...</Text>;
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Bem-vindo!</Text>
      
      <View style={{ backgroundColor: '#f0f0f0', padding: 15, borderRadius: 5, marginBottom: 20 }}>
        <Text>Assinatura: {subscriptionStatus.subscriptionStatus}</Text>
        <Text>Valor: {SubscriptionService.formatSubscriptionValue()}</Text>
        <Text>Próxima cobrança: {subscriptionStatus.nextBillingDate}</Text>
      </View>
      
      <TouchableOpacity onPress={() => router.push('/assinatura')} style={{ backgroundColor: '#007AFF', padding: 15, borderRadius: 5, marginBottom: 10 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Gerenciar Assinatura</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleLogout} style={{ backgroundColor: '#FF3B30', padding: 15, borderRadius: 5 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## ☁️ Cloud Functions

### 1. Instalar dependências
```bash
cd functions
npm install firebase-admin firebase-functions axios
```

### 2. package.json
```json
{
  "name": "functions",
  "description": "Cloud Functions for Firebase",
  "scripts": {
    "lint": "eslint .",
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "20"
  },
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "^11.0.0",
    "firebase-functions": "^4.0.0",
    "axios": "^1.6.0"
  },
  "private": true
}
```

### 3. index.js (Cloud Functions)
```javascript
// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const { defineSecret } = require("firebase-functions/params");

// Definir secrets de forma segura
const asaasKey = defineSecret("ASAAS_KEY");

// Inicializar Firebase Admin
admin.initializeApp();

// Configuração da API Asaas
const ASAAS_API_URL = 'https://www.asaas.com/api/v3'; // Produção

// Função para criar cliente
exports.createCustomer = functions
  .runWith({ secrets: [asaasKey] })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }
    
    try {
      const response = await axios.post(
        `${ASAAS_API_URL}/customers`,
        data,
        {
          headers: {
            access_token: asaasKey.value(),
            "Content-Type": "application/json",
          },
        }
      );
      
      return { 
        success: true, 
        customer: {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email
        }
      };
    } catch (error) {
      throw new functions.https.HttpsError('internal', 'Erro ao criar cliente');
    }
  });

// Função para criar assinatura
exports.createSubscription = functions
  .runWith({ secrets: [asaasKey] })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }
    
    try {
      const { customerId, creditCardData, creditCardHolderInfo } = data;
      
      const subscriptionData = {
        customer: customerId,
        billingType: 'CREDIT_CARD',
        value: 5.00, // R$ 5,00
        nextDueDate: new Date().toISOString().split('T')[0],
        cycle: 'MONTHLY',
        description: 'Assinatura Mensal Premium',
        creditCard: creditCardData,
        creditCardHolderInfo: creditCardHolderInfo,
      };
      
      const response = await axios.post(
        `${ASAAS_API_URL}/subscriptions`,
        subscriptionData,
        {
          headers: {
            access_token: asaasKey.value(),
            "Content-Type": "application/json",
          },
        }
      );
      
      const subscription = response.data;
      
      // Atualizar Firestore
      const userRef = admin.firestore().collection('userSubscriptions').doc(context.auth.uid);
      await userRef.set({
        uid: context.auth.uid,
        email: context.auth.token.email,
        subscriptionId: subscription.id,
        subscriptionStatus: 'ACTIVE',
        subscriptionValue: subscription.value,
        nextBillingDate: subscription.nextDueDate,
        lastPaymentDate: new Date().toISOString(),
        customerId: customerId,
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      
      return { 
        success: true, 
        subscription: {
          id: subscription.id,
          status: subscription.status,
          nextDueDate: subscription.nextDueDate,
          value: subscription.value
        }
      };
    } catch (error) {
      throw new functions.https.HttpsError('internal', 'Erro ao criar assinatura');
    }
  });

// Função para verificar status
exports.getSubscriptionStatus = functions
  .runWith({ secrets: [asaasKey] })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }
    
    try {
      const userRef = admin.firestore().collection('userSubscriptions').doc(context.auth.uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists()) {
        return { hasActiveSubscription: false };
      }
      
      const userData = userDoc.data();
      return { 
        hasActiveSubscription: userData.isActive,
        subscription: {
          id: userData.subscriptionId,
          status: userData.subscriptionStatus,
          nextDueDate: userData.nextBillingDate,
          value: userData.subscriptionValue
        }
      };
    } catch (error) {
      throw new functions.https.HttpsError('internal', 'Erro ao verificar status');
    }
  });

// Função para cancelar assinatura
exports.cancelSubscription = functions
  .runWith({ secrets: [asaasKey] })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }
    
    try {
      const userRef = admin.firestore().collection('userSubscriptions').doc(context.auth.uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists()) {
        throw new functions.https.HttpsError('not-found', 'Assinatura não encontrada');
      }
      
      const userData = userDoc.data();
      
      if (userData.subscriptionId) {
        await axios.post(
          `${ASAAS_API_URL}/subscriptions/${userData.subscriptionId}/cancel`,
          {},
          {
            headers: {
              access_token: asaasKey.value(),
              "Content-Type": "application/json",
            },
          }
        );
      }
      
      await userRef.update({
        isActive: false,
        subscriptionStatus: 'CANCELLED',
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      return { success: true };
    } catch (error) {
      throw new functions.https.HttpsError('internal', 'Erro ao cancelar assinatura');
    }
  });
```

---

## 🚀 Deploy e Produção

### 1. Deploy das Cloud Functions
```bash
firebase deploy --only functions
```

### 2. Configurar Security Rules do Firestore
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /userSubscriptions/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Deploy das regras
```bash
firebase deploy --only firestore:rules
```

---

## 🧪 Testes

### 1. Testar localmente
```bash
cd functions
npm run serve
```

### 2. Cartões de teste (Sandbox)
- **Aprovado**: `5162306219655154`
- **Reprovado**: `5162306219655161`

### 3. Fluxo de teste
1. Criar usuário no app
2. Fazer login
3. Preencher dados de assinatura
4. Testar com cartão de teste
5. Verificar status no painel Asaas

---

## 🔧 Troubleshooting

### Erros Comuns

#### 1. `FirebaseError: not-found`
**Causa**: Cloud Functions não deployadas ou região incorreta
**Solução**:
```bash
firebase deploy --only functions
# Verificar região em services/CloudFunctionsService.ts
const functions = getFunctions(app, 'us-central1');
```

#### 2. `API Key inválida`
**Causa**: Secret ASAAS_KEY não configurada
**Solução**:
```bash
firebase functions:secrets:set ASAAS_KEY
# Colar API Key de produção
```

#### 3. `Usuário não autenticado`
**Causa**: Firebase Authentication não configurado
**Solução**: Ativar Authentication no Firebase Console

#### 4. `Permissão negada Firestore`
**Causa**: Security Rules incorretas
**Solução**: Verificar firestore.rules

### Debug Tips

1. **Verificar logs das functions**:
   ```bash
   firebase functions:log
   ```

2. **Testar functions individualmente**:
   ```bash
   firebase functions:shell
   ```

3. **Verificar secrets**:
   ```bash
   firebase functions:secrets:list
   ```

---

## 📋 Checklist Final

### Antes de ir para produção:
- [ ] API Key configurada como secret
- [ ] Cloud Functions deployadas
- [ ] Security Rules do Firestore configuradas
- [ ] Testado com cartões de sandbox
- [ ] Webhook configurado (opcional)
- [ ] Monitoramento de erros ativo
- [ ] Backup dos dados

### Segurança:
- [ ] Sem API Keys no frontend
- [ ] Autenticação funcionando
- [ ] Firestore rules restritivas
- [ ] HTTPS em todas as chamadas

---

## 🎉 Conclusão

Sistema completo de assinaturas com:
- ✅ **Segurança**: API Keys no backend
- ✅ **Escalabilidade**: Cloud Functions
- ✅ **Persistência**: Firestore
- ✅ **Pagamentos**: Asaas integration
- ✅ **UX**: React Native + Expo Router

Pronto para produção e facilmente adaptável para outros projetos! 🚀
