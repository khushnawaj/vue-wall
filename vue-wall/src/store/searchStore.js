import { defineStore } from "pinia";
import api from "@/services/api";

export const useSearchStore = defineStore("search", {
  state: () => ({
    results: {
        artworks: [],
        users: []
    },
    loading: false,
    query: ""
  }),

  actions: {
    async search(query) {
      if (!query.trim()) {
          this.results = { artworks: [], users: [] };
          return;
      }
      this.loading = true;
      this.query = query;
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
        this.results = res.data;
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        this.loading = false;
      }
    }
  }
});
