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
  templateSrc?: string;
  cssFilter?: string;
}

const IDCardPreview = forwardRef<HTMLDivElement, IDCardPreviewProps>(
  ({ data, templateSrc, cssFilter }, ref) => {
    return (
      <div
        ref={ref}
        className="relative w-full max-w-[400px] aspect-[5/8] bg-card overflow-hidden"
        style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif" }}
      >
        {/* Template Background */}
        <img
          src={templateSrc || idCardTemplate}
          alt="ID Card Template"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: cssFilter || "none" }}
          crossOrigin="anonymous"
        />

        {/* Photo Area - 30.5% width, 23.4375% height, positioned at 35.5% left, 18% top */}
        <div 
          className="absolute w-[30.5%] aspect-[122/150] overflow-hidden" 
          style={{ left: "35.5%", top: "18%" }}
        >
          {data.photo && (
            <img
              src={data.photo}
              alt="Employee Photo"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          )}
        </div>

        {/* Employee Details - using percentage-based positioning */}
        <div
          className="absolute text-sm sm:text-base font-bold"
          style={{ color: "rgba(0, 0, 0, 1)", top: "415px", left: "161px" }}
        >
          {data.empId}
        </div>
        <div
          className="absolute text-sm sm:text-base font-bold"
          style={{ color: "rgba(0, 0, 0, 1)", top: "448px", left: "162px" }}
        >
          {data.dob}
        </div>
        <div
          className="absolute text-sm sm:text-base font-bold"
          style={{ color: "rgba(0, 0, 0, 1)", top: "479px", left: "163px" }}
        >
          {data.bloodGroup}
        </div>
        <div
          className="absolute text-sm sm:text-base font-bold"
          style={{ color: "rgba(0, 0, 0, 1)", top: "511px", left: "161px" }}
        >
          {data.emergencyContact}
        </div>
        <div
          className="absolute text-sm sm:text-base font-bold leading-tight"
          style={{ color: "rgba(0, 0, 0, 1)", top: "542px", left: "160px", maxWidth: "37.5%" }}
        >
          {data.idMarks}
        </div>
      </div>
    );
  }
);

IDCardPreview.displayName = "IDCardPreview";

export default IDCardPreview;
