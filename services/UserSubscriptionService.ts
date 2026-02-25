import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './FirebaseConfig';
import SubscriptionService from './SubscriptionService';

export interface UserSubscriptionData {
  uid: string;
  email: string;
  subscriptionId?: string;
  subscriptionStatus: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'OVERDUE';
  subscriptionValue: number;
  nextBillingDate?: string;
  lastPaymentDate?: string;
  customerId?: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export class UserSubscriptionService {
  // Criar registro de assinatura do usuário
  static async createUserSubscription(
    subscriptionId: string,
    customerId: string
  ): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      const subscriptionData: UserSubscriptionData = {
        uid: user.uid,
        email: user.email || '',
        subscriptionId,
        subscriptionStatus: 'ACTIVE',
        subscriptionValue: SubscriptionService.getSubscriptionValue(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lastPaymentDate: new Date().toISOString(),
        customerId,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'userSubscriptions', user.uid), subscriptionData);
    } catch (error) {
      console.error('Erro ao criar assinatura do usuário:', error);
      throw error;
    }
  }

  // Verificar status da assinatura do usuário
  static async getUserSubscriptionStatus(): Promise<UserSubscriptionData | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const docRef = doc(db, 'userSubscriptions', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserSubscriptionData;
        
        // Verificar se a assinatura ainda está válida
        if (data.isActive && data.nextBillingDate) {
          const nextBilling = new Date(data.nextBillingDate);
          const today = new Date();
          
          if (nextBilling < today) {
            // Assinatura vencida, verificar na API Asaas
            const isStillActive = await this.syncWithAsaas(data.subscriptionId);
            if (!isStillActive) {
              await this.updateSubscriptionStatus(user.uid, 'OVERDUE', false);
              data.isActive = false;
              data.subscriptionStatus = 'OVERDUE';
            }
          }
        }
        
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao verificar status da assinatura:', error);
      return null;
    }
  }

  // Sincronizar com API Asaas
  static async syncWithAsaas(subscriptionId?: string): Promise<boolean> {
    try {
      if (!subscriptionId) return false;
      
      const subscription = await SubscriptionService.getActiveSubscription();
      return subscription?.status === 'ACTIVE' || subscription?.status === 'CONFIRMED';
    } catch (error) {
      console.error('Erro ao sincronizar com Asaas:', error);
      return false;
    }
  }

  // Atualizar status da assinatura
  static async updateSubscriptionStatus(
    uid: string,
    status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'OVERDUE',
    isActive: boolean
  ): Promise<void> {
    try {
      const docRef = doc(db, 'userSubscriptions', uid);
      await updateDoc(docRef, {
        subscriptionStatus: status,
        isActive,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  }

  // Cancelar assinatura do usuário
  static async cancelUserSubscription(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      const subscriptionData = await this.getUserSubscriptionStatus();
      if (subscriptionData?.subscriptionId) {
        // Cancelar na API Asaas
        await SubscriptionService.cancelSubscription(subscriptionData.subscriptionId);
      }

      // Atualizar no Firestore
      await this.updateSubscriptionStatus(user.uid, 'CANCELLED', false);
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      throw error;
    }
  }

  // Verificar se usuário tem acesso (método principal)
  static async hasUserAccess(): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscriptionStatus();
      
      if (!subscription) {
        return false;
      }

      // Verificar se está ativo e não vencido
      if (!subscription.isActive) {
        return false;
      }

      // Verificar data de vencimento
      if (subscription.nextBillingDate) {
        const nextBilling = new Date(subscription.nextBillingDate);
        const today = new Date();
        
        if (nextBilling < today) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar acesso:', error);
      return false;
    }
  }

  // Limpar dados do usuário (logout)
  static async clearUserSubscription(): Promise<void> {
    // Não precisa fazer nada, os dados ficam no Firestore
    // A verificação é feita pelo UID do usuário autenticado
  }
}

export default UserSubscriptionService;
