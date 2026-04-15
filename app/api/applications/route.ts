import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
        award: true,
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("GET /api/applications error:", error);

    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const application = await prisma.application.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        country: body.country,
        stateProvince: body.stateProvince || null,
        city: body.city,
        professionalTitle: body.professionalTitle,
        yearsExperience: Number(body.yearsExperience),
        membershipNumber: body.membershipNumber,
        membershipLevel: body.membershipLevel || null,
        websiteUrl: body.websiteUrl || null,
        socialUrl: body.socialUrl || null,
        reviewsUrl: body.reviewsUrl || null,
        heardAbout: body.heardAbout || null,
        categoryId: body.categoryId,
        awardId: body.awardId,
        status: "SUBMITTED",
        paymentStatus: "PENDING",
        submittedAt: new Date(),
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("POST /api/applications error:", error);

    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
