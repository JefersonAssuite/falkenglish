
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

export default {};
