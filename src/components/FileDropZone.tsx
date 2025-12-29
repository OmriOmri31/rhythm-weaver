import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Music, X, File } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadedFile {
  id: string;
  file: File;
  name: string;
}

interface FileDropZoneProps {
  onFilesChange: (files: UploadedFile[]) => void;
  files: UploadedFile[];
}

const FileDropZone = ({ onFilesChange, files }: FileDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith("audio/") || file.name.endsWith(".mp3") || file.name.endsWith(".wav")
    );
    
    const newFiles: UploadedFile[] = droppedFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name.replace(/\.[^/.]+$/, ""),
    }));
    
    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const selectedFiles = Array.from(e.target.files).filter(
      file => file.type.startsWith("audio/") || file.name.endsWith(".mp3") || file.name.endsWith(".wav")
    );
    
    const newFiles: UploadedFile[] = selectedFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name.replace(/\.[^/.]+$/, ""),
    }));
    
    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange]);

  const removeFile = useCallback((id: string) => {
    onFilesChange(files.filter(f => f.id !== id));
  }, [files, onFilesChange]);

  return (
    <div className="space-y-3">
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all duration-300
          ${isDragging 
            ? "border-accent bg-accent/10" 
            : "border-border/50 hover:border-primary/50 bg-secondary/20"
          }
        `}
      >
        <input
          type="file"
          accept="audio/*,.mp3,.wav"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center gap-2 text-center pointer-events-none">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center transition-colors
            ${isDragging ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"}
          `}>
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/80">
              גרור קבצי אודיו לכאן
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              או לחץ לבחירת קבצים (MP3, WAV)
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Music className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground/90">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileDropZone;
