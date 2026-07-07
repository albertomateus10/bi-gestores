// ================================================
// auth.js — Gerenciamento de Autenticação
// ================================================

import { auth, db, LOJAS } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ---- Cache do usuário atual ----
let currentUser = null;
let currentUserData = null;

// ---- Login ----
export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ---- Logout ----
export async function logoutUser() {
  await signOut(auth);
  sessionStorage.clear();
  window.location.href = 'index.html';
}

// ---- Busca dados do usuário no Firestore ----
export async function getUserData(uid) {
  if (currentUserData) return currentUserData;
  const snap = await getDoc(doc(db, 'usuarios', uid));
  if (snap.exists()) {
    currentUserData = snap.data();
    return currentUserData;
  }
  return null;
}

// ---- Observa estado de auth ----
export function observeAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
      const data = await getUserData(user.uid);
      callback(user, data);
    } else {
      callback(null, null);
    }
  });
}

// ---- Protege página (redireciona se não logado) ----
export function requireAuth(onUser) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    const data = await getUserData(user.uid);
    if (!data) {
      window.location.href = 'index.html';
      return;
    }
    if (onUser) onUser(user, data);
  });
}

// ---- Redireciona se já está logado ----
export function redirectIfLoggedIn() {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const data = await getUserData(user.uid);
      if (data) {
        if (data.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'dashboard.html';
        }
      }
    }
  });
}

// ---- Inicializar usuários padrão (use 1x no console) ----
// Crie os usuários no Firebase Auth e depois rode:
// initDefaultUsers() no console para criar perfis no Firestore
export async function initDefaultUsers() {
  const users = [
    { uid: 'UID_GERENTE_1', nome: 'Gerente 1', role: 'gerente' },
    { uid: 'UID_GERENTE_2', nome: 'Gerente 2', role: 'gerente' },
    { uid: 'UID_GERENTE_3', nome: 'Gerente 3', role: 'gerente' },
    { uid: 'UID_GERENTE_4', nome: 'Gerente 4', role: 'gerente' },
    { uid: 'UID_GERENTE_5', nome: 'Gerente 5', role: 'gerente' },
    { uid: 'UID_ADMIN', nome: 'Diretor', role: 'admin' },
  ];
  for (const u of users) {
    await setDoc(doc(db, 'usuarios', u.uid), {
      nome: u.nome,
      role: u.role,
      aprovado: true,
      criadoEm: new Date().toISOString()
    });
  }
  console.log('Usuários inicializados!');
}
