import Feather from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Alert,
  Image,
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

export default function CadastroScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [pais, setPais] = useState('');
  const [cidade, setCidade] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const formatarTelefone = (telefone: string) => {
    return telefone
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const formatarData = (data: string) => {
    return data
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{4})\d+?$/, '$1');
  };

  const selecionarImagem = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setFotoPerfil(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const handleCadastro = async () => {
    // Validações dos campos obrigatórios
    if (!nome || !email || !senha || !confirmarSenha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    setCarregando(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      
      // Atualizar o perfil do usuário com o nome e foto
      await updateProfile(userCredential.user, {
        displayName: nome,
        photoURL: fotoPerfil
      });

      // Salvar dados do usuário no Firestore com status de pagamento pendente
      await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
        uid: userCredential.user.uid,
        nome: nome,
        email: email,
        telefone: telefone || '',
        foto: fotoPerfil || '',
        dataNascimento: dataNascimento || '',
        pais: pais || '',
        cidade: cidade || '',
        statusPagamento: 'pendente', //pendente, pago, cancelado
        dataCadastro: serverTimestamp(),
        dataPagamento: null,
        assinaturaId: null,
        customerId: null,
        // Campos do onboarding (serão preenchidos depois)
        nivelIngles: '',
        objetivo: '',
        habilidades: [],
        frequenciaEstudo: '',
        tempoDiario: ''
      });

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso! Vamos personalizar seu aprendizado.');
      router.replace('/onboarding');
    } catch (error: any) {
      let mensagemErro = 'Ocorreu um erro ao cadastrar';
      
      if (error.code === 'auth/email-already-in-use') {
        mensagemErro = 'Este e-mail já está em uso';
      } else if (error.code === 'auth/weak-password') {
        mensagemErro = 'A senha é muito fraca';
      } else if (error.code === 'auth/invalid-email') {
        mensagemErro = 'E-mail inválido';
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
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Preencha os dados para se cadastrar</Text>

          <View style={styles.form}>
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

            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />

            <Text style={styles.label}>Confirmar Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirme sua senha"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry
            />

            {/* Foto de Perfil */}
            <View style={styles.photoContainer}>
              <Text style={styles.label}>Foto de Perfil (Opcional)</Text>
              <TouchableOpacity style={styles.photoButton} onPress={selecionarImagem}>
                {fotoPerfil ? (
                  <Image source={{ uri: fotoPerfil }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Feather name="camera" size={24} color="#9ca3af" />
                    <Text style={styles.photoText}>Adicionar foto</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Campos Opcionais */}
            <Text style={styles.sectionTitle}>Informações Adicionais (Opcional)</Text>
            
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              value={telefone}
              onChangeText={(text) => setTelefone(formatarTelefone(text))}
              keyboardType="phone-pad"
              maxLength={15}
            />

            <Text style={styles.label}>Data de Nascimento</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              value={dataNascimento}
              onChangeText={(text) => setDataNascimento(formatarData(text))}
              keyboardType="numeric"
              maxLength={10}
            />

            <Text style={styles.label}>País</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu país"
              value={pais}
              onChangeText={setPais}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Cidade</Text>
            <TextInput
              style={styles.input}
              placeholder="Sua cidade"
              value={cidade}
              onChangeText={setCidade}
              autoCapitalize="words"
            />

            <TouchableOpacity 
              style={[styles.button, carregando && styles.buttonDisabled]} 
              onPress={handleCadastro}
              disabled={carregando}
            >
              <Text style={styles.buttonText}>
                {carregando ? 'Cadastrando...' : 'Cadastrar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkButton} 
              onPress={() => router.push('/login')}
            >
              <Text style={styles.linkText}>
                Já tem uma conta? Faça login
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    marginTop: 24,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
});
