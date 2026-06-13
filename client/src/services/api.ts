import { get, post, put, del } from '@/utils/request';
import {
  Pet,
  Trainer,
  Course,
  Order,
  User,
  TrainerReview,
  EffectUpload,
  DashboardStats
} from '@/types';
import { mockPets, mockTrainers, mockBookings, mockUser, mockTrainerReviews, mockDashboardStats } from '@/data';

const USE_MOCK = true;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const petApi = {
  getPets: async (): Promise<Pet[]> => {
    if (USE_MOCK) {
      await delay(300);
      return mockPets;
    }
    return get<Pet[]>('/pets');
  },

  getPetById: async (id: string): Promise<Pet> => {
    if (USE_MOCK) {
      await delay(200);
      const pet = mockPets.find((p) => p.id === id);
      if (!pet) throw new Error('Pet not found');
      return pet;
    }
    return get<Pet>(`/pets/${id}`);
  },

  createPet: async (data: Partial<Pet>): Promise<Pet> => {
    if (USE_MOCK) {
      await delay(300);
      const newPet: Pet = {
        ...data,
        id: String(Date.now()),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Pet;
      mockPets.push(newPet);
      return newPet;
    }
    return post<Pet>('/pets', data);
  },

  updatePet: async (id: string, data: Partial<Pet>): Promise<Pet> => {
    if (USE_MOCK) {
      await delay(200);
      const index = mockPets.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Pet not found');
      mockPets[index] = { ...mockPets[index], ...data, updatedAt: new Date().toISOString() };
      return mockPets[index];
    }
    return put<Pet>(`/pets/${id}`, data);
  },

  deletePet: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await delay(200);
      const index = mockPets.findIndex((p) => p.id === id);
      if (index > -1) mockPets.splice(index, 1);
      return;
    }
    return del(`/pets/${id}`);
  }
};

export const trainerApi = {
  getTrainers: async (params?: {
    specialty?: string;
    location?: string;
    mode?: 'online' | 'offline';
    sortBy?: 'rating' | 'distance' | 'price';
  }): Promise<Trainer[]> => {
    if (USE_MOCK) {
      await delay(300);
      let result = [...mockTrainers];
      if (params?.specialty) {
        result = result.filter((t) =>
          t.specialties.includes(params.specialty as any)
        );
      }
      if (params?.mode === 'online') {
        result = result.filter((t) => t.onlineAvailable);
      } else if (params?.mode === 'offline') {
        result = result.filter((t) => t.offlineAvailable);
      }
      if (params?.sortBy === 'rating') {
        result.sort((a, b) => b.starRating - a.starRating);
      } else if (params?.sortBy === 'distance') {
        result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      } else if (params?.sortBy === 'price') {
        result.sort((a, b) => a.pricePerHour - b.pricePerHour);
      }
      return result;
    }
    return get<Trainer[]>('/trainers', params);
  },

  getRecommendedTrainers: async (petId: string): Promise<Trainer[]> => {
    if (USE_MOCK) {
      await delay(400);
      const pet = mockPets.find((p) => p.id === petId);
      if (!pet) return mockTrainers.slice(0, 3);

      const petProblems = pet.behaviorProblems.map((bp) => bp.type);
      const scored = mockTrainers.map((trainer) => {
        const matchCount = trainer.specialties.filter((s) =>
          petProblems.includes(s)
        ).length;
        return {
          ...trainer,
          score: matchCount * 10 + trainer.starRating * 2 - (trainer.distance || 0)
        };
      });
      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, 5);
    }
    return get<Trainer[]>(`/trainers/recommended/${petId}`);
  },

  getTrainerById: async (id: string): Promise<Trainer> => {
    if (USE_MOCK) {
      await delay(200);
      const trainer = mockTrainers.find((t) => t.id === id);
      if (!trainer) throw new Error('Trainer not found');
      return trainer;
    }
    return get<Trainer>(`/trainers/${id}`);
  },

  getTrainerReviews: async (trainerId: string): Promise<TrainerReview[]> => {
    if (USE_MOCK) {
      await delay(300);
      return mockTrainerReviews.filter((r) => r.trainerId === trainerId);
    }
    return get<TrainerReview[]>(`/trainers/${trainerId}/reviews`);
  }
};

export const courseApi = {
  getCourses: async (status?: string): Promise<Course[]> => {
    if (USE_MOCK) {
      await delay(300);
      if (status) {
        return mockBookings.filter((c) => c.status === status);
      }
      return mockBookings;
    }
    return get<Course[]>('/courses', { status });
  },

  getCourseById: async (id: string): Promise<Course> => {
    if (USE_MOCK) {
      await delay(200);
      const course = mockBookings.find((c) => c.id === id);
      if (!course) throw new Error('Course not found');
      return course;
    }
    return get<Course>(`/courses/${id}`);
  },

  createCourse: async (data: Partial<Course>): Promise<Course> => {
    if (USE_MOCK) {
      await delay(300);
      const newCourse: Course = {
        ...data,
        id: `c${Date.now()}`,
        ticketCode: `TK${Date.now()}`,
        ownerConfirmed: false,
        settled: false,
        createdAt: new Date().toISOString()
      } as Course;
      mockBookings.unshift(newCourse);
      return newCourse;
    }
    return post<Course>('/courses', data);
  },

  checkIn: async (courseId: string): Promise<Course> => {
    if (USE_MOCK) {
      await delay(200);
      const course = mockBookings.find((c) => c.id === courseId);
      if (!course) throw new Error('Course not found');
      course.checkInTime = new Date().toISOString();
      course.status = 'in_progress';
      return course;
    }
    return post<Course>(`/courses/${courseId}/checkin`);
  },

  confirmCourse: async (courseId: string): Promise<Course> => {
    if (USE_MOCK) {
      await delay(200);
      const course = mockBookings.find((c) => c.id === courseId);
      if (!course) throw new Error('Course not found');
      course.ownerConfirmed = true;
      course.settled = true;
      return course;
    }
    return post<Course>(`/courses/${courseId}/confirm`);
  },

  submitTrainingRecord: async (
    courseId: string,
    data: any
  ): Promise<Course> => {
    if (USE_MOCK) {
      await delay(300);
      const course = mockBookings.find((c) => c.id === courseId);
      if (!course) throw new Error('Course not found');
      course.trainingRecord = data;
      return course;
    }
    return post<Course>(`/courses/${courseId}/training-record`, data);
  },

  submitHomework: async (courseId: string, data: any): Promise<Course> => {
    if (USE_MOCK) {
      await delay(300);
      const course = mockBookings.find((c) => c.id === courseId);
      if (!course) throw new Error('Course not found');
      course.homework = data;
      return course;
    }
    return post<Course>(`/courses/${courseId}/homework`, data);
  }
};

export const orderApi = {
  createOrder: async (data: Partial<Order>): Promise<Order> => {
    if (USE_MOCK) {
      await delay(300);
      const newOrder: Order = {
        ...data,
        id: String(Date.now()),
        orderNo: `ORD${Date.now()}`,
        status: 'pending',
        ticket: {
          id: String(Date.now()),
          orderId: String(Date.now()),
          code: `TK${Date.now()}`,
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TK${Date.now()}`,
          validFrom: new Date().toISOString(),
          validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          used: false
        },
        createdAt: new Date().toISOString()
      } as Order;
      return newOrder;
    }
    return post<Order>('/orders', data);
  },

  payOrder: async (orderId: string, method: string): Promise<Order> => {
    if (USE_MOCK) {
      await delay(500);
      return {
        id: orderId,
        orderNo: `ORD${orderId}`,
        userId: 'u1',
        courseId: 'c1',
        amount: 399,
        status: 'paid',
        paymentMethod: method,
        paidAt: new Date().toISOString(),
        ticket: {
          id: `t${orderId}`,
          orderId: orderId,
          code: `TK${orderId}`,
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TK${orderId}`,
          validFrom: new Date().toISOString(),
          validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          used: false
        },
        createdAt: new Date().toISOString()
      };
    }
    return post<Order>(`/orders/${orderId}/pay`, { method });
  },

  getOrderById: async (id: string): Promise<Order> => {
    if (USE_MOCK) {
      await delay(200);
      return {
        id,
        orderNo: `ORD${id}`,
        userId: 'u1',
        courseId: 'c1',
        amount: 399,
        status: 'paid',
        ticket: {
          id: `t${id}`,
          orderId: id,
          code: `TK${id}`,
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TK${id}`,
          validFrom: new Date().toISOString(),
          validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          used: false
        },
        createdAt: new Date().toISOString()
      };
    }
    return get<Order>(`/orders/${id}`);
  }
};

export const userApi = {
  getUserInfo: async (): Promise<User> => {
    if (USE_MOCK) {
      await delay(200);
      return mockUser;
    }
    return get<User>('/user/info');
  },

  uploadEffect: async (data: Partial<EffectUpload>): Promise<EffectUpload> => {
    if (USE_MOCK) {
      await delay(500);
      return {
        ...data,
        id: String(Date.now()),
        userId: 'u1',
        createdAt: new Date().toISOString()
      } as EffectUpload;
    }
    return post<EffectUpload>('/user/effects', data);
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    if (USE_MOCK) {
      await delay(300);
      return mockDashboardStats;
    }
    return get<DashboardStats>('/admin/dashboard');
  }
};
