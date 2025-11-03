import {BrowserRouter, Route, Routes} from "react-router";
import {HeroPage} from "./pages/HeroPage.jsx";
import Model from "./pages/model/Model.jsx";
import DesignPage from "./pages/design/DesignPage.jsx";

export const AppRouter = () => (
    <BrowserRouter>
        <Routes>
            <Route index element={<HeroPage />}/>
            <Route path={'/model'} element={<Model />} />
            <Route path={'/design'} element={<DesignPage />} />
        </Routes>
    </BrowserRouter>
);