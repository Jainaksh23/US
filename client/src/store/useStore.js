import { create } from 'zustand';
import modeThemes from '../theme/modeThemes';

const useStore = create((set, get) => ({
  // Auth state
  token: localStorage.getItem('us-token') || null,
  couple: JSON.parse(localStorage.getItem('us-couple') || 'null'),
  currentPartner: localStorage.getItem('us-partner') || null,

  // Mode state
  currentMode: 'sweet',
  theme: modeThemes.sweet,

  // Game state
  currentGame: null,
  scores: { partner1: 0, partner2: 0 },

  // Socket state
  socket: null,
  partnerOnline: false,

  // Toast notifications
  toasts: [],

  // Questions cache
  questions: {},

  // Coupons
  coupons: [],

  // Actions
  setAuth: (token, couple, currentPartner) => {
    localStorage.setItem('us-token', token);
    localStorage.setItem('us-couple', JSON.stringify(couple));
    localStorage.setItem('us-partner', currentPartner);
    set({ token, couple, currentPartner });
  },

  logout: () => {
    localStorage.removeItem('us-token');
    localStorage.removeItem('us-couple');
    localStorage.removeItem('us-partner');
    const { socket } = get();
    if (socket) socket.disconnect();
    set({
      token: null,
      couple: null,
      currentPartner: null,
      socket: null,
      partnerOnline: false,
      currentGame: null,
    });
  },

  setMode: (mode) => {
    set({
      currentMode: mode,
      theme: modeThemes[mode],
    });
    // Apply CSS variables
    const cssVars = modeThemes[mode].cssVars;
    Object.entries(cssVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    // Notify partner via socket
    const { socket } = get();
    if (socket) {
      socket.emit('mode-change', { mode });
    }
  },

  setCurrentGame: (game) => set({ currentGame: game }),

  setSocket: (socket) => set({ socket }),
  setPartnerOnline: (online) => set({ partnerOnline: online }),

  setScores: (scores) => set({ scores }),

  setCoupons: (coupons) => set({ coupons }),

  addToast: (toast) => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    // Auto-remove after 4 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  setQuestions: (game, mode, questions) => {
    set((state) => ({
      questions: {
        ...state.questions,
        [`${game}-${mode}`]: questions,
      },
    }));
  },
}));

export default useStore;
