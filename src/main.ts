import { createApp } from "vue";
import { createPinia } from "pinia";
import "@fontsource-variable/geist/wght.css";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "@/stores/auth";

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(router);

const authStore = useAuthStore();
authStore.init().then(() => {
  app.mount("#app");
});
