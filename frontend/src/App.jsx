import { Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AddMarkSheetPage from './pages/AddMarkSheetPage'
import Layout from './components/Layout'
import Templete from './pages/Templete'

function App() {
  return (

      <Routes>
        <Route path="/" element={<Layout />}>

          <Route index element={<LandingPage />} />
          <Route path="/createmarksheet"  element={<AddMarkSheetPage/>} />
          {/* <Route path="/createmarksheet"  element={<Templete/>} /> */}

      

        </Route>
      </Routes>
  )
}

export default App
