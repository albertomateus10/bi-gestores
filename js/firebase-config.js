// ================================================
// firebase-config.js — Configuração do Firebase
// ================================================
// INSTRUÇÃO: Substitua os valores abaixo pelas suas
// credenciais do Firebase Console.
// ================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔥 Firebase — Projeto: bi-gerentes
const firebaseConfig = {
  apiKey: "AIzaSyCoD6SQI5u91ql5MOO1DR791fevPUjzWlI",
  authDomain: "bi-gerentes.firebaseapp.com",
  projectId: "bi-gerentes",
  storageBucket: "bi-gerentes.firebasestorage.app",
  messagingSenderId: "331844480670",
  appId: "1:331844480670:web:1570986f4a8e1920d5958f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Mapeamento de lojas
export const LOJAS = {
  matriz: "Matriz",
  zona_sul: "Zona Sul",
  gravataí: "Gravataí",
  viamao: "Viamão",
  multimarcas: "Multimarcas"
};

// Semanas do mês (labels)
export function getWeekLabel(weekNum) {
  return `Semana ${weekNum}`;
}

// Gera ID de semana no formato: YYYY-MM-W{n}
export function getWeekId(year, month, week) {
  return `${year}-${String(month).padStart(2,'0')}-W${week}`;
}

// Retorna semana atual do mês
export function getCurrentWeekOfMonth() {
  const now = new Date();
  const day = now.getDate();
  return Math.ceil(day / 7);
}

// Retorna mês/ano atual
export function getCurrentMonthYear() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}
