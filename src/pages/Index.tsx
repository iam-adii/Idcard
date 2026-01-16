import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import InputPanel from "@/components/InputPanel";
import IDCardPreview from "@/components/IDCardPreview";
import IDCardBacksidePreview from "@/components/IDCardBacksidePreview";
import ExportPanel from "@/components/ExportPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Download, FileText, Sparkles, FlipHorizontal } from "lucide-react";
import idCardTemplate from "@/assets/id-card-template.jpeg";
import idCardBackside from "@/assets/default-backside.png";
import { getAllTemplates, type SavedIDCard, DEFAULT_TEMPLATE_ID, getNextEmployeeId } from "@/lib/storage";

interface EmployeeData {
  empId: string;
  name: string;
  designation: string;
  dob: string;
  bloodGroup: string;
  emergencyContact: string;
  idMarks: string;
  photo: string | null;
}

const initialData: EmployeeData = {
  empId: "",
  name: "",
  designation: "",
  dob: "",
  bloodGroup: "",
  emergencyContact: "",
  idMarks: "",
  photo: null,
};

const Index = () => {
  const [employeeData, setEmployeeData] = useState<EmployeeData>(initialData);
  const cardRef = useRef<HTMLDivElement>(null);
  const backsideRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState<{ src: string, backsideSrc?: string, filter: string, id?: string } | null>(null);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>("front");
  const [currentCardId, setCurrentCardId] = useState<string | null>(null);

  // Handle loading saved card data from IDCards page
  useEffect(() => {
    const loadCardData = async () => {
      if (location.state?.savedCard) {
        const savedCard = location.state.savedCard as SavedIDCard;
        setEmployeeData(savedCard.employeeData);
        setCurrentCardId(savedCard.id);

        // Load template if templateId exists
        if (savedCard.templateId && savedCard.templateId !== DEFAULT_TEMPLATE_ID) {
          const templates = await getAllTemplates();
          const template = templates.find((t) => t.id === savedCard.templateId);
          if (template) {
            setSelectedTemplate({
              src: template.src,
              backsideSrc: template.backsideSrc,
              filter: "none",
              id: template.id,
            });
            setCurrentTemplateId(template.id);
          } else {
            // Template not found, use default
            setSelectedTemplate({
              src: idCardTemplate,
              backsideSrc: idCardBackside,
              filter: "none",
            });
            setCurrentTemplateId(DEFAULT_TEMPLATE_ID);
          }
        } else {
          // Use default template
          setSelectedTemplate({
            src: idCardTemplate,
            backsideSrc: idCardBackside,
            filter: "none",
          });
          setCurrentTemplateId(DEFAULT_TEMPLATE_ID);
        }
      } else if (location.state?.selectedTemplate) {
        // Handle template selection from Templates page
        const template = location.state.selectedTemplate;
        setSelectedTemplate(template);
        const templateId = template.id || DEFAULT_TEMPLATE_ID;
        setCurrentTemplateId(templateId);
        setCurrentCardId(null);

        // Auto-generate Employee ID for new cards (from template)
        const nextId = await getNextEmployeeId(templateId);
        setEmployeeData(prev => ({ ...prev, empId: nextId }));
      } else {
        // Set default template with backside if no template is selected
        setSelectedTemplate({
          src: idCardTemplate,
          backsideSrc: idCardBackside,
          filter: "none",
        });
        setCurrentTemplateId(DEFAULT_TEMPLATE_ID);
        setCurrentCardId(null);

        // Auto-generate Employee ID for new cards
        const nextId = await getNextEmployeeId(DEFAULT_TEMPLATE_ID);
        setEmployeeData(prev => ({ ...prev, empId: nextId }));
      }
    };

    loadCardData();
  }, [location.state]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        {/* Decorative background */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_55%)]" />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--accent)/0.06),transparent_50%)]" />

        {/* Header */}
        <header className="sticky top-0 z-40 flex h-14 sm:h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-2 sm:px-4 shadow-sm">
          <SidebarTrigger className="-ml-1 h-10 w-10 sm:h-9 sm:w-9" />
          <div className="flex flex-1 items-center gap-2 sm:gap-4 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
              <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <CreditCard className="size-3.5 sm:size-4" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight truncate">ID Card Creator</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Create professional employee ID cards</p>
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
              <Sparkles className="size-3.5" />
              <span>Print-ready export</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-2 sm:p-4 pt-4 sm:pt-6">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12 lg:gap-8">
            {/* Left column */}
            <section className="space-y-4 sm:space-y-6 lg:col-span-5 xl:col-span-4">
              <Card className="shadow-sm border-border/50">
                <CardHeader className="space-y-1 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <FileText className="size-3.5 sm:size-4 text-muted-foreground" />
                    Employee details
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Upload a photo and enter the employee information.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <InputPanel data={employeeData} onChange={setEmployeeData} />
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/50">
                <CardHeader className="space-y-1 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Download className="size-3.5 sm:size-4 text-muted-foreground" />
                    Export
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Download as PNG for digital use or PDF for printing.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <ExportPanel
                    cardRef={cardRef}
                    backsideRef={(selectedTemplate?.backsideSrc || idCardBackside) ? backsideRef : undefined}
                    employeeId={employeeData.empId}
                    employeeData={employeeData}
                    templateId={currentTemplateId}
                    inCard
                    existingId={currentCardId}
                    onSave={(newId) => setCurrentCardId(newId)}
                  />
                </CardContent>
              </Card>
            </section>

            {/* Right column */}
            <section className="lg:col-span-7 xl:col-span-8">
              <div className="lg:sticky lg:top-20 space-y-3 sm:space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  {/* Tabs for switching between front and back - above the card */}
                  {(selectedTemplate?.backsideSrc || idCardBackside) && (
                    <div className="flex justify-center sm:justify-start mb-3 sm:mb-4">
                      <TabsList className="inline-flex h-11 sm:h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground border border-border/50 shadow-sm">
                        <TabsTrigger
                          value="front"
                          className="px-3 sm:px-4 h-9 sm:h-8 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm min-h-[44px] sm:min-h-0"
                        >
                          <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                          <span className="text-xs sm:text-sm">Front Side</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="back"
                          className="px-3 sm:px-4 h-9 sm:h-8 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm min-h-[44px] sm:min-h-0"
                        >
                          <FlipHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                          <span className="text-xs sm:text-sm">Back Side</span>
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  )}

                  <Card className="shadow-sm border-border/50">
                    <CardHeader className="space-y-1 p-4 sm:p-6">
                      <CardTitle className="text-sm sm:text-base">Live Preview</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Real-time preview of your ID card. What you see is what gets exported.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6">
                      <div className="w-full overflow-x-auto pb-2 -mx-3 sm:mx-0">
                        <div className="mx-auto w-full max-w-[90vw] sm:max-w-[400px] flex justify-center relative">
                          {/* Always render both sides for export - visibility controlled by activeTab */}
                          <div className="relative w-full" style={{ minHeight: '500px' }}>
                            {/* Front side - always rendered, positioned for export */}
                            <div
                              className={`id-card-shadow overflow-hidden rounded-xl bg-card ring-1 ring-border/50 w-full transition-opacity ${activeTab === 'front' ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 pointer-events-none'
                                }`}
                            >
                              <IDCardPreview
                                ref={cardRef}
                                data={employeeData}
                                templateSrc={selectedTemplate?.src || idCardTemplate}
                                cssFilter={selectedTemplate?.filter}
                              />
                            </div>
                            {/* Back side - always rendered, positioned for export */}
                            {(selectedTemplate?.backsideSrc || idCardBackside) && (
                              <div
                                className={`id-card-shadow overflow-hidden rounded-xl bg-card ring-1 ring-border/50 w-full transition-opacity ${activeTab === 'back' ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 pointer-events-none'
                                  }`}
                              >
                                <IDCardBacksidePreview
                                  ref={backsideRef}
                                  backsideSrc={selectedTemplate?.backsideSrc || idCardBackside}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Tabs>
              </div>
            </section>
          </div>
        </div>
      </SidebarInset >
    </>
  );
};

export default Index;
