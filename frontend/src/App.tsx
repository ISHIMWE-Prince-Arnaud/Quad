import { RouterProvider } from "react-router-dom";
import { SocketManager } from "./components/SocketManager";
import { router } from "./routes";

function App() {
  return (
    <>
      <SocketManager />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
