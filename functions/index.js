const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const { defineSecret } = require("firebase-functions/params");

// Definir secrets de forma segura
const asaasKey = defineSecret("ASAAS_KEY");

// Inicializar Firebase Admin
admin.initializeApp();

// Configuração da API Asaas - AMBIENTE DE PRODUÇÃO
const ASAAS_API_URL = 'https://sandbox.asaas.com/api/v3'; 
// Para testes: 'https://sandbox.asaas.com/api/v3'

// Função para criar cliente de forma segura
exports.createCustomer = functions
  .runWith({ secrets: [asaasKey] })
  .https.onCall(async (data, context) => {
    // Verificar se usuário está autenticado
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }
    
    try {
      const customerData = data;
      
      // Validar dados obrigatórios
      if (!customerData.name || !customerData.email || !customerData.cpfCnpj) {
        throw new functions.https.HttpsError('invalid-argument', 'Dados do cliente incompletos');
      }
      
      const response = await axios.post(
        `${ASAAS_API_URL}/customers`,
        {
          name: customerData.name,
          email: customerData.email,
          cpfCnpj: customerData.cpfCnpj,
          phone: customerData.phone,
          mobilePhone: customerData.mobilePhone,
        },
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
      console.error('Erro ao criar cliente:', error);
      
      if (error.response?.data?.errors) {
        const errorMessage = error.response.data.errors.map(e => e.description).join('\n');
        throw new functions.https.HttpsError('invalid-argument', errorMessage);
      }
      
      throw new functions.https.HttpsError('internal', 'Erro ao criar cliente');
    }
  });

// Função para criar assinatura de forma segura
exports.createSubscription = functions
  .runWith({ secrets: [asaasKey] })
  .https.onCall(async (data, context) => {
    // Verificar se usuário está autenticado
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }
    
    try {
      const { 
        customerId, 
        creditCardData, 
        creditCardHolderInfo 
      } = data;
      
      // Validar dados obrigatórios
      if (!customerId || !creditCardData || !creditCardHolderInfo) {
        throw new functions.https.HttpsError('invalid-argument', 'Dados incompletos');
      }
      
      // Criar assinatura na API Asaas
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
      
      // Atualizar dados do usuário no Firestore
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
      console.error('Erro ao criar assinatura:', error);
      
      // Retornar erro específico da API Asaas se disponível
      if (error.response?.data?.errors) {
        const errorMessage = error.response.data.errors.map(e => e.description).join('\n');
        throw new functions.https.HttpsError('invalid-argument', errorMessage);
      }
      
      throw new functions.https.HttpsError('internal', 'Erro ao criar assinatura');
    }
  });

// Função para verificar status da assinatura
exports.getSubscriptionStatus = functions
  .runWith({ secrets: [asaasKey] })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }
    
    try {
      const userRef = admin.firestore().collection('userSubscriptions').doc(context.auth.uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        return { hasActiveSubscription: false };
      }
      
      const userData = userDoc.data();
      
      // Verificar se assinatura está válida
      if (userData.isActive && userData.nextBillingDate) {
        const nextBilling = new Date(userData.nextBillingDate);
        const today = new Date();
        
        if (nextBilling < today) {
          // Assinatura vencida, verificar na API Asaas
          try {
            const response = await axios.get(
              `${ASAAS_API_URL}/subscriptions/${userData.subscriptionId}`,
              {
                headers: {
                  access_token: asaasKey.value(),
                  "Content-Type": "application/json",
                },
              }
            );
            
            const subscription = response.data;
            
            if (subscription.status === 'ACTIVE' || subscription.status === 'CONFIRMED') {
              // Atualizar data de próxima cobrança
              await userRef.update({
                nextBillingDate: subscription.nextDueDate,
                subscriptionStatus: subscription.status,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
              
              return { 
                hasActiveSubscription: true,
                subscription: {
                  id: subscription.id,
                  status: subscription.status,
                  nextDueDate: subscription.nextDueDate,
                  value: subscription.value
                }
              };
            } else {
              // Assinatura não está mais ativa
              await userRef.update({
                isActive: false,
                subscriptionStatus: subscription.status,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
              
              return { hasActiveSubscription: false };
            }
          } catch (apiError) {
            console.error('Erro ao verificar API Asaas:', apiError);
            // Se falhar API, assume que está inativo
            await userRef.update({
              isActive: false,
              subscriptionStatus: 'UNKNOWN',
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            
            return { hasActiveSubscription: false };
          }
        }
      }
      
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
      console.error('Erro ao verificar status:', error);
      throw new functions.https.HttpsError('internal', 'Erro ao verificar status da assinatura');
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
      
      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Assinatura não encontrada');
      }
      
      const userData = userDoc.data();
      
      if (userData.subscriptionId) {
        // Cancelar na API Asaas
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
      
      // Atualizar dados do usuário
      await userRef.update({
        isActive: false,
        subscriptionStatus: 'CANCELLED',
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      
      if (error.response?.data?.errors) {
        const errorMessage = error.response.data.errors.map(e => e.description).join('\n');
        throw new functions.https.HttpsError('invalid-argument', errorMessage);
      }
      
      throw new functions.https.HttpsError('internal', 'Erro ao cancelar assinatura');
    }
  });

// Webhook para receber notificações do Asaas
exports.asaasWebhook = functions
  .runWith({ secrets: [asaasKey] })
  .https.onRequest(async (req, res) => {
    try {
      const { event, payment } = req.body;
      
      console.log('Webhook recebido:', { event, payment });
      
      switch (event) {
        case 'PAYMENT_CONFIRMED':
          await handlePaymentConfirmed(payment);
          break;
        case 'PAYMENT_OVERDUE':
          await handlePaymentOverdue(payment);
          break;
        case 'SUBSCRIPTION_CREATED':
          await handleSubscriptionCreated(payment);
          break;
        case 'SUBSCRIPTION_UPDATED':
          await handleSubscriptionUpdated(payment);
          break;
        case 'SUBSCRIPTION_DELETED':
          await handleSubscriptionDeleted(payment);
          break;
        default:
          console.log('Evento não tratado:', event);
      }
      
      res.status(200).send('OK');
    } catch (error) {
      console.error('Erro no webhook:', error);
      res.status(500).send('Internal Server Error');
    }
  });

// Tratar pagamento confirmado
async function handlePaymentConfirmed(payment) {
  try {
    // Buscar usuário pelo customerId
    const usersSnapshot = await admin.firestore()
      .collection('userSubscriptions')
      .where('customerId', '==', payment.customer)
      .get();
    
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      await userDoc.ref.update({
        subscriptionStatus: 'ACTIVE',
        isActive: true,
        lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log('Pagamento confirmado para usuário:', userDoc.id);
    }
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
  }
}

// Tratar assinatura atualizada
async function handleSubscriptionUpdated(subscription) {
  try {
    const usersSnapshot = await admin.firestore()
      .collection('userSubscriptions')
      .where('subscriptionId', '==', subscription.id)
      .get();
    
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      await userDoc.ref.update({
        subscriptionStatus: subscription.status,
        isActive: subscription.status === 'ACTIVE' || subscription.status === 'CONFIRMED',
        nextBillingDate: subscription.nextDueDate,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log('Assinatura atualizada:', subscription.id);
    }
  } catch (error) {
    console.error('Erro ao atualizar assinatura:', error);
  }
}

async function handlePaymentOverdue(payment) {
  try {
    const usersSnapshot = await admin.firestore()
      .collection('userSubscriptions')
      .where('customerId', '==', payment.customer)
      .get();

    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      await userDoc.ref.update({
        subscriptionStatus: 'OVERDUE',
        isActive: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('Pagamento vencido:', userDoc.id);
    }
  } catch (error) {
    console.error('Erro ao tratar pagamento vencido:', error);
  }
}

// Tratar assinatura criada
async function handleSubscriptionCreated(subscription) {
  try {
    const usersSnapshot = await admin.firestore()
      .collection('userSubscriptions')
      .where('customerId', '==', subscription.customer)
      .get();

    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      await userDoc.ref.update({
        subscriptionStatus: subscription.status,
        subscriptionId: subscription.id,
        isActive: subscription.status === 'ACTIVE',
        nextBillingDate: subscription.nextDueDate,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('Assinatura criada:', subscription.id);
    }
  } catch (error) {
    console.error('Erro ao tratar assinatura criada:', error);
  }
}

// Tratar assinatura cancelada
async function handleSubscriptionDeleted(subscription) {
  try {
    const usersSnapshot = await admin.firestore()
      .collection('userSubscriptions')
      .where('subscriptionId', '==', subscription.id)
      .get();
    
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      await userDoc.ref.update({
        subscriptionStatus: 'CANCELLED',
        isActive: false,
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log('Assinatura cancelada:', subscription.id);
    }
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
  }
}
