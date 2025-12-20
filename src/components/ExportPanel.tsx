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

interface ExportPanelProps {
  cardRef: React.RefObject<HTMLDivElement>;
  employeeName: string;
}

type ExportFormat = "png" | "pdf";
type ExportQuality = "standard" | "high" | "print";

const qualitySettings = {
  standard: { scale: 1, label: "Standard (1x)", dpi: 96 },
  high: { scale: 2, label: "High (2x)", dpi: 192 },
  print: { scale: 4, label: "Print (4x - 300 DPI)", dpi: 300 },
};

const ExportPanel = ({ cardRef, employeeName }: ExportPanelProps) => {
  const [format, setFormat] = useState<ExportFormat>("png");
  const [quality, setQuality] = useState<ExportQuality>("high");
  const [isExporting, setIsExporting] = useState(false);

  const getFileName = () => {
    const name = employeeName.trim() || "employee";
    const sanitized = name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    return `id_card_${sanitized}`;
  };

  const exportAsImage = async (): Promise<string> => {
    if (!cardRef.current) throw new Error("Card element not found");

    const { scale } = qualitySettings[quality];

    const dataUrl = await toPng(cardRef.current, {
      quality: 1,
      pixelRatio: scale,
      cacheBust: true,
    });

    return dataUrl;
  };

  const downloadImage = (dataUrl: string) => {
    const link = document.createElement("a");
    link.download = `${getFileName()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const exportAsPDF = async (imageDataUrl: string) => {
    // ID card dimensions in mm (standard CR80 card size: 85.6mm x 53.98mm)
    // But our template is portrait, so we'll use appropriate dimensions
    const cardWidth = 54; // mm
    const cardHeight = 86; // mm

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [cardWidth, cardHeight],
    });

    pdf.addImage(imageDataUrl, "PNG", 0, 0, cardWidth, cardHeight);
    pdf.save(`${getFileName()}.pdf`);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const imageDataUrl = await exportAsImage();

      if (format === "png") {
        downloadImage(imageDataUrl);
        toast.success("ID Card exported as PNG");
      } else {
        await exportAsPDF(imageDataUrl);
        toast.success("ID Card exported as PDF");
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border">
      <h3 className="font-semibold text-sm text-foreground">Export Options</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Format</Label>
          <Select
            value={format}
            onValueChange={(v) => setFormat(v as ExportFormat)}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">
                <div className="flex items-center gap-2">
                  <FileImage className="w-3.5 h-3.5" />
                  PNG Image
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  PDF Document
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Quality</Label>
          <Select
            value={quality}
            onValueChange={(v) => setQuality(v as ExportQuality)}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(qualitySettings).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
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
        className="w-full"
        size="lg"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Export ID Card
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
