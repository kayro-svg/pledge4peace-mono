import AuthContainer from "@/components/login/auth-container";
import { LeftPanel } from "@/components/login/left-panel";
import { RightPanel } from "@/components/login/right-panel";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex p-4">
      <LeftPanel />
      <RightPanel>
        <AuthContainer />
      </RightPanel>
    </main>
  );
}
