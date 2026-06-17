import { RouterProvider } from 'react-router-dom';
import router from './router/router';

/**
 * App
 * The main/root component. Its only job is to hand control to the
 * router — all actual page composition lives in Layout and the routed
 * page components.
 */
function App() {
  return <RouterProvider router={router} />;
}

export default App;
