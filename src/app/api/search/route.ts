import { NextResponse } from "next/server";
import { connectToDatabase, User, Order, ContactRequest } from "@/lib/models";
import { Op } from "sequelize";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query || query.length < 2) {
            return NextResponse.json({ success: false, results: [] });
        }

        await connectToDatabase();

        const searchTerm = `%${query}%`; // Add wildcards for LIKE

        // 1. Search Users (Admins/Editors only)
        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: searchTerm } },
                    { email: { [Op.like]: searchTerm } }
                ],
                role: { [Op.ne]: 'user' } // Only show staff
            },
            limit: 5
        });

        // 2. Search Orders (Join with User)
        const orders = await Order.findAll({
            where: {
                [Op.or]: [
                    { id: { [Op.like]: searchTerm } },
                    { trackingNumber: { [Op.like]: searchTerm } }
                ]
            } as any, // Cast to any to bypass TS number vs string LIKE check
            limit: 5,
            include: [{ model: User, attributes: ['name'] }]
        });

        // 3. Search Contacts
        const contacts = await ContactRequest.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: searchTerm } },
                    { email: { [Op.like]: searchTerm } },
                    { message: { [Op.like]: searchTerm } } // Use message instead of subject
                ]
            },
            limit: 5
        });

        // Format Results
        const results = [
            ...users.map(u => ({
                id: `user-${u.id}`,
                type: 'user',
                label: u.name,
                detail: u.email,
                path: `/dashboard/orders?userId=${u.id}`, // Or users detail page if exists, currently listed in UsersPage
                icon: 'person'
            })),
            ...orders.map(o => ({
                id: `order-${o.id}`,
                type: 'order',
                label: `Sipariş #${o.id}`,
                detail: `${o.user?.name || 'Müşteri'} - ${new Date(o.createdAt).toLocaleDateString('tr-TR')}`,
                path: `/dashboard/orders/${o.id}`,
                icon: 'shopping_cart'
            })),
            ...contacts.map(c => ({
                id: `contact-${c.id}`,
                type: 'contact',
                label: c.name,
                detail: c.subject,
                path: `/dashboard/contacts/${c.id}`,
                icon: 'mail'
            }))
        ];

        // Cache search results for 30 seconds to reduce repeated queries
        return NextResponse.json(
            { success: true, results },
            {
                headers: {
                    'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
                }
            }
        );

    } catch (error) {
        console.error("Search failed:", error);
        return NextResponse.json({ success: false, error: "Search failed" }, { status: 500 });
    }
}
