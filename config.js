import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

// GANTI BAGIAN INI DENGAN CONFIG DARI FIREBASE CONSOLE ANDA
export const firebaseConfig = {
  apiKey: "AIzaSyDB7tEP-_qP2FG0fQmsAchYoXKD0fX4Hgg",
  authDomain: "lms-ssk.firebaseapp.com",
  databaseURL: "https://lms-ssk-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lms-ssk",
  storageBucket: "lms-ssk.firebasestorage.app",
  messagingSenderId: "722349741232",
  appId: "1:722349741232:web:8ff46d1ee89c6bfded1775"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// Akhiran domain internal untuk login menggunakan Username / NISN / NIP
export const DOMAIN_SUFFIX = "@pkbm.id";

export function toLoginEmail(identifier) {
  const clean = identifier.trim().toLowerCase();
  if (clean.includes("@")) return clean;
  return `${clean}${DOMAIN_SUFFIX}`;
}

/**
 * Pengunci Zona Waktu Lokal Indonesia (WIB / Asia/Jakarta / UTC+7)
 */
export function getWIBNow() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const parts = formatter.formatToParts(now).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});

  const hour = parts.hour === "24" ? "00" : parts.hour;
  const dateISO = `${parts.year}-${parts.month}-${parts.day}`; // YYYY-MM-DD
  const timeString = `${hour}:${parts.minute}:${parts.second}`; // HH:mm:ss
  const timeShort = `${hour}:${parts.minute}`; // HH:mm

  const dayName = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long"
  }).format(now);

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(now);

  const isLearningDay = dayName === "Jumat" || dayName === "Sabtu";

  return {
    dateISO,
    timeString,
    timeShort,
    dayName,
    formattedDate,
    isLearningDay
  };
}

/**
 * Mengecek apakah jam WIB saat ini masuk dalam jadwal pelajaran
 */
export function isWithinScheduleTime(jamMulai, jamSelesai) {
  const { timeString } = getWIBNow();
  const start = jamMulai.length === 5 ? `${jamMulai}:00` : jamMulai;
  const end = jamSelesai.length === 5 ? `${jamSelesai}:59` : jamSelesai;
  return timeString >= start && timeString <= end;
}

/**
 * Pembuat tautan WhatsApp Bantuan Login dinamis
 */
export function buildWhatsAppHelpUrl(waAdmin, waTemplate) {
  let cleanNumber = (waAdmin || "6281234567890").replace(/\D/g, "");
  if (cleanNumber.startsWith("0")) {
    cleanNumber = "62" + cleanNumber.slice(1);
  }
  const text = encodeURIComponent(
    waTemplate || "Halo Admin PKBM, saya butuh bantuan login LMS"
  );
  return `https://wa.me/${cleanNumber}?text=${text}`;
}

/**
 * Pengarah halaman otomatis berdasarkan Role
 */
export function getPageByRole(role) {
  const routes = {
    pengelola: "pengelola.html",
    tutor: "tutor.html",
    piket: "piket.html",
    warga_belajar: "siswa.html"
  };
  return routes[role] || "index.html";
}
