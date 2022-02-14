import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { StoreContext, defaultStore } from "./context";

ReactDOM.render(
    <StoreContext.Provider value={defaultStore}>
        <App />
    </StoreContext.Provider>,
    document.getElementById("root")
);
