import { MotionConfig } from "motion/react";

import { Toaster } from "@/components/ui/sonner";
import { ConnectionsPage } from "@/features/connections/ConnectionsPage";

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ConnectionsPage />
      <Toaster position="top-center" />
    </MotionConfig>
  );
}

export default App;
