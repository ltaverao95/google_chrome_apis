import { useState, useEffect } from "react";
import styles from "./Summarizer.module.css";

//declare Summarizer as global
declare global {
  const Summarizer: any;
}

export const SummarizerComponent = () => {
  const [text, setText] = useState("");
  const [sharedContext, setSharedContext] = useState(
    "You are a helpful assistant to summarize content from an input."
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [summarizer, setSummarizer] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const availability = await Summarizer.availability();
      if (availability === "unavailable") {
        // The Summarizer API isn't usable.
        console.log("API unavailable");
        return;
      }

      // Check for user activation before creating the summarizer
      if (!navigator.userActivation.isActive) {
        console.log("API inactive");
        return;
      }

      const options = {
        sharedContext: sharedContext,
        type: "key-points",
        format: "markdown",
        length: "medium"
      };

      const modelKey = JSON.stringify(options)

      const newSummarizer = await Summarizer.create({
        ...options,
        monitor(m) {
          m.addEventListener("downloadprogress", (e) => {
            const progressEvent = e as ProgressEvent;
            console.log(
              `Download progress: ${progressEvent.loaded * 100}% of ${modelKey}`
            );
          });
        }
      });
      setSummarizer(newSummarizer);
    };
    init();
  }, [sharedContext]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const summary = await summarizer.summarize(text, {
        context: sharedContext,
      });

      let res = "";
      for await (const chunk of summary) {
        res += chunk;
      }

      setResult(res);
    } catch (err: any) {
      setError(err?.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || !text.trim();

  return (
    <section className={styles.wrapper}>
      <div className={styles.left}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h1 className={styles.title}>Text to summarize</h1>
          <label className={styles.label}>
            <span className={styles.labelText}>Contenido</span>
            <textarea
              className={styles.textarea}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Pega o escribe el texto que deseas resumir..."
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
              placeholder="Contexto opcional compartido (ej. dominio, tema)"
            />
          </label>
          <button className={styles.button} disabled={disabled} type="submit">
            {loading ? "Summarizing…" : "Summarize"}
          </button>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </form>
      </div>
      <div className={styles.right}>
        <h2 className={styles.subtitle}>Resultado</h2>
        {!result && !loading && (
          <p className={styles.placeholder}>El resumen aparecerá aquí.</p>
        )}
        {loading && <p className={styles.loading}>Generando resumen...</p>}
        {result && <article className={styles.result}>{result}</article>}
      </div>
    </section>
  );
};
