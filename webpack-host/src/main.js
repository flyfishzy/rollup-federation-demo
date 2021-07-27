import { createApp } from "vue";
import Layout from "./Layout.vue";

const lazyLoadRemote = () => import("remote_app/Button");
const app = createApp(Layout);

app.mount("#root");
lazyLoadRemote();
