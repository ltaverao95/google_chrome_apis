import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

declare global {
  const Translator: any;
  const LanguageDetector: any;
}

const cachedTranslator: Record<string, typeof Translator> = {};
const cachedLanguageDetector: Record<string, typeof LanguageDetector> = {};

export const TranslatorComponent = () => {
  const [input, setInput] = useState(
    "Este es un texto de ejemplo en español que podrás traducir a otros idiomas."
  );
  const [detectedLanguageText, setDetectedLanguageText] = useState(`es`);
  const [detectedLanguageCode, setDetectedLanguageCode] = useState("es");
  const [targetLang, setTargetLang] = useState("en");
  const [translatedText, setTranslatedText] = useState("");
  const [translatorOptions, setTranslatorOptions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      if (!areGoogleApisAvailable()) {
        setIsLoading(false);
        return;
      }

      const languageDetectorAvailability =
        await LanguageDetector.availability();

      if (!isValidModelState(languageDetectorAvailability)) {
        alert("API Not Available for this browser.");
        setIsLoading(false);
        return;
      }

      let languageDetectorModel;

      if (languageDetectorAvailability === "available") {
        // The Writer API can be used immediately .
        languageDetectorModel = await LanguageDetector.create();
      } else {
        languageDetectorModel = await LanguageDetector.create({
          monitor(m: any) {
            m.addEventListener("downloadprogress", (e: ProgressEvent) => {
              console.log(
                `Downloading Language Detector Model: ${e.loaded * 100}%`
              );
            });
          },
        });
      }

      cachedLanguageDetector["default"] = languageDetectorModel;
      await detectLanguage();

      const translatorOptionsLocal = {
        sourceLanguage: detectedLanguageCode,
        targetLanguage: targetLang,
      };

      const translatorOptionsModelKey = JSON.stringify(translatorOptionsLocal);
      if (cachedTranslator[translatorOptionsModelKey]) {
        console.log("Content cached.");
        setIsLoading(false);
        return;
      }

      const translatorAvailability = await Translator.availability(
        translatorOptionsLocal
      );

      if (!isValidModelState(translatorAvailability)) {
        alert("API Not Available for the selected languages.");
        setIsLoading(false);
        return;
      }

      let translator;

      if (translatorAvailability === "available") {
        // The Writer API can be used immediately .
        translator = await Translator.create(translatorOptionsLocal);
      } else {
        translator = await Translator.create({
          ...translatorOptionsLocal,
          monitor(m: any) {
            m.addEventListener("downloadprogress", (e: Event) => {
              const progressEvent = e as ProgressEvent;
              console.log(
                `Downloading Translator in progress: ${
                  progressEvent.loaded * 100
                }% of ${translatorOptionsModelKey}`
              );
            });
          },
        });
      }

      cachedTranslator[translatorOptionsModelKey] = translator;
      setTranslatorOptions(translatorOptionsModelKey);
      setIsLoading(false);
    };
    init();
  }, [targetLang]);

  const languageTagToHumanReadable = (
    languageTag: string,
    targetLanguage: string
  ) => {
    const displayNames = new Intl.DisplayNames([targetLanguage], {
      type: "language",
    });
    return displayNames.of(languageTag) || "en";
  };

  const isValidModelState = (state: string): boolean => {
    if (state === "unavailable") {
      console.log("API unavailable");
      alert("API Not Available");
      return false;
    }

    if (state === "downloading") {
      console.log("Downloading API");
      alert("Downloading Model, please wait.");
      return false;
    }

    return true;
  };

  const areGoogleApisAvailable = (): boolean => {
    if (!("Translator" in self)) {
      alert(
        "This browser does not support the Google Built-in Translator API."
      );
      return false;
    }
    if (!("LanguageDetector" in self)) {
      alert(
        "This browser does not support the Google Built-in Language Detector API."
      );
      return false;
    }
    return true;
  };

  const detectLanguage = async (): Promise<void> => {
    const [{ detectedLanguage, confidence }] = await cachedLanguageDetector[
      "default"
    ].detect(input);
    const confidenceParsed = (confidence * 100).toFixed(1);
    const languageTag = languageTagToHumanReadable(detectedLanguage, "en");
    setDetectedLanguageCode(detectedLanguage);
    const detectedText = `${confidenceParsed}% sure that this is ${languageTag}`;
    setDetectedLanguageText(detectedText);
  };

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    setTranslatedText("");
    if (!translatorOptions) return;
    const result = await cachedTranslator[translatorOptions].translate(input);
    setTranslatedText(result);
  };

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInput(e.target.value);

    await detectLanguage();
  };

  const disableButton = isLoading || !input.trim();

  return (
    <section className="wrapper">
      <NavLink to="/" className="backLink">
        <span className="backIcon" aria-hidden="true">
          ←
        </span>
        <span className="backText">Home</span>
      </NavLink>
      <div className="left">
        <h2 className="title">Translator & Language Recognition</h2>
        <form onSubmit={handleTranslate} className="form">
          <h1 className="subtitle">Input:</h1>

          <textarea
            value={input}
            onChange={handleInputChange}
            rows={8}
            className="textarea"
          />
          <div className="detection">{detectedLanguageText}</div>
          <button type="submit" disabled={disableButton} className="button">
            Translate
          </button>
          <h2 className="subtitle">Translated Content:</h2>
          <textarea
            value={translatedText}
            rows={8}
            readOnly
            className="textarea"
            placeholder="Generated text will appear here..."
          />
        </form>
      </div>
      <div className="right">
        <form className="rightForm">
          <div className="selectGroup">
            <label className="selectLabel">
              <span>Translate to</span>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="select"
              >
                <option value="es">Spanish</option>
                <option value="en">English</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="fr">French</option>
              </select>
            </label>
          </div>
        </form>
      </div>
    </section>
  );
};
