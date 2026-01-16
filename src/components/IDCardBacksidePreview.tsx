import { forwardRef } from "react";

interface IDCardBacksidePreviewProps {
  backsideSrc: string;
}

const IDCardBacksidePreview = forwardRef<HTMLDivElement, IDCardBacksidePreviewProps>(
  ({ backsideSrc }, ref) => {
    return (
      <div
        ref={ref}
        className="relative w-full max-w-[400px] aspect-[5/8] bg-card overflow-hidden"
        style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif" }}
      >
        {/* Backside Template - Static */}
        <img
          src={backsideSrc}
          alt="ID Card Backside"
          className="absolute inset-0 w-full h-full object-cover"
          crossOrigin="anonymous"
        />
      </div>
    );
  }
);

IDCardBacksidePreview.displayName = "IDCardBacksidePreview";

export default IDCardBacksidePreview;

