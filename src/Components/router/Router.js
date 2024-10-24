import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "../app/Home";
import Register from "../member/Register";
import Login from "../member/Login";
import Logout from "../member/Logout";
import Book from '../app/Book';
import GoogleMaps from '../Api/GoogleMaps.tsx';
import PlannerPage from "../planner/PlannerPage.js";
import DateRangePicker from "../DateRangePicker/DateRangePicker.js";
import User from "../member/user/user.js";
import GPT from "../GPT/GPT";

function Router() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
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
