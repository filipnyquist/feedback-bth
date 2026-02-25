import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "@/components/ui/toast";
import { Home } from "@/pages/Home";
import { ProgramDetailPage } from "@/pages/ProgramDetail";
import { Admin } from "@/pages/Admin";
import { EditGroup } from "@/pages/EditGroup";
import { AuthCallback } from "@/pages/AuthCallback";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/program/:id" element={<ProgramDetailPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/group/:id" element={<EditGroup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
