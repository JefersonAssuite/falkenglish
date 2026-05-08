import { Feather } from "@expo/vector-icons";
import { Video } from "expo-av";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import BibliotecaCard from "../../components/BibliotecaCard";
import { Button, Card, HStack, VStack } from "../../components/ui";
import { auth, db } from "../../services/FirebaseConfig";
import { formatDateTime } from "../../utils/dateUtils";

interface Biblioteca {
  id: string;
  nome: string;
  categoria: string;
  imagem_url?: string;
  descricao?: string;
}

interface Message {
  id: string;
  titulo?: string;
  message: string;
  midia_url?: string;
  created_at: any;
}

export default function Home() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [bibliotecas, setBibliotecas] = useState<Biblioteca[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  useEffect(() => {
    // Carregar dados do usuário
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Pegar nome do auth ou do firestore
        const displayName = user.displayName || '';
        const photoURL = user.photoURL || null;
        
        setUserName(displayName);
        setUserPhoto(photoURL);
        
        // Tentar pegar dados mais completos do firestore
        try {
          const userDocRef = doc(db, 'usuarios', user.uid);
          const unsubscribeUserDoc = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              const data = doc.data();
              setUserData(data);
              // Usar nome do firestore se não tiver no auth
              if (!displayName && data.nome) {
                setUserName(data.nome);
              }
              // Usar foto do firestore se não tiver no auth
              if (!photoURL && data.foto) {
                setUserPhoto(data.foto);
              }
            }
          });
          
          return () => unsubscribeUserDoc();
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
        }
      }
    });

    const unsubscribeBibliotecas = onSnapshot(
      collection(db, "bibliotecas"),
      (snapshot) => {
        setBibliotecas(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Biblioteca[]
        );
      }
    );

    const unsubscribeMessages = onSnapshot(
      collection(db, "messages"),
      (snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Message[]
        );
      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeBibliotecas();
      unsubscribeMessages();
    };
  }, []);

  const cotidiano = bibliotecas.filter(
    (b) => b.categoria === "Cotidiano"
  );

  const modulos = bibliotecas.filter(
    (b) => b.categoria === "Módulos"
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* HEADER PERSONALIZADO */}
      <View style={{ 
        backgroundColor: '#000080', 
        paddingTop: 60, 
        paddingHorizontal: 20, 
        paddingBottom: 20 
      }}>
        <HStack alignItems="center" justifyContent="space-between">
          <HStack alignItems="center" space={12}>
            {/* Foto de Perfil Circular */}
            {userPhoto ? (
              <Image 
                source={{ uri: userPhoto }} 
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  borderWidth: 2,
                  borderColor: '#ffffff'
                }}
              />
            ) : (
              <View style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: '#ffffff',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#ffffff'
              }}>
                <Text style={{
                  fontSize: 10,
                  color: '#000080',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Perfil sem foto
                </Text>
              </View>
            )}
            
            {/* Mensagem de Boas-vindas */}
            <View>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#ffffff'
              }}>
                Hello, {userName || 'Usuário'}!
              </Text>
              <Text style={{
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                Bem-vindo de volta
              </Text>
            </View>
          </HStack>
          
          {/* Botão de Logout */}
          <TouchableOpacity onPress={handleLogout}>
            <Feather name="log-out" size={24} color="#ffffff" />
          </TouchableOpacity>
        </HStack>
      </View>

      {/* Cotidiano */}
      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 }}>
          Cotidiano
        </Text>

        {cotidiano.length === 0 ? (
          <Text style={{ color: '#6b7280' }}>Nenhuma biblioteca encontrada.</Text>
        ) : (
          <FlatList
            horizontal
            data={cotidiano}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
            renderItem={({ item }) => (
              <BibliotecaCard
                item={item}
                size="large"
                onPress={() =>
                  router.push('/library/' + item.id)
                }
              />
            )}
          />
        )}
      </View>

      {/* Módulos */}
      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 }}>
          Módulos
        </Text>

        {modulos.length === 0 ? (
          <Text style={{ color: '#6b7280' }}>Nenhuma biblioteca encontrada.</Text>
        ) : (
          <FlatList
            horizontal
            data={modulos}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
            renderItem={({ item }) => (
              <BibliotecaCard
                item={item}
                size="small"
                onPress={() =>
                  router.push('/library/' + item.id)
                }
              />
            )}
          />
        )}
      </View>
      
      <VStack space={16} style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <Button onPress={() => router.push("/assinatura")}>
          <Text>Assinar</Text>
        </Button>

        <Button
          onPress={handleLogout}
          style={{ backgroundColor: '#ef4444' }}
        >
          <Text style={{ color: '#ffffff' }}>Sair</Text>
        </Button>
      </VStack>

      {/* NOVIDADES */}
      <View style={{ paddingHorizontal: 16, marginTop: 32, marginBottom: 40 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 }}>
          Novidades da Semana
        </Text>

        {messages.length === 0 ? (
          <Text style={{ color: '#6b7280' }}>Nenhuma mensagem encontrada.</Text>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Card
                variant="outlined"
                style={{
                  backgroundColor: '#f3f4f6',
                  padding: 16,
                  marginBottom: 16,
                  borderRadius: 12,
                }}
              >
                <VStack space={8}>
                  <Text style={{ fontWeight: 'bold', color: '#1f2937' }}>
                    {item.titulo || "Sem título"}
                  </Text>

                  {item.midia_url && (
                    item.midia_url.endsWith(".mp4") ? (
                      <Video
                        source={{ uri: item.midia_url }}
                        useNativeControls
                        resizeMode="contain"
                        style={{
                          width: "100%",
                          height: 200,
                          marginVertical: 8,
                          borderRadius: 12,
                        }}
                      />
                    ) : (
                      <Image
                        source={{ uri: item.midia_url }}
                        style={{
                          width: "100%",
                          height: 200,
                          borderRadius: 12,
                          marginVertical: 8,
                        }}
                        resizeMode="cover"
                      />
                    )
                  )}

                  <Text style={{ color: '#4b5563' }}>{item.message}</Text>

                  <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
                    {formatDateTime(item.created_at)}
                  </Text>
                </VStack>
              </Card>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}
