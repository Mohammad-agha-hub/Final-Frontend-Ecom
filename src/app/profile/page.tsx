import ProfilePage from '@/components/user/Profile'
import React from 'react'
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { redirect } from "next/navigation";

export default async function Profile(){
   const session = await getServerSession(authOptions);
     if (!session || session.user.backendToken) {
       return redirect("/login");
     } 
    return (
    <div>
      <ProfilePage/>
      
    </div>
  )
}

