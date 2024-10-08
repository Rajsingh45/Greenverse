import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import Dashboard from './UserDashboard/Dashboard';
import UserContextProvider from './UserContext';
import ChangePassword from './UserDashboard/ChangePassword';
import ForgotPassword from './UserDashboard/ForgotPassword';
import VerifyOTP from './UserDashboard/VerifyOTP';
import SetPassword from './UserDashboard/SetPassword';
import EditUser from './AdminDashboard/EditUser';
import UserInfo from './UserDashboard/UserInfo';
import DashboardPage from './ParentComponent';
import DeviceDetail from './UserDashboard/DeviceDetail';
import GraphPage from './UserDashboard/GraphPage';
import ContactUs from './UserDashboard/ContactUs';
import UserDetail from './AdminDashboard/UserDetail';
import NewUserForm from './AdminDashboard/NewUser';
import Maps from './UserDashboard/Maps';
import VerifyOtpPage from './VerifyOtpPage'
import About from './About.js'
import NeedHelp from './NeedHelp.js'
import ChangePasswordOTP from './ChangePasswordOTP.js'
const backendURL=process.env.REACT_APP_BACKEND_URL;

function App() {
  return (
    <div className="App">
      <UserContextProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<DashboardPage />} />
              <Route path="/admin/new-user" element={<NewUserForm />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/set-password" element={<SetPassword />} />
              <Route path="/edit-user" element={<EditUser />} />
              <Route path="/user-info" element={<UserInfo />} />
              <Route path="/device/:deviceName" element={<DeviceDetail />} />
              <Route path="/graph/:deviceName" element={<GraphPage />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/user/:email" element={<UserDetail />} />
              <Route path="/api-generation" element={<Maps />} />
              <Route path="/verifysignupotp" element={< VerifyOtpPage/>} />
              <Route path="/about-us" element={< About/>} />
              <Route path="/need-help" element={< NeedHelp/>} />
              <Route path="/new-otp" element={< ChangePasswordOTP/>} />
            </Routes>
          </Router>
      </UserContextProvider>
    </div>
  );
}

export default App;
