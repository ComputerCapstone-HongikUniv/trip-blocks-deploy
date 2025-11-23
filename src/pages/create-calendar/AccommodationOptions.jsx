import { API_KEY } from '../../api/googleMapApi.js';
import './AccommodationOptions.css';

export default function AccommodationOptions({ places = [], city, cities }) {
  const safePlaces = places ?? [];

  return (
    <div className="accommodation-list-container">
      <h3>숙소 검색 결과</h3>    {/*  20개 */}
      <div className="accommodation-list">
        {safePlaces.map((p) => {
          const name = p.displayName || '(이름 없음)';
          const address = p.formattedAddress || '';

          const rating = p.rating;
          const reviewCount = p.userRatingCount;

          const photoName = p.photos?.[0]?.name;
          const photoUrl = photoName
            ? `https://places.googleapis.com/v1/${photoName}/media?key=${API_KEY}&maxHeightPx=500&maxWidthPx=500`
            : '/images/accommodation-placeholder.jpg';

          return (
            <div key={p.id} className="accommodation-card">
              <img
                src={photoUrl}
                alt={name}
                className="accommodation-photo"
              />

              <div className="accommodation-info">
                <div className="accommodation-name">{name}</div>
                <div className="accommodation-address">{address}</div>

                <div className="accommodation-rating">
                  {typeof rating === 'number' ? (
                    <>
                      <span className="rating-star">★</span>
                      <span className="rating-score">
                        {rating.toFixed(1)}
                      </span>
                      {typeof reviewCount === 'number' && (
                        <span className="rating-count">
                          ({reviewCount.toLocaleString()} 리뷰)
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="rating-none">평점 정보 없음</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}