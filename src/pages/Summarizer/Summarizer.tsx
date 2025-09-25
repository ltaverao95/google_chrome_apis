import { useState, useEffect } from "react";
import styles from "./Summarizer.module.css";
import { NavLink } from "react-router-dom";

declare global {
  const Summarizer: any;
}

const cachedSummarizer: Record<string, typeof Summarizer> = {};

export const SummarizerComponent = () => {
  const [text, setText] = useState(
    `These documents collectively outline Chrome's built-in AI capabilities, specifically focusing on various client-side Web APIs powered by Gemini Nano. They detail the Prompt API for general language model interactions, including multimodal input (images, audio), and the Writing Assistance APIs (Writer, Rewriter, Summarizer, Proofreader) for content creation and refinement. Additionally, the Translation APIs (Translator, Language Detector) enable multilingual experiences directly within the browser. The sources emphasise best practices for developers, covering aspects such as session management, efficient rendering of streamed responses, caching AI models, and debugging techniques, while also addressing security concerns and promoting a hybrid AI approach with server-side fallbacks like Firebase AI Logic.`
  );
  const [sharedContext, setSharedContext] = useState(
    "Explain clearly and concisely to a general audience."
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [summarizerOptions, setSummarizerOptions] = useState<any>(null);

  // nuevos estados mock para selects
  const [summarizerType, setSummarizerType] = useState("tldr");
  const [summarizerFormat, setSummarizerFormat] = useState("plain-text");
  const [summarizerLength, setSummarizerLength] = useState("short");

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      if (!("Summarizer" in self)) {
        alert("This browser does not support the Google Built-in Summarizer API.");
        return;
      }

      const availability = await Summarizer.availability();
      if (availability === "unavailable") {
        // The Summarizer API isn't usable.
        console.log("API unavailable");
        alert("API Not Available");
        setLoading(false);
        return;
      }

      if (availability === "downloading") {
        // The Summarizer API isn't usable.
        console.log("Downloading API");
        alert("Downloading Model, please wait.");
        setLoading(false);
        return;
      }

      const options = {
        sharedContext: sharedContext,
        type: summarizerType,
        format: summarizerFormat,
        length: summarizerLength,
      };

      const modelKey = JSON.stringify(options);

      if (cachedSummarizer[modelKey]) {
        console.log("Content cached.");
        setLoading(false);
        return;
      }

      const newSummarizer = await Summarizer.create({
        ...options,
        monitor(m: any) {
          m.addEventListener("downloadprogress", (e: Event) => {
            const progressEvent = e as ProgressEvent;
            console.log(
              `Downloading Summarizer Model in progress: ${progressEvent.loaded * 100}% of ${modelKey}`
            );
          });
        },
      });

      cachedSummarizer[modelKey] = newSummarizer;
      setSummarizerOptions(modelKey);
      console.log("Content created and added to cache");
      setLoading(false);
    };
    init();
  }, [sharedContext, summarizerType, summarizerFormat, summarizerLength]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const summary = await cachedSummarizer[
        summarizerOptions
      ].summarizeStreaming(text, {
        context: sharedContext,
      });

      for await (const chunk of summary) {
        setResult((prev) => (prev || "") + chunk);
      }
    } catch (err: any) {
      setError(err?.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || !text.trim();

  return (
    <section className={styles.wrapper}>
      <NavLink to="/" className={styles.backLink}>
        <span className={styles.backIcon} aria-hidden="true">
          ←
        </span>
        <span className={styles.backText}>Home</span>
      </NavLink>
      <div className={styles.left}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h1 className={styles.title}>Text to summarize</h1>
          <label className={styles.label}>
            <span className={styles.labelText}>Content</span>
            <textarea
              className={styles.textarea}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type the text you want to summarize..."
              rows={14}
              required
            />
          </label>
          <label className={styles.label}>
            <span className={styles.labelText}>Shared context</span>
            <input
              type="text"
              className={styles.input}
              value={sharedContext}
              onChange={(e) => setSharedContext(e.target.value)}
              placeholder="Optional shared context (e.g. domain, topic)"
            />
          </label>
          <button className={styles.button} disabled={disabled} type="submit">
            Summarize
          </button>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </form>
      </div>
      <div className={styles.right}>
        <form
          className={styles.rightForm}
          aria-label="Opciones de resumen (mock)"
        >
          <div className={styles.selectGroup}>
            <label className={styles.selectLabel}>
              Type
              <select
                value={summarizerType}
                onChange={(e) => setSummarizerType(e.target.value)}
                className={styles.select}
              >
                <option value="key-points">Key Points</option>
                <option value="tldr">TLDR</option>
                <option value="teaser">Teaser</option>
                <option value="headline">Headline</option>
              </select>
            </label>
            <label className={styles.selectLabel}>
              Formats
              <select
                value={summarizerFormat}
                onChange={(e) => setSummarizerFormat(e.target.value)}
                className={styles.select}
              >
                <option value="markdown">Markdown</option>
                <option value="plain-text">Plain Text</option>
              </select>
            </label>
            <label className={styles.selectLabel}>
              Option Length
              <select
                value={summarizerLength}
                onChange={(e) => setSummarizerLength(e.target.value)}
                className={styles.select}
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </label>
          </div>
        </form>
        <hr className={styles.divider} />
        <div className={styles.resultZone}>
          <h2 className={styles.subtitle}>Result</h2>
          {!result && !loading && (
            <p className={styles.placeholder}>The summary will appear here.</p>
          )}
          {result && <article className={styles.result}>{result}</article>}
        </div>
      </div>
    </section>
  );
};
