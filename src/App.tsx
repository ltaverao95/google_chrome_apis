import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { Home } from "./pages/Home/Home";
import { NotFound } from "./pages/NotFound/NotFound";
import { SummarizerComponent } from "./pages/Summarizer/Summarizer";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="summarizer" element={<SummarizerComponent />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
