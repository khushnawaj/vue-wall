import { defineStore } from "pinia";
import api from "@/services/api";
import { useToastStore } from "./toastStore";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("artwall_token")
  }),

  actions: {
    /* --------------------
       AUTH
    -------------------- */
    async login(payload) {
      const toast = useToastStore();
      try {
        const res = await api.post("/auth/login", payload);
        this.user = res.data.user;
        this.token = res.data.token;
        localStorage.setItem("artwall_token", this.token);
        toast.success(`Welcome back, ${this.user.name}!`);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Login failed");
        throw err;
      }
    },

    async signup(payload) {
      const toast = useToastStore();
      try {
        const res = await api.post("/auth/signup", payload);
        this.user = res.data.user;
        this.token = res.data.token;
        localStorage.setItem("artwall_token", this.token);
        toast.success("Account created successfully!");
      } catch (err) {
        toast.error(err?.response?.data?.message || "Signup failed");
        throw err;
      }
    },

    async fetchMe() {
      if (!this.token) return;

      try {
        const res = await api.get("/users/me");
        this.user = res.data;
      } catch (err) {
        this.logout();
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("artwall_token");
      useToastStore().info("Successfully logged out");
    },

    /* --------------------
       PROFILE UPDATE  ✅ NEW
    -------------------- */
async updateProfile(data, onProgress) {
  const toast = useToastStore();
  try {
    let payload;
    let headers = {};

    if (data.avatar instanceof File) {
      payload = new FormData();
      if (data.name) payload.append("name", data.name);
      if (data.bio) payload.append("bio", data.bio);
      payload.append("avatar", data.avatar);

      headers["Content-Type"] = "multipart/form-data";
    } else {
      payload = {
        name: data.name,
        bio: data.bio
      };
    }

    const res = await api.put("/users/me", payload, {
      headers,
      onUploadProgress: (e) => {
        if (!onProgress || !e.total) return;
        const percent = Math.round((e.loaded * 100) / e.total);
        onProgress(percent);
      }
    });

    this.user = res.data.user || res.data;
    toast.success("Profile updated successfully");
    return this.user;
  } catch (err) {
    toast.error("Failed to update profile");
    throw err;
  }
}

  }
});
