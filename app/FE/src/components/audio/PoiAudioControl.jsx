import { useEffect, useRef, useState } from "react";
import { api } from "../../api/client";
import { useSettings } from "../../context/SettingsContext";

function toAudioLanguage(language) {
  if (language === "zh") return "zh";
  if (language === "en") return "en";
  return "vi";
}

export default function PoiAudioControl({ marker, language = "vi" }) {
  const { t } = useSettings();
  const [requestResult, setRequestResult] = useState(null);
  const audioLanguage = toAudioLanguage(language);
  const requestKey = `${marker?.id || ""}:${audioLanguage}`;
  const isAvailable = marker?.fromDatabase && marker.audioAvailable;

  const currentResult = requestResult?.key === requestKey ? requestResult : null;
  const loading = !currentResult;
  const track = currentResult?.track;
  const error = currentResult?.error;

  const [usageId, setUsageId] = useState(null);
  const [completedLogged, setCompletedLogged] = useState(false);
  const listenTimer = useRef(null);
  const loggedRef = useRef(false);
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

useEffect(() => {
  loggedRef.current = false;
  setUsageId(null);
  setCompletedLogged(false);

  return () => {
    if (listenTimer.current !== null) {
      clearTimeout(listenTimer.current);
      listenTimer.current = null;
    }
  };
}, [marker?.id, track?.fileUrl]);
  if (!isAvailable) return null;


const handlePlay = () => {
  if (loggedRef.current || listenTimer.current !== null) return;

  listenTimer.current = setTimeout(() => {
    listenTimer.current = null;

    if (loggedRef.current) return;
    loggedRef.current = true;

    api.logAudioUsage({
      poiId: marker?.poiId || marker?.dbId || marker?.id,
      languageCode: track?.language || audioLanguage,
      triggerType: "manual",
      completed: false,
    })
      .then((res) => {
        if (res?.usageId) setUsageId(res.usageId);
      })
      .catch((err) => {
        console.error("Lỗi ghi lượt nghe:", err);
      });
  }, 3000);
};

const handlePause = () => {
  if (listenTimer.current !== null) {
    clearTimeout(listenTimer.current);
    listenTimer.current = null;
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
      {loading && <span role="status">{t("map.infoCard.audioLoading", "Đang tải audio...")}</span>}
      {!loading && error && <span className="poi-audio-control__error" role="alert">{error}</span>}
      {!loading && !error && track && (
        <>
          <span className="poi-audio-control__label">
            🎧 {t("map.infoCard.audioTitle", "Thuyết minh")} — {track.language === "zh" ? "中文" : track.language === "en" ? "English" : "Tiếng Việt"}
          </span>
          <audio
            controls
            preload="none"
            src={track.fileUrl}
            aria-label={`${t("map.infoCard.listenAudio", "Nghe thuyết minh")} ${track.language}`}
            onPlay={handlePlay}
            onPause={handlePause}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          />
        </>
      )}
      {!loading && !error && !track && (
        <span>{t("map.infoCard.noAudio", "POI này chưa có audio thuyết minh.")}</span>
      )}
    </div>
  );
}
