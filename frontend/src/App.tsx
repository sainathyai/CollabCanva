import { BrowserRouter } from 'react-router-dom'
import Header from './components/Header'
import Router from './routes/Router'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <Router />
      </div>
    </BrowserRouter>
  )
}

export default App

