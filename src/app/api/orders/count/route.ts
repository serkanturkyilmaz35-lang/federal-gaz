import { NextResponse } from "next/server";
import { Order } from "@/lib/models";

export async function GET() {
    try {
        const count = await Order.count();
        return NextResponse.json({ count });
    } catch (error) {
        console.error("Error getting order count:", error);
        return NextResponse.json({ count: 0 });
    }
}
