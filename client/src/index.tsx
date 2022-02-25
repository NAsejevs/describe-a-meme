import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { ContextWrapper } from "./context";
import { BrowserRouter } from "react-router-dom";

ReactDOM.render(
    <BrowserRouter>
        <ContextWrapper>
            <App />
        </ContextWrapper>
    </BrowserRouter>,
    document.getElementById("root")
);
