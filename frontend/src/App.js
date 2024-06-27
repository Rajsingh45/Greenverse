import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import Dashboard from './Dashboard'
import UserContextProvider from './UserContext';
import Admin from './components/Admin'
import NewUser from './components/NewUser'

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
          <Route path="/newuser" element={<NewUser />} />
        </Routes>
        </UserContextProvider>
      </Router>
    </div>
  );
}

export default App;
