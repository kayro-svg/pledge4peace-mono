"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadReportDocument } from "@/lib/api/peace-seal";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type EvidenceMode = "text" | "url" | "file";

interface EvidenceValue {
  text?: string;
  url?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

interface EvidenceInputProps {
  value: string; // Current evidence value (URL or text)
  onChange: (value: string) => void;
  companyId: string;
  error?: string;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = [".jpg", ".jpeg", ".png", ".pdf"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export default function EvidenceInput({
  value,
  onChange,
  companyId,
  error,
  disabled,
}: EvidenceInputProps) {
  const [selectedMode, setSelectedMode] = useState<EvidenceMode>("text");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Parse current value to determine mode and populate fields
  const evidenceValue: EvidenceValue = (() => {
    if (!value) return {};

    // Check if it's a URL (starts with http:// or https://)
    if (value.startsWith("http://") || value.startsWith("https://")) {
      // Could be a file URL or regular URL - check if it looks like a file URL
      const isFileUrl =
        value.includes("/peace-seal/") ||
        value.match(/\.(jpg|jpeg|png|pdf)(\?|$)/i);
      if (isFileUrl) {
        return { fileUrl: value };
      }
      return { url: value };
    }

    // Otherwise it's text
    return { text: value };
  })();

  // Initialize selected mode based on existing value
  useEffect(() => {
    if (evidenceValue.fileUrl) {
      setSelectedMode("file");
    } else if (evidenceValue.url) {
      setSelectedMode("url");
    } else if (evidenceValue.text) {
      setSelectedMode("text");
    }
  }, []);

  const handleModeChange = useCallback(
    (mode: EvidenceMode) => {
      setSelectedMode(mode);
      setUploadError(null);
      // Clear value when switching modes
      onChange("");
    },
    [onChange]
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(
          `File size exceeds ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)}MB limit`
        );
        return;
      }

      // Validate file type
      const extension = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_FILE_TYPES.includes(extension)) {
        setUploadError(
          `File type not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`
        );
        return;
      }

      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setUploadError(`File type not allowed. Allowed types: JPG, PNG, PDF`);
        return;
      }

      setUploading(true);
      setUploadError(null);

      try {
        const result = await uploadReportDocument(file, companyId);

        if (result.success && result.fileUrl) {
          onChange(result.fileUrl);
        } else {
          setUploadError(result.error || "Upload failed");
        }
      } catch (error: any) {
        setUploadError(error?.message || "Upload failed");
      } finally {
        setUploading(false);
      }

      // Reset input
      event.target.value = "";
    },
    [companyId, onChange]
  );

  const handleFileRemove = useCallback(() => {
    onChange("");
  }, [onChange]);

  const hasValue = !!value;
  const hasFile = !!evidenceValue.fileUrl;

  return (
    <div className="space-y-3">
      <Label htmlFor="evidence">Supporting Evidence (Optional)</Label>

      {/* Mode selector */}
      <div className="flex gap-2 border rounded-lg p-1 bg-gray-50">
        <button
          type="button"
          onClick={() => handleModeChange("text")}
          disabled={disabled}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            selectedMode === "text"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex items-center justify-center gap-2">
            Text
            {evidenceValue.text && (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
          </div>
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("url")}
          disabled={disabled}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            selectedMode === "url"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex items-center justify-center gap-2">
            URL
            {evidenceValue.url && (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
          </div>
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("file")}
          disabled={disabled}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            selectedMode === "file"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex items-center justify-center gap-2">
            File
            {hasFile && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          </div>
        </button>
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 italic">
        Choose one method; you can switch anytime.
      </p>

      {/* Render appropriate input based on selected mode */}
      {selectedMode === "text" && (
        <div className="space-y-2">
          <Textarea
            id="evidence-text"
            value={evidenceValue.text || ""}
            onChange={handleTextChange}
            placeholder="Links to articles, documents, or other evidence..."
            rows={3}
            disabled={disabled}
            className={error ? "border-red-500" : ""}
          />
          <p className="text-xs text-gray-500">URLs or document references.</p>
        </div>
      )}

      {selectedMode === "url" && (
        <div className="space-y-2">
          <Input
            id="evidence-url"
            type="url"
            value={evidenceValue.url || ""}
            onChange={handleUrlChange}
            placeholder="https://example.com/evidence"
            disabled={disabled}
            className={error ? "border-red-500" : ""}
          />
          <p className="text-xs text-gray-500">
            Enter a URL to supporting evidence.
          </p>
        </div>
      )}

      {selectedMode === "file" && (
        <div className="space-y-2">
          {!hasFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center space-y-3">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="flex flex-col items-center gap-2">
                  <Label
                    htmlFor="evidence-file-upload"
                    className="cursor-pointer"
                  >
                    <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </>
                      )}
                    </span>
                    <Input
                      id="evidence-file-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                      onChange={handleFileSelect}
                      disabled={uploading || disabled}
                      className="sr-only"
                    />
                  </Label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Allowed: JPG, PNG, PDF
                </p>
                <p className="text-xs text-gray-500">
                  Max size: {(MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)}MB
                </p>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">File uploaded</p>
                      <p className="text-xs text-gray-500">
                        {evidenceValue.fileUrl ? (
                          <a
                            href={evidenceValue.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View file
                          </a>
                        ) : (
                          "File URL available"
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFileRemove}
                    disabled={disabled}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {(uploadError || error) && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{uploadError || error}</span>
        </div>
      )}
    </div>
  );
}
