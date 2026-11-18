export type {
  EmployeeData,
  SavedIDCard,
  SavedTemplate,
} from "./localStorage";

export {
  DEFAULT_TEMPLATE_ID,
  uploadEmployeePhoto,
  uploadTemplateImage,
  dataURLtoFile,
  saveIDCard,
  getAllIDCards,
  getIDCardById,
  deleteIDCard,
  saveTemplate,
  getAllTemplates,
  getTemplateById,
  deleteTemplate,
  getNextEmployeeId,
} from "./localStorage";
