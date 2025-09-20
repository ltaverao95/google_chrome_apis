import { useState, useEffect } from "react";
import styles from "./Summarizer.module.css";
import { NavLink } from "react-router-dom";

//declare Summarizer as global
declare global {
  const Summarizer: any;
}

const cachedSummarizer: Record<string, typeof Summarizer> = {};

export const SummarizerComponent = () => {
  const [text, setText] = useState("");
  const [sharedContext, setSharedContext] = useState(
    "You are a helpful assistant to summarize content from an input."
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
      const availability = await Summarizer.availability();
      if (availability === "unavailable") {
        // The Summarizer API isn't usable.
        console.log("API unavailable");
        return;
      }

      if (availability === "downloading") {
        // The Summarizer API isn't usable.
        console.log("Downloading API");
        return;
      }

      const options = {
        sharedContext: sharedContext,
        type: summarizerType,
        format: summarizerFormat,
        length: summarizerLength,
      };

      const modelKey = JSON.stringify(options);
      
      if(cachedSummarizer[modelKey])
      {
        console.log("Content cached.");
        return;
      }

      const newSummarizer = await Summarizer.create({
        ...options,
        monitor(m: any) {
          m.addEventListener("downloadprogress", (e: Event) => {
            const progressEvent = e as ProgressEvent;
            console.log(
              `Download progress: ${progressEvent.loaded * 100}% of ${modelKey}`
            );
          });
        },
      });

      cachedSummarizer[modelKey] = newSummarizer;
      setSummarizerOptions(modelKey);
      console.log("Content created and added to cache");
      
    };
    init();
  }, [sharedContext, summarizerType, summarizerFormat, summarizerLength]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const summary = await cachedSummarizer[summarizerOptions].summarize(text, {
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
      <NavLink to="/" className={styles.backLink}>
        <span className={styles.backIcon} aria-hidden="true">
          ←
        </span>
        <span className={styles.backText}>Inicio</span>
      </NavLink>
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
          <h2 className={styles.subtitle}>Resultado</h2>
          {!result && !loading && (
            <p className={styles.placeholder}>El resumen aparecerá aquí.</p>
          )}
          {loading && <p className={styles.loading}>Generando resumen...</p>}
          {result && <article className={styles.result}>{result}</article>}
        </div>
      </div>
    </section>
  );
};
