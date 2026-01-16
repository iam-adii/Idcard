import { useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, FileImage, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveIDCard, type EmployeeData } from "@/lib/storage";

interface ExportPanelProps {
  cardRef: React.RefObject<HTMLDivElement>;
  backsideRef?: React.RefObject<HTMLDivElement>;
  employeeId: string;
  employeeData?: EmployeeData;
  templateId?: string;
  inCard?: boolean;
  existingId?: string | null;
  onSave?: (id: string) => void;
}

type ExportFormat = "png" | "pdf";
type ExportQuality = "standard" | "high" | "print";

const qualitySettings = {
  standard: { scale: 2, label: "Standard (2x)", dpi: 192 },
  high: { scale: 3, label: "High (3x)", dpi: 288 },
  print: { scale: 5, label: "Print (5x - 480 DPI)", dpi: 480 },
};

// UUID v4 generator (RFC 4122 compliant)
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const ExportPanel = ({
  cardRef,
  backsideRef,
  employeeId,
  employeeData,
  templateId,
  inCard = false,
  existingId,
  onSave
}: ExportPanelProps) => {
  const [format, setFormat] = useState<ExportFormat>("png");
  const [quality, setQuality] = useState<ExportQuality>("high");
  const [isExporting, setIsExporting] = useState(false);

  const getFileName = () => {
    const id = employeeId.trim() || "employee";
    const sanitized = id.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    return `id_card_${sanitized}`;
  };

  const exportAsImage = async (): Promise<string> => {
    if (!cardRef.current) throw new Error("Card element not found");

    const { scale } = qualitySettings[quality];

    // Temporarily make both sides visible for export if backside exists
    let frontParent: HTMLElement | null = null;
    let backParent: HTMLElement | null = null;
    let frontOriginalStyle: string | null = null;
    let backOriginalStyle: string | null = null;

    if (backsideRef?.current) {
      // Make front side visible - find the container div with opacity
      frontParent = cardRef.current.closest('.id-card-shadow')?.parentElement as HTMLElement;
      if (frontParent) {
        frontOriginalStyle = frontParent.style.cssText;
        frontParent.style.opacity = '1';
        frontParent.style.visibility = 'visible';
        frontParent.style.pointerEvents = 'auto';
        frontParent.style.position = 'relative';
        frontParent.style.zIndex = '10';
      }

      // Make back side visible - find the container div with opacity
      backParent = backsideRef.current.closest('.id-card-shadow')?.parentElement as HTMLElement;
      if (backParent) {
        backOriginalStyle = backParent.style.cssText;
        backParent.style.opacity = '1';
        backParent.style.visibility = 'visible';
        backParent.style.pointerEvents = 'auto';
        backParent.style.position = 'relative';
        backParent.style.zIndex = '10';
      }

      // Small delay to ensure styles are applied
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      const frontDataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: scale,
        cacheBust: true,
        skipFonts: true,
      });

      // If backside exists, combine front and back
      if (backsideRef?.current) {
        const backDataUrl = await toPng(backsideRef.current, {
          quality: 1,
          pixelRatio: scale,
          cacheBust: true,
          skipFonts: true,
        });

        // Create a canvas to combine both sides
        const combinedDataUrl = await new Promise<string>((resolve, reject) => {
          const frontImg = new Image();
          const backImg = new Image();

          frontImg.crossOrigin = "anonymous";
          backImg.crossOrigin = "anonymous";

          frontImg.onload = () => {
            backImg.onload = () => {
              try {
                const canvas = document.createElement("canvas");
                // Place cards side by side (front | back)
                canvas.width = frontImg.width * 2;
                canvas.height = frontImg.height;
                const ctx = canvas.getContext("2d");

                if (!ctx) {
                  reject(new Error("Could not get canvas context"));
                  return;
                }

                // Draw front side on the left
                ctx.drawImage(frontImg, 0, 0);
                // Draw back side on the right
                ctx.drawImage(backImg, frontImg.width, 0);

                resolve(canvas.toDataURL("image/png", 1));
              } catch (error) {
                reject(error);
              }
            };
            backImg.onerror = reject;
            backImg.src = backDataUrl;
          };
          frontImg.onerror = reject;
          frontImg.src = frontDataUrl;
        });

        // Restore original styles before returning
        if (frontParent && frontOriginalStyle !== null) {
          frontParent.style.cssText = frontOriginalStyle;
        }
        if (backParent && backOriginalStyle !== null) {
          backParent.style.cssText = backOriginalStyle;
        }

        return combinedDataUrl;
      }

      return frontDataUrl;
    } finally {
      // Restore original styles in case of error
      if (frontParent && frontOriginalStyle !== null) {
        frontParent.style.cssText = frontOriginalStyle;
      }
      if (backParent && backOriginalStyle !== null) {
        backParent.style.cssText = backOriginalStyle;
      }
    }
  };

  const downloadImage = (dataUrl: string) => {
    const link = document.createElement("a");
    link.download = `${getFileName()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const exportAsPDF = async (frontImageDataUrl: string) => {
    // ID card dimensions in mm (standard CR80 card size: 85.6mm x 53.98mm)
    // But our template is portrait, so we'll use appropriate dimensions
    const cardWidth = 54; // mm
    const cardHeight = 86; // mm

    const { scale } = qualitySettings[quality];

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [cardWidth, cardHeight],
    });

    // Add front page
    pdf.addImage(frontImageDataUrl, "PNG", 0, 0, cardWidth, cardHeight);

    // If backside exists, add it as a second page
    if (backsideRef?.current) {
      // Temporarily make back side visible for export
      let backParent: HTMLElement | null = null;
      let backOriginalStyle: string | null = null;

      backParent = backsideRef.current.closest('.id-card-shadow')?.parentElement as HTMLElement;
      if (backParent) {
        backOriginalStyle = backParent.style.cssText;
        backParent.style.opacity = '1';
        backParent.style.visibility = 'visible';
        backParent.style.pointerEvents = 'auto';
        backParent.style.position = 'relative';
        backParent.style.zIndex = '10';
      }

      // Small delay to ensure styles are applied
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        const backDataUrl = await toPng(backsideRef.current, {
          quality: 1,
          pixelRatio: scale,
          cacheBust: true,
          skipFonts: true,
        });

        pdf.addPage([cardWidth, cardHeight], "portrait");
        pdf.addImage(backDataUrl, "PNG", 0, 0, cardWidth, cardHeight);
      } finally {
        // Restore original styles
        if (backParent && backOriginalStyle !== null) {
          backParent.style.cssText = backOriginalStyle;
        }
      }
    }

    pdf.save(`${getFileName()}.pdf`);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (format === "png") {
        const imageDataUrl = await exportAsImage();
        downloadImage(imageDataUrl);
        toast.success(backsideRef?.current ? "ID Card (front & back) exported as PNG" : "ID Card exported as PNG");
      } else {
        // For PDF, export front separately (back will be handled in exportAsPDF)
        const { scale } = qualitySettings[quality];
        const frontDataUrl = await toPng(cardRef.current!, {
          quality: 1,
          pixelRatio: scale,
          cacheBust: true,
          skipFonts: true,
        });
        await exportAsPDF(frontDataUrl);
        toast.success(backsideRef?.current ? "ID Card (front & back) exported as PDF" : "ID Card exported as PDF");
      }

      // Auto-save ID card data
      if (employeeData) {
        try {
          const idToSave = existingId || generateUUID();
          await saveIDCard({
            id: idToSave,
            createdAt: new Date().toISOString(),
            employeeData,
            templateId,
          });
          if (onSave) {
            onSave(idToSave);
          }
          toast.success("ID card saved successfully");
        } catch (error) {
          console.error("Failed to save ID card:", error);
          // Don't show error toast for save failures, just log it
        }
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={inCard ? "space-y-3 sm:space-y-4" : "space-y-3 sm:space-y-4 p-3 sm:p-4 bg-secondary/50 rounded-lg border"}>
      <h3 className="font-semibold text-xs sm:text-sm text-foreground">Export Options</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs sm:text-xs">Format</Label>
          <Select
            value={format}
            onValueChange={(v) => setFormat(v as ExportFormat)}
          >
            <SelectTrigger className="h-11 sm:h-9 text-base sm:text-sm min-h-[44px] sm:min-h-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png" className="text-base sm:text-sm min-h-[44px] sm:min-h-0">
                <div className="flex items-center gap-2">
                  <FileImage className="w-3.5 h-3.5" />
                  PNG Image
                </div>
              </SelectItem>
              <SelectItem value="pdf" className="text-base sm:text-sm min-h-[44px] sm:min-h-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  PDF Document
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs sm:text-xs">Quality</Label>
          <Select
            value={quality}
            onValueChange={(v) => setQuality(v as ExportQuality)}
          >
            <SelectTrigger className="h-11 sm:h-9 text-base sm:text-sm min-h-[44px] sm:min-h-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(qualitySettings).map(([key, { label }]) => (
                <SelectItem key={key} value={key} className="text-base sm:text-sm min-h-[44px] sm:min-h-0">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full min-h-[44px] sm:min-h-0 h-12 sm:h-10 text-base sm:text-sm"
        size="lg"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            <span>Export ID Card</span>
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        {quality === "print"
          ? "Best for printing"
          : quality === "high"
            ? "Good for digital use"
            : "Smaller file size"}
      </p>
    </div>
  );
};

export default ExportPanel;
