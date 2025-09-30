import { useEffect, useState } from "react";
import styles from "./Prompt.module.css";
import { NavLink } from "react-router-dom";

declare global {
  const LanguageModel: any;
}

const cachedLanguageModel: Record<string, typeof LanguageModel> = {};

export const PromptComponent = () => {
  const [promptInput, setPromptInput] = useState(
    "How can i dress for this event?"
  );
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful and friendly fashion assistant."
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [generated, setGenerated] = useState("");
  const [isStreamingActive, setIsStreamingActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState(1);
  const [topK, setTopK] = useState(3);
  const [promptOptions, setPromptOptions] = useState<any>(null);
  const [controller, setController] = useState<AbortController>(
    new AbortController()
  );

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
      console.log("Default LanguageModel params:", languageModelParams);

      languageModelParams.temperature =
        temperature || languageModelParams.defaultTemperature;
      languageModelParams.topK = topK || languageModelParams.defaultTopK;

      const promptOptionsModelKey = JSON.stringify(languageModelParams);
      if (cachedLanguageModel[promptOptionsModelKey]) {
        console.log("Content cached.");
        setIsLoading(false);
        return;
      }

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

      cachedLanguageModel[promptOptionsModelKey] = sessionLanguageModel;
      setPromptOptions(promptOptionsModelKey);
      console.log("LanguageModel initialized and cached.");
      console.log(
        `Input Usage: ${cachedLanguageModel[promptOptionsModelKey].inputUsage} / Input Quota: ${cachedLanguageModel[promptOptionsModelKey].inputQuota}`
      );

      setIsLoading(false);
    };
    init();
  }, [systemPrompt, temperature, topK]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setImageFile(f);
  };

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();

    setGenerated("");
    setIsLoading(true);

    let promptContent: { type: string; value: string | File }[] = [
      { type: "text", value: promptInput },
    ];

    if (imageFile) {
      promptContent.push({ type: "image", value: imageFile });
    }

    const prompt = [
      {
        role: "user",
        content: promptContent,
      },
    ];

    let promptResponse;

    if (isStreamingActive) {
      promptResponse = await cachedLanguageModel[promptOptions].promptStreaming(
        prompt,
        {
          signal: controller.signal,
        }
      );
      for await (const chunk of promptResponse) {
        setGenerated((prev) => prev + chunk);
      }

      console.log(
        `Input Usage: ${cachedLanguageModel[promptOptions].inputUsage} / Input Quota: ${cachedLanguageModel[promptOptions].inputQuota}`
      );

      setIsLoading(false);

      return;
    }

    promptResponse = await cachedLanguageModel[promptOptions].prompt(prompt, {
      signal: controller.signal,
    });
    console.log(
      `Input Usage: ${cachedLanguageModel[promptOptions].inputUsage} / Input Quota: ${cachedLanguageModel[promptOptions].inputQuota}`
    );
    setGenerated(promptResponse);

    setIsLoading(false);
  };

  const handleStop = () => {
    controller.abort();
    setIsLoading(false);
    setController(new AbortController());
  };

  const isDisabled = isLoading || !promptInput.trim();

  return (
    <section className={styles.wrapper}>
      <NavLink to="/" className={styles.backLink}>
        <span className={styles.backIcon} aria-hidden="true">
          ←
        </span>
        <span className={styles.backText}>Home</span>
      </NavLink>
      <div className={styles.left}>
        <h2>Prompt</h2>
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
            <button
              type="button"
              className={styles.runBtn}
              onClick={handleStop}
            >
              Stop
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
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className={styles.range}
                aria-valuemin={0}
                aria-valuemax={2}
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
              max={128}
              value={topK}
              onChange={(e) =>
                setTopK(Math.min(100, Math.max(1, Number(e.target.value) || 1)))
              }
              className={styles.numberInput}
              placeholder="e.g., 3"
            />
          </label>
        </div>
      </div>
    </section>
  );
};
