import { ChevronRightIcon } from "lucide-react";
import { ChevronLeftIcon } from "lucide-react";
import { Button } from "../ui/button";

export default function Navigation({
  handlePageChange,
}: {
  handlePageChange: (direction: "prev" | "next") => void;
}) {
  return (
    <div className="w-full py-10 max-w-[400px] mx-auto">
      <div className="flex justify-center items-center space-x-2">
        <Button
          onClick={() => handlePageChange("prev")}
          variant="default"
          size="sm"
          className="w-full"
        >
          <ChevronLeftIcon className="h-4 w-4" /> Prev
        </Button>
        <Button
          onClick={() => handlePageChange("next")}
          variant="default"
          size="sm"
          className="w-full"
        >
          Next <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
