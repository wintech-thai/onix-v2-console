"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { MapDataPoint } from "../api/fetch-scan-map.api";
import "leaflet/dist/leaflet.css";
import { useMemo } from "react";
import L from "leaflet";
import { useTranslation } from "react-i18next";

interface ScanMapProps {
  mapData: MapDataPoint[];
  productColors: Record<string, string>;
}

const ScanMap = ({ mapData, productColors }: ScanMapProps) => {
  const { t } = useTranslation("scan-map");

  // Calculate center of map based on data
  const center = useMemo<[number, number]>(() => {
    if (mapData.length === 0) {
      return [13.7563, 100.5018]; // Default to Bangkok
    }

    const avgLat =
      mapData.reduce((sum, point) => sum + point.location.lat, 0) /
      mapData.length;
    const avgLon =
      mapData.reduce((sum, point) => sum + point.location.lon, 0) /
      mapData.length;

    return [avgLat, avgLon];
  }, [mapData]);

  // Custom cluster icon
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createClusterCustomIcon = (cluster: any) => {
    const count = cluster.getChildCount();
    return L.divIcon({
      html: `<div style="
        background-color: #3b82f6;
        color: white;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: bold;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        pointer-events: auto;
      ">${count}</div>`,
      className: "custom-cluster-icon",
      iconSize: L.point(50, 50, true),
    });
  };

  return (
    <MapContainer
      center={center}
      zoom={6}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup
        chunkedLoading
        showCoverageOnHover={false}
        spiderfyOnMaxZoom={true}
        spiderfyOnEveryZoom={true}
        maxClusterRadius={20}
        iconCreateFunction={createClusterCustomIcon}
      >
        {mapData.map((point) => {
          const color = point.productCode
            ? productColors[point.productCode] || "#999"
            : "#999";

          return (
            <CircleMarker
              key={point.id}
              center={[point.location.lat, point.location.lon]}
              radius={8}
              fillColor={color}
              color="#fff"
              weight={2}
              opacity={1}
              fillOpacity={0.8}
            >
              <Tooltip>
                <div className="space-y-1 min-w-[200px]">
                  <div>
                    <span className="font-semibold">
                      {t("tooltip.product")}:
                    </span>{" "}
                    {point.productCode || t("tooltip.notAvailable")}
                  </div>
                  {point.productDesc && (
                    <div className="text-sm text-gray-600">
                      {point.productDesc}
                    </div>
                  )}
                  <div>
                    <span className="font-semibold">{t("tooltip.email")}:</span>{" "}
                    {point.email || t("tooltip.notAvailable")}
                  </div>
                  <div>
                    <span className="font-semibold">
                      {t("tooltip.province")}:
                    </span>{" "}
                    {point.province || t("tooltip.notAvailable")}
                  </div>
                  <div>
                    <span className="font-semibold">
                      {t("tooltip.country")}:
                    </span>{" "}
                    {point.country || t("tooltip.notAvailable")}
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default ScanMap;
