import { useEffect, useState } from "react";
import styles from "./Writer.module.css";
import { NavLink } from "react-router-dom";

declare global {
  const Writer: any;
}

const cachedWriter: Record<string, typeof Writer> = {};

export const WriterComponent = () => {
  const [writerPrompt, setWriterPrompt] = useState("A RomCom synopsis.");
  const [writerContextInput, setWriterContextInput] = useState(
    "Set it a utopian future."
  );
  const [generated, setGenerated] = useState("");
  const [sharedContext, setSharedContext] = useState(
    "I'm a storyteller specializing in heartfelt romances, crafted specifically for young hearts."
  );
  const [writerOptionsTone, setWriterOptionsTone] = useState("neutral");
  const [writerOptionsLength, setWriterOptionsLength] = useState("short");
  const [writerOptionsFormat, setWriterOptionsFormat] = useState("plain-text");
  const [writerOptions, setWriterOptions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      setGenerated("");

      if (!("Writer" in self)) {
        // The Writer API is supported.
        console.log("Writer API not supported");
        setIsLoading(false);
        return;
      }

      const availability = await Writer.availability();

      if (availability === "unavailable") {
        console.log("The Writer API isn't usable.");
        return;
      }

      const writerOptions = {
        sharedContext: sharedContext,
        tone: writerOptionsTone,
        format: writerOptionsFormat,
        length: writerOptionsLength
      };

      const writerOptionsModelKey = JSON.stringify(writerOptions);
      if (cachedWriter[writerOptionsModelKey]) {
        console.log("Content cached.");
        setIsLoading(false);
        return;
      }

      let writer;

      if (availability === "available") {
        writer = await Writer.create(writerOptions);
        setIsLoading(false);
      } else {
        writer = await Writer.create({
          ...writerOptions,
          monitor(m: any) {
            m.addEventListener("downloadprogress", (e: any) => {
              console.log(`Downloaded ${e.loaded * 100}%`);
            });
          },
        });
      }

      cachedWriter[writerOptionsModelKey] = writer;
      setWriterOptions(writerOptionsModelKey);
      console.log("Content created and added to cache");
      setIsLoading(false);
    };
    init();
  }, [
    sharedContext,
    writerOptionsTone,
    writerOptionsFormat,
    writerOptionsLength,
  ]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGenerated("");
    const stream = cachedWriter[writerOptions]?.writeStreaming(writerPrompt, {
      context: writerContextInput
    });

    for await (const chunk of stream) {
      setGenerated((prev) => prev + chunk);
    }

    setIsLoading(false);
  };

  const buttonDisabled = isLoading || writerPrompt.trim() === "";

  return (
    <section className={styles.wrapper}>
      <NavLink to="/" className={styles.backLink}>
        <span className={styles.backIcon} aria-hidden="true">
          ←
        </span>
        <span className={styles.backText}>Home</span>
      </NavLink>
      <div className={styles.left}>
        <form onSubmit={handleGenerate} className={styles.form}>
          <div className={styles.textareasRow}>
            <label className={styles.field}>
              <span className={styles.label}>Topic to write about</span>
              <textarea
                className={styles.textarea}
                value={writerPrompt}
                onChange={(e) => setWriterPrompt(e.target.value)}
                rows={8}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Context</span>
              <textarea
                className={styles.textarea}
                value={writerContextInput}
                onChange={(e) => setWriterContextInput(e.target.value)}
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
              value={writerOptionsTone}
              onChange={(e) => setWriterOptionsTone(e.target.value)}
            >
              <option value="formal">Formal</option>
              <option value="neutral">Neutral</option>
              <option value="casual">Casual</option>
            </select>
          </label>
          <label className={styles.controlField}>
            <span className={styles.controlLabel}>Length</span>
            <select
              className={styles.select}
              value={writerOptionsLength}
              onChange={(e) => setWriterOptionsLength(e.target.value)}
            >
              <option value="short">short</option>
              <option value="medium">medium</option>
              <option value="long">Long</option>
            </select>
          </label>
          <label className={styles.controlField}>
            <span className={styles.controlLabel}>Format</span>
            <select
              className={styles.select}
              value={writerOptionsFormat}
              onChange={(e) => setWriterOptionsFormat(e.target.value)}
            >
              <option value="markdown">Markdown</option>
              <option value="plain-text">Plain Text</option>
            </select>
          </label>
        </div>
      </div>
    </section>
  );
};
