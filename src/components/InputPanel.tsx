import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

interface InputPanelProps {
  data: EmployeeData;
  onChange: (data: EmployeeData) => void;
}

const InputPanel = ({ data, onChange }: InputPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof EmployeeData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  // Handle manual date input with DD/MM/YYYY format
  const handleDateInputChange = (value: string) => {
    // Allow empty input
    if (!value || value.trim() === "") {
      handleChange("dob", "");
      return;
    }

    // Keep only digits and slashes - this allows manual typing with slashes
    let cleaned = value.replace(/[^\d/]/g, "");
    
    // Handle manual typing with slashes (e.g., user types "25/12/1990")
    if (cleaned.includes("/")) {
      // User is manually typing with slashes - preserve their input
      const parts = cleaned.split("/");
      let formatted = "";
      
      // Process each part (day, month, year)
      for (let i = 0; i < Math.min(parts.length, 3); i++) {
        if (i > 0) formatted += "/";
        
        const part = parts[i].trim();
        
        if (i === 0) {
          // Day: allow up to 2 digits
          let day = part.substring(0, 2);
          // Only validate if user has entered 2 digits
          if (day.length === 2) {
            const dayNum = parseInt(day, 10);
            if (dayNum > 31) day = "31";
            if (dayNum === 0 && day.length > 0) day = "01";
          }
          formatted += day;
        } else if (i === 1) {
          // Month: allow up to 2 digits
          let month = part.substring(0, 2);
          // Only validate if user has entered 2 digits
          if (month.length === 2) {
            const monthNum = parseInt(month, 10);
            if (monthNum > 12) month = "12";
            if (monthNum === 0 && month.length > 0) month = "01";
          }
          formatted += month;
        } else if (i === 2) {
          // Year: allow up to 4 digits
          formatted += part.substring(0, 4);
        }
      }
      
      // Limit total length to 10 characters (DD/MM/YYYY)
      if (formatted.length <= 10) {
        handleChange("dob", formatted);
      } else {
        // Keep previous valid value if exceeds length
        handleChange("dob", data.dob);
      }
    } else {
      // User is typing numbers without slashes - auto-format as they type
      let digits = cleaned.replace(/\D/g, "");
      
      if (digits.length === 0) {
        handleChange("dob", "");
        return;
      }
      
      // Auto-format: "25121990" -> "25/12/1990"
      let formatted = "";
      if (digits.length >= 1) {
        formatted += digits.substring(0, 2); // Day (up to 2 digits)
      }
      if (digits.length > 2) {
        formatted += "/" + digits.substring(2, 4); // Month (up to 2 digits)
      }
      if (digits.length > 4) {
        formatted += "/" + digits.substring(4, 8); // Year (up to 4 digits)
      }
      
      // Validate day and month if they're complete (2 digits)
      const parts = formatted.split("/");
      if (parts[0] && parts[0].length === 2) {
        const dayNum = parseInt(parts[0], 10);
        if (dayNum > 31) {
          formatted = "31" + (parts[1] ? "/" + parts[1] : "") + (parts[2] ? "/" + parts[2] : "");
        } else if (dayNum === 0) {
          formatted = "01" + (parts[1] ? "/" + parts[1] : "") + (parts[2] ? "/" + parts[2] : "");
        }
      }
      if (parts[1] && parts[1].length === 2) {
        const monthNum = parseInt(parts[1], 10);
        if (monthNum > 12) {
          formatted = (parts[0] || "") + "/12" + (parts[2] ? "/" + parts[2] : "");
        } else if (monthNum === 0) {
          formatted = (parts[0] || "") + "/01" + (parts[2] ? "/" + parts[2] : "");
        }
      }
      
      // Limit total length
      if (formatted.length <= 10) {
        handleChange("dob", formatted);
      } else {
        handleChange("dob", formatted.substring(0, 10));
      }
    }
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    onChange({ ...data, photo: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Photo Upload Section - At the Top */}
      <div className="space-y-2 sm:space-y-3">
        <Label className="text-sm sm:text-base font-semibold">Employee Photo</Label>
        <div className="rounded-lg border border-dashed bg-muted/30 p-3 sm:p-6">
            {data.photo ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="relative mx-auto w-24 h-30 sm:w-32 sm:h-40 rounded-lg overflow-hidden border-2 border-primary/20 shadow-md">
                  <img
                    src={data.photo}
                    alt="Employee Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 min-h-[44px] sm:min-h-0 h-11 sm:h-10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    <span className="text-sm sm:text-base">Change Photo</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removePhoto}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 h-11 w-11 sm:h-10 sm:w-10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 sm:py-8 space-y-3 sm:space-y-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center">
                  <ImageIcon className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
                <div className="text-center space-y-1.5 sm:space-y-2">
                  <p className="text-sm font-medium">Upload employee photo</p>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 120x150px or similar ratio
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <Button
                  type="button"
                  variant="default"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full min-h-[44px] sm:min-h-0 h-11 sm:h-10"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  <span className="text-sm sm:text-base">Choose Photo</span>
                </Button>
              </div>
            )}
        </div>
      </div>

      <Separator />

      {/* Employee Details Section */}
      <div className="space-y-4 sm:space-y-5">
        <h3 className="text-sm sm:text-base font-semibold text-foreground">Personal Information</h3>
        
        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter employee name"
              value={data.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="h-11 sm:h-10 text-base sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation" className="text-sm font-medium">
              Designation <span className="text-destructive">*</span>
            </Label>
            <Input
              id="designation"
              placeholder="Enter designation"
              value={data.designation}
              onChange={(e) => handleChange("designation", e.target.value)}
              className="h-11 sm:h-10 text-base sm:text-sm"
            />
          </div>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="empId" className="text-sm font-medium">
              Employee ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="empId"
              placeholder="Enter employee ID"
              value={data.empId}
              onChange={(e) => handleChange("empId", e.target.value)}
              className="h-11 sm:h-10 text-base sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob" className="text-sm font-medium">
              Date of Birth
            </Label>
            <Input
              id="dob"
              type="text"
              placeholder="DD/MM/YYYY"
              value={data.dob}
              onChange={(e) => handleDateInputChange(e.target.value)}
              onBlur={(e) => {
                // On blur, validate and format the date if partially entered
                const value = e.target.value.trim();
                if (value && value.length > 0 && value.length < 10) {
                  // Allow partial dates to remain for user to continue typing
                  return;
                }
              }}
              className="h-11 sm:h-10 flex-1 text-base sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodGroup" className="text-sm font-medium">
              Blood Group
            </Label>
            <Select
              value={data.bloodGroup}
              onValueChange={(value) => handleChange("bloodGroup", value)}
            >
              <SelectTrigger id="bloodGroup" className="h-11 sm:h-10 text-base sm:text-sm">
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                {bloodGroups.map((group) => (
                  <SelectItem key={group} value={group} className="text-base sm:text-sm min-h-[44px] sm:min-h-0">
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact" className="text-sm font-medium">
              Emergency Contact
            </Label>
            <Input
              id="emergencyContact"
              placeholder="Phone number"
              value={data.emergencyContact}
              onChange={(e) => handleChange("emergencyContact", e.target.value)}
              className="h-11 sm:h-10 text-base sm:text-sm"
            />
          </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idMarks" className="text-sm font-medium">
              Identification Marks
            </Label>
            <Textarea
              id="idMarks"
              placeholder="Any identifying marks or features"
              value={data.idMarks}
              onChange={(e) => handleChange("idMarks", e.target.value)}
              className="resize-none h-24 text-base sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputPanel;
