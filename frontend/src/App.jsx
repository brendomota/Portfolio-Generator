import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import AuthLayout from './layouts/AuthLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Dashboard from './pages/Dashboard'
import Portfolio from './pages/Portfolio'
import NotFound from './pages/NotFound'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

const router = createBrowserRouter([
  { path: '/',                    element: <Home /> },
  {
    // Rota-pai com layout fixo: Login e Cadastro renderizam no <Outlet> do AuthLayout
    element: <AuthLayout />,
    children: [
      { path: '/login',    element: <Login /> },
      { path: '/cadastro', element: <Cadastro /> },
    ],
  },
  { path: '/dashboard',           element: <PrivateRoute><Dashboard /></PrivateRoute> },
  { path: '/portfolio/:username', element: <Portfolio /> },
  { path: '*',                    element: <NotFound />, errorElement: <NotFound /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
