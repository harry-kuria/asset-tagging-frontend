import React, { Component, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import './scss/style.scss'
import Home from './components/Home'
import AddUserForm from './components/AddUserForm'
import UserList from './components/UserList'
import EditUser from './components/EditUser'
import AddAsset from './components/AddAsset'
import MultipleEncode from './components/MultipleEncode'
import ViewReport from './components/ViewReport'
import WidgetsBrand from './views/widgets/WidgetsBrand' // Import your WidgetsBrand component
//import { getUserRoles } from './components/UserRoles' // Import your getUserRoles function
import Dashboard from './views/dashboard/Dashboard'
import { AuthProvider } from './components/AuthContext'
import { useLocation } from 'react-router-dom'
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

class App extends Component {
  render() {
    //const userRoles = getUserRoles()

    return (
      <HashRouter>
        <AuthProvider>
          <Suspense fallback={loading}>
            <Routes>
              <Route exact path="/" name="Login Page" element={<Home />} />
              <Route exact path="/register" name="Register Page" element={<Register />} />
              <Route exact path="/404" name="Page 404" element={<Page404 />} />
              <Route exact path="/500" name="Page 500" element={<Page500 />} />
              <Route
                path="*"
                name="Dashboard"
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
}

export default App
