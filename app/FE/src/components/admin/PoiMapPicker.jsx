import { useId, useRef, useState } from "react";
import { Expand, LocateFixed, X, ZoomIn, ZoomOut } from "lucide-react";
import zooMapImage from "../../assets/map/zoo_map.png";

export default function PoiMapPicker({ mapX, mapY, geofenceRadius, onChange, disabled = false }) {
  const dialogRef = useRef(null);
  const imageRef = useRef(null);
  const viewportRef = useRef(null);
  const titleId = useId();
  const [zoom, setZoom] = useState(1);
  const [point, setPoint] = useState({ mapX, mapY });
  const ringSize = Math.min(90, 20 + geofenceRadius / 2);

  const openMap = () => {
    setPoint({ mapX, mapY });
    setZoom(1);
    dialogRef.current.showModal();
    viewportRef.current.scrollTo(0, 0);
  };
  const closeMap = () => dialogRef.current.close();
  const selectPoint = (event) => {
    if (disabled) return;
    const bounds = imageRef.current.getBoundingClientRect();
    setPoint({
      mapX: Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100)),
      mapY: Math.max(0, Math.min(100, (event.clientY - bounds.top) / bounds.height * 100)),
    });
  };
  const marker = (position) => <>
    <span className="poi-map-picker__geofence" style={{ left: `${position.mapX}%`, top: `${position.mapY}%`, width: `${ringSize}%` }} />
    <span className="poi-map-picker__pin" style={{ left: `${position.mapX}%`, top: `${position.mapY}%` }}><span /></span>
  </>;

  return (
    <div className="poi-map-picker">
      <button type="button" className="poi-map-picker__stage poi-map-picker__preview" disabled={disabled} onClick={openMap} aria-label="Mở bản đồ lớn để chọn vị trí POI">
        <div className="poi-map-picker__image">
          <img src={zooMapImage} alt="Sơ đồ Thảo Cầm Viên" draggable={false} />
          {marker({ mapX, mapY })}
        </div>
        <span className="poi-map-picker__expand"><Expand size={16} /> Mở bản đồ lớn</span>
      </button>
      <div className="poi-map-picker__details">Vị trí trên ảnh: X {Number(mapX).toFixed(1)}% · Y {Number(mapY).toFixed(1)}%</div>
      <p className="poi-map-picker__hint">Bấm bản đồ để mở rộng, sau đó click vị trí muốn đặt POI.</p>

      <dialog ref={dialogRef} className="poi-map-picker__dialog" aria-labelledby={titleId} onCancel={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); if (event.target === event.currentTarget) closeMap(); }}>
        <div className="poi-map-picker__panel">
          <header className="poi-map-picker__header">
            <div><h2 id={titleId}>Chọn vị trí POI</h2><p>Click trên bản đồ để đặt pin. Chọn lại bằng cách click vị trí khác.</p></div>
            <button type="button" onClick={closeMap} aria-label="Đóng bản đồ"><X size={22} /></button>
          </header>
          <div className="poi-map-picker__toolbar">
            <button type="button" onClick={() => setZoom((value) => Math.min(4, value + 0.5))} disabled={zoom >= 4} aria-label="Phóng to bản đồ"><ZoomIn size={20} /></button>
            <span>{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => setZoom((value) => Math.max(1, value - 0.5))} disabled={zoom <= 1} aria-label="Thu nhỏ bản đồ"><ZoomOut size={20} /></button>
            <button type="button" onClick={() => { setZoom(1); viewportRef.current.scrollTo(0, 0); }} aria-label="Xem toàn bộ bản đồ"><LocateFixed size={20} /></button>
            <span className="poi-map-picker__scroll-hint">Khi phóng to, cuộn để xem các phần của bản đồ.</span>
          </div>
          <div ref={viewportRef} className="poi-map-picker__viewport">
            <div className="poi-map-picker__canvas" style={{ width: `${zoom * 100}%` }} onClick={selectPoint}>
              <img ref={imageRef} src={zooMapImage} alt="Click để chọn vị trí trên sơ đồ Thảo Cầm Viên" draggable={false} />
              {marker(point)}
            </div>
          </div>
          <footer className="poi-map-picker__footer">
            <span aria-live="polite">X {Number(point.mapX).toFixed(1)}% · Y {Number(point.mapY).toFixed(1)}%</span>
            <button type="button" onClick={closeMap}>Hủy</button>
            <button type="button" className="poi-map-picker__confirm" disabled={disabled} onClick={() => { onChange(point); closeMap(); }}>Dùng vị trí này</button>
          </footer>
        </div>
      </dialog>
    </div>
  );
}
