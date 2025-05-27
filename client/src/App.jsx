import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TravelForm from "./components/TravelForm";
import ReviewRequests from "./components/ReviewRequests";

const App = () => (
  <Router>
    <nav style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
      <Link to="/">Formulář</Link>
      <Link to="/review">Schvalování</Link>
    </nav>
    <Routes>
      <Route path="/" element={<TravelForm />} />
      <Route path="/review" element={<ReviewRequests />} />
    </Routes>
  </Router>
);

export default App;