"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Flag, ArrowLeft } from "lucide-react";
import {
  submitPublicReport,
  type ReportData,
  type ReportReasons,
} from "@/lib/api/peace-seal";

type Props = {
  locale: string;
  reasons: ReportReasons;
  company: { id: string; name: string; slug: string } | null;
  backHref: string;
};

export default function ReportClient({
  locale,
  reasons,
  company,
  backHref,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  // Usa exactamente ReportData del SDK. companyId siempre string.
  const [form, setForm] = useState<ReportData>({
    companyId: company?.id ?? "",
    reporterEmail: "",
    reporterName: "",
    reason: "",
    description: "",
    evidence: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.reason) {
      toast({
        title: "Selecciona un motivo del reporte",
        variant: "destructive",
      });
      return;
    }
    if (!form.description?.trim()) {
      toast({
        title: "Agrega una descripción del problema",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload: ReportData = {
        ...form,
        description: form.description.trim(),
        // Mantén string. Si está vacío, envía "".
        evidence: (form.evidence ?? "").trim(),
      };

      await submitPublicReport(payload);

      toast({
        title: "Reporte enviado",
        description: "Gracias. Nuestro equipo lo revisará.",
      });

      const dest = company
        ? `/${locale}/peace-seal/company/${company.slug}`
        : `/${locale}/peace-seal/directory`;
      router.push(dest);
    } catch (error: any) {
      toast({
        title: "No se pudo enviar el reporte",
        description: error?.message || "Intenta más tarde.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <Link
          href={backHref}
          className="inline-flex items-center text-[#548281] hover:text-[#2F4858] mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {company?.name ?? "Directory"}
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Flag className="w-6 h-6 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">Report an Issue</h1>
        </div>

        {company?.name && (
          <p className="text-gray-600">
            Reporting an issue with:{" "}
            <span className="font-medium">{company.name}</span>
          </p>
        )}
      </div>

      {/* Warning Notice */}
      <Card className="mb-6 border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-800">
              <p className="font-medium mb-1">Important Notice</p>
              <p>
                Submit reports only for legitimate concerns about Peace Seal
                companies. False reports may trigger restrictions. All reports
                are reviewed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Form */}
      <Card>
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Reporter Information (Optional) */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Your Information (Optional)
              </h3>
              <p className="text-sm text-gray-600">
                Sharing contact helps us follow up. Not required.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reporterName">Your Name</Label>
                  <Input
                    id="reporterName"
                    value={form.reporterName || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, reporterName: e.target.value }))
                    }
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <Label htmlFor="reporterEmail">Your Email</Label>
                  <Input
                    id="reporterEmail"
                    type="email"
                    value={form.reporterEmail || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, reporterEmail: e.target.value }))
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            {/* Report Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Report Details</h3>

              <div>
                <Label htmlFor="reason">Reason for Report *</Label>
                <Select
                  value={form.reason}
                  onValueChange={(value) =>
                    setForm((p) => ({ ...p, reason: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(reasons).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Please provide detailed information about the issue..."
                  rows={5}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Be specific and detailed.
                </p>
              </div>

              <div>
                <Label htmlFor="evidence">Supporting Evidence (Optional)</Label>
                <Textarea
                  id="evidence"
                  value={form.evidence || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, evidence: e.target.value }))
                  }
                  placeholder="Links to articles, documents, or other evidence..."
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  URLs or document references.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t">
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(backHref)}
                  disabled={submitting}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={
                    submitting || !form.reason || !form.description?.trim()
                  }
                  className="bg-red-600 hover:bg-red-700"
                >
                  {submitting ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
