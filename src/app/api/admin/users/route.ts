import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { AttemptModel } from "@/models/Attempt";

export const dynamic = "force-dynamic";

// GET /api/admin/users - List all candidate accounts & their summary stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as unknown as { role?: string })?.role;

    if (!session || role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    await connectToDatabase();

    const users = await UserModel.find({}).sort({ createdAt: -1 }).lean();
    const attempts = await AttemptModel.find({}).lean();

    // Group attempts by userId
    const userAttemptsMap = new Map<string, typeof attempts>();
    for (const att of attempts) {
      if (att.userId) {
        const list = userAttemptsMap.get(att.userId) || [];
        list.push(att);
        userAttemptsMap.set(att.userId, list);
      }
    }

    const userSummaries = users.map((u) => {
      const userAtts = userAttemptsMap.get(u._id.toString()) || [];
      const completedAtts = userAtts.filter((a) => a.score);

      const totalAttempts = completedAtts.length;
      const averageScore =
        totalAttempts > 0
          ? Number(
              (
                completedAtts.reduce((acc, curr) => acc + (curr.score?.netScore || 0), 0) /
                totalAttempts
              ).toFixed(2)
            )
          : 0;

      const highestScore =
        totalAttempts > 0
          ? Math.max(...completedAtts.map((a) => a.score?.netScore || 0))
          : 0;

      const averageAccuracy =
        totalAttempts > 0
          ? Number(
              (
                completedAtts.reduce(
                  (acc, curr) => acc + (curr.score?.accuracyPercentage || 0),
                  0
                ) / totalAttempts
              ).toFixed(1)
            )
          : 0;

      const qualifiedCount = completedAtts.filter((a) => a.score?.qualifyingCleared).length;

      return {
        id: u._id.toString(),
        username: u.username,
        name: u.name,
        role: u.role,
        createdAt: u.createdAt,
        stats: {
          totalAttempts,
          averageScore,
          highestScore,
          averageAccuracy,
          qualifiedCount,
        },
      };
    });

    return NextResponse.json({ users: userSummaries, attempts }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a new user account
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as unknown as { role?: string })?.role;

    if (!session || role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { username, name, password, role: newRole } = body;

    if (!username || !name || !password) {
      return NextResponse.json(
        { error: "Username, Name, and Password are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const cleanUsername = username.trim().toLowerCase();
    const existing = await UserModel.findOne({ username: cleanUsername });
    if (existing) {
      return NextResponse.json(
        { error: "Username already exists. Please pick another username." },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await UserModel.create({
      username: cleanUsername,
      name: name.trim(),
      passwordHash,
      role: newRole === "admin" ? "admin" : "student",
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser._id.toString(),
          username: newUser.username,
          name: newUser.name,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/admin/users:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create user" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users - Update username, name, role, or password
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as unknown as { role?: string })?.role;

    if (!session || role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, username, name, password, role: updatedRole } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If username changed, check uniqueness
    if (username && username.trim().toLowerCase() !== user.username) {
      const cleanUsername = username.trim().toLowerCase();
      const existing = await UserModel.findOne({ username: cleanUsername });
      if (existing && existing._id.toString() !== userId) {
        return NextResponse.json(
          { error: "Username is already taken by another candidate." },
          { status: 400 }
        );
      }
      user.username = cleanUsername;
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (updatedRole && ["admin", "student"].includes(updatedRole)) {
      user.role = updatedRole;
    }

    if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password.trim(), salt);
    }

    await user.save();

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          username: user.username,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /api/admin/users:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users - Delete a user
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as unknown as { role?: string })?.role;
    const currentUserId = (session?.user as unknown as { id?: string })?.id;

    if (!session || role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (userId === currentUserId) {
      return NextResponse.json({ error: "Cannot delete your own active admin account" }, { status: 400 });
    }

    await connectToDatabase();
    await UserModel.findByIdAndDelete(userId);

    return NextResponse.json({ success: true, message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/admin/users:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete user" },
      { status: 500 }
    );
  }
}
