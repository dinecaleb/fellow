import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { NoteView } from "./pages/NoteView";
import { NewNote } from "./pages/NewNote";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/note/:id" element={<NoteView />} />
        <Route path="/new/:type" element={<NewNote />} />
      </Routes>
    </div>
  );
}

export default App;
