import { useEffect, useState } from "react";
import { api } from "../../api/client";

function toAudioLanguage(language) {
  if (language === "zh") return "zh";
  if (language === "en") return "en";
  return "vi";
}

export default function PoiAudioControl({ marker, language = "vi" }) {
  const [requestResult, setRequestResult] = useState(null);
  const audioLanguage = toAudioLanguage(language);
  const requestKey = `${marker?.id || ""}:${audioLanguage}`;
  const isAvailable = marker?.fromDatabase && marker.audioAvailable;

  useEffect(() => {
    if (!isAvailable) return undefined;

    let cancelled = false;
    api.getPublicAudio(marker.id, audioLanguage)
      .then((result) => {
        if (!cancelled) setRequestResult({ key: requestKey, track: result, error: "" });
      })
      .catch((requestError) => {
        if (!cancelled) setRequestResult({ key: requestKey, track: null, error: requestError.message });
      });

    return () => {
      cancelled = true;
    };
  }, [isAvailable, marker?.id, audioLanguage, requestKey]);

  if (!isAvailable) return null;

  const currentResult = requestResult?.key === requestKey ? requestResult : null;
  const loading = !currentResult;
  const track = currentResult?.track;
  const error = currentResult?.error;

  return (
    <div className="poi-audio-control">
      {loading && <span role="status">Đang tải audio...</span>}
      {!loading && error && <span className="poi-audio-control__error" role="alert">{error}</span>}
      {!loading && !error && track && (
        <>
          <span className="poi-audio-control__label">
            🎧 Thuyết minh — {track.language === "zh" ? "中文" : track.language === "en" ? "English" : "Tiếng Việt"}
          </span>
          <audio controls preload="none" src={track.fileUrl} aria-label={`Nghe thuyết minh ${track.language}`} />
        </>
      )}
      {!loading && !error && !track && (
        <span>POI này chưa có audio thuyết minh.</span>
      )}
    </div>
  );
}
