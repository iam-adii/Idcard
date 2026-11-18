export interface EmployeeData {
  empId: string;
  name: string;
  designation: string;
  dob: string;
  bloodGroup: string;
  emergencyContact: string;
  idMarks: string;
  photo: string | null;
}

export interface SavedIDCard {
  id: string;
  createdAt: string;
  updatedAt?: string;
  employeeData: EmployeeData;
  templateId?: string;
}

export interface SavedTemplate {
  id: string;
  name: string;
  category: string;
  src: string;
  backsideSrc?: string;
  createdAt: string;
}

export const DEFAULT_TEMPLATE_ID = "default-template";

const ID_CARDS_KEY = "ats-icard-cards";
const TEMPLATES_KEY = "ats-icard-templates";

const useElectronDb = () => Boolean(window.atsIcard?.isElectron && window.atsIcard.db);

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

export const dataURLtoFile = (dataUrl: string, filename: string): File => {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

export const uploadEmployeePhoto = async (
  file: File,
  _employeeId: string
): Promise<string> => fileToDataUrl(file);

export const uploadTemplateImage = async (
  file: File,
  _templateId: string,
  _side: "front" | "back"
): Promise<string> => fileToDataUrl(file);

export const saveIDCard = async (card: SavedIDCard): Promise<void> => {
  if (useElectronDb()) {
    await window.atsIcard!.db.saveIDCard(card);
    return;
  }

  const cards = readJson<SavedIDCard[]>(ID_CARDS_KEY, []);
  const index = cards.findIndex((c) => c.id === card.id);
  const next: SavedIDCard = {
    ...card,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    cards[index] = { ...cards[index], ...next, createdAt: cards[index].createdAt };
  } else {
    cards.unshift(next);
  }

  writeJson(ID_CARDS_KEY, cards);
};

export const getAllIDCards = async (): Promise<SavedIDCard[]> => {
  if (useElectronDb()) {
    const cards = await window.atsIcard!.db.getAllIDCards();
    return [...cards].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const cards = readJson<SavedIDCard[]>(ID_CARDS_KEY, []);
  return [...cards].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getIDCardById = async (id: string): Promise<SavedIDCard | null> => {
  const cards = await getAllIDCards();
  return cards.find((c) => c.id === id) ?? null;
};

export const deleteIDCard = async (id: string): Promise<void> => {
  if (useElectronDb()) {
    await window.atsIcard!.db.deleteIDCard(id);
    return;
  }

  const cards = readJson<SavedIDCard[]>(ID_CARDS_KEY, []);
  writeJson(
    ID_CARDS_KEY,
    cards.filter((c) => c.id !== id)
  );
};

export const saveTemplate = async (template: SavedTemplate): Promise<void> => {
  if (useElectronDb()) {
    await window.atsIcard!.db.saveTemplate(template);
    return;
  }

  const templates = readJson<SavedTemplate[]>(TEMPLATES_KEY, []);
  const index = templates.findIndex((t) => t.id === template.id);

  if (index >= 0) {
    templates[index] = template;
  } else {
    templates.unshift(template);
  }

  writeJson(TEMPLATES_KEY, templates);
};

export const getAllTemplates = async (): Promise<SavedTemplate[]> => {
  if (useElectronDb()) {
    const templates = await window.atsIcard!.db.getAllTemplates();
    return [...templates].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const templates = readJson<SavedTemplate[]>(TEMPLATES_KEY, []);
  return [...templates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getTemplateById = async (id: string): Promise<SavedTemplate | null> => {
  const templates = await getAllTemplates();
  return templates.find((t) => t.id === id) ?? null;
};

export const deleteTemplate = async (id: string): Promise<void> => {
  if (useElectronDb()) {
    await window.atsIcard!.db.deleteTemplate(id);
    return;
  }

  const templates = readJson<SavedTemplate[]>(TEMPLATES_KEY, []);
  writeJson(
    TEMPLATES_KEY,
    templates.filter((t) => t.id !== id)
  );
};

const getPrefixForTemplate = async (templateId?: string): Promise<string> => {
  if (!templateId || templateId === DEFAULT_TEMPLATE_ID) {
    return "AEON";
  }

  try {
    const template = await getTemplateById(templateId);
    if (template?.name.toUpperCase().includes("AEON")) {
      return "AEON";
    }
  } catch {
    // fall through
  }

  return "AEON";
};

const extractNumberFromEmployeeId = (employeeId: string, prefix: string): number | null => {
  if (!employeeId?.startsWith(prefix)) return null;
  const number = parseInt(employeeId.substring(prefix.length), 10);
  if (Number.isNaN(number) || number < 0) return null;
  return number;
};

export const getNextEmployeeId = async (templateId?: string): Promise<string> => {
  const prefix = await getPrefixForTemplate(templateId);
  const cards = await getAllIDCards();
  const existingIds = cards
    .map((c) => c.employeeData.empId)
    .filter((id) => id.startsWith(prefix));

  let maxNumber = 0;
  for (const id of existingIds) {
    const number = extractNumberFromEmployeeId(id, prefix);
    if (number !== null && number > maxNumber) {
      maxNumber = number;
    }
  }

  const startNumber = prefix === "AEON" ? 15361 : 1;
  const nextNumber = maxNumber >= startNumber ? maxNumber + 1 : startNumber;
  return `${prefix}${nextNumber}`;
};
