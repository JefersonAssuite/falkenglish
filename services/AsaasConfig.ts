import axios from 'axios';

// Configuração da API Asaas
const ASAAS_API_URL = 'https://sandbox.asaas.com/api/v3'; // Ambiente de testes
// Para produção: 'https://www.asaas.com/api/v3'

const ASAAS_API_KEY = "$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmEyNzc0ZjVkLTkyZGMtNGU1MC1hMDlkLTkyOTEzMTM3NTE1Yjo6JGFhY2hfNGIxZTU5ZTYtMjQ2OS00NjI0LTkxYjItNDkzMTEwNTNlNzlj"

// Configuração do Axios para requisições à API Asaas
const asaasApi = axios.create({
  baseURL: ASAAS_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'access_token': ASAAS_API_KEY,
  },
});

// Interfaces TypeScript para os dados da API Asaas
export interface Customer {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  cpfCnpj: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  city?: string;
  state?: string;
  country?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
  additionalEmails?: string;
  municipalInscription?: string;
  stateInscription?: string;
  observations?: string;
  groupName?: string;
}

export interface Subscription {
  id?: string;
  customer: string;
  billingType: 'CREDIT_CARD' | 'BOLETO' | 'PIX';
  value: number;
  nextDueDate: string;
  cycle: 'MONTHLY' | 'YEARLY' | 'QUARTERLY' | 'SEMIANNUALLY';
  description?: string;
  externalReference?: string;
  maxPayments?: number;
  coupon?: string;
  discount?: {
    value?: number;
    dueDateLimitDays?: number;
    type?: 'FIXED' | 'PERCENTAGE';
  };
  fine?: {
    value?: number;
    type?: 'FIXED' | 'PERCENTAGE';
  };
  interest?: {
    value?: number;
    type?: 'PERCENTAGE';
  };
  postalService?: boolean;
  split?: Array<{
    walletId: string;
    fixedValue?: number;
    percentualValue?: number;
    totalFixedValue?: number;
  }>;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
    creditCardToken?: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    addressComplement?: string;
    phone: string;
    mobilePhone?: string;
  };
  remoteIp?: string;
}

export interface SubscriptionResponse {
  object: string;
  id: string;
  dateCreated: string;
  customer: string;
  paymentLink: string;
  invoiceUrl?: string;
  subscription: string;
  cycle: string;
  value: number;
  nextDueDate: string;
  description: string;
  status: string;
  statusDescription: string;
  externalReference?: string;
  maxPayments?: number;
  currentPayment?: any;
  payments?: any[];
  subscriptionDiscount?: any;
  subscriptionFine?: any;
  subscriptionInterest?: any;
  postalService?: boolean;
  split?: any;
  deleted?: boolean;
  creditCard?: any;
  creditCardHolderInfo?: any;
  remoteIp?: string;
  canBeDeleted?: boolean;
  canBeUpdated?: boolean;
  updateSubscriptionMandate?: boolean;
  lastInvoiceViewedDate?: string;
  lastPaymentViewedDate?: string;
  lastCreditCardViewedDate?: string;
  paymentErrorMessage?: string;
  fiscalDocument?: any;
  refundDescription?: string;
  anticipatedDate?: string;
  paymentProvider?: string;
  acquirerTid?: string;
  acquirerNsu?: string;
  acquirerAuthCode?: string;
  acquirerMessage?: string;
  acquirerReturnCode?: string;
  gatewayId?: string;
  cardLastFourDigits?: string;
  creditHolderInfo?: any;
  billingType?: string;
  daysPastDue?: number;
  daysUntilDue?: number;
  paymentDateFormatted?: string;
  dueDateFormatted?: string;
  nextDueDateFormatted?: string;
}

export interface Payment {
  id?: string;
  customer: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
  installmentCount?: number;
  installmentValue?: number;
  discount?: {
    value?: number;
    dueDateLimitDays?: number;
    type?: 'FIXED' | 'PERCENTAGE';
  };
  fine?: {
    value?: number;
    type?: 'FIXED' | 'PERCENTAGE';
  };
  interest?: {
    value?: number;
    type?: 'PERCENTAGE';
  };
  postalService?: boolean;
  split?: Array<{
    walletId: string;
    fixedValue?: number;
    percentualValue?: number;
    totalFixedValue?: number;
  }>;
  callback?: {
    successUrl?: string;
    autoRedirect?: boolean;
  };
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
    creditCardToken?: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    addressComplement?: string;
    phone: string;
    mobilePhone?: string;
  };
  remoteIp?: string;
}

export interface PaymentResponse {
  object: string;
  id: string;
  dateCreated: string;
  customer: string;
  paymentLink: string;
  boletoUrl?: string;
  boletoBarcode?: string;
  pixQrCode?: {
    encodedImage: string;
    payload: string;
  };
  invoiceUrl?: string;
  bankSlipUrl?: string;
  invoiceNumber?: string;
  dueDate: string;
  originalDueDate?: string;
  value: number;
  netValue: number;
  originalValue?: number;
  interestValue?: number;
  discountValue?: number;
  description: string;
  billingType: string;
  status: string;
  statusDescription: string;
  externalReference?: string;
  confirmedDate?: string;
  paymentDate?: string;
  clientPaymentDate?: string;
  installment?: string;
  invoiceReceived?: boolean;
  creditCardToken?: string;
  creditCardHolderInfo?: any;
  creditCard?: any;
  split?: any;
  deleted?: boolean;
  anticipated?: boolean;
  anticipateable?: boolean;
  anticipation?: any;
  postalService?: boolean;
  anticipationFees?: number;
  anticipationFee?: number;
  callback?: any;
  pixTransaction?: any;
  estimatedCreditDate?: string;
  transactionReceiptUrl?: string;
  authorizedAt?: string;
  nfeExternalReference?: string;
  nfeStatus?: string;
  nfeFee?: number;
  nfeLink?: string;
  lastInvoiceViewedDate?: string;
  lastBankSlipViewedDate?: string;
  lastCreditCardViewedDate?: string;
  paymentErrorMessage?: string;
  fiscalDocument?: any;
  refundDescription?: string;
  anticipatedDate?: string;
  paymentProvider?: string;
  acquirerTid?: string;
  acquirerNsu?: string;
  acquirerAuthCode?: string;
  acquirerMessage?: string;
  acquirerReturnCode?: string;
  gatewayId?: string;
  cardLastFourDigits?: string;
  creditHolderInfo?: any;
  daysOverdue?: number;
  daysPastDue?: number;
  daysUntilDue?: number;
  paymentDateFormatted?: string;
  dueDateFormatted?: string;
  originalDueDateFormatted?: string;
}

// Serviços da API Asaas
export const AsaasService = {
  // Criar cliente
  async createCustomer(customerData: Omit<Customer, 'id'>): Promise<Customer> {
    try {
      const response = await asaasApi.post('/customers', customerData);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error.response?.data || error.message);
      throw error;
    }
  },

  // Listar clientes
  async getCustomers(): Promise<Customer[]> {
    try {
      const response = await asaasApi.get('/customers');
      return response.data.data;
    } catch (error: any) {
      console.error('Erro ao listar clientes:', error.response?.data || error.message);
      throw error;
    }
  },

  // Criar cobrança
  async createPayment(paymentData: Omit<Payment, 'id'>): Promise<PaymentResponse> {
    try {
      const response = await asaasApi.post('/payments', paymentData);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar cobrança:', error.response?.data || error.message);
      throw error;
    }
  },

  // Listar cobranças
  async getPayments(customerId?: string): Promise<PaymentResponse[]> {
    try {
      const params = customerId ? { customer: customerId } : {};
      const response = await asaasApi.get('/payments', { params });
      return response.data.data;
    } catch (error: any) {
      console.error('Erro ao listar cobranças:', error.response?.data || error.message);
      throw error;
    }
  },

  // Obter detalhes de uma cobrança
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await asaasApi.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao obter cobrança:', error.response?.data || error.message);
      throw error;
    }
  },

  // Cancelar cobrança
  async cancelPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await asaasApi.post(`/payments/${paymentId}/cancel`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao cancelar cobrança:', error.response?.data || error.message);
      throw error;
    }
  },

  // Criar assinatura
  async createSubscription(subscriptionData: Omit<Subscription, 'id'>): Promise<SubscriptionResponse> {
    try {
      const response = await asaasApi.post('/subscriptions', subscriptionData);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar assinatura:', error.response?.data || error.message);
      throw error;
    }
  },

  // Listar assinaturas
  async getSubscriptions(customerId?: string): Promise<SubscriptionResponse[]> {
    try {
      const params = customerId ? { customer: customerId } : {};
      const response = await asaasApi.get('/subscriptions', { params });
      return response.data.data;
    } catch (error: any) {
      console.error('Erro ao listar assinaturas:', error.response?.data || error.message);
      throw error;
    }
  },

  // Obter detalhes de uma assinatura
  async getSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
    try {
      const response = await asaasApi.get(`/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao obter assinatura:', error.response?.data || error.message);
      throw error;
    }
  },

  // Cancelar assinatura
  async cancelSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
    try {
      const response = await asaasApi.post(`/subscriptions/${subscriptionId}/cancel`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao cancelar assinatura:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default AsaasService;
