// Storage utility - now using Supabase cloud storage
// This file maintains backward compatibility by re-exporting from supabaseStorage

export type {
  EmployeeData,
  SavedIDCard,
  SavedTemplate,
} from './supabaseStorage';

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
} from './supabaseStorage';

// Note: All storage operations now use Supabase cloud database and storage
// instead of localStorage. Data persists across devices and sessions.
