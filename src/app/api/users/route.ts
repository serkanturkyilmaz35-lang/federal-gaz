import { NextResponse } from 'next/server';
import { User, connectToDatabase } from '@/lib/models';
import { Op } from 'sequelize';

// GET: All Users (excluding 'user' role/members)
export async function GET() {
    try {
        await connectToDatabase();
        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { role: { [Op.ne]: 'user' } }, // Exclude members
                    { email: 'serkanturkyilmaz35@gmail.com' } // Force show main admin
                ]
            },
            attributes: { exclude: ['password_hash'] },
            order: [['createdAt', 'DESC']],
            raw: true
        });
        return NextResponse.json({ success: true, users });
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
    }
}

// POST: Create User (Admin)
export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { name, email, password, phone, role } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "İsim, e-posta ve şifre alanları zorunludur." }, { status: 400 });
        }

        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "Bu e-posta adresi zaten kullanımda." }, { status: 409 });
        }

        const newUser = await User.create({
            name,
            email,
            password_hash: password, // Hook will hash
            phone,
            role: role || 'user'
        });

        const { password_hash, ...safeUser } = newUser.toJSON();

        return NextResponse.json({ success: true, user: safeUser });
    } catch (error) {
        console.error("Create user failed:", error);
        return NextResponse.json({ success: false, error: "Kullanıcı oluşturulurken bir hata oluştu." }, { status: 500 });
    }
}
