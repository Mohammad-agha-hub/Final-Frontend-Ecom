import CheckoutDetail from '@/components/checkout/CheckoutDetail'
import OrderSummary from '@/components/checkout/OrderSummary'
import OrderSummaryTop from '@/components/checkout/OrderSummaryTop'
import React from 'react'



const Checkout = () => {
  return (
    <div className='checkout flex flex-col lg:flex-row px-[5%] sm:px-[10%] md:px-[7%] lg:px[10%] xl:px-[5%] gap-10'>
      <div className='lg:hidden'>
      <OrderSummaryTop/>
      </div>
      <CheckoutDetail/>
      <OrderSummary/>
    </div>
  )
}

export default Checkout
