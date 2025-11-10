import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportDropdownProps {
  onExportCSV: () => void;
  onExportExcel: () => void;
  onCopyClipboard: () => void;
}

export const ExportDropdown = ({
  onExportCSV,
  onExportExcel,
  onCopyClipboard,
}: ExportDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExportCSV}>
          📄 Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportExcel}>
          📊 Export as Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCopyClipboard}>
          📋 Copy to Clipboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
