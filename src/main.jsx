import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./main.css";
import { MoralisProvider } from "react-moralis";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <MoralisProvider
            appId="*moralis_app_id*"
            serverUrl="*moralis_server_url*"
        >
            <App />
        </MoralisProvider>
    </React.StrictMode>
);
