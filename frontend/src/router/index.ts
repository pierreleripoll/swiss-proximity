// Composables
import { createRouter, createWebHistory } from "vue-router";
import type { MapType } from "@/utils/variables";

const routes = [
  {
    path: "/",
    redirect: "/demande",
  },
  {
    path: "/offre",
    name: "Offre de proximité",
    component: () => import("@/views/SimpleMapView.vue"),
    props: { mapType: "supply" as MapType },
  },
  {
    path: "/demande",
    name: "Demande de proximité",
    component: () => import("@/views/SimpleMapView.vue"),
    props: { mapType: "demand" as MapType },
  },
  {
    path: "/comparaison",
    name: "Comparaison",
    component: () => import("@/views/DoubleMapView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
