import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Hero from './component/layout/hero'
import SignUp from './component/layout/signup.jsx'
import Login from './component/layout/login.jsx'
import ForgotPassword from './component/layout/forgotpassword.jsx'
import Home from './pages/home.jsx'

// Dashboard
import Dashboard from './dashboardcontent/dashboard.jsx'
import Scheduling from './dashboardcontent/Scheduling.jsx'
import Meetings from './dashboardcontent/Meetings.jsx'
import Availability from './dashboardcontent/Availability.jsx'
import PublicBooking from './dashboardcomponent/PublicBooking.jsx'

// profile
import ProfileDashboard from './profile/profiledashboard.jsx'
import Success from './component/layout/success.jsx';


 export default function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>

        
        <Route path="/" element={<Home />} />
       
       
        
        <Route path="/login" element={<Login/>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
       <Route path="/join-event/:eventId" element={<PublicBooking />} />
       <Route path="/book/:eventId" element={<PublicBooking />} />
    
        <Route path="/signup" element={<SignUp />} />
      {/* dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scheduling" element={<Scheduling />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/availability" element={<Availability />} /> 

        {/* profile */}
        <Route path="/profile" element={<ProfileDashboard />} />
        <Route path="/success" element={<Success/>} />
      </Routes>
    </BrowserRouter>
     );
}


