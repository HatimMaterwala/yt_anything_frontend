"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/Loader";

export default function Home() {
  const [ytLink, setYtLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [hasTouched, setHasTouched] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [downText, setDownText] = useState("Download");

  const findRealLink = (ytLink) => {
    const correctUrl = new URL(ytLink);
    const videoId = correctUrl.searchParams.get("v");
    return `https://www.youtube.com/watch?v=${videoId}`;
  };

  const handleSubmitButton = async () => {
    if (ytLink.length == 0) return;

    if (
      !ytLink.match(
        /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      )
    ) {
      setIsInvalid(true);
      return;
    }

    const realYtLink = findRealLink(ytLink);

    setDownText("Preparing...");
    setIsDisabled(true);
    setLoading(true);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 9;
      if (progress > 90) progress = 90;
      setDownText(`Downloading ${Math.floor(progress)}%`);
    }, 500);

    const res = await fetch(
       "https://ytanythingbackend-production.up.railway.app/download",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ realYtLink }),
      }
    );

    if (!res.ok) {
      alert("Download Failed - Video not Found");
      setLoading(false);
      setDownText("Download");
      setIsDisabled(false)
      clearInterval(interval);
      return;
    }

    clearInterval(interval);

    const data = await res.blob();
    setDownText("Finishing...");

    const url = window.URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "video.mp4";
    a.click();
    window.URL.revokeObjectURL(url);

    setLoading(false);
    setIsDisabled(false);
    setDownText("Download");
  };

  useEffect(() => {
    if (!hasTouched) return;

    if (ytLink.length == 0) {
      setErrorMessage(true);
      setIsDisabled(true);
      setShowIframe(false);
    } else {
      setErrorMessage(false);
      setIsDisabled(false);
      setShowIframe(true);

      if (
        ytLink.match(
          /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        )
      ) {
        setIsInvalid(false);
      } else {
        setIsInvalid(true);
      }
    }
  }, [ytLink.length]);

  return (
    <div className="flex flex-col justify-center items-center w-full px-4 gap-4">
      <p className="text-center">
        <strong className="text-xl sm:text-2xl">
          <span className="text-red-600">YT</span> Anything
        </strong>
      </p>

      <section className="bg-red-400 p-6 sm:p-8 w-[95%] sm:w-[90%] md:w-2/3 lg:w-1/2 rounded-2xl flex flex-col gap-4 border-2 border-white">
        <h1 className="text-black font-bold text-center text-sm sm:text-base">
          Paste your link here
        </h1>

        <input
          value={ytLink}
          onChange={(e) => {
            setYtLink(e.target.value);
            setHasTouched(true);
          }}
          type="text"
          className="bg-white p-3 sm:p-4 px-5 sm:px-6 text-black rounded-full border-black border-2 outline-none text-sm sm:text-base"
        />

        <div className="flex justify-center items-center gap-2 flex-wrap">
          {errorMessage && (
            <div className="bg-white border-2 border-black text-black p-2 rounded-full px-4 text-xs sm:text-sm">
              * No link found !!
            </div>
          )}
          {isInvalid && (
            <div className="bg-white border-2 border-black text-black p-2 rounded-full px-4 text-xs sm:text-sm">
              * Invalid Link
            </div>
          )}
        </div>

        {showIframe && !isInvalid && (
          <div className="w-full flex justify-center">
            <div className="relative w-full max-w-sm aspect-video rounded-2xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${
                  findRealLink(ytLink).split("v=")[1]
                }`}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        )}

        <button
          onClick={handleSubmitButton}
          disabled={isDisabled}
          className="bg-black mx-auto p-2 sm:p-3 rounded-2xl px-6 cursor-pointer hover:scale-105 transition-all duration-300 border-2 border-white text-sm sm:text-base"
        >
          {downText}
        </button>

        {loading && (
          <div className="flex justify-center items-center">
            <Loader />
          </div>
        )}
      </section>
    </div>
  );
}
