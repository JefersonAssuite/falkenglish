import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase - substitua com suas credenciais
const firebaseConfig = {
  apiKey: "AIzaSyBhE-Z_fIr-5dGBYwD4vdaiS6f9LCmOBK8",
  authDomain: "pagamento2026-43dbf.firebaseapp.com",
  projectId: "pagamento2026-43dbf",
  storageBucket: "pagamento2026-43dbf.firebasestorage.app",
  messagingSenderId: "586602414232",
  appId: "1:586602414232:web:a7cef49a9514a0455210ed",
  measurementId: "G-LBYW9YRWM3"
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
