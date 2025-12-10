import { NextResponse } from 'next/server';
import { User, Address, connectToDatabase } from '@/lib/models';

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const params = await props.params;
        const id = params.id;

        await User.destroy({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete user failed:", error);
        return NextResponse.json({ success: false, error: "Delete failed" }, { status: 500 });
    }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const params = await props.params;
        const id = params.id;
        const body = await req.json();
        const { name, email, role, password, phone, addresses, deletedAddressIds } = body;

        const user = await User.findByPk(id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        if (phone) user.phone = phone;

        if (password) {
            user.password_hash = password; // Hook will hash
        }

        await user.save();

        // Handle Bulk Address Updates
        if (Array.isArray(addresses)) {
            for (const addr of addresses) {
                if (addr.id) {
                    // Update existing
                    // Ensure this address belongs to the user for security (though admin role implies trust)
                    await Address.update(
                        {
                            title: addr.title,
                            address: addr.address,
                            isDefault: addr.isDefault
                        },
                        { where: { id: addr.id, userId: id } }
                    );
                } else {
                    // Create new
                    await Address.create({
                        userId: parseInt(id),
                        title: addr.title || 'Yeni Adres',
                        address: addr.address || '',
                        isDefault: addr.isDefault || false
                    });
                }
            }
        } else if (body.address || body.title) {
            // Legacy single address fallback (optional, but good for backward compat if needed)
            // Just creating/updating default like before
            let userAddress = await Address.findOne({ where: { userId: id, isDefault: true } });
            if (!userAddress) userAddress = await Address.findOne({ where: { userId: id } });

            if (userAddress) {
                userAddress.title = body.title || userAddress.title;
                userAddress.address = body.address || userAddress.address;
                await userAddress.save();
            } else {
                await Address.create({
                    userId: parseInt(id),
                    title: body.title || 'Ev',
                    address: body.address || '',
                    isDefault: true
                });
            }
        }

        // Handle Deletions
        if (Array.isArray(deletedAddressIds) && deletedAddressIds.length > 0) {
            await Address.destroy({
                where: {
                    id: deletedAddressIds,
                    userId: id
                }
            });
        }

        // Handle "Ensure One Default" logic if needed, but for now trusting frontend input.
        // If multiple defaults sent, the last one processed might win or both set true.
        // It's better to enforce single default in frontend.

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash, ...safeUser } = user.toJSON();
        return NextResponse.json({ success: true, user: safeUser });

    } catch (error) {
        console.error("Update user failed:", error);
        return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
    }
}
