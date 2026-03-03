import { getFunctions, httpsCallable } from 'firebase/functions';
import app from './FirebaseConfig';

// Inicializar Firebase Functions
const functions = getFunctions(app, 'us-central1');// Região padrão
type CreateCustomerResponse = {
  success: boolean;
  customer: {
    id: string;
    name: string;
    email: string;
  };
};

export class CloudFunctionsService {
  // Criar cliente via Cloud Function
  static async createCustomer(
    customerData: any
  ): Promise<CreateCustomerResponse> {
    try {
      const createCustomerFunction = httpsCallable<
        any,
        CreateCustomerResponse
      >(functions, 'createCustomer');

      const result = await createCustomerFunction(customerData);

      return result.data;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  }


  // Criar assinatura via Cloud Function
    static async createSubscription(subscriptionData: {
      customerId: string;
      creditCardData: any;
      creditCardHolderInfo: any;
    }) {
      try {
        const createSubscriptionFunction = httpsCallable(functions, 'createSubscription');
        const result = await createSubscriptionFunction(subscriptionData);
        return result.data;
      } catch (error) {
        console.error('Erro ao criar assinatura:', error);
        throw error;
      }
    }

  // Verificar status da assinatura via Cloud Function
  static async getSubscriptionStatus() {
    try {
      const getSubscriptionStatusFunction = httpsCallable(functions, 'getSubscriptionStatus');
      const result = await getSubscriptionStatusFunction();
      return result.data;
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      throw error;
    }
  }

  // Cancelar assinatura via Cloud Function
  static async cancelSubscription(subscriptionId: string) {
    try {
      const cancelSubscriptionFunction = httpsCallable(functions, 'cancelSubscription');
      const result = await cancelSubscriptionFunction({ subscriptionId });
      return result.data;
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      throw error;
    }
  }
}

export default CloudFunctionsService;
