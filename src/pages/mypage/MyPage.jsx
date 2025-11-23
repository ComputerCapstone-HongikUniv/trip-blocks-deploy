// import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance.js';
import { useEffect, useState } from "react";
import BrandLogo from "../../components/Brand/BrandLogo.jsx";
import CoverImage from "./CoverImage.jsx";
import MypageDropdown from "../../components/Header/MypageDropdown.jsx";
import { MyCalendars } from './MyCalendars.jsx';
import './MyPage.css';

import ProfileBtn from '../../components/Header/ProfileBtn.jsx';

function MyPage() {
  const [calendars, setCalendars] = useState([]);

  useEffect(() => {
    const FetchCalendars = async () => {
      const res = await axiosInstance.get('/api/calendars/calendar-list');
      setCalendars(res.data);
    }
    FetchCalendars();
  }, []);

  return (
    <div>
      <title>My Page</title>

      <CoverImage />

      <header className="my-page-header">
        <Link to="/mypage" className="logo-container">
          <BrandLogo logoSize={20} fontSize={20} fontWeight="700" color={"#ffffff"} />
        </Link>

        <div className='right-section'>
          <ProfileBtn />
          <MypageDropdown />
        </div>
      </header>

      <h1 className="catchphrase" >Design Your Days, <br></br>
        Discover the World
      </h1>

      <div className="calendars-container">

        <div className="calandars-txt-container">
          <h2 className="calandars-txt">Calendars</h2>
          <Link to="/create-calendar">
            <button className="plus-icon-btn">
              <img className="plus-icon" src="icons/plus-icon.png" />
            </button>
          </Link>
        </div>

        <MyCalendars calendars={calendars} />
      </div>
    </div >
  );
}

export default MyPage;