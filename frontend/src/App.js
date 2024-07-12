import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import Dashboard from './Dashboard'
import UserContextProvider from './UserContext';
import Admin from './components/Admin'
import ChangePassword from './ChangePassword';
import ForgotPassword from './ForgotPassword';
import VerifyOTP from './VerifyOTP';
import SetPassword from './SetPassword';
import EditUser from './components/EditUser'
import UserInfo from './UserInfo';

function App() {
  return (
    <div className="App">
      <Router>
      <UserContextProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/edit-user" element={<EditUser />} />
          <Route path="/user-info" element={<UserInfo />} />
        </Routes>
        </UserContextProvider>
      </Router>
    </div>
  );
}

export default App;
