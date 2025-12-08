import { NextResponse } from 'next/server';
import { User, connectToDatabase } from '@/lib/models';

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
        const { name, email, role, password } = body;

        const user = await User.findByPk(id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;

        if (password) {
            user.password_hash = password; // Hook will hash
        }

        await user.save();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash, ...safeUser } = user.toJSON();
        return NextResponse.json({ success: true, user: safeUser });

    } catch (error) {
        console.error("Update user failed:", error);
        return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
    }
}
