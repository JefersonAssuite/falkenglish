import { Video } from "expo-av";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, Text, View, Image, FlatList, TouchableOpacity, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { db } from "../../services/FirebaseConfig";
import { Button, Card, VStack, HStack } from "../../components/ui";

interface Biblioteca {
  id: string;
  nome: string;
  categoria: string;
  descricao?: string;
  imageUrl?: string;
  imagem_url?: string;
}

interface VideoItem {
  id: string;
  titulo: string;
  descricao?: string;
  videoUrl: string;
  video_url?: string;
  bibliotecaId: string;
  createdAt: any;
  storagePath?: string;
}

export default function LibraryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [biblioteca, setBiblioteca] = useState<Biblioteca | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      router.back();
      return;
    }

    // Carregar dados da biblioteca
    const bibliotecaDoc = doc(db, "bibliotecas", id as string);
    const unsubscribeBiblioteca = onSnapshot(bibliotecaDoc, (doc) => {
      if (doc.exists()) {
        setBiblioteca({ id: doc.id, ...doc.data() } as Biblioteca);
      } else {
        router.back();
      }
      setLoading(false);
    });

    // Carregar vídeos da biblioteca
    const videosQuery = query(
      collection(db, "videos"),
      where("bibliotecaId", "==", id),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribeVideos = onSnapshot(videosQuery, (snapshot) => {
      const videosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VideoItem[];
      setVideos(videosData);
    });

    return () => {
      unsubscribeBiblioteca();
      unsubscribeVideos();
    };
  }, [id, router]);

  const handleBack = () => {
    router.back();
  };

  const renderVideoItem = ({ item }: { item: VideoItem }) => {
    const videoUrl = item.videoUrl || item.video_url || '';

    return (
      <Card variant="elevated" style={{ marginBottom: 16 }}>
        <VStack>
          {/* Video Preview */}
          <View style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
            {videoUrl ? (
              <Video
                source={{ uri: videoUrl }}
                style={{ 
                  width: '100%', 
                  height: 200,
                  backgroundColor: '#000'
                }}
                useNativeControls
                resizeMode="contain"
              />
            ) : (
              <View style={{ 
                width: '100%', 
                height: 200, 
                backgroundColor: '#f3f4f6',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Feather name="video" size={48} color="#9ca3af" />
                <Text style={{ color: '#9ca3af', marginTop: 8 }}>Vídeo não disponível</Text>
              </View>
            )}
          </View>

          {/* Video Info */}
          <VStack style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>
              {item.titulo || 'Sem título'}
            </Text>
            
            {item.descricao && (
              <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8, lineHeight: 20 }}>
                {item.descricao}
              </Text>
            )}

            <Text style={{ fontSize: 12, color: '#9ca3af' }}>
              {item.createdAt ? 
                new Date(item.createdAt.seconds * 1000).toLocaleDateString('pt-BR') : 
                'Data não disponível'
              }
            </Text>
          </VStack>
        </VStack>
      </Card>
    );
  };

  if (loading) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <VStack style={{ padding: 20, paddingTop: 60 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
            <Text style={{ fontSize: 18, color: '#6b7280' }}>🔄 Carregando...</Text>
          </View>
        </VStack>
      </ScrollView>
    );
  }

  if (!biblioteca) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <VStack style={{ padding: 20, paddingTop: 60 }}>
          <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
            <Text style={{ fontSize: 18, color: '#6b7280' }}>Biblioteca não encontrada</Text>
            <Button
              onPress={handleBack}
              variant="outline"
              style={{ marginTop: 16 }}
            >
              Voltar
            </Button>
          </View>
        </VStack>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <VStack>
        {/* Header */}
        <View style={{ paddingTop: 60, paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={handleBack} style={{ marginBottom: 20 }}>
            <HStack alignItems="center">
              <Feather name="arrow-left" size={24} color="#374151" />
              <Text style={{ fontSize: 16, color: '#374151', marginLeft: 8 }}>Voltar</Text>
            </HStack>
          </TouchableOpacity>
        </View>

        {/* Biblioteca Header */}
        <Card variant="elevated" style={{ margin: 20, marginBottom: 24 }}>
          <VStack>
            {/* Imagem da Biblioteca */}
            <View style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
              <Image
                source={{ 
                  uri: biblioteca.imageUrl || biblioteca.imagem_url || 'https://via.placeholder.com/400x200' 
                }}
                style={{ 
                  width: '100%', 
                  height: 200,
                  backgroundColor: '#f3f4f6'
                }}
                resizeMode="cover"
              />
            </View>

            {/* Info da Biblioteca */}
            <VStack style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>
                {biblioteca.nome}
              </Text>
              
              <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 12 }}>
                {biblioteca.categoria}
              </Text>
              
              <Text style={{ fontSize: 14, color: '#4b5563', lineHeight: 20 }}>
                {biblioteca.descricao || "Nenhuma descrição disponível."}
              </Text>
            </VStack>
          </VStack>
        </Card>

        {/* Seção de Vídeos */}
        <VStack style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          <HStack justifyContent="space-between" alignItems="center" style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937' }}>
              Vídeos ({videos.length})
            </Text>
            
            {/* Futuro: Botão para adicionar vídeos (se necessário) */}
            {videos.length === 0 && (
              <Button variant="ghost" size="sm">
                <Feather name="plus" size={16} color="#3b82f6" />
              </Button>
            )}
          </HStack>

          {videos.length === 0 ? (
            <Card variant="outlined" style={{ padding: 40, alignItems: 'center' }}>
              <VStack alignItems="center">
                <Feather name="video-off" size={48} color="#9ca3af" />
                <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 12, marginBottom: 16 }}>
                  Nenhum vídeo encontrado
                </Text>
                <Text style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center' }}>
                  Esta biblioteca ainda não possui vídeos disponíveis.
                </Text>
              </VStack>
            </Card>
          ) : (
            <FlatList
              data={videos}
              keyExtractor={(item) => item.id}
              renderItem={renderVideoItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </VStack>
      </VStack>
    </ScrollView>
  );
}
