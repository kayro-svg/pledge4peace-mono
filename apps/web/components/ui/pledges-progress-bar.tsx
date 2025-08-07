import { Progress } from "@/components/ui/progress";
import { useTranslations } from "next-intl";
type PledgesProgressBarProps = {
  currentValue: number;
  goalValue: number;
  variant?: "default" | "medium" | "small";
};

export default function PledgesProgressBar({
  currentValue,
  goalValue,
  variant = "default",
}: PledgesProgressBarProps): JSX.Element {
  const t = useTranslations("SingleCampaign_Page");
  // Calculate progress percentage (0-100)
  const progressPercentage = Math.min(
    100,
    Math.round((currentValue / goalValue) * 100)
  );

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className={`${variant === "medium" ? "text-xs" : "text-sm"}`}>
          {t("raised")}
        </span>
        <span className={`${variant === "medium" ? "text-xs" : "text-sm"}`}>
          {t("goal")}
        </span>
      </div>
      <Progress
        value={progressPercentage}
        className="h-2 mb-2 bg-[#d2daba80]"
      />
      <div
        className={`flex justify-between text-sm ${
          variant === "medium" ? "text-sm" : "text-base"
        }`}
      >
        <span className={`${variant === "medium" ? "text-xs" : "text-sm"}`}>
          +{currentValue.toLocaleString()} {t("peacePledges")}
        </span>
        <span className={`${variant === "medium" ? "text-xs" : "text-sm"}`}>
          +{goalValue.toLocaleString()} {t("peacePledges")}
        </span>
      </div>
    </div>
  );
}
