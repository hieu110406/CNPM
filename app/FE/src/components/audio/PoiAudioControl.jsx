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

  const [usageId, setUsageId] = useState(null);
  const [completedLogged, setCompletedLogged] = useState(false);

  useEffect(() => {
    setUsageId(null);
    setCompletedLogged(false);
  }, [marker?.id, track?.id]);

  const handlePlay = () => {
    if (!usageId) {
      api.logAudioUsage({
        poiId: marker?.id,
        languageCode: track?.language || audioLanguage,
        triggerType: "manual",
        completed: false,
      }).then((res) => {
        if (res?.usageId) setUsageId(res.usageId);
      }).catch(() => {});
    }
  };

  const handleTimeUpdate = (e) => {
    const audio = e.currentTarget;
    if (usageId && !completedLogged && audio.duration > 0) {
      const percent = (audio.currentTime / audio.duration) * 100;
      if (percent >= 80) {
        setCompletedLogged(true);
        api.logAudioUsage({
          usageId,
          completed: true,
        }).catch(() => {});
      }
    }
  };

  const handleEnded = () => {
    if (usageId && !completedLogged) {
      setCompletedLogged(true);
      api.logAudioUsage({
        usageId,
        completed: true,
      }).catch(() => {});
    }
  };

  return (
    <div className="poi-audio-control">
      {loading && <span role="status">Đang tải audio...</span>}
      {!loading && error && <span className="poi-audio-control__error" role="alert">{error}</span>}
      {!loading && !error && track && (
        <>
          <span className="poi-audio-control__label">
            🎧 Thuyết minh — {track.language === "zh" ? "中文" : track.language === "en" ? "English" : "Tiếng Việt"}
          </span>
          <audio
            controls
            preload="none"
            src={track.fileUrl}
            aria-label={`Nghe thuyết minh ${track.language}`}
            onPlay={handlePlay}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          />
        </>
      )}
      {!loading && !error && !track && (
        <span>POI này chưa có audio thuyết minh.</span>
      )}
    </div>
  );
}
