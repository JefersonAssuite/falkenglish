import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { addDoc, collection, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../services/FirebaseConfig";
import { formatTime } from "../../utils/dateUtils";

interface Message {
  id: string;
  text: string;
  userId: string;
  userEmail: string;
  createdAt: any;
}

export default function TalkScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "messages"),
      (snapshot) => {
        const messagesData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a: any, b: any) => {
            const dateA = a.createdAt?.toDate?.() || (a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(0));
            const dateB = b.createdAt?.toDate?.() || (b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(0));
            return dateA.getTime() - dateB.getTime();
          }) as Message[];
        
        setMessages(messagesData);
      }
    );

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage.trim(),
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.userId === user?.uid;
    
    return (
      <View
        style={{
          flexDirection: isOwnMessage ? "row-reverse" : "row",
          marginHorizontal: 16,
          marginVertical: 4,
          alignItems: "flex-end",
        }}
      >
        <View
          style={{
            maxWidth: "70%",
            backgroundColor: isOwnMessage ? "#007AFF" : "#E5E5EA",
            borderRadius: 18,
            paddingHorizontal: 16,
            paddingVertical: 10,
            marginHorizontal: isOwnMessage ? 0 : 8,
          }}
        >
          <Text
            style={{
              color: isOwnMessage ? "white" : "black",
              fontSize: 16,
            }}
          >
            {item.text}
          </Text>
          <Text
            style={{
              color: isOwnMessage ? "white" : "gray",
              fontSize: 12,
              marginTop: 4,
              opacity: 0.7,
            }}
          >
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ flex: 1 }}>
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
          <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
            Talk
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={{ flex: 1, backgroundColor: "#F5F5F5" }}
          contentContainerStyle={{ paddingVertical: 16 }}
        />

        {/* Input */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: "white",
            borderTopWidth: 1,
            borderTopColor: "#E5E5EA",
          }}
        >
          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#E5E5EA",
              borderRadius: 25,
              paddingHorizontal: 16,
              paddingVertical: 10,
              marginRight: 8,
              backgroundColor: "#F5F5F5",
            }}
            placeholder="Digite uma mensagem..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={loading || !newMessage.trim()}
            style={{
              backgroundColor: loading || !newMessage.trim() ? "#CCC" : "#007AFF",
              borderRadius: 25,
              paddingHorizontal: 16,
              paddingVertical: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Feather name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
