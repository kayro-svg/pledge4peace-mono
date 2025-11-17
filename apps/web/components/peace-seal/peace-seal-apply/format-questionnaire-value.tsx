import { ParsedQuestionnaireResponse } from "@/lib/api/peace-seal";
import { formatTimestampDate } from "@/lib/utils/peace-seal-utils";
import { CheckCircle, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFieldName } from "@/utils/advisors-peace-seal-utils";
import React from "react";

export function formatQuestionnaireValue(
  response: ParsedQuestionnaireResponse
): React.ReactNode {
  const { answer, isEmpty } = response;

  if (isEmpty || answer === null || answer === undefined || answer === "") {
    return <span className="text-gray-400 italic">Not provided</span>;
  }

  if (typeof answer === "boolean") {
    return (
      <span
        className={`font-medium ${answer ? "text-green-600" : "text-red-600"}`}
      >
        {answer ? "Yes" : "No"}
      </span>
    );
  }

  if (Array.isArray(answer)) {
    return answer.length > 0 ? (
      <div className="space-y-1">
        {answer.map((item, index) => (
          <div key={index} className="text-sm bg-gray-50 px-2 py-1 rounded">
            {String(item)}
          </div>
        ))}
      </div>
    ) : (
      <span className="text-gray-400 italic">None provided</span>
    );
  }

  if (typeof answer === "object" && answer !== null) {
    const answerObj = answer as Record<string, unknown>;

    // Handle agreement objects
    if ("type" in answerObj && answerObj.type === "agreement") {
      const agreementObj = answerObj as {
        type: string;
        templateId: string;
        acceptedAt: string;
        id?: string | null;
      };

      return (
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <div>
            <div className="text-green-800 font-medium">Agreement Accepted</div>
            <div className="text-xs text-green-600">
              Accepted on {formatTimestampDate(agreementObj.acceptedAt)}
            </div>
          </div>
        </div>
      );
    }

    // Handle file objects
    if ("type" in answerObj && answerObj.type === "file") {
      const fileObj = answerObj as {
        type: string;
        name: string;
        size?: number | null;
        url?: string | null;
        id?: string | null;
        mimeType?: string | null;
      };
      return (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <div>
              <div className="text-blue-800 font-medium">{fileObj.name}</div>
              <div className="text-xs text-blue-600 space-x-2">
                {fileObj.size && (
                  <span>{(fileObj.size / 1024).toFixed(1)} KB</span>
                )}
                {fileObj.mimeType && <span>• {fileObj.mimeType}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {fileObj.url ? (
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => window.open(fileObj.url!, "_blank")}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View File
              </Button>
            ) : (
              <span className="text-xs text-gray-500 italic">
                File uploaded
              </span>
            )}
          </div>
        </div>
      );
    }

    // For other objects, show key-value pairs in a readable format
    return (
      <div className="space-y-1">
        {Object.entries(answer).map(([k, v]) => (
          <div key={k} className="text-sm">
            <span className="font-semibold text-gray-700">
              {formatFieldName(k)}:
              <br />{" "}
            </span>
            <span className="text-gray-600">{String(v || "—")}</span>
          </div>
        ))}
      </div>
    );
  }

  const stringValue = String(answer);

  // Handle long text with better formatting
  if (stringValue.length > 200) {
    return (
      <div className="bg-gray-50 p-3 rounded border">
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {stringValue}
        </p>
      </div>
    );
  }

  return <span className="text-gray-700">{stringValue}</span>;
}
