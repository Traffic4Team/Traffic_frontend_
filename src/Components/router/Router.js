import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../app/Home";
import BbsList from "../bbs/BbsList";
import BbsWrite from "../bbs/BbsWrite";
import BbsDetail from "../bbs/BbsDetail";
import BbsUpdate from "../bbs/BbsUpdate";
import BbsAnswer from "../bbs/BbsAnswer";
import Register from "../member/Register";
import Login from "../member/Login";
import Logout from "../member/Logout";
import Book from '../app/Book';
import GoogleMaps from '../Api/GoogleMaps.tsx';
import PlannerPage from "../planner/PlannerPage.js";
import DateRangePicker from "../DateRangePicker/DateRangePicker.js";
import User from "../member/user";
import GPT from "../GPT/GPT";

function Router() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/bbslist" element={<BbsList />} />
        <Route path="/bbswrite" element={<BbsWrite />} />
        <Route path="/bbsdetail/:seq" element={<BbsDetail />} />
        <Route path="/bbsupdate" element={<BbsUpdate />} />
        <Route path="/bbsanswer/:parentSeq" element={<BbsAnswer />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />

        <Route path="/book" element={<Book />} />
        <Route path="/googlemaps" element={<GoogleMaps />} />
        <Route path="/PlannerPage" element={<PlannerPage />} />
        <Route path="/DateRangePicker" element={<DateRangePicker />} />
        <Route path="/user" element={<User />} />
        <Route path="/gpt" element={<GPT />} />
      </Routes>

  );
}

export default Router;
