import { AsaasService, Subscription, SubscriptionResponse } from './AsaasConfig';

const SUBSCRIPTION_VALUE = 8; // R$ 15,00 mensal
const SUBSCRIPTION_DESCRIPTION = 'Assinatura Mensal Premium';

export class SubscriptionService {
  // Criar assinatura mensal de R$ 15,00
  static async createMonthlySubscription(
    customerId: string,
    creditCardData?: any,
    creditCardHolderInfo?: any
  ): Promise<SubscriptionResponse> {
    try {
      const subscriptionData: Omit<Subscription, 'id'> = {
        customer: customerId,
        billingType: 'CREDIT_CARD',
        value: SUBSCRIPTION_VALUE,
        nextDueDate: new Date().toISOString().split('T')[0], // Hoje
        cycle: 'MONTHLY',
        description: SUBSCRIPTION_DESCRIPTION,
        creditCard: creditCardData,
        creditCardHolderInfo: creditCardHolderInfo,
      };

      const subscription = await AsaasService.createSubscription(subscriptionData);
      return subscription;
    } catch (error) {
      console.error('Erro ao criar assinatura mensal:', error);
      throw error;
    }
  }

  // Verificar se usuário tem assinatura ativa
  static async hasActiveSubscription(customerId?: string): Promise<boolean> {
    try {
      const subscriptions = await AsaasService.getSubscriptions(customerId);
      
      // Verificar se existe alguma assinatura ativa
      const activeSubscription = subscriptions.find(sub => 
        sub.status === 'ACTIVE' || 
        sub.status === 'PENDING' ||
        sub.status === 'CONFIRMED'
      );
      
      return !!activeSubscription;
    } catch (error) {
      console.error('Erro ao verificar assinatura ativa:', error);
      return false;
    }
  }

  // Obter assinatura ativa do usuário
  static async getActiveSubscription(customerId?: string): Promise<SubscriptionResponse | null> {
    try {
      const subscriptions = await AsaasService.getSubscriptions(customerId);
      
      // Retornar primeira assinatura ativa encontrada
      const activeSubscription = subscriptions.find(sub => 
        sub.status === 'ACTIVE' || 
        sub.status === 'PENDING' ||
        sub.status === 'CONFIRMED'
      );
      
      return activeSubscription || null;
    } catch (error) {
      console.error('Erro ao obter assinatura ativa:', error);
      return null;
    }
  }

  // Cancelar assinatura
  static async cancelSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
    try {
      const cancelledSubscription = await AsaasService.cancelSubscription(subscriptionId);
      return cancelledSubscription;
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      throw error;
    }
  }

  // Formatar valor da assinatura
  static formatSubscriptionValue(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(SUBSCRIPTION_VALUE);
  }

  // Obter descrição da assinatura
  static getSubscriptionDescription(): string {
    return SUBSCRIPTION_DESCRIPTION;
  }

  // Obter valor numérico da assinatura
  static getSubscriptionValue(): number {
    return SUBSCRIPTION_VALUE;
  }

  // Verificar status da assinatura
  static getSubscriptionStatusText(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'Ativa';
      case 'PENDING':
        return 'Pendente';
      case 'CONFIRMED':
        return 'Confirmada';
      case 'OVERDUE':
        return 'Vencida';
      case 'CANCELED':
        return 'Cancelada';
      case 'EXPIRED':
        return 'Expirada';
      default:
        return status;
    }
  }

  // Obter cor do status da assinatura
  static getSubscriptionStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return '#34C759'; // Verde
      case 'PENDING':
        return '#FF9500'; // Laranja
      case 'CONFIRMED':
        return '#34C759'; // Verde
      case 'OVERDUE':
        return '#FF3B30'; // Vermelho
      case 'CANCELED':
        return '#8E8E93'; // Cinza
      case 'EXPIRED':
        return '#8E8E93'; // Cinza
      default:
        return '#8E8E93'; // Cinza
    }
  }
}

export default SubscriptionService;
