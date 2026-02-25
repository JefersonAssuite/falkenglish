import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { AsaasService, PaymentResponse } from '../services/AsaasConfig';

export default function ListarPagamentosScreen() {
  const [pagamentos, setPagamentos] = useState<PaymentResponse[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const router = useRouter();

  const carregarPagamentos = async () => {
    try {
      const response = await AsaasService.getPayments();
      setPagamentos(response);
    } catch (error: any) {
      console.error('Erro ao carregar pagamentos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os pagamentos');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  };

  useEffect(() => {
    carregarPagamentos();
  }, []);

  const onRefresh = () => {
    setAtualizando(true);
    carregarPagamentos();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#FF9500';
      case 'CONFIRMED':
        return '#34C759';
      case 'OVERDUE':
        return '#FF3B30';
      case 'RECEIVED':
        return '#34C759';
      case 'REFUNDED':
        return '#8E8E93';
      default:
        return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'CONFIRMED':
        return 'Confirmado';
      case 'OVERDUE':
        return 'Vencido';
      case 'RECEIVED':
        return 'Recebido';
      case 'REFUNDED':
        return 'Reembolsado';
      default:
        return status;
    }
  };

  const getBillingTypeText = (billingType: string) => {
    switch (billingType) {
      case 'BOLETO':
        return 'Boleto';
      case 'PIX':
        return 'PIX';
      case 'CREDIT_CARD':
        return 'Cartão';
      case 'UNDEFINED':
        return 'Indefinido';
      default:
        return billingType;
    }
  };

  const formatarData = (data: string) => {
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const renderPagamento = ({ item }: { item: PaymentResponse }) => (
    <View style={styles.pagamentoCard}>
      <View style={styles.pagamentoHeader}>
        <Text style={styles.pagamentoId}>ID: {item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.pagamentoInfo}>
        <Text style={styles.pagamentoDescription}>{item.description}</Text>
        <Text style={styles.pagamentoValue}>{formatarValor(item.value)}</Text>
      </View>
      
      <View style={styles.pagamentoDetails}>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Método:</Text> {getBillingTypeText(item.billingType)}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.detailLabel}>Vencimento:</Text> {formatarData(item.dueDate)}
        </Text>
        {item.paymentDate && (
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Pagamento:</Text> {formatarData(item.paymentDate)}
          </Text>
        )}
      </View>

      {item.boletoUrl && (
        <TouchableOpacity 
          style={styles.boletoButton}
          onPress={() => Alert.alert('Boleto', `Link do boleto: ${item.boletoUrl}`)}
        >
          <Text style={styles.boletoButtonText}>Ver Boleto</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (carregando) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando pagamentos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Pagamentos</Text>
        <TouchableOpacity 
          style={styles.newPaymentButton}
          onPress={() => (router as any).push('/pagamento')}
        >
          <Text style={styles.newPaymentButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      {pagamentos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum pagamento encontrado</Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => (router as any).push('/pagamento')}
          >
            <Text style={styles.emptyButtonText}>Criar primeiro pagamento</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pagamentos}
          renderItem={renderPagamento}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={atualizando} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  newPaymentButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newPaymentButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  pagamentoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pagamentoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pagamentoId: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  pagamentoInfo: {
    marginBottom: 12,
  },
  pagamentoDescription: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  pagamentoValue: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  pagamentoDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailLabel: {
    fontWeight: '600',
  },
  boletoButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  boletoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
