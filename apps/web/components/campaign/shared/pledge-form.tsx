import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight } from "lucide-react";

interface PledgeFormProps {
  commitmentText: string | undefined;
}

export default function PledgeForm({ commitmentText }: PledgeFormProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-[#f8f9f0]">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800">I pledge that:</h3>
        <p className="text-sm text-gray-700 mt-2">{commitmentText}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            className="mt-1 data-[state=checked]:bg-[#548281] data-[state=checked]:text-primary-foreground"
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms"
              className="text-xs leading-snug text-gray-600"
            >
              I agree to the terms of service and privacy policy. I understand
              that my information will be used as described.
            </label>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="contact"
            className="mt-1 data-[state=checked]:bg-[#548281] data-[state=checked]:text-primary-foreground"
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="contact"
              className="text-xs leading-snug text-gray-600"
            >
              I'd like to receive occasional updates about this campaign and
              other related initiatives.
            </label>
          </div>
        </div>

        <Button className="w-full bg-[#548281] hover:bg-[#3c6665] group">
          Make my pledge{" "}
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
