import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  const { code } = req.query;

  // STEP 1: Redirect to Google
  if (!code) {
    const redirectUrl =
      "https://accounts.google.com/o/oauth2/v2/auth" +
      "?client_id=" + process.env.GOOGLE_CLIENT_ID +
      "&redirect_uri=" + encodeURIComponent("https://zenix-website.vercel.app/api/auth") +
      "&response_type=code" +
      "&scope=email profile";

    return res.redirect(redirectUrl);
  }

  // STEP 2: Exchange code for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: "https://zenix-website.vercel.app/api/auth",
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();

  // STEP 3: Fetch user info
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  const user = await userRes.json();

  // STEP 4: Check admin email
  if (user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).send("❌ Access denied");
  }

  // STEP 5: Create session token
  const token = jwt.sign(
    { email: user.email },
    process.env.GOOGLE_CLIENT_SECRET,
    { expiresIn: "2h" }
  );

  res.setHeader(
    "Set-Cookie",
    `admin_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`
  );

  // STEP 6: Redirect to admin panel
  res.redirect("/admin.html");
}
