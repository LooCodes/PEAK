import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import QuestionnairePage from "./pages/Questionnaire";
import LeaderboardPage from "./pages/Leaderboard";


export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100">
  
        <main className="max-w-5xl mx-auto mt-6">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/questionnaire" element={<QuestionnairePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />

          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}