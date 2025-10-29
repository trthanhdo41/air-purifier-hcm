import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (name?: string, phone?: string, address?: string, city?: string, district?: string, ward?: string) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,

      setUser: (user) => set({ user }),

      setLoading: (loading) => set({ loading }),

      signIn: async (email, password) => {
        set({ loading: true });
        try {
          const supabase = createClient();
          console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
          console.log("Calling signInWithPassword...");
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          console.log("Supabase response:", { data, error });

          if (error) {
            set({ loading: false });
            console.error("Supabase error:", error);
            return { success: false, error: error.message };
          }

          if (data.user) {
            set({ 
              user: { 
                id: data.user.id, 
                email: data.user.email,
                role: email === 'admin@hoithoxanh.com' ? 'admin' : 'user',
                name: (data.user.user_metadata?.full_name as string) || undefined,
                phone: (data.user.user_metadata?.phone as string) || undefined,
                address: (data.user.user_metadata?.address as string) || undefined,
                city: (data.user.user_metadata?.city as string) || undefined,
                district: (data.user.user_metadata?.district as string) || undefined,
                ward: (data.user.user_metadata?.ward as string) || undefined
              },
              loading: false 
            });
            return { success: true };
          }

          set({ loading: false });
          return { success: false, error: 'Login failed' };
        } catch (error) {
          set({ loading: false });
          console.error("Catch error:", error);
          return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
        }
      },

      signUp: async (email, password, fullName) => {
        set({ loading: true });
        try {
          const supabase = createClient();
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName || '',
              },
            },
          });

          if (error) {
            set({ loading: false });
            return { success: false, error: error.message };
          }

          if (data.user) {
            set({ 
              user: { 
                id: data.user.id, 
                email: data.user.email,
                role: 'user',
                name: (data.user.user_metadata?.full_name as string) || undefined,
                phone: (data.user.user_metadata?.phone as string) || undefined,
                address: (data.user.user_metadata?.address as string) || undefined,
                city: (data.user.user_metadata?.city as string) || undefined,
                district: (data.user.user_metadata?.district as string) || undefined,
                ward: (data.user.user_metadata?.ward as string) || undefined
              },
              loading: false 
            });
            return { success: true };
          }

          set({ loading: false });
          return { success: false, error: 'Registration failed' };
        } catch (error) {
          set({ loading: false });
          return { success: false, error: 'An error occurred' };
        }
      },

      signOut: async () => {
        set({ loading: true });
        try {
          const supabase = createClient();
          await supabase.auth.signOut();
          set({ user: null, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      updateProfile: async (name, phone, address, city, district, ward) => {
        set({ loading: true });
        try {
          const supabase = createClient();
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          
          if (!currentUser) {
            set({ loading: false });
            return { success: false, error: 'Không tìm thấy người dùng' };
          }

          const metadata: { full_name?: string; phone?: string; address?: string; city?: string; district?: string; ward?: string } = {};
          if (name !== undefined) metadata.full_name = name;
          if (phone !== undefined) metadata.phone = phone;
          if (address !== undefined) metadata.address = address;
          if (city !== undefined) metadata.city = city;
          if (district !== undefined) metadata.district = district;
          if (ward !== undefined) metadata.ward = ward;

          const { data, error } = await supabase.auth.updateUser({
            data: {
              ...currentUser.user_metadata,
              ...metadata
            }
          });

          if (error) {
            set({ loading: false });
            return { success: false, error: error.message };
          }

          if (data.user) {
            set({ 
              user: { 
                id: data.user.id, 
                email: data.user.email,
                role: data.user.email === 'admin@hoithoxanh.com' ? 'admin' : 'user',
                name: (data.user.user_metadata?.full_name as string) || undefined,
                phone: (data.user.user_metadata?.phone as string) || undefined,
                address: (data.user.user_metadata?.address as string) || undefined,
                city: (data.user.user_metadata?.city as string) || undefined,
                district: (data.user.user_metadata?.district as string) || undefined,
                ward: (data.user.user_metadata?.ward as string) || undefined
              },
              loading: false 
            });
            return { success: true };
          }

          set({ loading: false });
          return { success: false, error: 'Cập nhật thất bại' };
        } catch (error) {
          set({ loading: false });
          return { success: false, error: error instanceof Error ? error.message : 'Đã xảy ra lỗi' };
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

const supabaseForListener = createClient();
supabaseForListener.auth.getSession().then(({ data }) => {
  const currentUser = data.session?.user
    ? { 
        id: data.session.user.id, 
        email: data.session.user.email ?? '', 
        role: (data.session.user.email === 'admin@hoithoxanh.com' ? 'admin' : 'user') as User['role'], 
        name: (data.session.user.user_metadata?.full_name as string) || undefined,
        phone: (data.session.user.user_metadata?.phone as string) || undefined,
        address: (data.session.user.user_metadata?.address as string) || undefined,
        city: (data.session.user.user_metadata?.city as string) || undefined,
        district: (data.session.user.user_metadata?.district as string) || undefined,
        ward: (data.session.user.user_metadata?.ward as string) || undefined
      }
    : null;
  useAuthStore.getState().setUser(currentUser);
});
supabaseForListener.auth.onAuthStateChange((_event, session) => {
  const nextUser = session?.user
    ? { 
        id: session.user.id, 
        email: session.user.email ?? '', 
        role: (session.user.email === 'admin@hoithoxanh.com' ? 'admin' : 'user') as User['role'], 
        name: (session.user.user_metadata?.full_name as string) || undefined,
        phone: (session.user.user_metadata?.phone as string) || undefined,
        address: (session.user.user_metadata?.address as string) || undefined,
        city: (session.user.user_metadata?.city as string) || undefined,
        district: (session.user.user_metadata?.district as string) || undefined,
        ward: (session.user.user_metadata?.ward as string) || undefined
      }
    : null;
  useAuthStore.getState().setUser(nextUser);
});

