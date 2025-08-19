import React, { Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import './scss/style.scss'
import Home from './components/Home'
import AddUserForm from './components/AddUserForm'
import UserList from './components/UserList'
import EditUser from './components/EditUser'
import AddAsset from './components/AddAsset'
import MultipleEncode from './components/MultipleEncode'
import ViewReport from './components/ViewReport'
import WidgetsBrand from './views/widgets/WidgetsBrand'
import Dashboard from './views/dashboard/Dashboard'
import { AuthProvider } from './components/AuthContext'
import UpdatePrompt from './components/UpdatePrompt'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Suspense fallback={loading}>
          <UpdatePrompt />
          <ToastContainer />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/404" element={<Page404 />} />
            <Route path="/500" element={<Page500 />} />
            <Route
              path="*"
              element={
                <DefaultLayout>
                  <Dashboard />
                </DefaultLayout>
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </HashRouter>
  )
}

export default App
