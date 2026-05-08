// Função utilitária para formatar datas de diferentes formatos
export const formatDate = (date: any): string => {
  if (!date) return "Carregando...";

  // 🔥 Timestamp do Firebase (tem método toDate)
  if (date && typeof date.toDate === 'function') {
    return date.toDate().toLocaleDateString('pt-BR');
  }

  // 🔥 Timestamp do Firebase (formato com seconds)
  if (date && date.seconds) {
    return new Date(date.seconds * 1000).toLocaleDateString('pt-BR');
  }

  // 🔥 String (ISO antiga) ou Date object
  try {
    return new Date(date).toLocaleDateString('pt-BR');
  } catch (error) {
    return "Data inválida";
  }
};

// Função para formatar hora
export const formatTime = (date: any): string => {
  if (!date) return "";

  // 🔥 Timestamp do Firebase (tem método toDate)
  if (date && typeof date.toDate === 'function') {
    return date.toDate().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // 🔥 Timestamp do Firebase (formato com seconds)
  if (date && date.seconds) {
    return new Date(date.seconds * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // 🔥 String (ISO antiga) ou Date object
  try {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "";
  }
};

// Função para formatar data e hora completos
export const formatDateTime = (date: any): string => {
  if (!date) return "Carregando...";

  // 🔥 Timestamp do Firebase (tem método toDate)
  if (date && typeof date.toDate === 'function') {
    return date.toDate().toLocaleString();
  }

  // 🔥 Timestamp do Firebase (formato com seconds)
  if (date && date.seconds) {
    return new Date(date.seconds * 1000).toLocaleString();
  }

  // 🔥 String (ISO antiga) ou Date object
  try {
    return new Date(date).toLocaleString();
  } catch (error) {
    return "Data inválida";
  }
};
