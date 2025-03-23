import { Routes, Route } from "react-router-dom"
import { ResultsView } from "./ResultsView"

export function ResultsRouter() {
  return (
    <Routes>
      <Route path="/" element={<ResultsView />} />
      <Route path="/live" element={<ResultsView isLive={true} />} />
    </Routes>
  )
} 