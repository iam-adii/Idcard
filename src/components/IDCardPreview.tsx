import { forwardRef } from "react";
import idCardTemplate from "@/assets/id-card-template.jpeg";

interface EmployeeData {
  empId: string;
  dob: string;
  bloodGroup: string;
  emergencyContact: string;
  idMarks: string;
  photo: string | null;
}

interface IDCardPreviewProps {
  data: EmployeeData;
}

const IDCardPreview = forwardRef<HTMLDivElement, IDCardPreviewProps>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        className="relative w-[400px] h-[640px] bg-card overflow-hidden"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Template Background */}
        <img
          src={idCardTemplate}
          alt="ID Card Template"
          className="absolute inset-0 w-full h-full object-cover"
          crossOrigin="anonymous"
        />

        {/* Photo Area */}
        <div className="absolute top-[124px] left-1/2 -translate-x-1/2 w-[120px] h-[150px] overflow-hidden">
          {data.photo && (
            <img
              src={data.photo}
              alt="Employee Photo"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          )}
        </div>

        {/* Employee Details - aligned to template fields */}
        <div 
          className="absolute text-[13px] font-semibold"
          style={{ color: "#1e3a5f", top: "370px", left: "160px" }}
        >
          {data.empId || ""}
        </div>
        <div 
          className="absolute text-[13px] font-semibold"
          style={{ color: "#1e3a5f", top: "405px", left: "160px" }}
        >
          {data.dob || ""}
        </div>
        <div 
          className="absolute text-[13px] font-semibold"
          style={{ color: "#1e3a5f", top: "440px", left: "160px" }}
        >
          {data.bloodGroup || ""}
        </div>
        <div 
          className="absolute text-[13px] font-semibold"
          style={{ color: "#1e3a5f", top: "475px", left: "160px" }}
        >
          {data.emergencyContact || ""}
        </div>
        <div 
          className="absolute text-[13px] font-semibold leading-tight"
          style={{ color: "#1e3a5f", top: "510px", left: "160px", maxWidth: "200px" }}
        >
          {data.idMarks || ""}
        </div>
      </div>
    );
  }
);

IDCardPreview.displayName = "IDCardPreview";

export default IDCardPreview;
