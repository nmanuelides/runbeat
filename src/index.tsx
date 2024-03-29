import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
//import './mobile.scss';
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import Cursor from "./components/cursor/src/Cursor";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <>
    <Cursor />
    <div className="curtain-off"/>
    <div className="main-container">
      <div className="header-container">
        <div className="title-container">
          <header className="title">RUNBEAT.</header>
          <h1 className="subtitle">Run to the beat</h1>
        </div>
      </div>
      <App />
      <a className="footer-link" href="https://getsongbpm.com/" target="blank">
        Powered by getSongBPM
      </a>
    </div>
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
