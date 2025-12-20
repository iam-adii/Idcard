import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import InputPanel from "@/components/InputPanel";
import IDCardPreview from "@/components/IDCardPreview";
import ExportPanel from "@/components/ExportPanel";
import { CreditCard } from "lucide-react";

interface EmployeeData {
  empId: string;
  dob: string;
  bloodGroup: string;
  emergencyContact: string;
  idMarks: string;
  photo: string | null;
}

const initialData: EmployeeData = {
  empId: "",
  dob: "",
  bloodGroup: "",
  emergencyContact: "",
  idMarks: "",
  photo: null,
};

const Index = () => {
  const [employeeData, setEmployeeData] = useState<EmployeeData>(initialData);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                ID Card Generator
              </h1>
              <p className="text-sm text-muted-foreground">
                Create employee ID cards
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Panel - Inputs */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Employee Details</CardTitle>
              </CardHeader>
              <CardContent>
                <InputPanel data={employeeData} onChange={setEmployeeData} />
              </CardContent>
            </Card>

            <ExportPanel cardRef={cardRef} employeeId={employeeData.empId} />
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="id-card-shadow rounded-lg overflow-hidden">
                  <IDCardPreview ref={cardRef} data={employeeData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
