import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // `/admin` requires admin role
      console.log("hit auth callback in middleware");
      if (req.nextUrl.pathname.startsWith("/admin")) {
        console.log("hit admin route");
        return token?.role === "SUPERADMIN";
      } else if (req.nextUrl.pathname.startsWith("/dashboard")) {
        console.log("hit dashboard route");
        return token?.role === "ORGMEMBER";
      } else {
        console.log("hit other route");
        return true;
      }
    },
  },
});

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] };
