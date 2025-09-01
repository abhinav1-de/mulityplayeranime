/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import BouncingLoader from "../ui/bouncingloader/Bouncingloader";

export default function IframePlayer({
  episodeId,
  serverName,
  servertype,
  animeInfo,
  episodeNum,
  episodes,
  playNext,
  autoNext, 
  aniid,
  activeServer,
}) {
  const baseURL =
    serverName.toLowerCase() === "hd-1"
      ? import.meta.env.VITE_BASE_IFRAME_URL
      : serverName.toLowerCase() === "hd-4"
      ? import.meta.env.VITE_BASE_IFRAME_URL_2
      : serverName.toLowerCase() === "nest" || servertype === "multi" || activeServer?.type === "multi"
      ? import.meta.env.VITE_BASE_IFRAME_URL_3
      : activeServer?.type === "slay"
      ? "https://slay-knight.xyz"
      : undefined; 

  const [loading, setLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    episodes?.findIndex(
      (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
    )
  );

  useEffect(() => {
    const loadIframeUrl = async () => {
      setLoading(true);
      setIframeLoaded(false);
      // Clear the iframe src first to force a reload
      setIframeSrc("");
      
      // Add a small delay to ensure the iframe is cleared before setting new src
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log("Loading iframe URL for:", {
        serverName,
        servertype,
        activeServer,
        baseURL,
        episodeId,
        episodeNum,
        aniid: animeInfo?.anilistId || aniid,
        animeInfo: animeInfo
      });

      if (serverName.toLowerCase() === "nest") {
        const nestUrl = `${baseURL}/${aniid}/${episodeNum}/hindi`;
        console.log("Nest URL:", nestUrl);
        setIframeSrc(nestUrl);
      } else if (activeServer?.type === "slay") {
        // Use anilistId from animeInfo if available, otherwise use aniid
        const anilistId = animeInfo?.anilistId || aniid;
        const slayLang = activeServer?.slayLang || "DUB";
        
        // Map languages to correct URL parameters based on the API response format
        let langParam;
        switch (slayLang) {
          case "ENGLISH":
            langParam = "dub";
            break;
          case "JAPANESE":
            langParam = "sub";
            break;
          case "HINDI":
            langParam = "hindi";
            break;
          case "TAMIL":
            langParam = "tamil";
            break;
          case "KANNADA":
            langParam = "kannada";
            break;
          case "MALAYALAM":
            langParam = "malayalam";
            break;
          case "TELUGU":
            langParam = "telugu";
            break;
          case "BANGLA":
            langParam = "bangla";
            break;
          default:
            langParam = "dub"; // Default to dub
        }
        
        // Construct URL following the pattern: /player/[anilist_id]/[ep]/[LANG]?autoplay=true
        const slayUrl = `${baseURL}/player/${anilistId}/${episodeNum}/${langParam}?autoplay=true`;
        console.log("=== SLAY SERVER DEBUG ===");
        console.log("Slay Knight URL:", slayUrl);
        console.log("AnilistId:", anilistId, "EpisodeNum:", episodeNum, "Lang:", slayLang, "LangParam:", langParam);
        console.log("BaseURL:", baseURL);
        console.log("AnimeInfo anilistId:", animeInfo?.anilistId);
        console.log("Fallback aniid:", aniid);
        console.log("========================");
        setIframeSrc(slayUrl);
      } else if (activeServer?.type === "multi" || serverName.toLowerCase() === "multi") {
        // Handle multi server (old Nest functionality)
        const multiUrl = `${baseURL}/${aniid}/${episodeNum}/hindi`;
        console.log("Multi URL:", multiUrl);
        setIframeSrc(multiUrl);
      } else {
        const regularUrl = `${baseURL}/${episodeId}/${servertype}`;
        console.log("Regular URL:", regularUrl);
        setIframeSrc(regularUrl);
      }
    };

    loadIframeUrl();
  }, [episodeId, servertype, serverName, animeInfo, activeServer, baseURL, aniid, episodeNum, activeServer?.slayLang, activeServer?.data_id]);

  useEffect(() => {
    if (episodes?.length > 0) {
      const newIndex = episodes.findIndex(
        (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
      );
      setCurrentEpisodeIndex(newIndex);
    }
  }, [episodeId, episodes]);

  useEffect(() => {
    const handleMessage = (event) => {
      const { currentTime, duration } = event.data;
      if (typeof currentTime === "number" && typeof duration === "number") {
        if (
          currentTime >= duration &&
          currentEpisodeIndex < episodes?.length - 1 &&
          autoNext
        ) {
          playNext(episodes[currentEpisodeIndex + 1].id.match(/ep=(\d+)/)?.[1]);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [autoNext, currentEpisodeIndex, episodes, playNext]);

  useEffect(() => {
    setLoading(true);
    setIframeLoaded(false);
    return () => {
      const continueWatching = JSON.parse(localStorage.getItem("continueWatching")) || [];
      const newEntry = {
        id: animeInfo?.id,
        data_id: animeInfo?.data_id,
        episodeId,
        episodeNum,
        adultContent: animeInfo?.adultContent,
        poster: animeInfo?.poster,
        title: animeInfo?.title,
        japanese_title: animeInfo?.japanese_title,
      };
      if (!newEntry.data_id) return;
      const existingIndex = continueWatching.findIndex(
        (item) => item.data_id === newEntry.data_id
      );
      if (existingIndex !== -1) {
        continueWatching[existingIndex] = newEntry;
      } else {
        continueWatching.push(newEntry);
      }
      localStorage.setItem("continueWatching", JSON.stringify(continueWatching));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId, servertype]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Loader Overlay */}
      <div
        className={`absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 z-10 transition-opacity duration-500 ${
          loading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <BouncingLoader />
      </div>

      <iframe
        key={`${episodeId}-${servertype}-${serverName}-${activeServer?.data_id}-${activeServer?.slayLang}-${Date.now()}`}
        src={iframeSrc}
        allowFullScreen
        allow="autoplay; fullscreen; encrypted-media"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        className={`w-full h-full transition-opacity duration-500 ${
          iframeLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => {
          setIframeLoaded(true);
          setTimeout(() => setLoading(false), 1000);
        }}
        onError={() => {
          console.error("Iframe failed to load:", iframeSrc);
          setLoading(false);
        }}
      ></iframe>
    </div>
  );
}
