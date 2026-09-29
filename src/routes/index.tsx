import { createFileRoute } from "@tanstack/react-router";
import { Workshop } from "@/rpg/view/Workshop";

export const Route = createFileRoute("/")({ component: Workshop });
