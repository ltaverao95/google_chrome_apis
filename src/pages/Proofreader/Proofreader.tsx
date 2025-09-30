import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

declare global {
  const Proofreader: any;
}

const cachedProofreaderModel: Record<string, typeof Proofreader> = {};

export const ProofreaderComponent = () => {
  const [text, setText] = useState(
    "This are a radnom text with a few classic common, and typicla typso and grammar issus. the Proofreader API hopefuly finds them all. Knocking at wood and crossed."
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [includeCorrectionTypes, setIncludeCorrectionTypes] = useState(false);
  const [includeCorrectionExplanations, setIncludeCorrectionExplanations] =
    useState(false);
  const [correctedText, setCorrectedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [proofreaderOptions, setProofreaderOptions] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      if (!("Proofreader" in self)) {
        console.error("Proofreader is not defined");
        return;
      }

      const availability = await Proofreader.availability();
      if (availability === "unavailable") {
        console.log("The Proofreader API isn't usable.");
        return;
      }

      const proofreaderOptions = {
        expectedInputLanguages: [language],
        correctionExplanationLanguage: language,
        includeCorrectionTypes: includeCorrectionTypes,
        includeCorrectionExplanations: includeCorrectionExplanations,
      };

      const proofreaderOptionsModelKey = JSON.stringify(proofreaderOptions);
      if (cachedProofreaderModel[proofreaderOptionsModelKey]) {
        console.log("Content cached.");
        setIsLoading(false);
        return;
      }

      let proofreaderModel;
      if (availability === "available") {
        proofreaderModel = await Proofreader.create(proofreaderOptions);
      } else {
        proofreaderModel = await Proofreader.create({
          ...proofreaderOptions,
          monitor(m: any) {
            m.addEventListener("downloadprogress", (e: any) => {
              console.log(`Downloaded ${e.loaded * 100}%`);
            });
          },
        });
      }

      console.log("Proofreader model initialized:", proofreaderModel);

      cachedProofreaderModel[proofreaderOptionsModelKey] = proofreaderModel;
      setProofreaderOptions(proofreaderOptionsModelKey);
    };
    init();
  }, [
    language,
    isStreaming,
    includeCorrectionTypes,
    includeCorrectionExplanations,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setCorrectedText("");

    let proofreadResult;

    if (isStreaming) {
      proofreadResult = await cachedProofreaderModel[
        proofreaderOptions
      ].proofreadStreaming(text);
    } else {
      proofreadResult = await cachedProofreaderModel[
        proofreaderOptions
      ].proofread(text);
    }
    setCorrectedText(proofreadResult.correctedInput);
    console.log("Proofread Result:", proofreadResult);
    console.log("Proofread Result:", proofreadResult.corrections);

    setIsLoading(false);
  };

  return (
    <section className="wrapper">
      <NavLink to="/" className="backLink">
        <span className="backIcon" aria-hidden="true">
          ←
        </span>
        <span className="backText">Home</span>
      </NavLink>
      <div className="left">
        <h2>Proofreader</h2>
        <form onSubmit={handleSubmit} className="form">
          <label className="label">
            <span className="labelText">Input Text</span>
            <textarea
              className="textarea"
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste text to proofread..."
            />
          </label>

          <button
            type="submit"
            className="button"
            disabled={isLoading || !text.trim()}
          >
            {isLoading ? "Processing..." : "Proffread"}
          </button>
        </form>

        <div className="resultZone">
          <h3 className="subtitle">Corrected text</h3>
          <textarea
            className="textarea"
            readOnly
            rows={5}
            value={correctedText}
            placeholder="Corrected output will appear here..."
          />
        </div>
      </div>

      <div className="right">
        <form className="rightForm">
          <div className="selectGroup">
            <div className="toggleGroup">
              <span className="toggleLabel">Streaming</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isStreaming}
                  disabled
                  onChange={(e) => setIsStreaming(e.target.checked)}
                />
                <span className="slider" />
              </label>
            </div>

            <div className="toggleGroup">
              <span className="toggleLabel">
                Include Correction Types
              </span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={includeCorrectionTypes}
                  onChange={(e) => setIncludeCorrectionTypes(e.target.checked)}
                />
                <span className="slider" />
              </label>
            </div>

            <div className="toggleGroup">
              <span className="toggleLabel">
                Include Correction Explanations
              </span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={includeCorrectionExplanations}
                  onChange={(e) =>
                    setIncludeCorrectionExplanations(e.target.checked)
                  }
                />
                <span className="slider" />
              </label>
            </div>

            <div className="toggleGroup">
              <label className="selectLabel">
                <span className="languageTitle">Language</span>
                <select
                  className="select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="ja" disabled>
                    Japanese
                  </option>
                  <option value="es" disabled>
                    Spanish
                  </option>
                  <option value="de" disabled>
                    German
                  </option>
                  <option value="it" disabled>
                    Italian
                  </option>
                  <option value="fr" disabled>
                    French
                  </option>
                </select>
              </label>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};
