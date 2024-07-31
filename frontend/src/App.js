import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import Dashboard from './Dashboard';
import UserContextProvider from './UserContext';
import Admin from './components/Admin';
import ChangePassword from './ChangePassword';
import ForgotPassword from './ForgotPassword';
import VerifyOTP from './VerifyOTP';
import SetPassword from './SetPassword';
import EditUser from './components/EditUser';
import UserInfo from './UserInfo';
import DashboardPage from './ParentComponent';
import DeviceDetail from './DeviceDetail';
import GraphPage from './GraphPage';
import ContactUs from './ContactUs';
import UserDetail from './UserDetail';
import ToggleMode from './ToggleMode';
import NewUserForm from './components/NewUser';
// import TestThemeComponent from './TestThemeComponent'; // Ensure this is the correct path

function App() {
  return (
    <div className="App">
      <UserContextProvider>
        <ToggleMode>
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
              <Route path="/device/:deviceId" element={<DeviceDetail />} />
              <Route path="/graph/:deviceId" element={<GraphPage />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/user/:email" element={<UserDetail />} />
            </Routes>
          </Router>
        </ToggleMode>
      </UserContextProvider>
    </div>
  );
}

export default App;
