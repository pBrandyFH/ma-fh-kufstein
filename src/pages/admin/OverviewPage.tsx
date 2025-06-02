import OverviewForFedAdmin from "@/components/overview/OverviewForFedAdmin";
import OverviewForMemberAdmin from "@/components/overview/OverviewForMemberAdmin";
import { useAuth } from "@/contexts/AuthContext";

export default function OverviewPage() {
  const { isMemberAdmin } = useAuth();

  if (isMemberAdmin) {
    return <OverviewForMemberAdmin />;
  }

  return <OverviewForFedAdmin />;
}
