"use client"
import React from 'react'
import { useUser } from '@clerk/nextjs'
const MainPage = () => {
  const {user} = useUser()
  console.log(user)
  return (
    <div>MainPage</div>
  )
}

export default MainPage