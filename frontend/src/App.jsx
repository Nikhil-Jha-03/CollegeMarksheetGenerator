import { Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AddMarkSheetPage from './pages/AddMarkSheetPage'
import Layout from './components/Layout'
import Templete from './pages/Templete'
import StoredStudentDetails from './pages/StoredStudentDetails'

function App() {
  return (

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="/createmarksheet"  element={<AddMarkSheetPage/>} />
          <Route path="/allstudent"  element={<StoredStudentDetails/>} />
          <Route path="/editstudent/:studentId"  element={<AddMarkSheetPage mode='edit'/>} />
        </Route>
      </Routes>
  )
}

export default App
