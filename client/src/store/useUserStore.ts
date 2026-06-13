import { create } from 'zustand';
import { User, Pet } from '@/types';
import { userApi, petApi } from '@/services/api';

interface UserState {
  user: User | null;
  pets: Pet[];
  loading: boolean;
  fetchUser: () => Promise<void>;
  fetchPets: () => Promise<void>;
  addPet: (pet: Pet) => void;
  updatePet: (pet: Pet) => void;
  removePet: (petId: string) => void;
  setUser: (user: User) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  pets: [],
  loading: false,

  fetchUser: async () => {
    set({ loading: true });
    try {
      const user = await userApi.getUserInfo();
      set({ user });
    } catch (error) {
      console.error('[UserStore] fetchUser error:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchPets: async () => {
    set({ loading: true });
    try {
      const pets = await petApi.getPets();
      set({ pets });
    } catch (error) {
      console.error('[UserStore] fetchPets error:', error);
    } finally {
      set({ loading: false });
    }
  },

  addPet: (pet: Pet) => {
    set((state) => ({ pets: [...state.pets, pet] }));
  },

  updatePet: (pet: Pet) => {
    set((state) => ({
      pets: state.pets.map((p) => (p.id === pet.id ? pet : p))
    }));
  },

  removePet: (petId: string) => {
    set((state) => ({
      pets: state.pets.filter((p) => p.id !== petId)
    }));
  },

  setUser: (user: User) => {
    set({ user });
  }
}));
