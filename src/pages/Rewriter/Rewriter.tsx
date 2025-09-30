import { useEffect, useState } from "react";
import styles from "./Rewriter.module.css";
import { NavLink } from "react-router-dom";

declare global {
  const Rewriter: any;
}

const cachedRewriter: Record<string, typeof Rewriter> = {};

export const RewriterComponent = () => {
  const [rewriterPrompt, setRewriterPrompt] = useState("Write an email to my bank asking them to raise my credit limit from $1,000 to $10,000.");
  const [rewriterContextInput, setRewriterContextInput] = useState(
    "I'm a long-standing customer."
  );
  const [generated, setGenerated] = useState("");
  const [sharedContext, setSharedContext] = useState(
    "I'm a long-standing customer."
  );
  const [rewriterOptionsTone, setRewriterOptionsTone] = useState("more-casual");
  const [rewriterOptionsLength, setRewriterOptionsLength] = useState("shorter");
  const [rewriterOptionsFormat, setRewriterOptionsFormat] = useState("plain-text");
  const [rewriterOptions, setWriterOptions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      setGenerated("");

      if (!("Rewriter" in self)) {
        // The Rewriter API is supported.
        console.log("Rewriter API not supported");
        setIsLoading(false);
        return;
      }

      const availability = await Rewriter.availability();

      if (availability === "unavailable") {
        console.log("The Rewriter API isn't usable.");
        return;
      }

      const rewriterOptions = {
        sharedContext: sharedContext,
        tone: rewriterOptionsTone,
        format: rewriterOptionsFormat,
        length: rewriterOptionsLength
      };

      const rewriterOptionsModelKey = JSON.stringify(rewriterOptions);
      if (cachedRewriter[rewriterOptionsModelKey]) {
        console.log("Content cached.");
        setIsLoading(false);
        return;
      }

      let rewriter;

      if (availability === "available") {
        rewriter = await Rewriter.create(rewriterOptions);
        setIsLoading(false);
      } else {
        rewriter = await Rewriter.create({
          ...rewriterOptions,
          monitor(m: any) {
            m.addEventListener("downloadprogress", (e: any) => {
              console.log(`Downloaded ${e.loaded * 100}%`);
            });
          },
        });
      }

      cachedRewriter[rewriterOptionsModelKey] = rewriter;
      setWriterOptions(rewriterOptionsModelKey);
      console.log("Content created and added to cache");
      setIsLoading(false);
    };
    init();
  }, [
    sharedContext,
    rewriterOptionsTone,
    rewriterOptionsFormat,
    rewriterOptionsLength,
  ]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGenerated("");
    const stream = cachedRewriter[rewriterOptions]?.rewriteStreaming(rewriterPrompt, {
      context: rewriterContextInput
    });

    for await (const chunk of stream) {
      setGenerated((prev) => prev + chunk);
    }

    setIsLoading(false);
  };

  const buttonDisabled = isLoading || rewriterPrompt.trim() === "";

  return (
    <section className={styles.wrapper}>
      <NavLink to="/" className={styles.backLink}>
        <span className={styles.backIcon} aria-hidden="true">
          ←
        </span>
        <span className={styles.backText}>Home</span>
      </NavLink>
      <div className={styles.left}>
        <h2>Re-Writer</h2>
        <form onSubmit={handleGenerate} className={styles.form}>
          <div className={styles.textareasRow}>
            <label className={styles.field}>
              <span className={styles.label}>Topic to write about</span>
              <textarea
                className={styles.textarea}
                value={rewriterPrompt}
                onChange={(e) => setRewriterPrompt(e.target.value)}
                rows={8}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Context</span>
              <textarea
                className={styles.textarea}
                value={rewriterContextInput}
                onChange={(e) => setRewriterContextInput(e.target.value)}
                rows={8}
              />
            </label>
          </div>
          <div className={styles.actions}>
            <button
              className={styles.button}
              type="submit"
              disabled={buttonDisabled}
            >
              Write
            </button>
          </div>
        </form>
        <div className={styles.generatedBlock}>
          <h3 className={styles.generatedTitle}>Generated Text</h3>
          <textarea
            className={`${styles.textarea} ${styles.readonly}`}
            readOnly
            value={generated}
            placeholder="Aquí aparecerá el texto generado..."
            rows={14}
          />
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.controls}>
          <label className={styles.controlField}>
            <span className={styles.controlLabel}>Shared Context</span>
            <input
              type="text"
              className={styles.input}
              value={sharedContext}
              onChange={(e) => setSharedContext(e.target.value)}
              placeholder="Información adicional..."
            />
          </label>
          <label className={styles.controlField}>
            <span className={styles.controlLabel}>Tone</span>
            <select
              className={styles.select}
              value={rewriterOptionsTone}
              onChange={(e) => setRewriterOptionsTone(e.target.value)}
            >
              <option value="more-formal">More Formal</option>
              <option value="as-is">As Is</option>
              <option value="more-casual">More Casual</option>
            </select>
          </label>
          <label className={styles.controlField}>
            <span className={styles.controlLabel}>Length</span>
            <select
              className={styles.select}
              value={rewriterOptionsLength}
              onChange={(e) => setRewriterOptionsLength(e.target.value)}
            >
              <option value="shorter">Shorter</option>
              <option value="as-is">As-Is</option>
              <option value="longer">Longer</option>
            </select>
          </label>
          <label className={styles.controlField}>
            <span className={styles.controlLabel}>Format</span>
            <select
              className={styles.select}
              value={rewriterOptionsFormat}
              onChange={(e) => setRewriterOptionsFormat(e.target.value)}
            >
              <option value="markdown">Markdown</option>
              <option value="plain-text">Plain Text</option>
              <option value="as-is">As Is</option>
            </select>
          </label>
        </div>
      </div>
    </section>
  );
};
