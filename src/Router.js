import React from 'react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Dashboard from "./Pages/Dashboard/Dashboard"

export default function Routers() {
    return (
      <Router basename='/bakabois'>
        <Routes>
          <Route exact path='/' element={<Dashboard />}></Route>
          <Route path='/dashboard' element={<Dashboard />}></Route>
        </Routes>
      </Router>
    )
  }