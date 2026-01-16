// Supabase storage service layer - replaces localStorage with cloud database and storage
import { supabase, type TemplateRow, type IDCardRow } from './supabase';

// Re-export types from storage.ts for backward compatibility
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

// =====================================================
// STORAGE UTILITIES
// =====================================================

/**
 * Upload employee photo to Supabase Storage
 * @param file - The image file to upload
 * @param employeeId - The employee ID for file naming
 * @returns Public URL of the uploaded image
 */
export const uploadEmployeePhoto = async (
    file: File,
    employeeId: string
): Promise<string> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${employeeId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
            .from('employee-photos')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('employee-photos')
            .getPublicUrl(data.path);

        return urlData.publicUrl;
    } catch (error) {
        console.error('Error uploading employee photo:', error);
        throw new Error('Failed to upload employee photo');
    }
};

/**
 * Upload template image to Supabase Storage
 * @param file - The image file to upload
 * @param templateId - The template ID for file naming
 * @param side - 'front' or 'back'
 * @returns Public URL of the uploaded image
 */
export const uploadTemplateImage = async (
    file: File,
    templateId: string,
    side: 'front' | 'back'
): Promise<string> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${templateId}-${side}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
            .from('template-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('template-images')
            .getPublicUrl(data.path);

        return urlData.publicUrl;
    } catch (error) {
        console.error('Error uploading template image:', error);
        throw new Error('Failed to upload template image');
    }
};

/**
 * Convert base64 data URL to File object
 */
export const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

// =====================================================
// ID CARDS CRUD OPERATIONS
// =====================================================

/**
 * Save or update an ID card in Supabase
 */
export const saveIDCard = async (card: SavedIDCard): Promise<void> => {
    try {
        const { employeeData, templateId } = card;

        // Check if card already exists
        const { data: existing } = await supabase
            .from('id_cards')
            .select('id')
            .eq('id', card.id)
            .maybeSingle();

        const cardData: Partial<IDCardRow> = {
            id: card.id,
            employee_id: employeeData.empId,
            employee_name: employeeData.name || null,
            designation: employeeData.designation || null,
            date_of_birth: employeeData.dob || null,
            blood_group: employeeData.bloodGroup || null,
            emergency_contact: employeeData.emergencyContact || null,
            identification_marks: employeeData.idMarks || null,
            photo_url: employeeData.photo || null,
            // Only save template_id if it's not the default template (which is not a UUID)
            template_id: (templateId && templateId !== DEFAULT_TEMPLATE_ID) ? templateId : null,
        };

        if (existing) {
            // Update existing card
            const { error } = await supabase
                .from('id_cards')
                .update(cardData)
                .eq('id', card.id);

            if (error) throw error;
        } else {
            // Insert new card
            const { error } = await supabase
                .from('id_cards')
                .insert([cardData]);

            if (error) throw error;
        }
    } catch (error) {
        console.error('Failed to save ID card:', error);
        throw new Error('Failed to save ID card to database');
    }
};

/**
 * Get all ID cards from Supabase
 */
export const getAllIDCards = async (): Promise<SavedIDCard[]> => {
    try {
        const { data, error } = await supabase
            .from('id_cards')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform database rows to SavedIDCard format
        return (data || []).map((row: IDCardRow) => ({
            id: row.id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            employeeData: {
                empId: row.employee_id,
                name: row.employee_name || '',
                designation: row.designation || '',
                dob: row.date_of_birth || '',
                bloodGroup: row.blood_group || '',
                emergencyContact: row.emergency_contact || '',
                idMarks: row.identification_marks || '',
                photo: row.photo_url || null,
            },
            templateId: row.template_id || undefined,
        }));
    } catch (error) {
        console.error('Failed to fetch ID cards:', error);
        return [];
    }
};

/**
 * Get a single ID card by ID
 */
export const getIDCardById = async (id: string): Promise<SavedIDCard | null> => {
    try {
        const { data, error } = await supabase
            .from('id_cards')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;

        const row = data as IDCardRow;
        return {
            id: row.id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            employeeData: {
                empId: row.employee_id,
                name: row.employee_name || '',
                designation: row.designation || '',
                dob: row.date_of_birth || '',
                bloodGroup: row.blood_group || '',
                emergencyContact: row.emergency_contact || '',
                idMarks: row.identification_marks || '',
                photo: row.photo_url || null,
            },
            templateId: row.template_id || undefined,
        };
    } catch (error) {
        console.error('Failed to fetch ID card:', error);
        return null;
    }
};

/**
 * Delete an ID card from Supabase
 */
export const deleteIDCard = async (id: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('id_cards')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Failed to delete ID card:', error);
        throw new Error('Failed to delete ID card');
    }
};

// =====================================================
// TEMPLATES CRUD OPERATIONS
// =====================================================

/**
 * Save or update a template in Supabase
 */
export const saveTemplate = async (template: SavedTemplate): Promise<void> => {
    try {
        // Check if template already exists
        const { data: existing } = await supabase
            .from('templates')
            .select('id')
            .eq('id', template.id)
            .maybeSingle();

        const templateData: Partial<TemplateRow> = {
            id: template.id,
            name: template.name,
            category: template.category,
            front_image_url: template.src,
            back_image_url: template.backsideSrc || null,
        };

        if (existing) {
            // Update existing template
            const { error } = await supabase
                .from('templates')
                .update(templateData)
                .eq('id', template.id);

            if (error) throw error;
        } else {
            // Insert new template
            const { error } = await supabase
                .from('templates')
                .insert([templateData]);

            if (error) throw error;
        }
    } catch (error) {
        console.error('Failed to save template:', error);
        throw new Error('Failed to save template to database');
    }
};

/**
 * Get all templates from Supabase
 */
export const getAllTemplates = async (): Promise<SavedTemplate[]> => {
    try {
        const { data, error } = await supabase
            .from('templates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform database rows to SavedTemplate format
        return (data || []).map((row: TemplateRow) => ({
            id: row.id,
            name: row.name,
            category: row.category,
            src: row.front_image_url,
            backsideSrc: row.back_image_url || undefined,
            createdAt: row.created_at,
        }));
    } catch (error) {
        console.error('Failed to fetch templates:', error);
        return [];
    }
};

/**
 * Get a single template by ID
 */
export const getTemplateById = async (id: string): Promise<SavedTemplate | null> => {
    try {
        const { data, error } = await supabase
            .from('templates')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;

        const row = data as TemplateRow;
        return {
            id: row.id,
            name: row.name,
            category: row.category,
            src: row.front_image_url,
            backsideSrc: row.back_image_url || undefined,
            createdAt: row.created_at,
        };
    } catch (error) {
        console.error('Failed to fetch template:', error);
        return null;
    }
};

/**
 * Delete a template from Supabase
 */
export const deleteTemplate = async (id: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('templates')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Failed to delete template:', error);
        throw new Error('Failed to delete template');
    }
};

// =====================================================
// EMPLOYEE ID GENERATION
// =====================================================

/**
 * Determine the employee ID prefix based on template
 * @param templateId - The template ID (optional)
 * @returns The prefix string (e.g., "AEON")
 */
const getPrefixForTemplate = async (templateId?: string): Promise<string> => {
    // For AEON Group templates (default template or templates with "AEON" in name)
    if (!templateId || templateId === DEFAULT_TEMPLATE_ID) {
        return 'AEON';
    }

    // Check if template name contains "AEON"
    try {
        const template = await getTemplateById(templateId);
        if (template && template.name.toUpperCase().includes('AEON')) {
            return 'AEON';
        }
    } catch (error) {
        console.error('Failed to fetch template:', error);
    }

    // Default to AEON for now (can be extended for other templates)
    return 'AEON';
};

/**
 * Extract the numeric part from an employee ID
 * @param employeeId - The employee ID string (e.g., "AEON15361")
 * @param prefix - The expected prefix (e.g., "AEON")
 * @returns The numeric part, or null if format doesn't match
 */
const extractNumberFromEmployeeId = (employeeId: string, prefix: string): number | null => {
    if (!employeeId || !employeeId.startsWith(prefix)) {
        return null;
    }

    const numberPart = employeeId.substring(prefix.length);
    const number = parseInt(numberPart, 10);

    if (isNaN(number) || number < 0) {
        return null;
    }

    return number;
};

/**
 * Get all existing employee IDs with a specific prefix
 * @param prefix - The prefix to filter by (e.g., "AEON")
 * @returns Array of employee ID strings
 */
const getExistingEmployeeIds = async (prefix: string): Promise<string[]> => {
    try {
        const { data, error } = await supabase
            .from('id_cards')
            .select('employee_id')
            .like('employee_id', `${prefix}%`);

        if (error) throw error;

        return (data || []).map((row: { employee_id: string }) => row.employee_id);
    } catch (error) {
        console.error('Failed to fetch existing employee IDs:', error);
        return [];
    }
};

/**
 * Find the maximum number from existing employee IDs
 * @param employeeIds - Array of employee ID strings
 * @param prefix - The prefix to extract numbers from
 * @returns The maximum number found, or 0 if none found
 */
const findMaxNumber = (employeeIds: string[], prefix: string): number => {
    let maxNumber = 0;

    for (const id of employeeIds) {
        const number = extractNumberFromEmployeeId(id, prefix);
        if (number !== null && number > maxNumber) {
            maxNumber = number;
        }
    }

    return maxNumber;
};

/**
 * Generate next employee ID based on template
 * @param templateId - Optional template ID to determine the format
 * @returns The next employee ID in the format for that template
 */
export const getNextEmployeeId = async (templateId?: string): Promise<string> => {
    try {
        // Determine prefix based on template
        const prefix = await getPrefixForTemplate(templateId);

        // Get all existing employee IDs with this prefix
        const existingIds = await getExistingEmployeeIds(prefix);

        // Find the highest number
        const maxNumber = findMaxNumber(existingIds, prefix);

        // Determine the next number (start from 15361 for AEON if no existing IDs)
        const startNumber = prefix === 'AEON' ? 15361 : 1;
        const nextNumber = maxNumber >= startNumber ? maxNumber + 1 : startNumber;

        // Return the formatted ID
        return `${prefix}${nextNumber}`;
    } catch (error) {
        console.error('Failed to generate employee ID:', error);
        // Fallback to client-side generation
        return generateEmployeeIdFallback();
    }
};

/**
 * Fallback employee ID generation (client-side)
 */
const generateEmployeeIdFallback = (): string => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let suffix = '';
    for (let i = 0; i < 4; i++) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${year}${month}${suffix}`;
};
