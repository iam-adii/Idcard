
import { useState, useEffect, useRef } from "react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Plus, ArrowRight, FlipHorizontal, Trash2, Upload, ImageIcon, X, Pencil } from "lucide-react";
import idCardTemplate from "@/assets/id-card-template.jpeg";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAllTemplates, saveTemplate, deleteTemplate, uploadTemplateImage, type SavedTemplate, DEFAULT_TEMPLATE_ID } from "@/lib/storage";
import { toast } from "sonner";

// Import backside image - this is the static backside for the AEON Group template
import idCardBackside from "@/assets/default-backside.png";

// Default template (always available, stored separately)
const defaultTemplate = {
    id: DEFAULT_TEMPLATE_ID,
    name: "AEON Group",
    src: idCardTemplate,
    backsideSrc: idCardBackside,
    category: "Corporate",
};

// Template interface for UI (can be default or saved)
interface TemplateUI {
    id: string;
    name: string;
    src: string;
    backsideSrc?: string;
    category: string;
}

const Templates = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<TemplateUI[]>([defaultTemplate]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
    const [addTemplateDialogOpen, setAddTemplateDialogOpen] = useState(false);
    const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
    const [templateTitle, setTemplateTitle] = useState("");
    const [frontImage, setFrontImage] = useState<string | null>(null);
    const [backImage, setBackImage] = useState<string | null>(null);
    const [frontFile, setFrontFile] = useState<File | null>(null);
    const [backFile, setBackFile] = useState<File | null>(null);
    const frontImageInputRef = useRef<HTMLInputElement>(null);
    const backImageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const isAuthenticated = localStorage.getItem("isAuthenticated");
        if (!isAuthenticated) {
            navigate("/");
            return;
        }

        // Load templates from storage
        loadTemplates();
    }, [navigate]);

    const loadTemplates = async () => {
        const savedTemplates = await getAllTemplates();
        // Filter out default template from saved (if it exists) and convert to UI format
        const uiTemplates: TemplateUI[] = savedTemplates
            .filter((t) => t.id !== DEFAULT_TEMPLATE_ID)
            .map((t) => ({
                id: t.id,
                name: t.name,
                src: t.src,
                backsideSrc: t.backsideSrc,
                category: t.category,
            }));
        // Always include default template at the beginning (using asset imports)
        setTemplates([defaultTemplate, ...uiTemplates]);
    };

    const handleUseTemplate = (template: TemplateUI) => {
        navigate("/creator", {
            state: {
                selectedTemplate: {
                    src: template.src,
                    backsideSrc: template.backsideSrc,
                    id: template.id,
                    // No filter applied as per request
                }
            }
        });
    };

    const handleAddTemplate = () => {
        setEditingTemplateId(null);
        setTemplateTitle("");
        setFrontImage(null);
        setBackImage(null);
        setFrontFile(null);
        setBackFile(null);
        if (frontImageInputRef.current) frontImageInputRef.current.value = "";
        if (backImageInputRef.current) backImageInputRef.current.value = "";
        setAddTemplateDialogOpen(true);
    };

    const handleEditTemplate = (template: TemplateUI) => {
        // Don't allow editing default template
        if (template.id === DEFAULT_TEMPLATE_ID) {
            toast.error("Default template cannot be edited");
            return;
        }
        setEditingTemplateId(template.id);
        setTemplateTitle(template.name);
        setFrontImage(template.src);
        setBackImage(template.backsideSrc || null);
        setFrontFile(null);
        setBackFile(null);
        if (frontImageInputRef.current) frontImageInputRef.current.value = "";
        if (backImageInputRef.current) backImageInputRef.current.value = "";
        setAddTemplateDialogOpen(true);
    };

    const handleFrontImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFrontFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFrontImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBackImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBackFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setBackImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeFrontImage = () => {
        setFrontImage(null);
        setFrontFile(null);
        if (frontImageInputRef.current) {
            frontImageInputRef.current.value = "";
        }
    };

    const removeBackImage = () => {
        setBackImage(null);
        setBackFile(null);
        if (backImageInputRef.current) {
            backImageInputRef.current.value = "";
        }
    };

    // Generate a proper UUID v4
    const generateUUID = (): string => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const handleSubmitTemplate = async () => {
        if (!templateTitle.trim()) {
            toast.error("Please enter a template title");
            return;
        }
        if (!frontImage) {
            toast.error("Please upload a front image");
            return;
        }
        if (!backImage) {
            toast.error("Please upload a back image");
            return;
        }

        // Show loading toast
        const loadingToast = toast.loading("Saving template...");

        try {
            // Determine template ID early
            // Use proper UUID for new templates to satisfy Supabase uuid type constraint
            const templateId = editingTemplateId || generateUUID();

            let finalFrontUrl = frontImage;
            let finalBackUrl = backImage;

            // Upload front image if it's a new file
            if (frontFile) {
                try {
                    finalFrontUrl = await uploadTemplateImage(frontFile, templateId, 'front');
                } catch (uploadError) {
                    console.error("Failed to upload front image:", uploadError);
                    toast.dismiss(loadingToast);
                    toast.error("Failed to upload front image");
                    return;
                }
            }

            // Upload back image if it's a new file
            if (backFile) {
                try {
                    finalBackUrl = await uploadTemplateImage(backFile, templateId, 'back');
                } catch (uploadError) {
                    console.error("Failed to upload back image:", uploadError);
                    toast.dismiss(loadingToast);
                    toast.error("Failed to upload back image");
                    return;
                }
            }

            if (editingTemplateId) {
                // Update existing template in storage
                const savedTemplate: SavedTemplate = {
                    id: templateId,
                    name: templateTitle.trim(),
                    category: "Custom",
                    src: finalFrontUrl!,
                    backsideSrc: finalBackUrl || undefined,
                    createdAt: new Date().toISOString(), // Keep original creation date, or update if needed
                };
                await saveTemplate(savedTemplate);
                toast.dismiss(loadingToast);
                toast.success("Template updated successfully");
            } else {
                // Add new template to storage
                const newTemplate: SavedTemplate = {
                    id: templateId,
                    name: templateTitle.trim(),
                    src: finalFrontUrl!,
                    backsideSrc: finalBackUrl || undefined,
                    category: "Custom",
                    createdAt: new Date().toISOString(),
                };
                await saveTemplate(newTemplate);
                toast.dismiss(loadingToast);
                toast.success("Template added successfully");
            }

            // Reload templates from storage
            await loadTemplates();

            // Reset form
            setEditingTemplateId(null);
            setTemplateTitle("");
            setFrontImage(null);
            setBackImage(null);
            setFrontFile(null);
            setBackFile(null);
            if (frontImageInputRef.current) frontImageInputRef.current.value = "";
            if (backImageInputRef.current) backImageInputRef.current.value = "";
            setAddTemplateDialogOpen(false);
        } catch (error) {
            console.error("Failed to save template:", error);
            toast.dismiss(loadingToast);
            toast.error(error instanceof Error ? error.message : "Failed to save template");
        }
    };

    const handleCancelAddTemplate = () => {
        setEditingTemplateId(null);
        setTemplateTitle("");
        setFrontImage(null);
        setBackImage(null);
        setFrontFile(null);
        setBackFile(null);
        if (frontImageInputRef.current) frontImageInputRef.current.value = "";
        if (backImageInputRef.current) backImageInputRef.current.value = "";
        setAddTemplateDialogOpen(false);
    };

    const handleDeleteClick = (templateId: string) => {
        setTemplateToDelete(templateId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (templateToDelete) {
            // Don't allow deleting default template
            if (templateToDelete === DEFAULT_TEMPLATE_ID) {
                toast.error("Default template cannot be deleted");
                setDeleteDialogOpen(false);
                setTemplateToDelete(null);
                return;
            }

            try {
                await deleteTemplate(templateToDelete);
                toast.success("Template deleted successfully");
                await loadTemplates(); // Reload templates from storage
                setTemplateToDelete(null);
            } catch (error) {
                console.error("Failed to delete template:", error);
                toast.error("Failed to delete template");
            }
        }
        setDeleteDialogOpen(false);
    };

    const handleDeleteCancel = () => {
        setTemplateToDelete(null);
        setDeleteDialogOpen(false);
    };

    return (
        <>
            <AppSidebar />
            <SidebarInset>
                <header className="sticky top-0 z-40 flex h-14 sm:h-16 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur px-2 sm:px-4 shadow-sm lg:px-8">
                    <div className="flex items-center gap-2 min-w-0">
                        <SidebarTrigger className="-ml-1 h-10 w-10 sm:h-9 sm:w-9" />
                        <span className="text-base sm:text-lg font-semibold truncate">Templates Library</span>
                    </div>
                    <Button onClick={handleAddTemplate} className="min-h-[44px] sm:min-h-0 h-11 sm:h-10 shrink-0">
                        <Plus className="mr-2 size-4" />
                        <span className="hidden sm:inline">Add Template</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                </header>

                <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-2 sm:p-4 md:p-6">
                    {/* Adjusted grid for smaller thumbnails */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                        {templates.map((template) => (
                            <Card key={template.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                                <div className="relative aspect-[400/640] w-full overflow-hidden bg-muted">
                                    <Tabs defaultValue="front" className="w-full h-full">
                                        <div className="relative h-full">
                                            <TabsContent value="front" className="m-0 h-full">
                                                <img
                                                    src={template.src}
                                                    alt={`${template.name} Front`}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            </TabsContent>
                                            <TabsContent value="back" className="m-0 h-full">
                                                <img
                                                    src={template.backsideSrc}
                                                    alt={`${template.name} Back`}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            </TabsContent>
                                            <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 sm:gap-2">
                                                <TabsList className="h-8 sm:h-7 bg-white/60 backdrop-blur-sm">
                                                    <TabsTrigger value="front" className="text-[10px] px-1.5 sm:px-2 py-1 h-7 sm:h-6 data-[state=active]:bg-white/20 min-h-[32px] sm:min-h-0">
                                                        Front
                                                    </TabsTrigger>
                                                    <TabsTrigger value="back" className="text-[10px] px-1.5 sm:px-2 py-1 h-7 sm:h-6 data-[state=active]:bg-white/20 min-h-[32px] sm:min-h-0">
                                                        <FlipHorizontal className="w-3 h-3 mr-0.5 sm:mr-1" />
                                                        Back
                                                    </TabsTrigger>
                                                </TabsList>
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="h-9 w-9 sm:h-7 sm:w-7 bg-blue-500/80 hover:bg-blue-600/80 backdrop-blur-sm min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditTemplate(template);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                                                </Button>
                                                {template.id !== DEFAULT_TEMPLATE_ID && (
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        className="h-9 w-9 sm:h-7 sm:w-7 bg-red-500/80 hover:bg-red-600/80 backdrop-blur-sm min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(template.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Tabs>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="font-semibold text-xs h-10 sm:h-8 min-h-[44px] sm:min-h-0"
                                            onClick={() => handleUseTemplate(template)}
                                        >
                                            Use This
                                        </Button>
                                    </div>
                                </div>
                                <CardContent className="p-3 pb-2 pt-3 flex-grow">
                                    <div className="flex flex-col gap-1.5">
                                        <h3 className="font-semibold text-sm truncate" title={template.name}>{template.name}</h3>
                                        <Badge variant="secondary" className="w-fit text-[10px] px-1.5 py-0 h-5">{template.category}</Badge>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-3 pt-0">
                                    <Button
                                        className="w-full gap-2 h-11 sm:h-8 text-xs min-h-[44px] sm:min-h-0"
                                        variant="ghost"
                                        onClick={() => handleUseTemplate(template)}
                                    >
                                        Select <ArrowRight className="size-3" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </SidebarInset>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="max-w-[95vw] sm:max-w-md p-4 sm:p-6">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base sm:text-lg">Delete Template</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">
                            Are you sure you want to delete this template? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                        <AlertDialogCancel onClick={handleDeleteCancel} className="min-h-[44px] sm:min-h-0 w-full sm:w-auto order-2 sm:order-1">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-h-[44px] sm:min-h-0 w-full sm:w-auto order-1 sm:order-2">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={addTemplateDialogOpen} onOpenChange={setAddTemplateDialogOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader className="pb-3 sm:pb-4">
                        <DialogTitle className="text-base sm:text-lg">{editingTemplateId ? "Edit Template" : "Add New Template"}</DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            {editingTemplateId
                                ? "Update the template images and name as needed."
                                : "Upload front and back images for your ID card template and give it a name."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
                        {/* Template Title */}
                        <div className="space-y-2">
                            <Label htmlFor="template-title">Template Title</Label>
                            <Input
                                id="template-title"
                                placeholder="Enter template name (e.g., Corporate ID Card)"
                                value={templateTitle}
                                onChange={(e) => setTemplateTitle(e.target.value)}
                            />
                        </div>

                        {/* Front Image Upload */}
                        <div className="space-y-2">
                            <Label>Front Image</Label>
                            <div className="border-2 border-dashed rounded-lg p-4">
                                {frontImage ? (
                                    <div className="relative">
                                        <img
                                            src={frontImage}
                                            alt="Front preview"
                                            className="w-full h-48 object-contain rounded-md bg-muted"
                                        />
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <input
                                                ref={frontImageInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFrontImageUpload}
                                                className="hidden"
                                                id="front-image-upload"
                                            />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="icon"
                                                className="h-8 w-8 bg-background/80 hover:bg-background backdrop-blur-sm"
                                                onClick={() => frontImageInputRef.current?.click()}
                                                title="Change image"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={removeFrontImage}
                                                title="Remove image"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="text-sm font-medium">Upload front image</p>
                                            <p className="text-xs text-muted-foreground">
                                                Recommended: 400x640px or similar ratio
                                            </p>
                                        </div>
                                        <input
                                            ref={frontImageInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFrontImageUpload}
                                            className="hidden"
                                            id="front-image-upload"
                                        />
                                        <Button
                                            type="button"
                                            variant="default"
                                            onClick={() => frontImageInputRef.current?.click()}
                                            className="w-full min-h-[44px] sm:min-h-0 h-11 sm:h-10"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            <span className="text-sm sm:text-base">Choose Front Image</span>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Back Image Upload */}
                        <div className="space-y-2">
                            <Label>Back Image</Label>
                            <div className="border-2 border-dashed rounded-lg p-4">
                                {backImage ? (
                                    <div className="relative">
                                        <img
                                            src={backImage}
                                            alt="Back preview"
                                            className="w-full h-48 object-contain rounded-md bg-muted"
                                        />
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <input
                                                ref={backImageInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleBackImageUpload}
                                                className="hidden"
                                                id="back-image-upload"
                                            />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="icon"
                                                className="h-8 w-8 bg-background/80 hover:bg-background backdrop-blur-sm"
                                                onClick={() => backImageInputRef.current?.click()}
                                                title="Change image"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={removeBackImage}
                                                title="Remove image"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="text-sm font-medium">Upload back image</p>
                                            <p className="text-xs text-muted-foreground">
                                                Recommended: 400x640px or similar ratio
                                            </p>
                                        </div>
                                        <input
                                            ref={backImageInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleBackImageUpload}
                                            className="hidden"
                                            id="back-image-upload"
                                        />
                                        <Button
                                            type="button"
                                            variant="default"
                                            onClick={() => backImageInputRef.current?.click()}
                                            className="w-full min-h-[44px] sm:min-h-0 h-11 sm:h-10"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            <span className="text-sm sm:text-base">Choose Back Image</span>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={handleCancelAddTemplate} className="min-h-[44px] sm:min-h-0 w-full sm:w-auto order-2 sm:order-1">
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleSubmitTemplate} className="min-h-[44px] sm:min-h-0 w-full sm:w-auto order-1 sm:order-2">
                            {editingTemplateId ? "Update Template" : "Add Template"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Templates;
