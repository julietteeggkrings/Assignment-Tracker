import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Assignment } from "@/types/assignment";
import { SyllabusPreviewTable } from "./SyllabusPreviewTable";

interface CourseInfo {
  courseCode: string;
  courseTitle: string;
  instructor: string;
  schedule: string;
}

interface ParsedAssignment {
  title: string;
  type: string;
  dueDate: string;
  dueTime?: string;
  weight?: number;
  notes?: string;
}

interface SyllabusUploadDialogProps {
  onAssignmentsExtracted: (assignments: Omit<Assignment, "id">[], courseInfo: CourseInfo) => void;
}

export const SyllabusUploadDialog = ({ onAssignmentsExtracted }: SyllabusUploadDialogProps) => {
  const [open, setOpen] = useState(false);
  const [courseInfo, setCourseInfo] = useState<CourseInfo>({
    courseCode: "",
    courseTitle: "",
    instructor: "",
    schedule: "",
  });
  const [uploadMethod, setUploadMethod] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedAssignments, setParsedAssignments] = useState<ParsedAssignment[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setCourseInfo({
      courseCode: "",
      courseTitle: "",
      instructor: "",
      schedule: "",
    });
    setFile(null);
    setPastedText("");
    setParsedAssignments([]);
    setShowPreview(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileSize = selectedFile.size / 1024 / 1024; // MB
      if (fileSize > 10) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      const fileType = selectedFile.type;
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/plain",
      ];

      if (!validTypes.includes(fileType)) {
        toast({
          title: "Invalid file format",
          description: "Please upload a PDF, Word document, or text file",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          
          if (file.type === "text/plain") {
            resolve(content);
          } else if (file.type === "application/pdf") {
            // For PDFs, we'll just use the text content
            // In a real implementation, you'd use pdf.js or similar
            toast({
              title: "PDF parsing",
              description: "For best results with PDFs, try copying and pasting the text directly",
            });
            resolve(content);
          } else {
            // For Word docs, fallback to text content
            toast({
              title: "Word document parsing",
              description: "For best results with Word docs, try copying and pasting the text directly",
            });
            resolve(content);
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      
      if (file.type === "text/plain") {
        reader.readAsText(file);
      } else {
        reader.readAsText(file); // Simplified - in production use proper PDF/DOCX parsers
      }
    });
  };

  const handleParse = async () => {
    if (!courseInfo.courseCode || !courseInfo.courseTitle) {
      toast({
        title: "Missing course information",
        description: "Please fill in course code and title",
        variant: "destructive",
      });
      return;
    }

    if (uploadMethod === "file" && !file) {
      toast({
        title: "No file selected",
        description: "Please upload a file",
        variant: "destructive",
      });
      return;
    }

    if (uploadMethod === "text" && !pastedText.trim()) {
      toast({
        title: "No text provided",
        description: "Please paste syllabus text",
        variant: "destructive",
      });
      return;
    }

    setIsParsing(true);

    try {
      let syllabusText = "";

      if (uploadMethod === "file" && file) {
        syllabusText = await extractTextFromFile(file);
      } else {
        syllabusText = pastedText;
      }

      const { supabase } = await import("@/integrations/supabase/client");
      
      const { data, error } = await supabase.functions.invoke("parse-syllabus", {
        body: {
          syllabusText,
          courseCode: courseInfo.courseCode,
          courseTitle: courseInfo.courseTitle,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const assignments = data.assignments || [];
      
      if (assignments.length === 0) {
        toast({
          title: "No assignments found",
          description: "Unable to extract assignments from the syllabus. Try adding them manually or paste the text more clearly.",
        });
      } else {
        toast({
          title: "Parsing successful",
          description: `Found ${assignments.length} assignments`,
        });
      }

      setParsedAssignments(assignments);
      setShowPreview(true);
    } catch (error) {
      console.error("Parsing error:", error);
      toast({
        title: "Parsing failed",
        description: error instanceof Error ? error.message : "Failed to parse syllabus",
        variant: "destructive",
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmAssignments = (assignments: Omit<Assignment, "id">[]) => {
    onAssignmentsExtracted(assignments, courseInfo);
    setOpen(false);
    resetForm();
    toast({
      title: "Success",
      description: `Added ${assignments.length} assignments to ${courseInfo.courseCode}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/80">
          <Upload className="mr-2 h-4 w-4" />
          Upload Syllabus
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Syllabus</DialogTitle>
          <DialogDescription>
            Upload a PDF/Word file or paste syllabus text to automatically extract assignments
          </DialogDescription>
        </DialogHeader>

        {!showPreview ? (
          <div className="space-y-6">
            {/* Course Information */}
            <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
              <h3 className="font-semibold">Course Details (Required)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courseCode">Course Code</Label>
                  <Input
                    id="courseCode"
                    placeholder="e.g., CSE 262"
                    value={courseInfo.courseCode}
                    onChange={(e) =>
                      setCourseInfo({ ...courseInfo, courseCode: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courseTitle">Course Title</Label>
                  <Input
                    id="courseTitle"
                    placeholder="e.g., Programming Languages"
                    value={courseInfo.courseTitle}
                    onChange={(e) =>
                      setCourseInfo({ ...courseInfo, courseTitle: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructor">Professor</Label>
                  <Input
                    id="instructor"
                    placeholder="e.g., Dr. Smith"
                    value={courseInfo.instructor}
                    onChange={(e) =>
                      setCourseInfo({ ...courseInfo, instructor: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule</Label>
                  <Input
                    id="schedule"
                    placeholder="e.g., Mon/Wed 10:00 AM"
                    value={courseInfo.schedule}
                    onChange={(e) =>
                      setCourseInfo({ ...courseInfo, schedule: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Upload Method */}
            <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as "file" | "text")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file">Upload File</TabsTrigger>
                <TabsTrigger value="text">Paste Text</TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-accent rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-accent" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, DOCX, DOC, or TXT (max 10MB)
                      </p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {file && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="text" className="space-y-4">
                <Textarea
                  placeholder="Paste your syllabus text here..."
                  className="min-h-[300px] font-mono text-sm"
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {pastedText.length} characters
                </p>
              </TabsContent>
            </Tabs>

            <Button
              className="w-full"
              onClick={handleParse}
              disabled={
                isParsing ||
                !courseInfo.courseCode ||
                !courseInfo.courseTitle ||
                (uploadMethod === "file" && !file) ||
                (uploadMethod === "text" && !pastedText.trim())
              }
            >
              {isParsing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Parsing syllabus...
                </>
              ) : (
                "Parse Syllabus"
              )}
            </Button>
          </div>
        ) : (
          <SyllabusPreviewTable
            assignments={parsedAssignments}
            courseInfo={courseInfo}
            onConfirm={handleConfirmAssignments}
            onBack={() => setShowPreview(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
