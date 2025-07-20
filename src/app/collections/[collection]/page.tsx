
import Category from '@/components/hero/Category'
import CollectionFilter from '@/components/collection/CollectionFilter'
import React from 'react'

export default async function Collection({ params }: { params: Promise<{ collection: string }> }){
  const { collection } = await params;
  

  return (
    <div className=''>
        <Category/>
        <CollectionFilter collection={collection}/>
    </div>
    
  )
}


