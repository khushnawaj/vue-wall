import { defineStore } from "pinia";
import api from "@/services/api";
import { useToastStore } from "./toastStore";
import { useAuthStore } from "./authStore";

export const useArtStore = defineStore("art", {
  state: () => ({
    posts: [],
    myPosts: [],
    savedPosts: [],
    taggedPosts: [],
    focusedPost: null,
    comments: {} // Map: artworkId -> [comments]
  }),

  actions: {
    /* --------------------
       FETCH GLOBAL GALLERY
    -------------------- */
    async fetchGallery() {
      try {
        const res = await api.get("/artworks");
        this.posts = res.data;
      } catch (error) {
        console.error("Failed to fetch gallery:", error);
      }
    },

    /* --------------------
       FETCH MY ARTWORKS
    -------------------- */
    async fetchMyArtworks() {
      try {
        const res = await api.get("/artworks/me");
        this.myPosts = res.data;
      } catch (error) {
        console.error("Failed to fetch user artworks:", error);
      }
    },

    /* --------------------
       FETCH SAVED ARTWORKS
    -------------------- */
    async fetchSavedArtworks() {
        try {
            const res = await api.get("/artworks/saved");
            this.savedPosts = res.data;
        } catch (error) {
            console.error("Failed to fetch saved artworks:", error);
        }
    },

    /* --------------------
       UPLOAD ARTWORK
    -------------------- */
    async uploadArtwork(file, caption) {
      const toast = useToastStore();
      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("caption", caption || "");

        const res = await api.post("/artworks", formData);

        // Add newly uploaded artwork to top
        this.posts.unshift(res.data.artwork);
        this.myPosts.unshift(res.data.artwork);

        toast.success("Artwork published successfully!");
        return res.data.artwork;
      } catch (error) {
        console.error("Artwork upload failed:", error);
        toast.error("Failed to publish artwork.");
        throw error;
      }
    },

    /* --------------------
       UPDATE ARTWORK (CAPTION)
    -------------------- */
    async updateArtwork(artworkId, data) {
      try {
        const res = await api.put(`/artworks/${artworkId}`, data);

        const index = this.posts.findIndex((p) => p._id === artworkId);
        if (index !== -1) {
          this.posts[index] = res.data.artwork;
        }

        const myIndex = this.myPosts.findIndex((p) => p._id === artworkId);
        if (myIndex !== -1) {
          this.myPosts[myIndex] = res.data.artwork;
        }

        return res.data.artwork;
      } catch (error) {
        console.error("Failed to update artwork:", error);
        throw error;
      }
    },

    /* --------------------
       DELETE ARTWORK
    -------------------- */
    async deleteArtwork(artworkId) {
      try {
        await api.delete(`/artworks/${artworkId}`);
        this.posts = this.posts.filter((p) => p._id !== artworkId);
        this.myPosts = this.myPosts.filter((p) => p._id !== artworkId);
      } catch (error) {
        console.error("Failed to delete artwork:", error);
        throw error;
      }
    },

    /* --------------------
       LIKE / UNLIKE ARTWORK
    -------------------- */
async likePost(artworkId) {
  try {
    const res = await api.post(`/artworks/${artworkId}/like`);

    const post = this.posts.find((p) => p._id === artworkId);
    if (post) {
      post.likes = res.data.likes;
      post.likesCount = res.data.likes.length;
    }

    const myPost = this.myPosts.find((p) => p._id === artworkId);
    if (myPost) {
      myPost.likes = res.data.likes;
      myPost.likesCount = res.data.likes.length;
    }
  } catch (error) {
    console.error("Failed to like artwork:", error);
  }
},

async toggleSaveArt(artworkId) {
  const toast = useToastStore();
  try {
    const res = await api.post(`/artworks/${artworkId}/save`);
    const authStore = useAuthStore();
    if (authStore.user) {
      authStore.user.savedArtworks = res.data.savedArtworks;
    }
    // Refresh saved list
    await this.fetchSavedArtworks();
    toast.info("Saved to your collection");
  } catch (error) {
    console.error("Failed to save artwork:", error);
    toast.error("Failed to save artwork");
  }
},

/* --------------------
   USER ACTIONS
-------------------- */
async fetchUserProfile(userId) {
  try {
    const res = await api.get(`/users/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch user profile", error);
  }
},

async fetchUserArtworks(userId) {
    try {
        const res = await api.get(`/artworks/user/${userId}`);
        return res.data;
    } catch (error) {
        console.error("Failed to fetch user artworks", error);
    }
},

async fetchTaggedArtworks(userId) {
    try {
        const res = await api.get(`/artworks/tagged/${userId}`);
        this.taggedPosts = res.data;
        return res.data;
    } catch (error) {
        console.error("Failed to fetch tagged artworks", error);
    }
},

async toggleFollow(userId) {
  const toast = useToastStore();
  try {
    const res = await api.post(`/users/${userId}/follow`);
    const authStore = useAuthStore();
    if (authStore.user) {
      authStore.user.following = res.data.following;
    }
    toast.info(res.data.message);
    return res.data;
  } catch (error) {
    console.error("Failed to follow user", error);
    toast.error("Action failed");
  }
},

    /* --------------------
       COMMENTS
    -------------------- */
    async fetchComments(artworkId) {
        try {
            const res = await api.get(`/artworks/${artworkId}/comments`);
            this.comments[artworkId] = res.data;
        } catch (error) {
            console.error("Failed to fetch comments", error);
        }
    },

    async postComment(artworkId, text, parentCommentId = null) {
        try {
            const res = await api.post(`/artworks/${artworkId}/comments`, { 
              text, 
              parentComment: parentCommentId 
            });
            
            // Add to local state immediately
            if (!this.comments[artworkId]) {
                this.comments[artworkId] = [];
            }
            this.comments[artworkId].unshift(res.data);

            // Update comment count in posts list
            const post = this.posts.find(p => p._id === artworkId);
            if (post) post.commentCount = (post.commentCount || 0) + 1;

            const myPost = this.myPosts.find(p => p._id === artworkId);
            if (myPost) myPost.commentCount = (myPost.commentCount || 0) + 1;

            if (this.focusedPost && this.focusedPost._id === artworkId) {
                this.focusedPost.commentCount = (this.focusedPost.commentCount || 0) + 1;
            }

        } catch (error) {
            console.error("Failed to post comment", error);
            throw error;
        }
    },

    async updateComment(commentId, text) {
        try {
            const res = await api.put(`/artworks/comments/${commentId}`, { text });
            
            // Update local state
            for (const artworkId in this.comments) {
                const commentIndex = this.comments[artworkId].findIndex(c => c._id === commentId);
                if (commentIndex !== -1) {
                    this.comments[artworkId][commentIndex] = res.data;
                    break;
                }
            }
            return res.data;
        } catch (error) {
            console.error("Failed to update comment", error);
        }
    },

    async deleteComment(commentId, artworkId) {
        const toast = useToastStore();
        try {
            const res = await api.delete(`/artworks/comments/${commentId}`);
            const deletedCount = res.data.deletedCount || 1;

            if (this.comments[artworkId]) {
                this.comments[artworkId] = this.comments[artworkId].filter(c => c._id !== commentId && c.parentComment !== commentId);
            }

            // Update counts across all post lists
            const post = this.posts.find(p => p._id === artworkId);
            if (post) post.commentCount = Math.max(0, (post.commentCount || 0) - deletedCount);

            const myPost = this.myPosts.find(p => p._id === artworkId);
            if (myPost) myPost.commentCount = Math.max(0, (myPost.commentCount || 0) - deletedCount);

            if (this.focusedPost && this.focusedPost._id === artworkId) {
                this.focusedPost.commentCount = Math.max(0, (this.focusedPost.commentCount || 0) - deletedCount);
            }

            toast.info("Comment removed");
        } catch (error) {
            console.error("Failed to delete comment", error);
            toast.error("Failed to remove comment");
        }
    },

    /* --------------------
       MODAL CONTROL
    -------------------- */
    openPost(post) {
      this.focusedPost = post;
    },

    closePost() {
      this.focusedPost = null;
    }
  }
});
