import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/profile";
import { getInitials } from "@/lib/utils";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const profile = ref<Profile | null>(null);

  const isAuthenticated = computed(() => !!user.value);
  const role = computed(() => profile.value?.role);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    profile.value = data
      ? { ...data, initials: getInitials(data.full_name), avatar_url: data.avatar_url ?? null }
      : null;
  }

  async function init() {
    return new Promise<void>((resolve) => {
      supabase.auth.onAuthStateChange((event, newSession) => {
        user.value = newSession?.user ?? null;

        const settle = () => {
          if (event === "INITIAL_SESSION") resolve();
        };

        if (newSession?.user) {
          fetchProfile(newSession.user.id).finally(settle);
        } else {
          profile.value = null;
          settle();
        }
      });
    });
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }

  async function logout() {
    await supabase.auth.signOut();
    profile.value = null;
  }

  return { user, profile, isAuthenticated, role, init, login, logout };
});
