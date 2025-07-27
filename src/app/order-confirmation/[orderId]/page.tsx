import { getServerSession } from "next-auth";
import { authOptions} from '../../../auth.config';
import OrderConfirmation from '../../../components/OrderConfirmation'
import { redirect } from "next/navigation";

export default async function OrderConfirmationPage({params}:{
  params:Promise<{orderId:string}>
}) {
  const {orderId} = await params
  const session = await getServerSession(authOptions);
  
 if(orderId && session?.user.backendToken){
   return <OrderConfirmation/>;
 }
 else{
  redirect('/')
 }
  
}
