import { useState } from "react";
import styles from "./Prompt.module.css";

export const PromptComponent = () => {
  const [promptInput, setPromptInput] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [generated, setGenerated] = useState("");
  const [streaming, setStreaming] = useState(true);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setImageFile(f);
  };

  const handleRun = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerated(
      `Generated Output (mock)\n\nPrompt:\n${promptInput}\n\nSystem Prompt:\n${systemPrompt}\n\nImage: ${
        imageFile ? imageFile.name : "None"
      }\nStreaming: ${streaming ? "On" : "Off"}`
    );
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.left}>
        <form onSubmit={handleRun} className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>Prompt Input</span>
            <textarea
              className={styles.textarea}
              rows={2}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Write your prompt..."
            />
            <small className={styles.hint}>
              Min 1 line, max ~5 lines (you can resize).
            </small>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Add image (optional)</span>
            <div className={styles.fileWrapper}>
              <input
                id="promptImage"
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={handleFile}
              />
              <label htmlFor="promptImage" className={styles.fileButton}>
                Choose Image
              </label>
              {imageFile ? (
                <span className={styles.fileInfo}>
                  {imageFile.name} ({Math.round(imageFile.size / 1024)} KB)
                </span>
              ) : (
                <span className={styles.filePlaceholder}>No file selected</span>
              )}
            </div>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>System Prompt</span>
            <textarea
              className={styles.textarea}
              rows={2}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="System instructions..."
            />
          </label>

            <div className={styles.actions}>
              <button type="submit" className={styles.runBtn}>
                Run Prompt
              </button>
            </div>

          <div className={styles.outputBlock}>
            <h3 className={styles.outputTitle}>Generated Output</h3>
            <p className={styles.outputText}>
              {generated || "No output yet."}
            </p>
          </div>
        </form>
      </div>

      <div className={styles.right}>
        <div className={styles.toggleGroup}>
          <span className={styles.toggleLabel}>Streaming</span>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={streaming}
              onChange={(e) => setStreaming(e.target.checked)}
            />
            <span className={styles.slider} />
          </label>
        </div>
      </div>
    </section>
  );
};