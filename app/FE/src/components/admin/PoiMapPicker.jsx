import { useRef, useState } from "react";
import { LocateFixed, ZoomIn, ZoomOut } from "lucide-react";
import zooMapImage from "../../assets/map/zoo_map.png";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

export default function PoiMapPicker({
  mapX,
  mapY,
  geofenceRadius,
  onChange,
  disabled = false,
}) {
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingPin, setIsDraggingPin] = useState(false);
  const stageRef = useRef(null);
  const imageRef = useRef(null);
  const dragRef = useRef(null);

  const pointFromPointer = (clientX, clientY) => {
    const imageBounds = imageRef.current?.getBoundingClientRect();
    if (!imageBounds) return null;

    return {
      mapX: Math.max(0, Math.min(100, ((clientX - imageBounds.left) / imageBounds.width) * 100)),
      mapY: Math.max(0, Math.min(100, ((clientY - imageBounds.top) / imageBounds.height) * 100)),
    };
  };

  const changeZoom = (amount) => {
    setZoom((currentZoom) => {
      const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom + amount));
      if (nextZoom === MIN_ZOOM) setPan({ x: 0, y: 0 });
      return nextZoom;
    });
  };

  const handlePointerDown = (event) => {
    if (disabled || event.target.closest(".poi-map-picker__controls")) return;

    dragRef.current = {
      kind: "map",
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y,
      moved: false,
    };
    stageRef.current?.setPointerCapture(event.pointerId);
  };

  const handlePinPointerDown = (event) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = { kind: "pin", moved: false };
    setIsDraggingPin(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || disabled) return;

    if (drag.kind === "pin") {
      drag.moved = true;
      const point = pointFromPointer(event.clientX, event.clientY);
      if (point) onChange(point);
      return;
    }

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 3) drag.moved = true;

    if (zoom > MIN_ZOOM && drag.moved) {
      setPan({ x: drag.originX + deltaX, y: drag.originY + deltaY });
    }
  };

  const handlePointerUp = (event) => {
    const drag = dragRef.current;
    if (!drag) return;

    if (drag.kind === "map" && !drag.moved) {
      const point = pointFromPointer(event.clientX, event.clientY);
      if (point) onChange(point);
    }

    if (drag.kind === "pin") setIsDraggingPin(false);
    dragRef.current = null;
    if (stageRef.current?.hasPointerCapture(event.pointerId)) {
      stageRef.current.releasePointerCapture(event.pointerId);
    }
  };

  const handlePinPointerUp = (event) => {
    event.stopPropagation();
    dragRef.current = null;
    setIsDraggingPin(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleWheel = (event) => {
    event.preventDefault();
    changeZoom(event.deltaY < 0 ? 0.25 : -0.25);
  };

  const ringSize = Math.min(90, 20 + geofenceRadius / 2);

  return (
    <div className="poi-map-picker">
      <div
        ref={stageRef}
        className={`poi-map-picker__stage${isDraggingPin ? " is-dragging-pin" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onDoubleClick={() => !disabled && changeZoom(0.5)}
        aria-label="Bản đồ chọn vị trí POI"
      >
        <div
          className="poi-map-picker__image"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          <img
            ref={imageRef}
            src={zooMapImage}
            alt="Sơ đồ Thảo Cầm Viên"
            draggable={false}
          />
          <div
            className="poi-map-picker__geofence"
            style={{
              left: `${mapX}%`,
              top: `${mapY}%`,
              width: `${ringSize}%`,
            }}
          />
          <button
            type="button"
            className="poi-map-picker__pin"
            style={{ left: `${mapX}%`, top: `${mapY}%` }}
            onPointerDown={handlePinPointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePinPointerUp}
            onPointerCancel={handlePinPointerUp}
            disabled={disabled}
            aria-label="Kéo để điều chỉnh vị trí POI"
            title="Kéo pin để điều chỉnh vị trí"
          >
            <span />
          </button>
        </div>

        <div className="poi-map-picker__controls">
          <button
            type="button"
            onClick={() => changeZoom(0.5)}
            disabled={disabled || zoom >= MAX_ZOOM}
            aria-label="Phóng to bản đồ"
            title="Phóng to"
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            onClick={() => changeZoom(-0.5)}
            disabled={disabled || zoom <= MIN_ZOOM}
            aria-label="Thu nhỏ bản đồ"
            title="Thu nhỏ"
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(MIN_ZOOM);
              setPan({ x: 0, y: 0 });
            }}
            disabled={disabled || (zoom === MIN_ZOOM && pan.x === 0 && pan.y === 0)}
            aria-label="Đưa bản đồ về mặc định"
            title="Đưa bản đồ về mặc định"
          >
            <LocateFixed size={16} />
          </button>
        </div>
      </div>
      <div className="poi-map-picker__details">
        <span>
          Vị trí trên ảnh: X {Number(mapX).toFixed(1)}% · Y {Number(mapY).toFixed(1)}%
        </span>
        <span>Phóng to: {Math.round(zoom * 100)}%</span>
      </div>
      <p className="poi-map-picker__hint">
        Bấm vào bản đồ để đặt pin, kéo pin để chỉnh vị trí. Lăn chuột hoặc dùng nút +/- để phóng to;
        kéo nền bản đồ khi đang phóng to để di chuyển.
      </p>
    </div>
  );
}
