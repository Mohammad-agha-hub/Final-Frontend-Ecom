import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

  type Metrics = {
    totalSales:number;
    totalOrders:number;
    totalUsers:number;
    totalProducts:number;
    pendingOrders:number;
    lowStock:string[]
  }

export function SectionCards({metrics}:{metrics:Metrics}) {
  
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="pt-1 text-center">Total Revenue Of This Month</CardDescription>
          <CardTitle className="text-2xl text-center font-semibold tabular-nums @[250px]/card:text-4xl">
           Rs. {metrics.totalSales.toLocaleString()}
          </CardTitle>
        </CardHeader>
        
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="pt-1 text-center">Total Users</CardDescription>
          <CardTitle className="text-3xl text-center font-semibold tabular-nums @[250px]/card:text-5xl">
            {metrics.totalUsers}
          </CardTitle>
        </CardHeader>
       
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="pt-1 text-center">Total Products</CardDescription>
          <CardTitle className="text-2xl text-center font-semibold tabular-nums @[250px]/card:text-5xl">
          {metrics.totalProducts}
          </CardTitle>
        </CardHeader>
        <CardFooter className="justify-center gap-2 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium ">
            Low Stock Products 
          </div>
          <div className=" text-black font-semibold text-center">{metrics.lowStock.length}</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="pt-1 text-center">Total Orders</CardDescription>
          <CardTitle className="text-2xl text-center font-semibold tabular-nums @[250px]/card:text-5xl">
            {metrics.totalOrders}
          </CardTitle>
          
        </CardHeader>
        <CardFooter className="justify-center gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Pending Orders
          </div>
          <div className="text-black font-semibold">{metrics.pendingOrders}</div>
        </CardFooter>
      </Card>
    </div>
  )
}
