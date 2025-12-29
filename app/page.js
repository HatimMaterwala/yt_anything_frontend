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
  }

  const handleSubmitButton = async () => {
    if (ytLink.length == 0) {
      return;
    }

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
    const interval = setInterval(()=>{
      progress = progress + Math.random()*9;
      if(progress > 90) progress = 90;
      setDownText(`Downloading ${Math.floor(progress)}%`)
    },500);

    const res = await fetch("https://ytanythingbackend-production.up.railway.app/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ realYtLink }),
    });

    if (!res.ok) {
      alert("Download Failed - Video not Found");
      setLoading(false);
      setDownText("Downlaod");  
      clearInterval(interval);
      return;
    }

    clearInterval(interval);

    const data = await res.blob();

    setDownText("Finishing...")
    const url = window.URL.createObjectURL(data);

    const a = document.createElement("a");
    a.href = url;
    a.download = "video.mp4";
    a.click();
    window.URL.revokeObjectURL(url)

    setLoading(false);
    setIsDisabled(false);
    setDownText("Download");
  };

  useEffect(() => {
    if (!hasTouched) {
      return;
    }

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
  }, [ytLink]);

  return (
    <div className="flex flex-col justify-center items-center w-full gap-4">
      <p>
        <strong className="text-2xl">
          <span className="text-red-600">YT</span> Anything
        </strong>
      </p>
      <section className="bg-red-400 p-8 w-1/2 rounded-2xl m-auto flex flex-col gap-3 border-2 border-white">
        <h1 className="text-black font-bold text-center ">
          Paste your link here
        </h1>
        <input
          value={ytLink}
          onChange={(e) => {
            setYtLink(e.target.value);
            setHasTouched(true);
          }}
          type="text"
          className="bg-white p-4 px-6 text-black rounded-full border-black border-2 outline-none "
        />

        <div className="flex justify-center items-center gap-2">
          {errorMessage && (
            <div className="bg-white border-2 border-black text-black p-2 rounded-full px-4">
              * No link found !!
            </div>
          )}
          {isInvalid && (
            <div className="bg-white border-2 border-black text-black p-2 rounded-full px-4">
              * Invalid Link
            </div>
          )}
        </div>

        {
          showIframe && !isInvalid && (
            <div className="flex justify-center items-center">
              <iframe
                width="360"
                height="175"
                src={`https://www.youtube.com/embed/${findRealLink(ytLink).split("v=")[1]}?si=hI2n2f11cE7d7KIA`}
                title="YouTube video player"  
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="rounded-2xl"
              ></iframe>
            </div>
          )
          // {ytLink}
        }

        <button
          onClick={handleSubmitButton}
          className="bg-black m-auto p-2 rounded-2xl px-4 cursor-pointer hover:scale-105 transition-all duration-300 border-2 border-white"
          disabled={isDisabled}
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
