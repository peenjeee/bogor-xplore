"use client";
/* eslint-disable react-hooks/refs */

import MapLibreGL, { type MarkerOptions, type PopupOptions } from "maplibre-gl";
import {
  createContext,
  use,
  useEffect,
  useId,
  useMemo,
  useRef,
  useSyncExternalStore,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}

const defaultStyles = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};
const subscribeClientReady = () => () => undefined;
const getClientSnapshot = () => true;
const getServerClientSnapshot = () => false;

type Theme = "light" | "dark";

type MapContextValue = {
  map: MapLibreGL.Map | null;
  isLoaded: boolean;
};

const MapContext = createContext<MapContextValue | null>(null);
const EMPTY_MAP_SNAPSHOT: MapContextValue = { map: null, isLoaded: false };

function createMapStore() {
  let snapshot = EMPTY_MAP_SNAPSHOT;
  const listeners = new Set<() => void>();

  const emit = () => {
    for (const listener of listeners) listener();
  };

  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => EMPTY_MAP_SNAPSHOT,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setMap: (map: MapLibreGL.Map | null) => {
      snapshot = { ...snapshot, map };
      emit();
    },
    setLoaded: (isLoaded: boolean) => {
      snapshot = { ...snapshot, isLoaded };
      emit();
    },
    reset: () => {
      snapshot = EMPTY_MAP_SNAPSHOT;
      emit();
    },
  };
}

function useMap() {
  const context = use(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a Map component");
  }
  return context;
}

function useClientReady() {
  return useSyncExternalStore(subscribeClientReady, getClientSnapshot, getServerClientSnapshot);
}

type MapViewport = {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
};

type MapStyleOption = string | MapLibreGL.StyleSpecification;

type MapProps = {
  children?: ReactNode;
  className?: string;
  theme?: Theme;
  styles?: {
    light?: MapStyleOption;
    dark?: MapStyleOption;
  };
  viewport?: Partial<MapViewport>;
  onViewportChange?: (viewport: MapViewport) => void;
} & Omit<MapLibreGL.MapOptions, "container" | "style">;

function getViewport(map: MapLibreGL.Map): MapViewport {
  const center = map.getCenter();
  return {
    center: [center.lng, center.lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };
}

function Map({
  children,
  className,
  theme: themeProp,
  styles,
  viewport,
  onViewportChange,
  ...props
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapStoreRef = useRef<ReturnType<typeof createMapStore> | null>(null);
  if (!mapStoreRef.current) mapStoreRef.current = createMapStore();
  const mapStore = mapStoreRef.current;
  const { map: mapInstance, isLoaded } = useSyncExternalStore(
    mapStore.subscribe,
    mapStore.getSnapshot,
    mapStore.getServerSnapshot,
  );
  const internalUpdateRef = useRef(false);
  const initialThemeRef = useRef<Theme>(themeProp ?? "light");
  const initialStylesRef = useRef({
    dark: styles?.dark ?? defaultStyles.dark,
    light: styles?.light ?? defaultStyles.light,
  });
  const initialPropsRef = useRef(props);
  const initialViewportRef = useRef(viewport);
  const isControlled = viewport !== undefined && onViewportChange !== undefined;
  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;

  useEffect(() => {
    if (!containerRef.current) return;

    const initialStyle =
      initialThemeRef.current === "dark"
        ? initialStylesRef.current.dark
        : initialStylesRef.current.light;

    const map = new MapLibreGL.Map({
      container: containerRef.current,
      style: initialStyle,
      renderWorldCopies: false,
      attributionControl: { compact: true },
      ...initialPropsRef.current,
      ...initialViewportRef.current,
    });

    const loadHandler = () => mapStore.setLoaded(true);
    const handleMove = () => {
      if (!internalUpdateRef.current) onViewportChangeRef.current?.(getViewport(map));
    };

    map.on("load", loadHandler);
    map.on("move", handleMove);
    mapStore.setMap(map);

    return () => {
      map.off("load", loadHandler);
      map.off("move", handleMove);
      map.remove();
      mapStore.reset();
    };
  }, [mapStore]);

  useEffect(() => {
    if (!mapInstance || !isControlled || !viewport || mapInstance.isMoving()) return;

    const current = getViewport(mapInstance);
    const next = {
      center: viewport.center ?? current.center,
      zoom: viewport.zoom ?? current.zoom,
      bearing: viewport.bearing ?? current.bearing,
      pitch: viewport.pitch ?? current.pitch,
    };

    if (
      next.center[0] === current.center[0] &&
      next.center[1] === current.center[1] &&
      next.zoom === current.zoom &&
      next.bearing === current.bearing &&
      next.pitch === current.pitch
    ) {
      return;
    }

    internalUpdateRef.current = true;
    mapInstance.jumpTo(next);
    internalUpdateRef.current = false;
  }, [isControlled, mapInstance, viewport]);

  const contextValue = useMemo(
    () => ({
      map: mapInstance,
      isLoaded,
    }),
    [isLoaded, mapInstance],
  );

  return (
    <MapContext.Provider value={contextValue}>
      <div ref={containerRef} className={cn("relative h-full w-full", className)}>
        {mapInstance && children}
      </div>
    </MapContext.Provider>
  );
}

type MarkerContextValue = {
  marker: MapLibreGL.Marker;
  map: MapLibreGL.Map | null;
};

const MarkerContext = createContext<MarkerContextValue | null>(null);

function useMarkerContext() {
  const context = use(MarkerContext);
  if (!context) {
    throw new Error("Marker components must be used within MapMarker");
  }
  return context;
}

type MapMarkerProps = {
  longitude: number;
  latitude: number;
  children: ReactNode;
  onClick?: (event: MouseEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
} & Omit<MarkerOptions, "element">;

function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  draggable = false,
  ...markerOptions
}: MapMarkerProps) {
  const { map } = useMap();
  const isClientReady = useClientReady();
  const initialMarkerOptionsRef = useRef(markerOptions);
  const initialDraggableRef = useRef(draggable);
  const initialCoordinateRef = useRef<[number, number]>([longitude, latitude]);
  const callbacksRef = useRef({ onClick, onMouseEnter, onMouseLeave });
  callbacksRef.current = { onClick, onMouseEnter, onMouseLeave };

  const marker = useMemo(() => {
    if (!isClientReady) return null;

    const markerInstance = new MapLibreGL.Marker({
      ...initialMarkerOptionsRef.current,
      element: document.createElement("div"),
      draggable: initialDraggableRef.current,
    }).setLngLat(initialCoordinateRef.current);

    const handleClick = (event: MouseEvent) => callbacksRef.current.onClick?.(event);
    const handleMouseEnter = (event: MouseEvent) => callbacksRef.current.onMouseEnter?.(event);
    const handleMouseLeave = (event: MouseEvent) => callbacksRef.current.onMouseLeave?.(event);

    markerInstance.getElement()?.addEventListener("click", handleClick);
    markerInstance.getElement()?.addEventListener("mouseenter", handleMouseEnter);
    markerInstance.getElement()?.addEventListener("mouseleave", handleMouseLeave);

    return markerInstance;
  }, [isClientReady]);

  useEffect(() => {
    if (!map || !marker) return;

    marker.addTo(map);
    return () => {
      marker.remove();
    };
  }, [map, marker]);

  const markerContextValue = useMemo(() => (marker ? { marker, map } : null), [map, marker]);

  if (!markerContextValue) return null;

  if (markerContextValue.marker.getLngLat().lng !== longitude || markerContextValue.marker.getLngLat().lat !== latitude) {
    markerContextValue.marker.setLngLat([longitude, latitude]);
  }
  if (markerContextValue.marker.isDraggable() !== draggable) {
    markerContextValue.marker.setDraggable(draggable);
  }

  return <MarkerContext.Provider value={markerContextValue}>{children}</MarkerContext.Provider>;
}

function MarkerContent({ children, className }: { children?: ReactNode; className?: string }) {
  const { marker } = useMarkerContext();

  return createPortal(
    <div className={cn("relative cursor-pointer", className)}>
      {children ?? <div className="relative size-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />}
    </div>,
    marker.getElement(),
  );
}

function PopupCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close popup"
      className="absolute right-0.5 top-0.5 z-10 inline-flex size-5 cursor-pointer items-center justify-center rounded-sm text-[#111111] transition-colors hover:bg-black/10 focus:outline-none focus-visible:ring-2"
    >
      <X className="size-3.5" />
    </button>
  );
}

type MarkerTooltipProps = {
  children: ReactNode;
  className?: string;
} & Omit<PopupOptions, "className" | "closeButton" | "closeOnClick">;

function MarkerTooltip({ children, className, ...popupOptions }: MarkerTooltipProps) {
  const { marker, map } = useMarkerContext();
  const container = useMemo(() => document.createElement("div"), []);
  const popupOptionsRef = useRef(popupOptions);
  const tooltipRef = useRef<MapLibreGL.Popup | null>(null);

  if (!tooltipRef.current) {
    tooltipRef.current = new MapLibreGL.Popup({
      offset: 16,
      ...popupOptionsRef.current,
      closeOnClick: true,
      closeButton: false,
      className: "bogor-route-tooltip",
    }).setMaxWidth("none");
  }

  const tooltip = tooltipRef.current;

  useEffect(() => {
    if (!map) return;

    tooltip.setDOMContent(container);

    const handleMouseEnter = () => tooltip.setLngLat(marker.getLngLat()).addTo(map);
    const handleMouseLeave = () => tooltip.remove();

    marker.getElement()?.addEventListener("mouseenter", handleMouseEnter);
    marker.getElement()?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      marker.getElement()?.removeEventListener("mouseenter", handleMouseEnter);
      marker.getElement()?.removeEventListener("mouseleave", handleMouseLeave);
      tooltip.remove();
    };
  }, [container, map, marker, tooltip]);

  return createPortal(
    <div className={cn("relative max-w-62 rounded-md border bg-white p-3 text-[#111111] shadow-md", className)}>
      {children}
    </div>,
    container,
  );
}

function MarkerLabel({
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

type MapRouteProps = {
  id?: string;
  coordinates: [number, number][];
  color?: string;
  width?: number;
  opacity?: number;
  dashArray?: [number, number];
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  interactive?: boolean;
};

type RouteHandlers = Pick<MapRouteProps, "onClick" | "onMouseEnter" | "onMouseLeave">;

function syncRoutePaint(
  map: MapLibreGL.Map,
  layerId: string,
  {
    color,
    width,
    opacity,
    dashArray,
  }: {
    color: string;
    width: number;
    opacity: number;
    dashArray?: [number, number];
  },
) {
  if (!map.getLayer(layerId)) return;

  map.setPaintProperty(layerId, "line-color", color);
  map.setPaintProperty(layerId, "line-width", width);
  map.setPaintProperty(layerId, "line-opacity", opacity);
  map.setPaintProperty(layerId, "line-dasharray", dashArray);
}

function bindRouteLayerEvents(
  map: MapLibreGL.Map,
  layerId: string,
  handlersRef: MutableRefObject<RouteHandlers>,
) {
  const handleClick = () => handlersRef.current.onClick?.();
  const handleMouseEnter = () => {
    map.getCanvas().style.cursor = "pointer";
    handlersRef.current.onMouseEnter?.();
  };
  const handleMouseLeave = () => {
    map.getCanvas().style.cursor = "";
    handlersRef.current.onMouseLeave?.();
  };

  map.on("click", layerId, handleClick);
  map.on("mouseenter", layerId, handleMouseEnter);
  map.on("mouseleave", layerId, handleMouseLeave);

  return () => {
    map.off("click", layerId, handleClick);
    map.off("mouseenter", layerId, handleMouseEnter);
    map.off("mouseleave", layerId, handleMouseLeave);
  };
}

function MapRoute({
  id: propId,
  coordinates,
  color = "#4285F4",
  width = 3,
  opacity = 0.8,
  dashArray,
  onClick,
  onMouseEnter,
  onMouseLeave,
  interactive = true,
}: MapRouteProps) {
  const { map, isLoaded } = useMap();
  const autoId = useId();
  const id = propId ?? autoId;
  const sourceId = `route-source-${id}`;
  const layerId = `route-layer-${id}`;
  const handlersRef = useRef({ onClick, onMouseEnter, onMouseLeave });
  handlersRef.current = { onClick, onMouseEnter, onMouseLeave };

  useEffect(() => {
    if (!isLoaded || !map) return;

    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: [] },
      },
    });

    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": "#4285F4",
        "line-width": 3,
        "line-opacity": 0.8,
      },
    });

    return () => {
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // MapLibre can throw during teardown if the style is already gone.
      }
    };
  }, [isLoaded, layerId, map, sourceId]);

  useEffect(() => {
    if (!isLoaded || !map || coordinates.length < 2) return;

    const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource | undefined;
    source?.setData({
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates },
    });
  }, [coordinates, isLoaded, map, sourceId]);

  useEffect(() => {
    if (!isLoaded || !map) return;

    syncRoutePaint(map, layerId, { color, width, opacity, dashArray });
  }, [color, dashArray, isLoaded, layerId, map, opacity, width]);

  useEffect(() => {
    if (!isLoaded || !map || !interactive) return;

    return bindRouteLayerEvents(map, layerId, handlersRef);
  }, [interactive, isLoaded, layerId, map]);

  return null;
}

export { Map, useMap, MapMarker, MarkerContent, MarkerTooltip, MarkerLabel, PopupCloseButton, MapRoute };
export type { MapViewport };
