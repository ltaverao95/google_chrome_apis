import { useEffect, useState } from "react";
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
    <section className="wrapper">
      <NavLink to="/" className="backLink">
        <span className="backIcon" aria-hidden="true">
          ←
        </span>
        <span className="backText">Home</span>
      </NavLink>
      <div className="left">
        <h2 className="title">Writer</h2>
        <form onSubmit={handleGenerate} className="form">
          <div className="textareasRow">
            <label className="label">
              <span className="labelText">Topic to write about</span>
              <textarea
                className="textarea"
                value={writerPrompt}
                onChange={(e) => setWriterPrompt(e.target.value)}
                rows={8}
              />
            </label>
            <label className="label">
              <span className="labelText">Context</span>
              <textarea
                className="textarea"
                value={writerContextInput}
                onChange={(e) => setWriterContextInput(e.target.value)}
                rows={8}
              />
            </label>
          </div>
          <button
            className="button"
            type="submit"
            disabled={buttonDisabled}
          >
            Write
          </button>
        </form>
        <div className="resultZone">
          <h2 className="subtitle">Generated Text</h2>
          <textarea
            className="textarea"
            readOnly
            value={generated}
            placeholder="Generated text will appear here..."
            rows={14}
          />
        </div>
      </div>
      <div className="right">
        <form className="rightForm">
          <div className="selectGroup">
            <label className="selectLabel">
              <span className="controlLabel">Shared Context</span>
              <textarea
                className="textarea"
                value={sharedContext}
                onChange={(e) => setSharedContext(e.target.value)}
                placeholder="Información adicional..."
                rows={2}
              />
            </label>
            <label className="selectLabel">
              <span className="controlLabel">Tone</span>
              <select
                className="select"
                value={writerOptionsTone}
                onChange={(e) => setWriterOptionsTone(e.target.value)}
              >
                <option value="formal">Formal</option>
                <option value="neutral">Neutral</option>
                <option value="casual">Casual</option>
              </select>
            </label>
            <label className="selectLabel">
              <span className="controlLabel">Length</span>
              <select
                className="select"
                value={writerOptionsLength}
                onChange={(e) => setWriterOptionsLength(e.target.value)}
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </label>
            <label className="selectLabel">
              <span className="controlLabel">Format</span>
              <select
                className="select"
                value={writerOptionsFormat}
                onChange={(e) => setWriterOptionsFormat(e.target.value)}
              >
                <option value="markdown">Markdown</option>
                <option value="plain-text">Plain Text</option>
              </select>
            </label>
          </div>
        </form>
      </div>
    </section>
  );
};
