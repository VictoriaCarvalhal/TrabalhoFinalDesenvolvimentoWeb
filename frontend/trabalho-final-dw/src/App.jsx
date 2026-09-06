import { useState } from 'react'
import Inicial from './components/Inicial/inicial'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <Inicial/>
      </div>
    </>
  )
}

export default App
