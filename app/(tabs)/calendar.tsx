import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../../services/FirebaseConfig";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description?: string;
}

export default function CalendarScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    time: "",
    description: "",
  });

  const user = auth.currentUser;

  // Gerar dias do mês
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const daysInMonth = getDaysInMonth(selectedDate);

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1));
  };

  const handleDatePress = (day: number | null) => {
    if (!day) return;
    
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    Alert.alert(
      "Adicionar Evento",
      `Deseja adicionar um evento em ${day}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Adicionar",
          onPress: () => {
            setShowAddEvent(true);
            setNewEvent({ title: "", time: "09:00", description: "" });
          }
        }
      ]
    );
  };

  const addEvent = () => {
    if (!newEvent.title.trim()) {
      Alert.alert("Erro", "Por favor, informe o título do evento");
      return;
    }

    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    
    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: dateStr,
      time: newEvent.time,
      description: newEvent.description,
    };

    setEvents([...events, event]);
    setShowAddEvent(false);
    setNewEvent({ title: "", time: "", description: "" });
    
    Alert.alert("Sucesso", "Evento adicionado com sucesso!");
  };

  const getEventsForDate = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const isToday = (day: number | null) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#ffffff" }}>
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
          Calendário
        </Text>
        
        <TouchableOpacity onPress={() => setShowAddEvent(true)}>
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Calendar Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 16,
          backgroundColor: "#F5F5F5",
        }}
      >
        <TouchableOpacity onPress={handlePrevMonth}>
          <Feather name="chevron-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>
          {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </Text>
        
        <TouchableOpacity onPress={handleNextMonth}>
          <Feather name="chevron-right" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Week Days */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          backgroundColor: "#F5F5F5",
          paddingBottom: 8,
        }}
      >
        {weekDays.map((day) => (
          <View key={day} style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#666" }}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Days */}
      <View style={{ paddingHorizontal: 16 }}>
        {Array.from({ length: Math.ceil(daysInMonth.length / 7) }).map((_, weekIndex) => (
          <View key={weekIndex} style={{ flexDirection: "row" }}>
            {daysInMonth.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
              const dayEvents = getEventsForDate(day);
              const hasEvents = dayEvents.length > 0;
              const today = isToday(day);
              
              return (
                <TouchableOpacity
                  key={dayIndex}
                  style={{
                    flex: 1,
                    height: 50,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: day ? "white" : "transparent",
                    borderWidth: day ? 1 : 0,
                    borderColor: "#E5E5EA",
                    borderRadius: 4,
                    marginHorizontal: 1,
                    marginVertical: 1,
                  }}
                  onPress={() => handleDatePress(day)}
                  disabled={!day}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: today ? "#007AFF" : day ? "#333" : "#CCC",
                      fontWeight: today ? "bold" : "normal",
                    }}
                  >
                    {day || ""}
                  </Text>
                  
                  {hasEvents && (
                    <View
                      style={{
                        position: "absolute",
                        bottom: 2,
                        width: 6,
                        height: 6,
                        backgroundColor: "#FF3B30",
                        borderRadius: 3,
                      }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Events List */}
      <View style={{ paddingHorizontal: 16, marginTop: 20, paddingBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 16 }}>
          Eventos do Mês
        </Text>
        
        {events.length === 0 ? (
          <Text style={{ color: "#666", textAlign: "center", paddingVertical: 20 }}>
            Nenhum evento encontrado para este mês.
          </Text>
        ) : (
          events.map((event) => (
            <View
              key={event.id}
              style={{
                backgroundColor: "#F5F5F5",
                padding: 16,
                borderRadius: 8,
                marginBottom: 12,
                borderLeftWidth: 4,
                borderLeftColor: "#007AFF",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#333", flex: 1 }}>
                  {event.title}
                </Text>
                <Text style={{ fontSize: 14, color: "#666" }}>
                  {event.time}
                </Text>
              </View>
              
              {event.description && (
                <Text style={{ fontSize: 14, color: "#666", marginTop: 8 }}>
                  {event.description}
                </Text>
              )}
              
              <Text style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
                {new Date(event.date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Add Event Modal */}
      {showAddEvent && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 20,
              marginHorizontal: 20,
              width: "100%",
              maxWidth: 400,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
              Adicionar Evento
            </Text>
            
            <Text style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
              Título
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#DDD",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 16,
              }}
              placeholder="Título do evento"
              value={newEvent.title}
              onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
            />
            
            <Text style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
              Horário
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#DDD",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 16,
              }}
              placeholder="09:00"
              value={newEvent.time}
              onChangeText={(text) => setNewEvent({ ...newEvent, time: text })}
            />
            
            <Text style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
              Descrição (opcional)
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#DDD",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 20,
                height: 80,
                textAlignVertical: "top",
              }}
              placeholder="Descrição do evento"
              value={newEvent.description}
              onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
              multiline
            />
            
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#E5E5EA",
                  padding: 16,
                  borderRadius: 8,
                  alignItems: "center",
                }}
                onPress={() => {
                  setShowAddEvent(false);
                  setNewEvent({ title: "", time: "", description: "" });
                }}
              >
                <Text style={{ fontSize: 16, color: "#333" }}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#007AFF",
                  padding: 16,
                  borderRadius: 8,
                  alignItems: "center",
                }}
                onPress={addEvent}
              >
                <Text style={{ fontSize: 16, color: "white" }}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
