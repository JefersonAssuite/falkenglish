import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { auth } from '../services/FirebaseConfig';
import UserSubscriptionService from '../services/UserSubscriptionService';

type Router = ReturnType<typeof useRouter>;

export default function HomeScreen() {
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verificarAcesso = async () => {
      const usuario = auth.currentUser;
      
      if (!usuario) {
        // Se não houver usuário logado, redirecionar para login
        router.replace('/login');
        return;
      }

      setNomeUsuario(usuario.displayName || 'Usuário');

      // Verificar se o usuário tem assinatura ativa
      const temAcesso = await UserSubscriptionService.hasUserAccess();
      
      if (!temAcesso) {
        // Se não tiver assinatura, redirecionar para tela de assinatura
        (router as any).replace('/assinatura');
        return;
      }
      
      setCarregando(false);
    };

    verificarAcesso();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (carregando) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Bem-vindo ao App</Text>
          <Text style={styles.userName}>{nomeUsuario}!</Text>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              🎉 Login realizado com sucesso!
            </Text>
            <Text style={styles.cardDescription}>
              Você está autenticado e pode acessar todas as funcionalidades do aplicativo.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.paymentButton} 
            onPress={() => (router as any).push('/assinatura')}
          >
            <Text style={styles.paymentButtonText}>💳 Gerenciar Assinatura</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.listButton} 
            onPress={() => (router as any).push('/listar-pagamentos')}
          >
            <Text style={styles.listButtonText}>📋 Meus Pagamentos</Text>
          </TouchableOpacity>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Funcionalidades disponíveis:</Text>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>✓ Autenticação segura com Firebase</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>✓ Cadastro de novos usuários</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>✓ Login e logout</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>✓ Pagamentos com Asaas</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureText}>✓ Interface responsiva</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  userName: {
    fontSize: 24,
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 8,
  },
  mainContent: {
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
  },
  featuresContainer: {
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
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  featureItem: {
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  paymentButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginVertical: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  listButton: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
