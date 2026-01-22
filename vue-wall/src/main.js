import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import "./styles/base.css";

import { useAuthStore } from "@/store/authStore";

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router);

/* --------------------
   AUTH REHYDRATION
-------------------- */
const authStore = useAuthStore();
if (authStore.token) {
  authStore.fetchMe();
}

app.mount("#app")
