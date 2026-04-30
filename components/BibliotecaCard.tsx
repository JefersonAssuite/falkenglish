import { LinearGradient } from 'expo-linear-gradient';
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Biblioteca {
  id: string;
  nome: string;
  categoria: string;
  imagem_url?: string;
  imageUrl?: string; // Adicionado para compatibilidade
  descricao?: string;
}

interface BibliotecaCardProps {
  item: Biblioteca;
  onPress: () => void;
  size: "large" | "small";
}

export default function BibliotecaCard({
  item,
  onPress,
  size,
}: BibliotecaCardProps) {
  const width = size === "large" ? 350 : 300;
  const height = size === "large" ? 450 : 200;

  // Usa imageUrl ou imagem_url (para compatibilidade)
  const imageUrl = item.imageUrl || item.imagem_url;

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.card, { width, height, marginRight: 16 }]}
    >
      <View style={[styles.cardContainer, { borderRadius: size === "large" ? 16 : 12 }]}>
        <Image
          source={{ uri: imageUrl || 'https://via.placeholder.com/350x450' }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Gradiente Esfumaçado com LinearGradient */}
        <View style={styles.gradientOverlay}>
          <LinearGradient
            colors={[
              'rgba(0,0,0,0)',      // Transparente no topo
              'rgba(0,0,0,0.05)',   // Muito claro
              'rgba(0,0,0,0.15)',   // Claro
              'rgba(0,0,0,0.4)',    // Médio
              'rgba(0,0,0,0.7)',    // Escuro
              'rgba(0,0,0,0.9)',    // Muito escuro na base
            ]}
            locations={[0, 0.2, 0.4, 0.6, 0.8, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                { fontSize: size === "large" ? 18 : 16 }
              ]}
            >
              {item.nome || "Sem nome"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  cardContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  textContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  title: {
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
