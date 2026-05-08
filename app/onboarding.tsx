import { useRouter } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../services/FirebaseConfig';

export default function OnboardingScreen() {
  const router = useRouter();
  
  // Estados para as perguntas
  const [objetivo, setObjetivo] = useState('');
  const [nivelIngles, setNivelIngles] = useState('');
  const [habilidades, setHabilidades] = useState<string[]>([]);
  const [frequenciaEstudo, setFrequenciaEstudo] = useState('');
  const [tempoDiario, setTempoDiario] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Opções para as perguntas
  const objetivos = [
    { id: 'conversacao', label: 'Conversação' },
    { id: 'viagem', label: 'Viagem' },
    { id: 'trabalho', label: 'Trabalho' },
    { id: 'entrevistas', label: 'Entrevistas' },
    { id: 'outros', label: 'Outros' }
  ];

  const niveis = [
    { id: 'iniciante', label: 'Iniciante' },
    { id: 'basico', label: 'Básico' },
    { id: 'intermediario', label: 'Intermediário' },
    { id: 'avancado', label: 'Avançado' }
  ];

  const habilidadesOpcoes = [
    { id: 'conversacao', label: 'Conversação' },
    { id: 'escuta', label: 'Escuta' },
    { id: 'escrita', label: 'Escrita' },
    { id: 'todas', label: 'Todas as opções' }
  ];

  const frequencias = [
    { id: '1-2', label: '1–2 dias' },
    { id: '3-4', label: '3–4 dias' },
    { id: '5+', label: '5+ dias' }
  ];

  const tempos = [
    { id: '15', label: '15 min' },
    { id: '30', label: '30 min' },
    { id: '60+', label: '+ 1 hora' }
  ];

  const toggleHabilidade = (habilidadeId: string) => {
    if (habilidadeId === 'todas') {
      setHabilidades(['todas']);
    } else {
      const novasHabilidades = habilidades.includes(habilidadeId)
        ? habilidades.filter(h => h !== habilidadeId)
        : [...habilidades.filter(h => h !== 'todas'), habilidadeId];
      setHabilidades(novasHabilidades);
    }
  };

  const handleFinalizar = async () => {
    // Validações
    if (!objetivo) {
      Alert.alert('Atenção', 'Por favor, selecione seu objetivo com o inglês.');
      return;
    }

    if (!nivelIngles) {
      Alert.alert('Atenção', 'Por favor, selecione seu nível de inglês.');
      return;
    }

    if (habilidades.length === 0) {
      Alert.alert('Atenção', 'Por favor, selecione pelo menos uma habilidade que deseja melhorar.');
      return;
    }

    if (!frequenciaEstudo) {
      Alert.alert('Atenção', 'Por favor, selecione quantos dias por semana pretende estudar.');
      return;
    }

    if (!tempoDiario) {
      Alert.alert('Atenção', 'Por favor, selecione quanto tempo por dia pretende estudar.');
      return;
    }

    setCarregando(true);

    try {
      const usuario = auth.currentUser;
      if (!usuario) {
        throw new Error('Usuário não autenticado');
      }

      // Atualizar dados do onboarding no Firestore
      await updateDoc(doc(db, 'usuarios', usuario.uid), {
        nivelIngles,
        objetivo,
        habilidades,
        frequenciaEstudo,
        tempoDiario,
        onboardingCompleto: true,
        dataOnboarding: new Date().toISOString()
      });

      Alert.alert(
        'Perfeito!', 
        'Seu perfil foi personalizado! Agora finalize sua assinatura para começar a estudar.',
        [
          {
            text: 'Continuar',
            onPress: () => router.replace('/assinatura')
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao salvar onboarding:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar suas informações. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const renderOptionButton = (selected: string, value: string, label: string, onPress: () => void) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        selected === value && styles.optionButtonSelected
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.optionText,
        selected === value && styles.optionTextSelected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderCheckbox = (checked: boolean, label: string, onPress: () => void) => (
    <TouchableOpacity
      style={styles.checkboxContainer}
      onPress={onPress}
    >
      <View style={[
        styles.checkbox,
        checked && styles.checkboxChecked
      ]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Vamos Personalizar seu Aprendizado</Text>
          <Text style={styles.subtitle}>Responda algumas perguntas para personalizarmos sua experiência</Text>

          <View style={styles.form}>
            {/* Qual seu objetivo com o inglês? */}
            <Text style={styles.question}>Qual seu objetivo com o inglês?</Text>
            <View style={styles.optionsContainer}>
              {objetivos.map((opcao) => (
                <View key={opcao.id} style={styles.optionWrapper}>
                  {renderOptionButton(objetivo, opcao.id, opcao.label, () => setObjetivo(opcao.id))}
                </View>
              ))}
            </View>

            {/* Como você considera seu inglês? */}
            <Text style={styles.question}>Como você considera seu inglês?</Text>
            <View style={styles.optionsContainer}>
              {niveis.map((nivel) => (
                <View key={nivel.id} style={styles.optionWrapper}>
                  {renderOptionButton(nivelIngles, nivel.id, nivel.label, () => setNivelIngles(nivel.id))}
                </View>
              ))}
            </View>

            {/* Habilidades que quer melhorar */}
            <Text style={styles.question}>Habilidades que quer melhorar</Text>
            <View style={styles.checkboxContainer}>
              {habilidadesOpcoes.map((habilidade) => (
                <View key={habilidade.id} style={styles.checkboxWrapper}>
                  {renderCheckbox(habilidades.includes(habilidade.id), habilidade.label, () => toggleHabilidade(habilidade.id))}
                </View>
              ))}
            </View>

            {/* Quantos dias por semana pretende estudar? */}
            <Text style={styles.question}>Quantos dias por semana pretende estudar?</Text>
            <View style={styles.optionsContainer}>
              {frequencias.map((freq) => (
                <View key={freq.id} style={styles.optionWrapper}>
                  {renderOptionButton(frequenciaEstudo, freq.id, freq.label, () => setFrequenciaEstudo(freq.id))}
                </View>
              ))}
            </View>

            {/* Quanto tempo por dia pretende estudar? */}
            <Text style={styles.question}>Quanto tempo por dia pretende estudar?</Text>
            <View style={styles.optionsContainer}>
              {tempos.map((tempo) => (
                <View key={tempo.id} style={styles.optionWrapper}>
                  {renderOptionButton(tempoDiario, tempo.id, tempo.label, () => setTempoDiario(tempo.id))}
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.button, carregando && styles.buttonDisabled]} 
              onPress={handleFinalizar}
              disabled={carregando}
            >
              <Text style={styles.buttonText}>
                {carregando ? 'Salvando...' : 'Finalizar e Continuar'}
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
    lineHeight: 22,
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
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    marginTop: 24,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  optionWrapper: {
    width: '48%',
    marginBottom: 8,
  },
  optionButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: 'white',
  },
  checkboxContainer: {
    marginBottom: 16,
  },
  checkboxWrapper: {
    width: '48%',
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
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
});
