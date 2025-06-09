import { Routes, Route } from "react-router-dom";
import { ResultsView } from "./ResultsView";
import ResultsPage from "@/pages/ResultsPage";

export function ResultsRouter() {
  return (
    <Routes>
      <Route path="/" element={<ResultsPage />} />
      <Route path="/live" element={<ResultsView isLive={true} />} />
    </Routes>
  );
}
