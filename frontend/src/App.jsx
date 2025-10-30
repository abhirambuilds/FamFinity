import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Features from './pages/Features';
import About from './pages/About';
import Contact from './pages/Contact';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import OnboardingQuestions from './pages/OnboardingQuestions';
import UploadCSV from './pages/UploadCSV';
import NewDashboard from './pages/NewDashboard';
import Budgets from './pages/Budgets';
import Expenses from './pages/Expenses';
import Goals from './pages/Goals';
import Advisor from './pages/Advisor';
import Chatbot from './pages/Chatbot';
import Investments from './pages/Investments';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Onboarding route - public, can be accessed during signup flow */}
        <Route 
          path="/onboarding" 
          element={<OnboardingQuestions />} 
        />
        
        {/* CSV Upload route - public, can be accessed during signup flow or by authenticated users */}
        <Route 
          path="/upload-csv" 
          element={<UploadCSV />} 
        />
        
        {/* Protected routes - require both authentication AND onboarding completion */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <NewDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/budgets" 
          element={
            <ProtectedRoute>
              <Budgets />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/expenses" 
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/goals" 
          element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/advisor" 
          element={
            <ProtectedRoute>
              <Advisor />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chatbot" 
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/investments" 
          element={
            <ProtectedRoute>
              <Investments />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
