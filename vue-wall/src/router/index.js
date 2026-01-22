import { createRouter, createWebHistory } from "vue-router";

import Home from "@/pages/Home.vue";
import Profile from "@/pages/Profile.vue";
import Login from "@/pages/Login.vue";
import Signup from "@/pages/Signup.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { title: "ArtWall | Curating the Future of Art" }
  },
  {
    path: "/profile",
    name: "MyProfile",
    component: Profile,
    meta: { requiresAuth: true, title: "My Profile | ArtWall" }
  },
  {
    path: "/profile/:id",
    name: "Profile",
    component: Profile,
    meta: { title: "Artist Profile | ArtWall" }
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { guestOnly: true, title: "Login | ArtWall" }
  },
  {
    path: "/signup",
    name: "Signup",
    component: Signup,
    meta: { guestOnly: true, title: "Join ArtWall" }
  },
  {
    path: "/auth/social-callback",
    name: "AuthCallback",
    component: () => import("@/pages/AuthCallback.vue"),
    meta: { title: "Authenticating..." }
  },
  {
    path: "/chat",
    name: "Chat",
    component: () => import("@/pages/Chat.vue"),
    meta: { requiresAuth: true, title: "Messages | ArtWall" }
  },
  {
    path: "/notifications",
    name: "Notifications",
    component: () => import("@/pages/Notifications.vue"),
    meta: { requiresAuth: true, title: "Activity | ArtWall" }
  },
  {
    path: "/art/:id",
    name: "ArtworkDetail",
    component: () => import("@/pages/ArtworkDetail.vue"),
    meta: { title: "View Artwork | ArtWall" }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

/* --------------------
   ROUTE GUARD
-------------------- */
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  const token = localStorage.getItem("artwall_token");

  // Protected routes
  if (to.meta.requiresAuth && !token) {
    return next("/login");
  }

  // Guest-only routes
  if (to.meta.guestOnly && token) {
    return next("/");
  }

  next();
});

export default router;
