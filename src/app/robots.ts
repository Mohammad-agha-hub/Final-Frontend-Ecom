import { MetadataRoute } from "next";

export default function robots():MetadataRoute.Robots{
    return{
        rules:[
            {
                userAgent:"*",
                allow:"/",
                disallow:["/dashboard","/dashboard/create-category","/dashboard/create-coupon","/dashboard/create-product","/dashboard/create-tag","/dashboard/create-variant","/dashboard/edit-product","/dashboard/edit-variants","/dashboard/import-data","/dashboard/manage-banner","/dashboard/manage-orders","/dashboard/manage-shipping","/dashboard/manage-stocks","/dashboard/view-products"]
            }
        ],
        sitemap:`${process.env.NEXT_PUBLIC_FRONTEND_URL}/sitemap.xml`
    }
}