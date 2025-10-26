import { db } from "./drizzle";
import { admin, emailTemplates } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database for GatherUp Accountability Platform...");

  try {
    // 1. Create admin user
    const passwordHash = await bcrypt.hash("admin123", 10);

    const [adminUser] = await db
      .insert(admin)
      .values({
        email: "admin@gatherup.com",
        passwordHash,
        name: "Admin User",
      })
      .returning();

    console.log("✅ Admin user created:");
    console.log("   Email: admin@gatherup.com");
    console.log("   Password: admin123");
    console.log("   ID:", adminUser.id);

    // 2. Create default email templates
    const templates = await db
      .insert(emailTemplates)
      .values([
        {
          templateType: "welcome",
          name: "Welcome Email",
          subject: "Welcome to GatherUp! 🎉",
          bodyHtml: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #053D3D;">Welcome {{memberName}}!</h1>
            <p>We're excited to have you join GatherUp, your accountability partner platform.</p>
            <p>You'll receive an email with your accountability partner details within 1 week.</p>
            <p>In the meantime, log in to your dashboard to view your goal and track your progress.</p>
            <p style="color: #666; margin-top: 30px;">Best regards,<br>The GatherUp Team</p>
          </div>
        `,
          bodyText:
            "Welcome {{memberName}}! We're excited to have you join GatherUp. You'll receive an email with your accountability partner details within 1 week.",
          variables: ["memberName"],
          isActive: true,
        },
        {
          templateType: "match_notification",
          name: "Match Notification",
          subject: "You've been matched with an accountability partner! 🤝",
          bodyHtml: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #053D3D;">Great news, {{memberName}}!</h1>
            <p>You've been matched with <strong>{{partnerName}}</strong>!</p>
            <div style="background: #E0F2CC; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Partner Details:</h3>
              <p><strong>Name:</strong> {{partnerName}}</p>
              <p><strong>Preferred Contact:</strong> {{partnerContact}}</p>
              <p><strong>Their Goal:</strong> {{partnerGoal}}</p>
            </div>
            <p>We encourage you to reach out and start your accountability journey together!</p>
            <p style="color: #666; margin-top: 30px;">Best regards,<br>The GatherUp Team</p>
          </div>
        `,
          bodyText:
            "Great news, {{memberName}}! You've been matched with {{partnerName}}. Their preferred contact: {{partnerContact}}. Reach out and start your accountability journey!",
          variables: [
            "memberName",
            "partnerName",
            "partnerContact",
            "partnerGoal",
          ],
          isActive: true,
        },
        {
          templateType: "check_in",
          name: "Check-In Reminder",
          subject: "Time to check in with your accountability partner 📞",
          bodyHtml: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #053D3D;">Hi {{memberName}},</h1>
            <p>It's check-in day! Time to connect with your accountability partner.</p>
            <div style="background: #BCE8E7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Check-in Tips:</h3>
              <ul>
                <li>Share your progress since the last check-in</li>
                <li>Discuss any challenges you're facing</li>
                <li>Set intentions for the next few days</li>
                <li>Celebrate wins, big or small!</li>
              </ul>
            </div>
            <p>Don't forget to update your progress score in your dashboard after your check-in.</p>
            <p style="color: #666; margin-top: 30px;">Keep going strong!<br>The GatherUp Team</p>
          </div>
        `,
          bodyText:
            "Hi {{memberName}}, It's check-in day! Reach out to your partner and share your progress. Don't forget to update your progress score in your dashboard.",
          variables: ["memberName"],
          isActive: true,
        },
        {
          templateType: "reflection",
          name: "Midweek Reflection",
          subject: "Your midweek reflection prompt 💭",
          bodyHtml: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #053D3D;">Hi {{memberName}},</h1>
            <p>Take a moment to reflect on your progress this week.</p>
            <div style="background: #E0F2CC; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Reflection Questions:</h3>
              <p><strong>Your Goal:</strong> {{goal}}</p>
              <ul>
                <li>What progress have you made this week?</li>
                <li>What obstacles did you overcome?</li>
                <li>What's one thing you'll do differently tomorrow?</li>
                <li>How can your accountability partner support you better?</li>
              </ul>
            </div>
            <p>Share your reflections with your accountability partner or update your progress in your dashboard.</p>
            <p style="color: #666; margin-top: 30px;">Keep up the great work!<br>The GatherUp Team</p>
          </div>
        `,
          bodyText:
            "Hi {{memberName}}, Take a moment to reflect: What progress have you made this week toward {{goal}}? Share your thoughts with your accountability partner.",
          variables: ["memberName", "goal"],
          isActive: true,
        },
        {
          templateType: "rematch",
          name: "Rematch Confirmation",
          subject: "Your rematch request has been processed",
          bodyHtml: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #053D3D;">Hi {{memberName}},</h1>
            <p>{{message}}</p>
            <p>If you have any questions, please don't hesitate to reach out.</p>
            <p style="color: #666; margin-top: 30px;">Best regards,<br>The GatherUp Team</p>
          </div>
        `,
          bodyText: "Hi {{memberName}}, {{message}}",
          variables: ["memberName", "message"],
          isActive: true,
        },
      ])
      .returning();

    console.log("✅ Default email templates created:");
    templates.forEach((template) => {
      console.log(`   - ${template.name} (${template.templateType})`);
    });

    console.log("\n🎉 Seeding complete!");
    console.log("\n📋 Summary:");
    console.log(`   - 1 admin user created`);
    console.log(`   - ${templates.length} email templates created`);
    console.log("\n🔐 Login Credentials:");
    console.log("   URL: http://localhost:3000/sign-in");
    console.log("   Email: admin@gatherup.com");
    console.log("   Password: admin123");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

seed()
  .catch((error) => {
    console.error("Error during seed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
