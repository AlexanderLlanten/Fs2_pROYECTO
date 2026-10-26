import {
    BrowserRouter,
    Route,
    Routes
} from "react-router-dom";

import HomePage from "../pages/HomePage.jsx";
import ProductsPage from "../pages/ProductsPage.jsx";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<HomePage />}
                />

                <Route
                    path="/productos"
                    element={<ProductsPage />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;
