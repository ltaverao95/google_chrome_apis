import { Routes, Route, createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { Home } from "./pages/Home/Home";
import { NotFound } from "./pages/NotFound/NotFound";
import { SummarizerComponent } from "./pages/Summarizer/Summarizer";
import { TranslatorComponent } from "./pages/Translator/Translator";
import { WriterComponent } from "./pages/Writer/Writer";
import { RewriterComponent } from "./pages/Rewriter/Rewriter";
import { PromptComponent } from "./pages/Prompt/Prompt";
import { ProofreaderComponent } from "./pages/Proofreader/Proofreader";

export default function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <NotFound />,
      children: [
        { index: true, element: <Home /> },
        { path: "writer", element: <WriterComponent /> },
        { path: "rewriter", element: <RewriterComponent  /> },
        { path: "summarizer", element: <SummarizerComponent /> },
        { path: "proofreader", element: <ProofreaderComponent /> },
        { path: "translator", element: <TranslatorComponent /> },
        { path: "prompt", element: <PromptComponent /> },
      ],
    },
  ]);

  return (
    <RouterProvider router={router} />
  );
}
