import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useState } from 'react';
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
import { auth, db } from '../services/FirebaseConfig';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setCarregando(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      
      // Verificar status do pagamento no Firestore
      const userDoc = await getDoc(doc(db, 'usuarios', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        // Usuário não encontrado no Firestore (pode ser usuário antigo)
        Alert.alert('Atenção', 'Complete seu cadastro e assine o plano para acessar o aplicativo.');
        router.replace('/assinatura');
        return;
      }

      const userData = userDoc.data();
      
      // Verificar se o usuário já completou o onboarding
      if (!userData.onboardingCompleto) {
        Alert.alert(
          'Complete seu Perfil', 
          'Vamos personalizar seu aprendizado. Redirecionando para o onboarding...',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/onboarding')
            }
          ]
        );
        return;
      }
      
      if (userData.statusPagamento !== 'pago') {
        Alert.alert(
          'Pagamento Pendente', 
          'Você precisa assinar o plano para acessar o aplicativo. Redirecionando para a página de pagamento...',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/assinatura')
            }
          ]
        );
        return;
      }

      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      router.replace('/(tabs)/home');
    } catch (error: any) {
      let mensagemErro = 'Ocorreu um erro ao fazer login';
      
      if (error.code === 'auth/user-not-found') {
        mensagemErro = 'Usuário não encontrado';
      } else if (error.code === 'auth/wrong-password') {
        mensagemErro = 'Senha incorreta';
      } else if (error.code === 'auth/invalid-email') {
        mensagemErro = 'E-mail inválido';
      } else if (error.code === 'auth/too-many-requests') {
        mensagemErro = 'Muitas tentativas. Tente novamente mais tarde';
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
          <Text style={styles.title}>Bem-vindo</Text>
          <Text style={styles.subtitle}>Faça login para continuar</Text>

          <View style={styles.form}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu e-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />

            <TouchableOpacity 
              style={[styles.button, carregando && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={carregando}
            >
              <Text style={styles.buttonText}>
                {carregando ? 'Entrando...' : 'Entrar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkButton} 
              onPress={() => router.push('/cadastro')}
            >
              <Text style={styles.linkText}>
                Não tem uma conta? Cadastre-se
              </Text>
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
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 32,
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
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
