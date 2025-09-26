import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { Home } from "./pages/Home/Home";
import { NotFound } from "./pages/NotFound/NotFound";
import { SummarizerComponent } from "./pages/Summarizer/Summarizer";
import { TranslatorComponent } from "./pages/Translator/Translator";
import { WriterComponent } from "./pages/Writer/Writer";
import { RewriterComponent } from "./pages/Rewriter/Rewriter";
import { PromptComponent } from "./pages/Prompt/Prompt";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="summarizer" element={<SummarizerComponent />} />
        <Route path="translator" element={<TranslatorComponent />} />
        <Route path="writer" element={<WriterComponent />} />
        <Route path="rewriter" element={<RewriterComponent />} />
        <Route path="prompt" element={<PromptComponent />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
