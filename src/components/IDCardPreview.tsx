import { forwardRef } from "react";
import idCardTemplate from "@/assets/id-card-template.jpeg";

interface EmployeeData {
  name: string;
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

        {/* Employee Name */}
        <div className="absolute top-[295px] left-0 right-0 text-center">
          <span
            className="text-lg font-bold tracking-wide"
            style={{ color: "#1e3a5f" }}
          >
            {data.name || ""}
          </span>
        </div>

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
          style={{ color: "#1e3a5f", top: "356px", left: "148px" }}
        >
          {data.empId || ""}
        </div>
        <div 
          className="absolute text-[13px] font-semibold"
          style={{ color: "#1e3a5f", top: "388px", left: "148px" }}
        >
          {data.dob || ""}
        </div>
        <div 
          className="absolute text-[13px] font-semibold"
          style={{ color: "#1e3a5f", top: "420px", left: "148px" }}
        >
          {data.bloodGroup || ""}
        </div>
        <div 
          className="absolute text-[13px] font-semibold"
          style={{ color: "#1e3a5f", top: "452px", left: "148px" }}
        >
          {data.emergencyContact || ""}
        </div>
        <div 
          className="absolute text-[13px] font-semibold leading-tight"
          style={{ color: "#1e3a5f", top: "484px", left: "148px", maxWidth: "200px" }}
        >
          {data.idMarks || ""}
        </div>
      </div>
    );
  }
);

IDCardPreview.displayName = "IDCardPreview";

export default IDCardPreview;
