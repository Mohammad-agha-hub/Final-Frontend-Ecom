import ProfilePage from '@/components/user/Profile'
import React from 'react'
import { Metadata } from "next";

export const metadata:Metadata={
  title:"Update Profile"
}

export default async function Profile(){
    return (
    <div>
      <ProfilePage/>
      
    </div>
  )
}

