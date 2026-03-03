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
import { Customer } from '../services/AsaasConfig';
import CloudFunctionsService from '../services/CloudFunctionsService';
import { auth } from '../services/FirebaseConfig';
import SubscriptionService from '../services/SubscriptionService';
import UserSubscriptionService from '../services/UserSubscriptionService';

export default function AssinaturaScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [numeroCartao, setNumeroCartao] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [emailCartao, setEmailCartao] = useState('');
  const [cpfCartao, setCpfCartao] = useState('');
  const [telefoneCartao, setTelefoneCartao] = useState('');
  const [cepCartao, setCepCartao] = useState('');
  const [enderecoCartao, setEnderecoCartao] = useState('');
  const [numeroEnderecoCartao, setNumeroEnderecoCartao] = useState('');
  const [validadeMes, setValidadeMes] = useState('');
  const [validadeAno, setValidadeAno] = useState('');
  const [cvv, setCvv] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [clienteId, setClienteId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const usuario = auth.currentUser;
    if (usuario) {
      const nomeCompleto = usuario.displayName || '';
      const emailUsuario = usuario.email || '';
      
      // Preencher dados pessoais
      setNome(nomeCompleto);
      setEmail(emailUsuario);
      
      // Preencher dados do titular do cartão com os mesmos dados
      setNomeCartao(nomeCompleto);
      setEmailCartao(emailUsuario);
      setCpfCartao(''); // Deixar vazio para usuário preencher
      setTelefoneCartao('');
      setCepCartao('');
      setEnderecoCartao('');
      setNumeroEnderecoCartao('');
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

  const formatarCEP = (cep: string) => {
    return cep
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const formatarCartao = (cartao: string) => {
    const numeros = cartao.replace(/\D/g, '');
    const grupos = numeros.match(/(\d{1,4})/g) || [];
    return grupos.join(' ').substr(0, 19); // Máximo 19 caracteres (16 dígitos + 3 espaços)
  };

  const validarCPF = (cpf: string) => {
    const cpfLimpo = cpf.replace(/\D/g, '');
    return cpfLimpo.length === 11;
  };

  const validarCartao = () => {
    const numeros = numeroCartao.replace(/\D/g, '');
    return numeros.length === 16;
  };

  const validarValidade = () => {
    const mes = parseInt(validadeMes);
    const ano = parseInt(validadeAno);
    const anoAtual = new Date().getFullYear() % 100;
    const mesAtual = new Date().getMonth() + 1;
    
    return mes >= 1 && mes <= 12 && 
           ano >= anoAtual && 
           (ano > anoAtual || mes >= mesAtual);
  };

  const handleCriarAssinatura = async () => {
    if (!nome || !email || !cpf || !telefone) {
      Alert.alert('Erro', 'Por favor, preencha todos os dados pessoais');
      return;
    }

    if (!validarCPF(cpf)) {
      Alert.alert('Erro', 'CPF inválido');
      return;
    }

    // Validações do titular do cartão
    if (!nomeCartao) {
      Alert.alert('Erro', 'Informe o nome do titular do cartão.');
      return;
    }

    if (!emailCartao) {
      Alert.alert('Erro', 'Informe o email do titular do cartão.');
      return;
    }

    if (!cpfCartao) {
      Alert.alert('Erro', 'Informe o CPF ou CNPJ do titular do cartão.');
      return;
    }

    if (!telefoneCartao) {
      Alert.alert('Erro', 'Informe o número de contato com DDD do titular do cartão.');
      return;
    }

    if (!cepCartao) {
      Alert.alert('Erro', 'Informe o CEP do titular do cartão.');
      return;
    }

    if (!numeroEnderecoCartao) {
      Alert.alert('Erro', 'Informe o número do endereço do titular do cartão.');
      return;
    }

    if (!validarCartao()) {
      Alert.alert('Erro', 'Número do cartão inválido');
      return;
    }

    if (!validadeMes || !validadeAno) {
      Alert.alert('Erro', 'Por favor, preencha a data de validade do cartão');
      return;
    }

    if (!validarValidade()) {
      Alert.alert('Erro', 'Data de validade inválida');
      return;
    }

    if (cvv.length < 3 || cvv.length > 4) {
      Alert.alert('Erro', 'CVV inválido');
      return;
    }

    if (!validarCPF(cpfCartao)) {
      Alert.alert('Erro', 'CPF do titular do cartão inválido');
      return;
    }

    setCarregando(true);

   try {
  // Criar ou obter cliente
  let customerIdFinal = clienteId;

  if (!customerIdFinal) {
    const customerData: Omit<Customer, 'id'> = {
      name: nome,
      email: email,
      cpfCnpj: cpf.replace(/\D/g, ''),
      phone: telefone.replace(/\D/g, ''),
      mobilePhone: telefone.replace(/\D/g, ''),
    };

    const response = await CloudFunctionsService.createCustomer(customerData);

    console.log("RETORNO CREATE CUSTOMER:", response);

    customerIdFinal = response?.customer?.id ?? null;

    if (!customerIdFinal) {
      throw new Error('Não foi possível obter ID do cliente');
    }

    setClienteId(customerIdFinal);
  }

  // Criar assinatura
  const creditCardData = {
    holderName: nomeCartao,
    number: numeroCartao.replace(/\D/g, ''),
    expiryMonth: validadeMes,
    expiryYear: validadeAno,
    ccv: cvv,
  };

  const creditCardHolderInfo = {
    name: nomeCartao,
    email: emailCartao,
    cpfCnpj: cpfCartao.replace(/\D/g, ''),
    postalCode: cepCartao.replace(/\D/g, ''),
    addressNumber: numeroEnderecoCartao,
    addressComplement: '',
    phone: telefoneCartao.replace(/\D/g, ''),
    mobilePhone: telefoneCartao.replace(/\D/g, ''),
  };

      const assinatura = await SubscriptionService.createMonthlySubscription(
        customerIdFinal,
        creditCardData,
        creditCardHolderInfo
      );

      // Marcar que o usuário realizou assinatura
      await UserSubscriptionService.createUserSubscription(
        assinatura.id,
        customerIdFinal
      );

      // Mostrar informações da assinatura
      let mensagem = `Assinatura criada com sucesso!\n\n`;
      mensagem += `Plano: ${SubscriptionService.getSubscriptionDescription()}\n`;
      mensagem += `Valor: ${SubscriptionService.formatSubscriptionValue()}/mês\n`;
      mensagem += `Status: ${SubscriptionService.getSubscriptionStatusText(assinatura.status)}\n`;
      mensagem += `Próxima cobrança: ${assinatura.nextDueDate}\n\n`;
      mensagem += `Sua assinatura está ativa!`;

      Alert.alert('Sucesso', mensagem, [
        {
          text: 'OK',
          onPress: () => (router as any).push('/home')
        }
      ]);

    } catch (error: any) {
      console.error('Erro ao criar assinatura:', error);
      let mensagemErro = 'Ocorreu um erro ao processar sua assinatura';
      
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
          <Text style={styles.title}>Assinatura Premium</Text>
          <Text style={styles.subtitle}>
            Acesso total ao aplicativo por apenas {SubscriptionService.formatSubscriptionValue()}/mês
          </Text>

          <View style={styles.planCard}>
            <Text style={styles.planTitle}>🎯 Plano Mensal</Text>
            <Text style={styles.planPrice}>{SubscriptionService.formatSubscriptionValue()}</Text>
            <Text style={styles.planPeriod}>por mês</Text>
            
            <View style={styles.benefitsList}>
              <Text style={styles.benefitItem}>✓ Acesso completo ao app</Text>
              <Text style={styles.benefitItem}>✓ Pagamentos ilimitados</Text>
              <Text style={styles.benefitItem}>✓ Suporte prioritário</Text>
              <Text style={styles.benefitItem}>✓ Cancelamento a qualquer momento</Text>
            </View>
          </View>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>
            
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome completo"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu e-mail"
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

            <Text style={styles.sectionTitle}>Dados do Titular do Cartão</Text>

            <Text style={styles.label}>Nome Completo (Titular)</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome como está no cartão"
              value={nomeCartao}
              onChangeText={setNomeCartao}
              autoCapitalize="words"
            />

            <Text style={styles.label}>E-mail (Titular)</Text>
            <TextInput
              style={styles.input}
              placeholder="E-mail do titular do cartão"
              value={emailCartao}
              onChangeText={setEmailCartao}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>CPF (Titular)</Text>
            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              value={cpfCartao}
              onChangeText={(text) => setCpfCartao(formatarCPF(text))}
              keyboardType="numeric"
              maxLength={14}
            />

            <Text style={styles.label}>Telefone (Titular)</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              value={telefoneCartao}
              onChangeText={(text) => setTelefoneCartao(formatarTelefone(text))}
              keyboardType="phone-pad"
              maxLength={15}
            />

            <Text style={styles.label}>CEP (Titular)</Text>
            <TextInput
              style={styles.input}
              placeholder="00000-000"
              value={cepCartao}
              onChangeText={(text) => setCepCartao(formatarCEP(text))}
              keyboardType="numeric"
              maxLength={9}
            />

            <Text style={styles.label}>Número do Endereço (Titular)</Text>
            <TextInput
              style={styles.input}
              placeholder="Número"
              value={numeroEnderecoCartao}
              onChangeText={setNumeroEnderecoCartao}
              keyboardType="numeric"
            />

            <Text style={styles.sectionTitle}>Dados do Cartão</Text>

            <Text style={styles.label}>Nome no Cartão</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome como está no cartão"
              value={nomeCartao}
              onChangeText={setNomeCartao}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Número do Cartão</Text>
            <TextInput
              style={styles.input}
              placeholder="0000 0000 0000 0000"
              value={numeroCartao}
              onChangeText={(text) => setNumeroCartao(formatarCartao(text))}
              keyboardType="numeric"
              maxLength={19}
            />

            <View style={styles.validadeRow}>
              <View style={styles.validadeHalf}>
                <Text style={styles.label}>Mês</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM"
                  value={validadeMes}
                  onChangeText={setValidadeMes}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              
              <View style={styles.validadeHalf}>
                <Text style={styles.label}>Ano</Text>
                <TextInput
                  style={styles.input}
                  placeholder="AA"
                  value={validadeAno}
                  onChangeText={setValidadeAno}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              
              <View style={styles.cvvContainer}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, carregando && styles.buttonDisabled]} 
              onPress={handleCriarAssinatura}
              disabled={carregando}
            >
              <Text style={styles.buttonText}>
                {carregando ? 'Processando...' : `Assinar por ${SubscriptionService.formatSubscriptionValue()}/mês`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => (router as any).push('/login')}
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
  planCard: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  planPeriod: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  benefitsList: {
    width: '100%',
  },
  benefitItem: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
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
  validadeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  validadeHalf: {
    flex: 0.3,
  },
  cvvContainer: {
    flex: 0.3,
  },
  button: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
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
