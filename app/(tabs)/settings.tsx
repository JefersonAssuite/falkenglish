import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from "react-native";
import { auth } from "../../services/FirebaseConfig";
import UserSubscriptionService from "../../services/UserSubscriptionService";
import SubscriptionService from "../../services/SubscriptionService";

export default function SettingsScreen() {
  const router = useRouter();
  const [user, setUser] = useState(auth.currentUser);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const subscription = await UserSubscriptionService.getUserSubscriptionStatus();
      setSubscriptionData(subscription);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/login');
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
            }
          }
        }
      ]
    );
  };

  const handleManageSubscription = () => {
    router.push('/assinatura');
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      "Cancelar Assinatura",
      "Tem certeza que deseja cancelar sua assinatura? Você perderá acesso a todos os recursos.",
      [
        {
          text: "Manter Assinatura",
          style: "cancel"
        },
        {
          text: "Cancelar Assinatura",
          style: "destructive",
          onPress: async () => {
            try {
              if (subscriptionData?.subscriptionId) {
                await SubscriptionService.cancelSubscription(subscriptionData.subscriptionId);
                Alert.alert("Sucesso", "Assinatura cancelada com sucesso!");
                loadUserData(); // Recarregar dados
              }
            } catch (error) {
              console.error('Erro ao cancelar assinatura:', error);
              Alert.alert("Erro", "Não foi possível cancelar a assinatura. Tente novamente.");
            }
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      icon: "user",
      title: "Perfil",
      subtitle: user?.email || "usuario@exemplo.com",
      onPress: () => Alert.alert("Info", "Funcionalidade em desenvolvimento")
    },
    {
      icon: "credit-card",
      title: "Forma de Pagamento",
      subtitle: subscriptionData?.isActive ? "Ativo" : "Inativo",
      onPress: handleManageSubscription
    },
    {
      icon: "bell",
      title: "Notificações",
      subtitle: notifications ? "Ativadas" : "Desativadas",
      onPress: () => setNotifications(!notifications)
    },
    {
      icon: "moon",
      title: "Modo Escuro",
      subtitle: darkMode ? "Ativado" : "Desativado",
      onPress: () => setDarkMode(!darkMode)
    },
    {
      icon: "help-circle",
      title: "Ajuda e Suporte",
      subtitle: "Central de ajuda",
      onPress: () => Alert.alert("Info", "Funcionalidade em desenvolvimento")
    },
    {
      icon: "file-text",
      title: "Termos de Uso",
      subtitle: "Política e privacidade",
      onPress: () => Alert.alert("Info", "Funcionalidade em desenvolvimento")
    },
    {
      icon: "info",
      title: "Sobre",
      subtitle: "Versão 1.0.0",
      onPress: () => Alert.alert("Sobre", "Talk App v1.0.0\nDesenvolvido com ❤️")
    }
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#007AFF",
          paddingHorizontal: 16,
          paddingVertical: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        
        <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
          Configurações
        </Text>
        
        <View style={{ width: 24 }} />
      </View>

      {/* User Info */}
      {user && (
        <View
          style={{
            backgroundColor: "white",
            margin: 16,
            borderRadius: 12,
            padding: 20,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "#007AFF",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>
              {user.email?.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>
              {user.displayName || "Usuário"}
            </Text>
            <Text style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
              {user.email}
            </Text>
          </View>
        </View>
      )}

      {/* Subscription Status */}
      {subscriptionData && (
        <View
          style={{
            backgroundColor: "white",
            marginHorizontal: 16,
            marginBottom: 16,
            borderRadius: 12,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Feather 
              name={subscriptionData.isActive ? "check-circle" : "x-circle"} 
              size={20} 
              color={subscriptionData.isActive ? "#34C759" : "#FF3B30"} 
            />
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333", marginLeft: 8 }}>
              Assinatura {subscriptionData.isActive ? "Ativa" : "Inativa"}
            </Text>
          </View>
          
          {subscriptionData.isActive && (
            <>
              <Text style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
                Valor: {SubscriptionService.formatSubscriptionValue()}
              </Text>
              <Text style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
                Próxima cobrança: {subscriptionData.nextBillingDate}
              </Text>
            </>
          )}
          
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#007AFF",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
              onPress={handleManageSubscription}
            >
              <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>
                Gerenciar
              </Text>
            </TouchableOpacity>
            
            {subscriptionData.isActive && (
              <TouchableOpacity
                style={{
                  backgroundColor: "#FF3B30",
                  padding: 12,
                  borderRadius: 8,
                  alignItems: "center",
                }}
                onPress={handleCancelSubscription}
              >
                <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Menu Items */}
      <View style={{ paddingHorizontal: 16 }}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 2,
            }}
            onPress={item.onPress}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#F5F5F5",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Feather name={item.icon as any} size={20} color="#007AFF" />
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#333" }}>
                {item.title}
              </Text>
              <Text style={{ fontSize: 14, color: "#666", marginTop: 2 }}>
                {item.subtitle}
              </Text>
            </View>
            
            {item.title === "Notificações" && (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
                thumbColor={notifications ? "#007AFF" : "#F5F5F5"}
              />
            )}
            
            {item.title === "Modo Escuro" && (
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
                thumbColor={darkMode ? "#007AFF" : "#F5F5F5"}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <View style={{ paddingHorizontal: 16, marginBottom: 40 }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#FF3B30",
            borderRadius: 12,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={20} color="white" />
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600", marginLeft: 8 }}>
            Sair
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
