import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface EmployeeData {
  empId: string;
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
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="empId">Employee ID</Label>
        <Input
          id="empId"
          placeholder="Enter employee ID"
          value={data.empId}
          onChange={(e) => handleChange("empId", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dob">Date of Birth</Label>
        <Input
          id="dob"
          type="date"
          value={data.dob}
          onChange={(e) => handleChange("dob", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bloodGroup">Blood Group</Label>
        <Input
          id="bloodGroup"
          placeholder="e.g., O+, A-, B+"
          value={data.bloodGroup}
          onChange={(e) => handleChange("bloodGroup", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="emergencyContact">Emergency Contact</Label>
        <Input
          id="emergencyContact"
          placeholder="Phone number"
          value={data.emergencyContact}
          onChange={(e) => handleChange("emergencyContact", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="idMarks">Identification Marks</Label>
        <Textarea
          id="idMarks"
          placeholder="Any identifying marks"
          value={data.idMarks}
          onChange={(e) => handleChange("idMarks", e.target.value)}
          className="resize-none h-20"
        />
      </div>

      <div className="space-y-2">
        <Label>Employee Photo</Label>
        <div className="flex items-center gap-3">
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
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            {data.photo ? "Change Photo" : "Upload Photo"}
          </Button>
          {data.photo && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={removePhoto}
              className="text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        {data.photo && (
          <div className="mt-2 w-16 h-20 rounded border overflow-hidden">
            <img
              src={data.photo}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InputPanel;
