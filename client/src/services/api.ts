import { get, post, put, del } from '@/utils/request';
import {
  Pet,
  Trainer,
  Course,
  Order,
  User,
  TrainerReview,
  EffectUpload,
  DashboardStats,
  Homework
} from '@/types';
import {
  mockPets,
  mockTrainers,
  mockBookings,
  mockOrders,
  mockUser,
  mockTrainerReviews,
  mockDashboardStats
} from '@/data';

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

  checkConflict: async (
    trainerId: string,
    date: string,
    slotId: string
  ): Promise<{ hasConflict: boolean; message?: string }> => {
    if (USE_MOCK) {
      await delay(100);
      const trainer = mockTrainers.find((t) => t.id === trainerId);
      if (!trainer) return { hasConflict: true, message: '训导师不存在' };
      const schedule = trainer.schedule.find((s) => s.date === date);
      if (!schedule) return { hasConflict: true, message: '该日期无排班' };
      const slot = schedule.timeSlots.find((s) => s.id === slotId);
      if (!slot || !slot.available) {
        return { hasConflict: true, message: '该时段已被预约，请选择其他时段' };
      }
      return { hasConflict: false };
    }
    return get(`/courses/conflict`, { trainerId, date, slotId });
  },

  createCourse: async (data: Partial<Course>): Promise<{ course: Course; order: Order }> => {
    if (USE_MOCK) {
      await delay(300);
      const courseId = `c${Date.now()}`;
      const orderId = `o${Date.now()}`;
      const ticketCode = `TK${Date.now()}`;

      const newCourse: Course = {
        ...data,
        id: courseId,
        ticketCode,
        orderId,
        status: 'pending',
        ownerConfirmed: false,
        settled: false,
        createdAt: new Date().toISOString()
      } as Course;
      mockBookings.unshift(newCourse);

      const newOrder: Order = {
        id: orderId,
        orderNo: `ORD${Date.now()}`,
        userId: 'u1',
        courseId,
        amount: data.price || 0,
        status: 'pending',
        ticket: {
          id: `t${Date.now()}`,
          orderId,
          code: ticketCode,
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticketCode}`,
          validFrom: new Date().toISOString(),
          validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          used: false
        },
        createdAt: new Date().toISOString()
      } as Order;
      mockOrders.unshift(newOrder);

      return { course: newCourse, order: newOrder };
    }
    return post<{ course: Course; order: Order }>('/courses', data);
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
      course.status = 'completed';

      const trainer = mockTrainers.find((t) => t.id === course.trainerId);
      if (trainer) {
        trainer.courseCount = (trainer.courseCount || 0) + 1;
      }

      mockUser.totalCourses = (mockUser.totalCourses || 0) + 1;
      mockUser.totalSpent = (mockUser.totalSpent || 0) + course.price;
      const progress = mockUser.memberUpgradeProgress;
      if (progress) {
        progress.coursesCompleted = mockUser.totalCourses;
        progress.amountSpent = mockUser.totalSpent;
        const courseProgress = Math.min(100, (progress.coursesCompleted / progress.coursesNeeded) * 100);
        const amountProgress = Math.min(100, (progress.amountSpent / progress.amountNeeded) * 100);
        progress.progressPercent = Math.round(Math.max(courseProgress, amountProgress));
      }

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
      course.status = 'completed';
      return course;
    }
    return post<Course>(`/courses/${courseId}/training-record`, data);
  },

  submitHomework: async (courseId: string, data: { tasks: { id: string; completed: boolean }[] }): Promise<Course> => {
    if (USE_MOCK) {
      await delay(300);
      const course = mockBookings.find((c) => c.id === courseId);
      if (!course || !course.homework) throw new Error('Course or homework not found');

      data.tasks.forEach((taskUpdate) => {
        const task = course!.homework!.tasks.find((t) => t.id === taskUpdate.id);
        if (task) {
          task.completed = taskUpdate.completed;
        }
      });

      const allCompleted = course.homework.tasks.every((t) => t.completed);
      if (allCompleted) {
        course.homework.completed = true;
        course.homework.completedAt = new Date().toISOString();
      }

      return course;
    }
    return post<Course>(`/courses/${courseId}/homework`, data);
  }
};

export const orderApi = {
  createOrder: async (data: Partial<Order>): Promise<Order> => {
    if (USE_MOCK) {
      await delay(300);
      const orderId = `o${Date.now()}`;
      const ticketCode = data.courseId ? `TK${data.courseId}` : `TK${Date.now()}`;
      const newOrder: Order = {
        ...data,
        id: orderId,
        orderNo: `ORD${Date.now()}`,
        status: 'pending',
        ticket: {
          id: `t${Date.now()}`,
          orderId,
          code: ticketCode,
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticketCode}`,
          validFrom: new Date().toISOString(),
          validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          used: false
        },
        createdAt: new Date().toISOString()
      } as Order;
      mockOrders.unshift(newOrder);
      return newOrder;
    }
    return post<Order>('/orders', data);
  },

  payOrder: async (orderId: string, data: { paymentMethod: string }): Promise<{ order: Order; course: Course }> => {
    if (USE_MOCK) {
      await delay(500);
      const order = mockOrders.find((o) => o.id === orderId);
      if (!order) throw new Error('Order not found');

      order.status = 'paid';
      order.paymentMethod = data.paymentMethod;
      order.paidAt = new Date().toISOString();
      if (order.ticket) {
        order.ticket.used = false;
      }

      const course = mockBookings.find((c) => c.id === order.courseId);
      if (course) {
        course.status = 'upcoming';
        course.settled = false;

        const trainer = mockTrainers.find((t) => t.id === course.trainerId);
        if (trainer) {
          const schedule = trainer.schedule.find((s) => s.date === course.date);
          if (schedule) {
            const slot = schedule.timeSlots.find((s) => s.startTime === course.startTime);
            if (slot) {
              slot.available = false;
            }
          }
        }
      }

      return { order, course: course! };
    }
    return post<{ order: Order; course: Course }>(`/orders/${orderId}/pay`, data);
  },

  getOrderById: async (id: string): Promise<Order> => {
    if (USE_MOCK) {
      await delay(200);
      const order = mockOrders.find((o) => o.id === id);
      if (!order) throw new Error('Order not found');
      return order;
    }
    return get<Order>(`/orders/${id}`);
  },

  getOrderByCourseId: async (courseId: string): Promise<Order> => {
    if (USE_MOCK) {
      await delay(200);
      const order = mockOrders.find((o) => o.courseId === courseId);
      if (!order) throw new Error('Order not found');
      return order;
    }
    return get<Order>(`/orders/by-course/${courseId}`);
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
      const effectId = `e${Date.now()}`;

      const result: EffectUpload = {
        ...data,
        id: effectId,
        userId: 'u1',
        createdAt: new Date().toISOString()
      } as EffectUpload;

      const trainer = mockTrainers.find((t) => t.id === data.trainerId);
      if (trainer) {
        trainer.reviewCount = (trainer.reviewCount || 0) + 1;
        const oldRating = trainer.starRating || 0;
        const oldCount = trainer.reviewCount - 1;
        trainer.starRating = Math.round(((oldRating * oldCount + (data.rating || 5)) / trainer.reviewCount) * 10) / 10;
        trainer.satisfactionRate = Math.min(100, Math.round(((trainer.satisfactionRate || 90) * oldCount + ((data.rating || 5) >= 4 ? 100 : 0)) / trainer.reviewCount));
      }

      const newReview: TrainerReview = {
        id: `r${Date.now()}`,
        userId: 'u1',
        userName: mockUser.nickname || '用户',
        userAvatar: mockUser.avatar || '',
        trainerId: data.trainerId || '',
        rating: data.rating || 5,
        content: data.description || '',
        createdAt: new Date().toISOString(),
        courseType: '一对一课程',
        behaviorImproved: data.behaviorImproved || false
      };
      mockTrainerReviews.unshift(newReview);

      const pointsEarned = (data.rating || 5) >= 4 ? 100 : 50;
      mockUser.memberPoints = (mockUser.memberPoints || 0) + pointsEarned;

      const progress = mockUser.memberUpgradeProgress;
      if (progress) {
        const courseProgress = Math.min(100, (progress.coursesCompleted / progress.coursesNeeded) * 100);
        const amountProgress = Math.min(100, (progress.amountSpent / progress.amountNeeded) * 100);
        progress.progressPercent = Math.round(Math.max(courseProgress, amountProgress));
      }

      return result;
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
