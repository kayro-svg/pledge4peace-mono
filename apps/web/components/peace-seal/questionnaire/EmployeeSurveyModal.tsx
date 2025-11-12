"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Trash2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendEmployeeSurveyInvitations } from "@/lib/api/peace-seal";
import type { SurveyInvitationData } from "@/types/questionnaire";

interface EmployeeSurveyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
  onSuccess: (invitationData: SurveyInvitationData) => void;
}

interface Employee {
  name: string;
  email: string;
}

export default function EmployeeSurveyModal({
  open,
  onOpenChange,
  companyId,
  companyName,
  onSuccess,
}: EmployeeSurveyModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentName, setCurrentName] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Email validation regex
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddEmployee = useCallback(() => {
    const trimmedName = currentName.trim();
    const trimmedEmail = currentEmail.trim().toLowerCase();

    if (!trimmedName) {
      toast({
        title: "Name required",
        description: "Please enter the employee's name",
        variant: "destructive",
      });
      return;
    }

    if (!trimmedEmail) {
      toast({
        title: "Email required",
        description: "Please enter the employee's email",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate emails
    if (employees.some((e) => e.email === trimmedEmail)) {
      toast({
        title: "Duplicate email",
        description: "This email has already been added",
        variant: "destructive",
      });
      return;
    }

    setEmployees([...employees, { name: trimmedName, email: trimmedEmail }]);
    setCurrentName("");
    setCurrentEmail("");
  }, [currentName, currentEmail, employees, toast]);

  const handleRemoveEmployee = useCallback(
    (index: number) => {
      setEmployees(employees.filter((_, i) => i !== index));
    },
    [employees]
  );

  const handleSendInvitations = useCallback(async () => {
    if (employees.length === 0) {
      toast({
        title: "No employees added",
        description:
          "Please add at least one employee before sending invitations",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const result = await sendEmployeeSurveyInvitations(companyId, employees);

      if (result.success) {
        const invitationData: SurveyInvitationData = {
          invitedAt: result.invitedAt,
          invitedCount: result.invitedCount,
          invitations: result.invitations,
        };

        toast({
          title: "Invitations sent successfully!",
          description: `Sent ${result.invitedCount} invitation${result.invitedCount !== 1 ? "s" : ""} to employees`,
        });

        onSuccess(invitationData);
        onOpenChange(false);
        // Reset form
        setEmployees([]);
        setCurrentName("");
        setCurrentEmail("");
      } else {
        throw new Error(result.error || "Failed to send invitations");
      }
    } catch (error: any) {
      toast({
        title: "Error sending invitations",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  }, [employees, companyId, onSuccess, onOpenChange, toast]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmployee();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[700px] !max-w-none h-[70vh] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Send Survey Invitations to Employees</DialogTitle>
          <DialogDescription>
            Add employee names and emails to send them survey invitations. They
            will receive an email with a link to complete the anonymous employee
            satisfaction survey for {companyName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Employee Form */}
          <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="employee-name">Employee Name</Label>
                <Input
                  id="employee-name"
                  value={currentName}
                  onChange={(e) => setCurrentName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="John Doe"
                  disabled={isSending}
                />
              </div>
              <div>
                <Label htmlFor="employee-email">Email Address</Label>
                <Input
                  id="employee-email"
                  type="email"
                  value={currentEmail}
                  onChange={(e) => setCurrentEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="john.doe@company.com"
                  disabled={isSending}
                />
              </div>
            </div>
            <Button
              type="button"
              onClick={handleAddEmployee}
              disabled={
                isSending || !currentName.trim() || !currentEmail.trim()
              }
              className="w-full md:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>

          {/* Employees List */}
          {employees.length > 0 && (
            <div className="space-y-2">
              <Label>Employees to Invite ({employees.length})</Label>
              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                {employees.map((employee, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{employee.name}</p>
                      <p className="text-xs text-gray-500">{employee.email}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveEmployee(index)}
                      disabled={isSending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {employees.length === 0 && (
            <div className="border border-dashed rounded-lg p-8 text-center text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                No employees added yet. Add employees above to send invitations.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendInvitations}
            disabled={isSending || employees.length === 0}
            className="bg-[#548281] hover:bg-[#2F4858]"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Send {employees.length} Invitation
                {employees.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
