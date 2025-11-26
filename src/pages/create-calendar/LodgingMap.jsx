// LodgingMap.jsx
import { useRef, useCallback, useEffect } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { ALL_CITY_CONFIG } from '../../utils/cityConfig.js';
import { MAP_ID } from '../../api/googleMapApi.js';

export default function LodgingMap({ city, setPlaces, query }) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // importLibrary 결과 캐시
  const placesLibRef = useRef(null);
  const markerLibRef = useRef(null);

  const currentCity =
    ALL_CITY_CONFIG.find((c) => c.id === city) || ALL_CITY_CONFIG[0];

  const clearMarkers = () => {
    markersRef.current.forEach((m) => {
      m.map = null;
    });
    markersRef.current = [];
  };

  // 🔎 공통 텍스트 검색 함수 (기본 검색 + 검색어 검색 둘 다 여기로)
  const runTextSearch = useCallback(
    async (overrideQuery) => {
      if (!mapRef.current) return;
      if (!placesLibRef.current || !markerLibRef.current) return;

      const { Place } = placesLibRef.current;
      const { AdvancedMarkerElement } = markerLibRef.current;

      // 검색어: props query 있으면 그거, 없으면 city의 defaultQuery
      const textQuery =
        (overrideQuery ?? query)?.trim() || currentCity.defaultQuery;

      const request = {
        textQuery,
        fields: [
          "id",
          "displayName",
          "location",
          "formattedAddress",
          "rating",
          "userRatingCount",
          "photos",
        ],
        locationBias: currentCity.center,
        maxResultCount: 20,
        language: "ko",
        region: "KR",
      };

      const { places: foundPlaces } = await Place.searchByText(request);
      // console.log("텍스트 검색 결과:", foundPlaces);

      setPlaces(foundPlaces || []);
      clearMarkers();

      (foundPlaces || []).forEach((place) => {
        if (!place.location) return;

        const loc = place.location;
        const position =
          typeof loc.lat === "function"
            ? { lat: loc.lat(), lng: loc.lng() }
            : { lat: loc.lat, lng: loc.lng };

        const marker = new AdvancedMarkerElement({
          map: mapRef.current,
          position,
          title: place.displayName?.text || place.displayName || "",
        });

        markersRef.current.push(marker);
      });

      // 첫 번째 결과로 중심 이동
      if (foundPlaces && foundPlaces[0]?.location) {
        const loc = foundPlaces[0].location;
        const center =
          typeof loc.lat === "function"
            ? { lat: loc.lat(), lng: loc.lng() }
            : { lat: loc.lat, lng: loc.lng };

        mapRef.current.panTo(center);
      }
    },
    [query, currentCity, setPlaces]
  );

  // 지도 로드 시: 라이브러리 import + 기본 검색 실행
  const handleMapLoad = useCallback(
    async (map) => {
      mapRef.current = map;

      // city에 맞는 center로 이동
      map.setCenter(currentCity.center);
      map.setZoom(11);

      // 라이브러리 로드 & 캐시
      placesLibRef.current = await window.google.maps.importLibrary("places");
      markerLibRef.current = await window.google.maps.importLibrary("marker");

      // 기본 검색 실행 (query 없으면 defaultQuery 사용)
      await runTextSearch();
    },
    [currentCity, runTextSearch]
  );

  // city 또는 query 변경 시 재검색
  useEffect(() => {
    if (!mapRef.current || !placesLibRef.current || !markerLibRef.current)
      return;

    runTextSearch();
  }, [city, query, runTextSearch]);

  return (
    <GoogleMap
      center={currentCity.center}
      zoom={11}
      onLoad={handleMapLoad}
      mapContainerStyle={{ width: "100%", height: "500px" }}
      options={{ mapId: MAP_ID }}
    />
  );
}