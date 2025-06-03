import { Users, Megaphone, Mail, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function VolunteeringTab() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Offer your time and skills</h3>
        <p className="text-sm text-muted-foreground">
          Join our global community of volunteers dedicated to building peace
          through meaningful action.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h4 className="font-medium">High-Profile Outreach</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Connect with celebrities, politicians, and influential figures to
              expand our reach and impact.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Community Campaigns</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Launch local initiatives that spread our message of peace through
              neighborhood outreach.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Direct Mail Campaigns</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Help distribute peace messages to neighborhoods through Every Door
              Direct Mail services.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Educational Outreach</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Encourage kids to write thoughtful messages about peace and share
              them with neighbors.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          Ready to make a difference? Your time and skills can help us create
          lasting peace.
        </p>
        <Button
          className="w-full md:w-auto"
          onClick={() => router.push("/volunteer")}
        >
          Join Our Volunteer Team
        </Button>
      </div>
    </div>
  );
}
