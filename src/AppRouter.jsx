import {BrowserRouter, Route, Routes} from "react-router";
import {HeroPage} from "./pages/HeroPage.jsx";
import ModelPage from "./pages/model/ModelPage.jsx";
import DesignPage from "./pages/design/DesignPage.jsx";

export const AppRouter = () => (
    <BrowserRouter basename="/Litiy-Sew">
        <Routes>
            <Route index element={<HeroPage />}/>
            <Route path={'/model'} element={<ModelPage />} />
            <Route path={'/design'} element={<DesignPage />} />
        </Routes>
    </BrowserRouter>
);