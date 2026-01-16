import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Plus, MoreVertical, Edit, Trash2, Download, User, Search, X, Filter, ChevronLeft, ChevronRight, MoreHorizontal, Eye, FlipHorizontal } from "lucide-react";
import { getAllIDCards, deleteIDCard, getAllTemplates, type SavedIDCard, type EmployeeData, DEFAULT_TEMPLATE_ID } from "@/lib/storage";
import { toast } from "sonner";
import IDCardPreview from "@/components/IDCardPreview";
import IDCardBacksidePreview from "@/components/IDCardBacksidePreview";
import idCardTemplate from "@/assets/id-card-template.jpeg";
import idCardBackside from "@/assets/default-backside.png";

const ITEMS_PER_PAGE = 10;
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const IDCards = () => {
  const navigate = useNavigate();
  const [allCards, setAllCards] = useState<SavedIDCard[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<SavedIDCard | null>(null);

  // Preview modal state
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [cardToPreview, setCardToPreview] = useState<SavedIDCard | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<{ src: string; backsideSrc?: string } | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>("all");
  const [designationFilter, setDesignationFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    // Load cards from storage
    loadCards();
  }, [navigate]);

  const loadCards = async () => {
    const savedCards = await getAllIDCards();
    // Cards are already sorted by createdAt descending from storage
    setAllCards(savedCards);
    setCurrentPage(1); // Reset to first page when cards are reloaded
  };

  // Filter and search cards
  const filteredCards = useMemo(() => {
    let filtered = [...allCards];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((card) => {
        const empId = card.employeeData.empId?.toLowerCase() || "";
        const name = card.employeeData.name?.toLowerCase() || "";
        const designation = card.employeeData.designation?.toLowerCase() || "";
        const dob = card.employeeData.dob?.toLowerCase() || "";
        const bloodGroup = card.employeeData.bloodGroup?.toLowerCase() || "";
        const emergencyContact = card.employeeData.emergencyContact?.toLowerCase() || "";
        const idMarks = card.employeeData.idMarks?.toLowerCase() || "";

        return (
          empId.includes(query) ||
          name.includes(query) ||
          designation.includes(query) ||
          dob.includes(query) ||
          bloodGroup.includes(query) ||
          emergencyContact.includes(query) ||
          idMarks.includes(query)
        );
      });
    }

    // Apply blood group filter
    if (bloodGroupFilter !== "all") {
      filtered = filtered.filter(
        (card) => card.employeeData.bloodGroup === bloodGroupFilter
      );
    }

    // Apply designation filter
    if (designationFilter !== "all") {
      filtered = filtered.filter(
        (card) => card.employeeData.designation?.toLowerCase() === designationFilter.toLowerCase()
      );
    }

    return filtered;
  }, [allCards, searchQuery, bloodGroupFilter, designationFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCards.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCards = filteredCards.slice(startIndex, endIndex);

  // Update page when filters change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredCards.length, currentPage, totalPages]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setBloodGroupFilter("all");
    setDesignationFilter("all");
    setCurrentPage(1);
  };

  // Get unique designations for filter dropdown
  const uniqueDesignations = useMemo(() => {
    const designations = new Set<string>();
    allCards.forEach((card) => {
      if (card.employeeData.designation?.trim()) {
        designations.add(card.employeeData.designation.trim());
      }
    });
    return Array.from(designations).sort();
  }, [allCards]);

  const hasActiveFilters = searchQuery.trim() !== "" || bloodGroupFilter !== "all" || designationFilter !== "all";

  const handleEdit = (card: SavedIDCard) => {
    navigate("/creator", {
      state: {
        savedCard: card,
      },
    });
  };

  const handleDeleteClick = (card: SavedIDCard) => {
    setCardToDelete(card);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (cardToDelete) {
      try {
        await deleteIDCard(cardToDelete.id);
        toast.success("ID card deleted successfully");
        await loadCards(); // Reload cards
        setDeleteDialogOpen(false);
        setCardToDelete(null);
      } catch (error) {
        toast.error("Failed to delete ID card");
        console.error(error);
      }
    }
  };

  const handleExport = async (card: SavedIDCard) => {
    // Navigate to creator with card data and trigger export
    navigate("/creator", {
      state: {
        savedCard: card,
        autoExport: true,
      },
    });
  };

  const handlePreview = async (card: SavedIDCard) => {
    setCardToPreview(card);

    // Load template for preview
    if (card.templateId && card.templateId !== DEFAULT_TEMPLATE_ID) {
      const templates = await getAllTemplates();
      const template = templates.find((t) => t.id === card.templateId);
      if (template) {
        setPreviewTemplate({
          src: template.src,
          backsideSrc: template.backsideSrc,
        });
      } else {
        // Template not found, use default
        setPreviewTemplate({
          src: idCardTemplate,
          backsideSrc: idCardBackside,
        });
      }
    } else {
      // Use default template
      setPreviewTemplate({
        src: idCardTemplate,
        backsideSrc: idCardBackside,
      });
    }

    setPreviewDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const getInitials = (empId: string) => {
    if (!empId) return "ID";
    // Get first 2 characters or first letter of each word
    return empId.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-14 sm:h-16 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur px-2 sm:px-4 shadow-sm lg:px-8">
          <div className="flex items-center gap-2 min-w-0">
            <SidebarTrigger className="-ml-1 h-10 w-10 sm:h-9 sm:w-9" />
            <span className="text-base sm:text-lg font-semibold truncate">ID Cards</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Button
              size="sm"
              onClick={() => navigate("/creator")}
              className="hidden sm:flex min-h-[44px] sm:min-h-0"
            >
              <Plus className="mr-2 size-4" />
              New ID Card
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-2 sm:p-4 pt-4 sm:pt-8 md:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <Card className="shadow-sm">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <CreditCard className="size-4 sm:size-5 shrink-0" />
                      <span className="truncate">All ID Cards</span>
                    </CardTitle>
                    <CardDescription className="mt-2 text-xs sm:text-sm">
                      View and manage all created ID cards
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => navigate("/creator")}
                    size="sm"
                    className="sm:hidden min-h-[44px] shrink-0"
                  >
                    <Plus className="mr-2 size-4" />
                    New
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {/* Search and Filter Bar */}
                <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                      <Input
                        type="search"
                        placeholder="Search by Name, Designation, Employee ID, DOB..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-9 pr-10 h-11 sm:h-10 text-base sm:text-sm"
                      />
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9 w-9 sm:h-7 sm:w-7 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                          onClick={() => {
                            setSearchQuery("");
                            setCurrentPage(1);
                          }}
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>

                    {/* Designation Filter */}
                    {uniqueDesignations.length > 0 && (
                      <div className="w-full sm:w-[200px]">
                        <Select
                          value={designationFilter}
                          onValueChange={(value) => {
                            setDesignationFilter(value);
                            setCurrentPage(1);
                          }}
                        >
                          <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm min-h-[44px] sm:min-h-0">
                            <Filter className="mr-2 size-4" />
                            <SelectValue placeholder="All Designations" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all" className="text-base sm:text-sm min-h-[44px] sm:min-h-0">All Designations</SelectItem>
                            {uniqueDesignations.map((designation) => (
                              <SelectItem key={designation} value={designation} className="text-base sm:text-sm min-h-[44px] sm:min-h-0">
                                {designation}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Blood Group Filter */}
                    <div className="w-full sm:w-[180px]">
                      <Select
                        value={bloodGroupFilter}
                        onValueChange={(value) => {
                          setBloodGroupFilter(value);
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm min-h-[44px] sm:min-h-0">
                          <Filter className="mr-2 size-4" />
                          <SelectValue placeholder="All Blood Groups" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="text-base sm:text-sm min-h-[44px] sm:min-h-0">All Blood Groups</SelectItem>
                          {BLOOD_GROUPS.map((group) => (
                            <SelectItem key={group} value={group} className="text-base sm:text-sm min-h-[44px] sm:min-h-0">
                              {group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        onClick={handleClearFilters}
                        className="w-full sm:w-auto min-h-[44px] sm:min-h-0 h-11 sm:h-10"
                      >
                        <X className="mr-2 size-4" />
                        Clear Filters
                      </Button>
                    )}
                  </div>

                  {/* Results Count */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Showing {filteredCards.length === 0 ? 0 : startIndex + 1} to{" "}
                      {Math.min(endIndex, filteredCards.length)} of {filteredCards.length} card
                      {filteredCards.length !== 1 ? "s" : ""}
                      {hasActiveFilters && " (filtered)"}
                    </span>
                  </div>
                </div>

                {allCards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
                      <CreditCard className="size-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No ID cards yet</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md">
                      Create your first ID card to get started. All created cards will appear here.
                    </p>
                    <Button onClick={() => navigate("/creator")}>
                      <Plus className="mr-2 size-4" />
                      Create ID Card
                    </Button>
                  </div>
                ) : filteredCards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
                      <Search className="size-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No results found</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md">
                      Try adjusting your search or filter criteria.
                    </p>
                    <Button onClick={handleClearFilters} variant="outline">
                      <X className="mr-2 size-4" />
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[80px]">Photo</TableHead>
                            <TableHead className="min-w-[120px]">Name</TableHead>
                            <TableHead className="min-w-[120px]">Designation</TableHead>
                            <TableHead className="min-w-[100px]">Employee ID</TableHead>
                            <TableHead className="hidden md:table-cell min-w-[110px]">Date of Birth</TableHead>
                            <TableHead className="hidden lg:table-cell min-w-[100px]">Blood Group</TableHead>
                            <TableHead className="hidden xl:table-cell min-w-[140px]">Emergency Contact</TableHead>
                            <TableHead className="hidden sm:table-cell min-w-[120px]">Created</TableHead>
                            <TableHead className="text-right w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedCards.map((card) => (
                            <TableRow key={card.id} className="hover:bg-muted/50">
                              <TableCell>
                                <Avatar className="size-10">
                                  <AvatarImage
                                    src={card.employeeData.photo || undefined}
                                    alt={card.employeeData.name || card.employeeData.empId || "Employee"}
                                  />
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {card.employeeData.photo ? (
                                      <User className="size-5" />
                                    ) : (
                                      getInitials(card.employeeData.name || card.employeeData.empId)
                                    )}
                                  </AvatarFallback>
                                </Avatar>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{card.employeeData.name || "—"}</div>
                                <div className="text-sm text-muted-foreground md:hidden">
                                  {card.employeeData.designation || "—"}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{card.employeeData.designation || "—"}</div>
                                <div className="text-sm text-muted-foreground md:hidden">
                                  {card.employeeData.bloodGroup || "—"}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{card.employeeData.empId || "N/A"}</div>
                                <div className="text-sm text-muted-foreground md:hidden">
                                  {card.employeeData.dob || "No DOB"}
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {card.employeeData.dob || "—"}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                {card.employeeData.bloodGroup || "—"}
                              </TableCell>
                              <TableCell className="hidden xl:table-cell">
                                {card.employeeData.emergencyContact || "—"}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-muted-foreground">
                                {formatDate(card.createdAt)}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-8 sm:w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0">
                                      <MoreVertical className="size-4" />
                                      <span className="sr-only">Open menu</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="min-w-[160px]">
                                    <DropdownMenuItem onClick={() => handlePreview(card)} className="min-h-[44px] sm:min-h-0 text-base sm:text-sm">
                                      <Eye className="mr-2 size-4" />
                                      Preview
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEdit(card)} className="min-h-[44px] sm:min-h-0 text-base sm:text-sm">
                                      <Edit className="mr-2 size-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExport(card)} className="min-h-[44px] sm:min-h-0 text-base sm:text-sm">
                                      <Download className="mr-2 size-4" />
                                      Export
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteClick(card)}
                                      className="text-destructive focus:text-destructive min-h-[44px] sm:min-h-0 text-base sm:text-sm"
                                    >
                                      <Trash2 className="mr-2 size-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-4 sm:mt-6 flex items-center justify-center">
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                          <Button
                            variant="outline"
                            size="default"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="gap-1 min-h-[44px] sm:min-h-0 h-11 sm:h-10 text-sm sm:text-sm"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Previous</span>
                            <span className="sm:hidden">Prev</span>
                          </Button>

                          <div className="flex items-center gap-0.5 sm:gap-1">
                            {(() => {
                              const pages: (number | "ellipsis")[] = [];

                              if (totalPages <= 7) {
                                // Show all pages if 7 or fewer
                                for (let i = 1; i <= totalPages; i++) {
                                  pages.push(i);
                                }
                              } else {
                                // Always show first page
                                pages.push(1);

                                if (currentPage > 3) {
                                  pages.push("ellipsis");
                                }

                                // Show pages around current
                                const start = Math.max(2, currentPage - 1);
                                const end = Math.min(totalPages - 1, currentPage + 1);

                                for (let i = start; i <= end; i++) {
                                  if (i !== 1 && i !== totalPages) {
                                    pages.push(i);
                                  }
                                }

                                if (currentPage < totalPages - 2) {
                                  pages.push("ellipsis");
                                }

                                // Always show last page
                                pages.push(totalPages);
                              }

                              return pages.map((page, index) => {
                                if (page === "ellipsis") {
                                  return (
                                    <div key={`ellipsis-${index}`} className="flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center">
                                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  );
                                }
                                return (
                                  <Button
                                    key={page}
                                    variant={currentPage === page ? "outline" : "ghost"}
                                    size="icon"
                                    onClick={() => setCurrentPage(page)}
                                    className="h-11 w-11 sm:h-9 sm:w-9 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 text-sm sm:text-sm"
                                  >
                                    {page}
                                  </Button>
                                );
                              });
                            })()}
                          </div>

                          <Button
                            variant="outline"
                            size="default"
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="gap-1 min-h-[44px] sm:min-h-0 h-11 sm:h-10 text-sm sm:text-sm"
                          >
                            <span>Next</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md p-4 sm:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Delete ID Card</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Are you sure you want to delete the ID card for{" "}
              <span className="font-semibold">
                {cardToDelete?.employeeData.name || cardToDelete?.employeeData.empId || "this employee"}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel onClick={() => setCardToDelete(null)} className="min-h-[44px] sm:min-h-0 w-full sm:w-auto order-2 sm:order-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-h-[44px] sm:min-h-0 w-full sm:w-auto order-1 sm:order-2"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-3 sm:pb-4">
            <DialogTitle className="text-base sm:text-lg">ID Card Preview</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Preview of ID card for {cardToPreview?.employeeData.name || cardToPreview?.employeeData.empId || "employee"}
            </DialogDescription>
          </DialogHeader>
          {cardToPreview && previewTemplate && (
            <div className="mt-2 sm:mt-4">
              <Tabs defaultValue="front" className="w-full">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <TabsList className="h-11 sm:h-10">
                    <TabsTrigger value="front" className="px-3 sm:px-4 h-10 sm:h-9 text-sm min-h-[44px] sm:min-h-0">
                      <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      <span className="text-xs sm:text-sm">Front Side</span>
                    </TabsTrigger>
                    {previewTemplate.backsideSrc && (
                      <TabsTrigger value="back" className="px-3 sm:px-4 h-10 sm:h-9 text-sm min-h-[44px] sm:min-h-0">
                        <FlipHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                        <span className="text-xs sm:text-sm">Back Side</span>
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>
                <TabsContent value="front" className="flex justify-center m-0">
                  <div className="id-card-shadow overflow-hidden rounded-xl bg-card ring-1 ring-border/50 w-full max-w-[90vw] sm:max-w-[400px]">
                    <IDCardPreview
                      data={cardToPreview.employeeData}
                      templateSrc={previewTemplate.src}
                    />
                  </div>
                </TabsContent>
                {previewTemplate.backsideSrc && (
                  <TabsContent value="back" className="flex justify-center m-0">
                    <div className="id-card-shadow overflow-hidden rounded-xl bg-card ring-1 ring-border/50 w-full max-w-[90vw] sm:max-w-[400px]">
                      <IDCardBacksidePreview
                        backsideSrc={previewTemplate.backsideSrc}
                      />
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IDCards;

