
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './components/providers'
import { router } from './routes'
import './assets/styles/index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')!).render(

  <div>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: { background: '#222', color: '#ff0' }
      }}
    />
  </div>
)