import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { StoreContext, defaultStore } from "./context";

const store = defaultStore;
store.setIsHost = (isHost) => store.isHost = isHost;

ReactDOM.render(
    <StoreContext.Provider value={store}>
        <App />
    </StoreContext.Provider>,
    document.getElementById("root")
);
