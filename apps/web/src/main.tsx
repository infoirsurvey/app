import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <GoogleReCaptchaProvider reCaptchaKey="6LecnGssAAAAALFIe8-D_zEcP-hdj_aFe2TbG0Fq">
        <AuthProvider>
          <App />
        </AuthProvider>
      </GoogleReCaptchaProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
