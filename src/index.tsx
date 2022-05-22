import ReactDOM from "react-dom";
import "./client/index.css";
import App from "./client/components/App";
import { ContextWrapper } from "./client/context";
import { BrowserRouter } from "react-router-dom";

ReactDOM.render(
    <BrowserRouter>
        <ContextWrapper>
            <App />
        </ContextWrapper>
    </BrowserRouter>,
    document.getElementById("root")
);
