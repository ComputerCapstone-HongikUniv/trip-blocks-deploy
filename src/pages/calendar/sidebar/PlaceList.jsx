// sidebar/PlaceList.jsx
import PlaceCard from './PlaceCard';
import './PlaceList.css';

export default function PlaceList({
  places,
  calendarId,
  fetchBookmarkedPlaces,
  setMakeGEventMode,
  setSelectedPlaceForGEvent,
  selectedPlaceId,
  setSelectedPlaceId,
  setMode,
  onFocusPlace,
}) {
  return (
    <div className="place-list">
      {places.map((place) => {
        return (
          <PlaceCard
            key={place.placeId}
            place={place}
            calendarId={calendarId}
            fetchBookmarkedPlaces={fetchBookmarkedPlaces}
            setMakeGEventMode={setMakeGEventMode}
            setSelectedPlaceForGEvent={setSelectedPlaceForGEvent}
            selectedPlaceId={selectedPlaceId}
            setSelectedPlaceId={setSelectedPlaceId}
            setMode={setMode}
            onFocusPlace={onFocusPlace}
          />
        );
      })}
    </div>
  );
}