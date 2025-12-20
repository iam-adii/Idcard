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
            {data.name || "EMPLOYEE NAME"}
          </span>
        </div>

        {/* Photo Area */}
        <div className="absolute top-[124px] left-1/2 -translate-x-1/2 w-[120px] h-[150px] overflow-hidden bg-muted">
          {data.photo ? (
            <img
              src={data.photo}
              alt="Employee Photo"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              Photo
            </div>
          )}
        </div>

        {/* Employee Details */}
        <div className="absolute top-[355px] left-[135px] right-[20px] space-y-[8px] text-sm font-medium" style={{ color: "#1e3a5f" }}>
          <div>{data.empId || "—"}</div>
          <div>{data.dob || "—"}</div>
          <div>{data.bloodGroup || "—"}</div>
          <div>{data.emergencyContact || "—"}</div>
          <div className="text-xs leading-tight max-w-[200px]">
            {data.idMarks || "—"}
          </div>
        </div>
      </div>
    );
  }
);

IDCardPreview.displayName = "IDCardPreview";

export default IDCardPreview;
