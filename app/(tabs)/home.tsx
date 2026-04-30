import { Feather } from "@expo/vector-icons";
import { Video } from "expo-av";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, Image, ScrollView, Text, View } from "react-native";
import BibliotecaCard from "../../components/BibliotecaCard";
import { Button, Card, HStack, VStack } from "../../components/ui";
import { auth, db } from "../../services/FirebaseConfig";

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
  created_at: {
    seconds: number;
  };
}

export default function Home() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [bibliotecas, setBibliotecas] = useState<Biblioteca[]>([]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  useEffect(() => {
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
      {/* HEADER */}
      <View style={{ paddingTop: 24 }}>
        <HStack
          style={{ paddingHorizontal: 16 }}
          alignItems="center"
          justifyContent="space-between"
        >
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>
            Talk
          </Text>

          <Button
            variant="ghost"
            onPress={handleLogout}
            style={{ minWidth: 44, minHeight: 44 }}
          >
            <Feather name="log-out" size={24} color="#000000" />
          </Button>
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
                    {new Date(
                      item.created_at.seconds * 1000
                    ).toLocaleString()}
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
