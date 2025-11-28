import { Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AddMarkSheetPage from './pages/AddMarkSheetPage'
import Layout from './components/Layout'
import Templete from './pages/Templete'
import StoredStudentDetails from './pages/StoredStudentDetails'
import LoginPage from './pages/LoginPage'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { userAuthReducer } from './features/Auth/UserAuth'
import useAuth from './hooks/useAuth.js'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {

  const dispatch = useDispatch();
  const { user, loading } = useAuth();

  // Fetch user ONCE when app loads
  useEffect(() => {
    dispatch(userAuthReducer());
  }, [dispatch]);

  // While loading, do NOT return login page yet
  if (loading) {
    return <div>Loading...</div>;
  }

  // After loading is done:
  // If no user → go to login page
  if (!user) {
    return <LoginPage />;
  }



  return (

    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="createmarksheet" element={<AddMarkSheetPage />} />
          <Route path="allstudent" element={<StoredStudentDetails />} />
          <Route path="editstudent/:studentId" element={<AddMarkSheetPage mode="edit" />} />
        </Route>
      </Route>
    </Routes>
  )
}


export default App
