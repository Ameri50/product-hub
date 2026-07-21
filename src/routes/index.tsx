import { createFileRoute } from "@tanstack/react-router";
import { ClientApp } from "@/components/ClientApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Admin de Productos | Panel" },
      { name: "description", content: "Panel de administración de productos con Firebase Firestore." },
      { property: "og:title", content: "Admin de Productos" },
      { property: "og:description", content: "Gestiona tu catálogo en tiempo real." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ClientApp />,
});
