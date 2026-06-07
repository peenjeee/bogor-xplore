"use client";

import {
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import maplibregl from "maplibre-gl";
import type {
  ControlPosition,
  LngLat,
  LngLatBounds,
  LngLatLike,
  Map as MapLibreMap,
  Marker as MapLibreMarker,
} from "maplibre-gl";
import { cn } from "@/lib/utils";

type MapContextValue = {
  map: MapLibreMap | null;
};

const EMPTY_FIT_BOUNDS: Array<[number, number]> = [];

const MapContext = createContext<MapContextValue>({ map: null });

const mapStyle = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const subscribeClientReady = () => () => undefined;
const getClientSnapshot = () => true;
const getServerClientSnapshot = () => false;

function useClientReady() {
  return useSyncExternalStore(subscribeClientReady, getClientSnapshot, getServerClientSnapshot);
}

function getCoordinateBounds(coordinates: Array<[number, number]>) {
  return coordinates.reduce<LngLatBounds | null>((currentBounds, coordinate) => {
    if (!currentBounds) return new maplibregl.LngLatBounds(coordinate, coordinate);
    return currentBounds.extend(coordinate);
  }, null);
}

function syncMapFitBounds(instance: MapLibreMap, fitBounds: Array<[number, number]>, zoom: number) {
  if (fitBounds.length === 1) {
    instance.easeTo({ center: fitBounds[0], zoom, duration: 0 });
    return;
  }

  const bounds = getCoordinateBounds(fitBounds);
  if (!bounds) return;

  instance.fitBounds(bounds, {
    duration: 0,
    maxZoom: 12.5,
    padding: 72,
  });
}

export function Map({
  center = [106.806, -6.596],
  fitBounds = EMPTY_FIT_BOUNDS,
  zoom = 10.4,
  children,
  className,
}: {
  center?: [number, number];
  fitBounds?: Array<[number, number]>;
  zoom?: number;
  children?: ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;

    let frame = 0;
    const resize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => mapRef.current?.resize());
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const instance = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: center as LngLatLike,
      zoom,
      attributionControl: { compact: false },
    });

    instance.on("load", () => {
      instance.resize();
      setMap(instance);
    });

    mapRef.current = instance;

    return () => {
      instance.remove();
      mapRef.current = null;
      setMap(null);
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.resize();
  });

  const fitBoundsKey = fitBounds?.map((coordinate) => coordinate.join(",")).join("|") ?? "";

  useEffect(() => {
    const instance = mapRef.current;
    if (!instance || fitBounds.length === 0) return;

    syncMapFitBounds(instance, fitBounds, zoom);
  }, [fitBounds, fitBoundsKey, zoom]);

  const value = useMemo(() => ({ map }), [map]);

  return (
    <MapContext.Provider value={value}>
      <div className={cn("relative h-full min-h-[420px] overflow-hidden rounded-lg border bg-[#f7f7ef] shadow-sm", className)}>
        <div ref={containerRef} className="absolute inset-0" style={{ position: "absolute", inset: 0 }} />
        {children}
      </div>
    </MapContext.Provider>
  );
}

type MapControlsOptions = {
  zoom?: boolean;
  compass?: boolean;
  locate?: boolean;
  fullscreen?: boolean;
};

const DEFAULT_MAP_CONTROLS: MapControlsOptions = {};

export function MapControls({
  position = "bottom-right",
  controls = DEFAULT_MAP_CONTROLS,
}: {
  position?: ControlPosition;
  controls?: MapControlsOptions;
}) {
  const { map } = use(MapContext);
  const showZoom = controls.zoom ?? true;
  const showCompass = controls.compass ?? true;
  const showLocate = controls.locate ?? false;
  const showFullscreen = controls.fullscreen ?? false;

  useEffect(() => {
    if (!map) return;

    const controls: Array<maplibregl.IControl> = [];
    if (showZoom || showCompass) {
      controls.push(new maplibregl.NavigationControl({ showZoom, showCompass, visualizePitch: true }));
    }
    if (showLocate) {
      controls.push(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: false,
        }),
      );
    }
    if (showFullscreen) {
      controls.push(new maplibregl.FullscreenControl());
    }

    controls.forEach((control) => map.addControl(control, position));

    return () => {
      controls.forEach((control) => {
        try {
          map.removeControl(control);
        } catch {
          // MapLibre throws if the map is already tearing down.
        }
      });
    };
  }, [map, position, showCompass, showFullscreen, showLocate, showZoom]);

  return null;
}

function isMarkerPopup(child: ReactNode): child is ReactElement<{ children?: ReactNode; className?: string }> {
  return isValidElement(child) && child.type === MarkerPopup;
}

export function MapMarker({
  longitude,
  latitude,
  draggable = false,
  onDragEnd,
  popup,
  children,
}: {
  longitude: number;
  latitude: number;
  draggable?: boolean;
  onDragEnd?: (lngLat: LngLat) => void;
  popup?: ReactNode;
  children?: ReactNode;
}) {
  const { map } = use(MapContext);
  const isClientReady = useClientReady();
  const markerRef = useRef<MapLibreMarker | null>(null);
  const markerElement = useMemo(() => {
    if (!isClientReady) return null;
    const element = document.createElement("div");
    element.className = "map-marker-root";
    return element;
  }, [isClientReady]);
  const popupElement = useMemo(() => {
    if (!isClientReady) return null;
    return document.createElement("div");
  }, [isClientReady]);

  const childArray = useMemo(() => {
    return Array.isArray(children) ? children : [children];
  }, [children]);
  const popupChild = popup ?? childArray.find(isMarkerPopup);
  const markerChildren = popup ? children : childArray.filter((child) => !isMarkerPopup(child));
  const popupContent = isMarkerPopup(popupChild) ? popupChild.props.children : popupChild;

  useEffect(() => {
    if (!map || !markerElement) return;

    const marker = new maplibregl.Marker({ element: markerElement, draggable })
      .setLngLat([longitude, latitude])
      .addTo(map);

    if (popupContent && popupElement) {
      marker.setPopup(
        new maplibregl.Popup({
          closeButton: true,
          closeOnClick: true,
          offset: 16,
          className: "bogor-map-popup",
        }).setDOMContent(popupElement),
      );
    }

    if (onDragEnd) {
      marker.on("dragend", () => onDragEnd(marker.getLngLat()));
    }

    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
    };
  }, [draggable, latitude, longitude, map, markerElement, onDragEnd, popupContent, popupElement]);

  useEffect(() => {
    markerRef.current?.setLngLat([longitude, latitude]);
  }, [longitude, latitude]);

  return (
    <>
      {markerElement ? createPortal(markerChildren, markerElement) : null}
      {popupElement && popupContent ? createPortal(popupContent, popupElement) : null}
    </>
  );
}

export function MarkerContent({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={cn("cursor-pointer", className)}>{children}</div>;
}

export function MarkerLabel({
  children,
  position = "bottom",
  className,
}: {
  children?: ReactNode;
  position?: "top" | "bottom";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-none border-[3px] border-[#111111] bg-white px-2 py-1 text-xs font-black uppercase text-[#111111] shadow-[4px_4px_0_#111111]",
        position === "top" ? "bottom-full mb-2" : "top-full mt-2",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function MarkerPopup({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={cn("w-56 max-w-[calc(100vw-48px)] bg-white p-3 text-[#111111]", className)}>{children}</div>;
}

export function MapPopup() {
  return null;
}
