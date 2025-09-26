import { useEffect, useState } from "react";
import styles from "./Prompt.module.css";

declare global {
  const LanguageModel: any;
}

const cachedLanguageModel: Record<string, typeof LanguageModel> = {};

export const PromptComponent = () => {
  const [promptInput, setPromptInput] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful and friendly assistant."
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [generated, setGenerated] = useState("");
  const [isStreamingActive, setIsStreamingActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [topK, setTopK] = useState(40);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      if (!("LanguageModel" in self)) {
        console.error("LanguageModel is not defined");
        return;
      }

      const availability = await LanguageModel.availability();

      if (availability === "unavailable") {
        console.log("The LanguageModel API isn't usable.");
        return;
      }

      const languageModelParams = await LanguageModel.params();

      languageModelParams.temperature = temperature;
      languageModelParams.topK = topK;

      let sessionLanguageModel;
      if (availability === "available") {
        sessionLanguageModel = await LanguageModel.create({
          ...languageModelParams,
          initialPrompts: [
            {
              role: "system",
              content: systemPrompt,
            },
          ],
          expectedInputs: [{ type: "image" }, { type: "audio" }],
        });
      } else {
        sessionLanguageModel = await LanguageModel.create({
          ...languageModelParams,
          monitor(m: any) {
            m.addEventListener("downloadprogress", (e: any) => {
              console.log(`Downloaded ${e.loaded * 100}%`);
            });
          },
        });
      }

      cachedLanguageModel["default"] = sessionLanguageModel;
      console.log("LanguageModel initialized and cached.");
      console.log(
        `Input Usage: ${cachedLanguageModel["default"].inputUsage} / Input Quota: ${cachedLanguageModel["default"].inputQuota}`
      );

      setIsLoading(false);
    };
    init();
  }, [isStreamingActive, systemPrompt, temperature, topK]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setImageFile(f);
  };

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();

    setGenerated("");
    setIsLoading(true);

    const prompt = [
      {
        role: "user",
        content: [
          { type: "text", value: promptInput },
          { type: "image", value: imageFile },
        ],
      },
      {
        role: "assistant",
        content: "```by: ltavera-bot\n",
        prefix: true,
      },
    ];

    let promptResponse;

    if (isStreamingActive) {
      promptResponse = await cachedLanguageModel["default"].promptStreaming(
        prompt
      );
      for await (const chunk of promptResponse) {
        setGenerated((prev) => prev + chunk);
      }

      console.log(
        `Input Usage: ${cachedLanguageModel["default"].inputUsage} / Input Quota: ${cachedLanguageModel["default"].inputQuota}`
      );

      setIsLoading(false);

      return;
    }

    promptResponse = await cachedLanguageModel["default"].prompt(prompt);
    console.log(
      `Input Usage: ${cachedLanguageModel["default"].inputUsage} / Input Quota: ${cachedLanguageModel["default"].inputQuota}`
    );
    setGenerated(promptResponse);

    setIsLoading(false);
  };

  const isDisabled = isLoading || !promptInput.trim();

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
            <button
              type="submit"
              className={`${styles.runBtn} ${isLoading ? styles.loading : ""}`}
              disabled={isDisabled}
              aria-busy={isLoading}
            >
              <span className={styles.runBtnContent}>
                {isLoading && (
                  <span className={styles.spinner} aria-hidden="true" />
                )}
                <span>Run Prompt</span>
              </span>
            </button>
          </div>

          <div className={styles.outputBlock}>
            <h3 className={styles.outputTitle}>Generated Output</h3>
            <p className={styles.outputText}>{generated || "No output yet."}</p>
          </div>
        </form>
      </div>

      <div className={styles.right}>
        <div className={styles.toggleGroup}>
          <span className={styles.toggleLabel}>Streaming</span>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={isStreamingActive}
              onChange={(e) => setIsStreamingActive(e.target.checked)}
            />
            <span className={styles.slider} />
          </label>
        </div>

        <div className={styles.paramGroup}>
          <label className={styles.paramField}>
            <span className={styles.paramLabel}>Temperature</span>
            <div className={styles.rangeRow}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className={styles.range}
                aria-valuemin={0}
                aria-valuemax={1}
                aria-valuenow={temperature}
              />
              <span className={styles.rangeValue}>
                {temperature.toFixed(2)}
              </span>
            </div>
          </label>

          <label className={styles.paramField}>
            <span className={styles.paramLabel}>Top K</span>
            <input
              type="number"
              min={1}
              max={100}
              value={topK}
              onChange={(e) =>
                setTopK(Math.min(100, Math.max(1, Number(e.target.value) || 1)))
              }
              className={styles.numberInput}
              placeholder="40"
            />
          </label>
        </div>
      </div>
    </section>
  );
};
