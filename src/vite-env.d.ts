/// <reference types="vite/client" />

import type { SavedIDCard, SavedTemplate } from "./lib/localStorage";

interface AtsIcardApi {
  platform: string;
  isElectron: boolean;
  db: {
    getAllIDCards: () => Promise<SavedIDCard[]>;
    saveIDCard: (card: SavedIDCard) => Promise<SavedIDCard>;
    deleteIDCard: (id: string) => Promise<void>;
    getAllTemplates: () => Promise<SavedTemplate[]>;
    saveTemplate: (template: SavedTemplate) => Promise<SavedTemplate>;
    deleteTemplate: (id: string) => Promise<void>;
    getInfo: () => Promise<{ path: string; userData: string }>;
  };
}

declare global {
  interface Window {
    atsIcard?: AtsIcardApi;
  }
}

export {};
