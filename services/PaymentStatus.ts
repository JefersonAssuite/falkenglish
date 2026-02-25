import SubscriptionService from './SubscriptionService';

// Usar um cache simples em memória para o status de pagamento
let paymentStatusCache: boolean | null = null;

export class PaymentStatusService {
  // Verificar se o usuário já tem assinatura ativa
  static async checkUserPaymentStatus(): Promise<boolean> {
    try {
      // Primeiro, verificar no cache
      if (paymentStatusCache !== null) {
        return paymentStatusCache;
      }

      // Verificar se tem assinatura ativa
      const hasActiveSubscription = await SubscriptionService.hasActiveSubscription();
      
      // Salvar no cache
      paymentStatusCache = hasActiveSubscription;
      
      return hasActiveSubscription;
    } catch (error) {
      console.error('Erro ao verificar status de assinatura:', error);
      return false;
    }
  }

  // Marcar que o usuário realizou pagamento/assinatura
  static async markPaymentCompleted(): Promise<void> {
    try {
      paymentStatusCache = true;
    } catch (error) {
      console.error('Erro ao marcar pagamento como concluído:', error);
    }
  }

  // Limpar status de pagamento (para logout)
  static async clearPaymentStatus(): Promise<void> {
    try {
      paymentStatusCache = null;
    } catch (error) {
      console.error('Erro ao limpar status de pagamento:', error);
    }
  }

  // Forçar verificação na API (usado após nova assinatura)
  static async refreshPaymentStatus(): Promise<boolean> {
    try {
      paymentStatusCache = null;
      return await this.checkUserPaymentStatus();
    } catch (error) {
      console.error('Erro ao atualizar status de pagamento:', error);
      return false;
    }
  }
}

export default PaymentStatusService;
