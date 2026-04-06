import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { AppRoutes } from "./routes";

function App() {

  return (
    <>
      <Navbar />
      <AppRoutes />
      <Footer />
    </>
  );
}

export default App;