// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoadScript } from "@react-google-maps/api";
import { API_KEY } from './api/googleMapApi.js';
import Intro from './pages/intro/Intro.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import SignUpPage from './pages/auth/SignUpPage.jsx';
import SignUpSuccessPage from './pages/auth/SignUpSuccessPage';
import DeleteAccount from './pages/auth/DeleteAccount.jsx';
import MyPage from './pages/mypage/MyPage.jsx';
import PrivateRoute from './pages/auth/PrivateRoute.jsx';
import EditProfile from './pages/edit-profile/EditProfile.jsx';
import EditCover from './pages/edit-cover/EditCover.jsx';
import CreateCalendar from './pages/create-calendar/CreateCalendar.jsx';
import Calendar from './pages/calendar/Calendar';
import RouteMode from './pages/calendar/route-mode/RouteMode.jsx';
import SettingCalendar from './pages/calendar/setting/SettingCalendar.jsx';
import './App.css';

const LIBRARIES = ["places", "marker"];

function App() {
  return (
    <BrowserRouter>
      <LoadScript
        id="google-map-script"
        googleMapsApiKey={API_KEY}
        libraries={LIBRARIES}
      >
        <Routes>
          {/* 로그인 불필요 */}
          <Route path="/" element={<Intro />} />
          <Route path="/signin" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* 로그인 필요 */}
          <Route
            path="/signup-success"
            element={
              <PrivateRoute>
                <SignUpSuccessPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/delete-account"
            element={
              <PrivateRoute>
                <DeleteAccount />
              </PrivateRoute>
            }
          />
          <Route
            path="/mypage"
            element={
              <PrivateRoute>
                <MyPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-calendar"
            element={
              <PrivateRoute>
                <CreateCalendar />
              </PrivateRoute>
            }
          />

          <Route
            path="/edit-profile"
            element={
              <PrivateRoute>
                <EditProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-cover"
            element={
              <PrivateRoute>
                <EditCover />
              </PrivateRoute>
            }
          />

          {/* ✅ 여기 calendarId를 파라미터로 받도록 변경 */}
          <Route
            path="/calendar/:calendarId"
            element={
              <PrivateRoute>
                <Calendar />
              </PrivateRoute>
            }
          />
          <Route
            path="/calendar/:calendarId/route"
            element={
              <PrivateRoute>
                <RouteMode />
              </PrivateRoute>
            }
          />
          <Route
            path="/calendar/:calendarId/setting"
            element={
              <PrivateRoute>
                <SettingCalendar />
              </PrivateRoute>
            }
          />
        </Routes>
      </LoadScript>
    </BrowserRouter>
  );
}

export default App;