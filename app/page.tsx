"use client";

import { ChangeEvent, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [urls, setUrls] = useState<string[]>([]);

  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageName(file.name);

    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImage(null);
    setImageName("");
  }

  async function analyzeMessage() {
    if (!message.trim() && !image) {
      alert("Please enter a message or upload a screenshot.");
      return;
    }
const foundUrls =
  message.match(/https?:\/\/[^\s]+/g) || [];

setUrls(foundUrls);
    setLoading(true);

    setResult("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          image,
        }),
      });

      const data = await response.json();

      if (typeof data.result === "string") {
        setResult(data.result);
      } else {
        setResult("Unexpected response from AI.");
      }
    } catch {
      setResult("Unable to connect to AI.");
    } finally {
      setLoading(false);
    }
  }

  let risk = 0;

  const match = result.match(/(\d+)%/);

  if (match) {
    risk = Number(match[1]);
  }

  const verdict =
    risk >= 80
      ? "🚨 SCAM"
      : risk >= 50
      ? "⚠️ SUSPICIOUS"
      : result
      ? "✅ SAFE"
      : "";

  const verdictColor =
    risk >= 80
      ? "bg-red-600"
      : risk >= 50
      ? "bg-yellow-500 text-black"
      : "bg-green-600";

  const progressColor =
    risk >= 80
      ? "bg-red-500"
      : risk >= 50
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">

      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="text-center mb-12">

          <div className="inline-block px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500 text-blue-300 font-semibold">
            AI Powered Scam Detection
          </div>

          <h1 className="text-6xl font-black mt-6">
            🛡 ScamShield AI
          </h1>

          <p className="text-blue-400 text-xl mt-4">
            Detect scam messages and screenshots instantly.
          </p>

        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8">

            <h2 className="text-2xl font-bold mb-5">
              📩 Message / Screenshot
            </h2>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste suspicious message..."
              className="w-full h-64 rounded-2xl bg-slate-800 border border-slate-700 p-5 resize-none outline-none focus:border-blue-500"
            />

            <div className="mt-5">

              <label className="block mb-2 font-semibold text-blue-300">
                Upload Screenshot
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-slate-300
                file:px-4
                file:py-2
                file:rounded-xl
                file:border-0
                file:bg-blue-600
                file:text-white"
              />

              {image && (
                                <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-800 p-4">

                  <img
                    src={image}
                    alt="Preview"
                    className="rounded-xl max-h-64 w-full object-contain"
                  />

                  <div className="flex items-center justify-between mt-4">

                    <p className="text-sm text-slate-400 truncate">
                      {imageName}
                    </p>

                    <button
                      onClick={removeImage}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
                    >
                      Remove
                    </button>

                  </div>

                </div>
              )}

            </div>

            <button
              onClick={analyzeMessage}
              disabled={loading}
              className="w-full mt-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xl font-bold transition"
            >
              {loading
                ? "Analyzing..."
                : "🔍 Analyze Message / Screenshot"}
            </button>

            {loading && (

              <div className="flex items-center gap-4 mt-8">

                <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>

                <div>

                  <p className="font-semibold text-blue-300">
                    AI is analyzing...
                  </p>

                  <p className="text-slate-400 text-sm">
                    Reading message and screenshot.
                  </p>

                </div>

              </div>

            )}

          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8">

            <h2 className="text-2xl font-bold mb-6">
              📊 AI Scam Report
            </h2>

            {result ? (

              <>

                <div className="mb-8">

                  <div className="flex justify-between mb-2">

                    <span className="font-semibold">
                      Scam Risk
                    </span>

                    <span className="font-bold">
                      {risk}%
                    </span>

                  </div>

                  <div className="w-full h-5 bg-slate-700 rounded-full overflow-hidden">

                    <div
                      className={`${progressColor} h-full transition-all duration-700`}
                      style={{
                        width: `${risk}%`,
                      }}
                    />

                  </div>

                </div>

                <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">

                  <div className="flex justify-between items-center mb-5">

                    <h3 className="text-xl font-bold">
                      AI Verdict
                    </h3>

                    <span
                      className={`px-5 py-2 rounded-full font-bold ${verdictColor}`}
                    >
                      {verdict}
                    </span>

                  </div>

                  <pre className="whitespace-pre-wrap leading-8 text-slate-200">
                    {result}
                  </pre>
                  {urls.length > 0 && (

  <div className="mt-8 border-t border-slate-700 pt-6">

    <h3 className="text-xl font-bold mb-4">
      🔗 URL Scanner
    </h3>

    {urls.map((url, index) => {

      const suspicious =
        /\.xyz|\.top|\.click|\.live|\.shop|\.buzz|\.info/i.test(url);

      return (

        <div
          key={index}
          className={`rounded-xl p-4 mb-3 ${
            suspicious
              ? "bg-red-900/20 border border-red-600"
              : "bg-green-900/20 border border-green-600"
          }`}
        >

          <p className="font-semibold break-all">
            {url}
          </p>

          <p className="mt-2">
            {suspicious
              ? "⚠️ Suspicious domain detected."
              : "✅ No obvious domain warning."}
          </p>

        </div>

      );

    })}

  </div>

)}

                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-8">
                                  <div className="rounded-xl bg-slate-800 border border-slate-700 p-5">

                    <div className="text-3xl mb-3">
                      🔍
                    </div>

                    <h3 className="font-bold mb-2">
                      AI Detection
                    </h3>

                    <p className="text-slate-400 text-sm">
                      Gemini analyzes suspicious language, phishing attempts,
                      urgency, fake rewards and scam patterns.
                    </p>

                  </div>

                  <div className="rounded-xl bg-slate-800 border border-slate-700 p-5">

                    <div className="text-3xl mb-3">
                      🛡️
                    </div>

                    <h3 className="font-bold mb-2">
                      Stay Safe
                    </h3>

                    <p className="text-slate-400 text-sm">
                      Never share OTPs, passwords, bank details or personal
                      information with unknown people.
                    </p>

                  </div>

                  <div className="rounded-xl bg-slate-800 border border-slate-700 p-5">

                    <div className="text-3xl mb-3">
                      ⚡
                    </div>

                    <h3 className="font-bold mb-2">
                      Instant AI Report
                    </h3>

                    <p className="text-slate-400 text-sm">
                      Receive a detailed AI-powered scam analysis within
                      seconds.
                    </p>

                  </div>

                </div>

              </>

            ) : (

              <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-700 rounded-2xl">

                <div className="text-center px-8">

                  <div className="text-7xl mb-6">
                    🤖
                  </div>

                  <h3 className="text-3xl font-bold mb-4">
                    Waiting for Analysis
                  </h3>

                  <p className="text-slate-400 leading-8">

                    Enter a suspicious message, upload a screenshot,
                    or do both.

                    <br />
                    <br />

                    Then click

                    <span className="text-blue-400 font-semibold">
                      {" "}Analyze Message / Screenshot
                    </span>

                    {" "}to generate a detailed AI scam report.

                  </p>

                </div>

              </div>

            )}

          </div>

        </div>

        <footer className="mt-16 border-t border-slate-800 pt-8 text-center">

          <p className="text-slate-500">
            Built with ❤️ using Next.js + Gemini AI + OpenRouter
          </p>

          <p className="text-slate-600 text-sm mt-2">
            ScamShield AI • Detect • Explain • Protect
          </p>

        </footer>

      </div>

    </main>
  );
}