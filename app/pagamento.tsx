import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { AsaasService, Customer, Payment } from '../services/AsaasConfig';
import { auth } from '../services/FirebaseConfig';
import PaymentStatusService from '../services/PaymentStatus';

export default function PagamentoScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState<'BOLETO' | 'PIX' | 'CREDIT_CARD'>('BOLETO');
  const [carregando, setCarregando] = useState(false);
  const [clienteId, setClienteId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const usuario = auth.currentUser;
    if (usuario) {
      setNome(usuario.displayName || '');
      setEmail(usuario.email || '');
    }
  }, []);

  const formatarCPF = (cpf: string) => {
    return cpf
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatarTelefone = (telefone: string) => {
    return telefone
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const formatarValor = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    const centavos = numeros.slice(-2);
    const reais = numeros.slice(0, -2);
    return reais ? `${reais},${centavos.padStart(2, '0')}` : `0,${centavos.padStart(2, '0')}`;
  };

  const converterParaDecimal = (valorFormatado: string): number => {
    const numeros = valorFormatado.replace(/\D/g, '');
    return parseFloat(numeros) / 100;
  };

  const validarCPF = (cpf: string) => {
    const cpfLimpo = cpf.replace(/\D/g, '');
    return cpfLimpo.length === 11;
  };

  const handleCriarPagamento = async () => {
    if (!nome || !email || !cpf || !valor) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!validarCPF(cpf)) {
      Alert.alert('Erro', 'CPF inválido');
      return;
    }

    const valorDecimal = converterParaDecimal(valor);
    if (valorDecimal <= 0) {
      Alert.alert('Erro', 'Valor deve ser maior que zero');
      return;
    }

    setCarregando(true);

    try {
      // Criar ou obter cliente
      let customerId = clienteId;
      
      if (!customerId) {
        const customerData: Omit<Customer, 'id'> = {
          name: nome,
          email: email,
          cpfCnpj: cpf.replace(/\D/g, ''),
          phone: telefone.replace(/\D/g, ''),
          mobilePhone: telefone.replace(/\D/g, ''),
        };

        const customer = await AsaasService.createCustomer(customerData);
        customerId = customer.id || null;
        setClienteId(customerId);
      }

      // Criar pagamento
      const paymentData: Omit<Payment, 'id'> = {
        customer: customerId!,
        billingType: metodoPagamento,
        value: valorDecimal,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias a partir de hoje
        description: descricao || 'Pagamento gerado pelo app',
      };

      const pagamento = await AsaasService.createPayment(paymentData);

      // Marcar que o usuário realizou pagamento
      await PaymentStatusService.markPaymentCompleted();

      // Mostrar informações do pagamento
      let mensagem = `Pagamento criado com sucesso!\n\n`;
      mensagem += `ID: ${pagamento.id}\n`;
      mensagem += `Valor: R$ ${pagamento.value.toFixed(2)}\n`;
      mensagem += `Status: ${pagamento.statusDescription}\n`;
      mensagem += `Vencimento: ${pagamento.dueDate}\n\n`;

      if (metodoPagamento === 'BOLETO' && pagamento.boletoUrl) {
        mensagem += `Link do boleto: ${pagamento.boletoUrl}`;
      } else if (metodoPagamento === 'PIX' && pagamento.pixQrCode) {
        mensagem += `Chave PIX disponível`;
      }

      Alert.alert('Sucesso', mensagem, [
        {
          text: 'OK',
          onPress: () => (router as any).push('/home')
        }
      ]);

    } catch (error: any) {
      console.error('Erro ao criar pagamento:', error);
      let mensagemErro = 'Ocorreu um erro ao processar o pagamento';
      
      if (error.response?.data?.errors) {
        const erros = error.response.data.errors;
        mensagemErro = erros.map((e: any) => e.description).join('\n');
      }
      
      Alert.alert('Erro', mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Novo Pagamento</Text>
          <Text style={styles.subtitle}>Preencha os dados para gerar uma cobrança</Text>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Dados do Cliente</Text>
            
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome completo"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o e-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              value={cpf}
              onChangeText={(text) => setCpf(formatarCPF(text))}
              keyboardType="numeric"
              maxLength={14}
            />

            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              value={telefone}
              onChangeText={(text) => setTelefone(formatarTelefone(text))}
              keyboardType="phone-pad"
              maxLength={15}
            />

            <Text style={styles.sectionTitle}>Dados do Pagamento</Text>

            <Text style={styles.label}>Valor (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00"
              value={valor}
              onChangeText={(text) => setValor(formatarValor(text))}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descrição do pagamento"
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Método de Pagamento</Text>
            <View style={styles.paymentMethods}>
              {(['BOLETO', 'PIX', 'CREDIT_CARD'] as const).map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentMethod,
                    metodoPagamento === method && styles.paymentMethodSelected
                  ]}
                  onPress={() => setMetodoPagamento(method)}
                >
                  <Text style={[
                    styles.paymentMethodText,
                    metodoPagamento === method && styles.paymentMethodTextSelected
                  ]}>
                    {method === 'BOLETO' ? 'Boleto' : method === 'PIX' ? 'PIX' : 'Cartão'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.button, carregando && styles.buttonDisabled]} 
              onPress={handleCriarPagamento}
              disabled={carregando}
            >
              <Text style={styles.buttonText}>
                {carregando ? 'Processando...' : 'Gerar Pagamento'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => router.push('/home')}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  paymentMethod: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  paymentMethodSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#666',
  },
  paymentMethodTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});
