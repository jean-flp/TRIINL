import React from "react";
import DehazeOutlinedIcon from "@mui/icons-material/DehazeOutlined";

const Header = () => {
  return (
    <header className="header">
      <h1>My Website</h1>
      <nav>
        <ul className="nav-list">
          <li>
            <a href="/">Home</a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
