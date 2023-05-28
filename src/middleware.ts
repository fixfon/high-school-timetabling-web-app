import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      if (req.nextUrl.pathname.startsWith("/admin")) {
        return token?.role === "SUPERADMIN";
      } else if (req.nextUrl.pathname.startsWith("/dashboard")) {
        return token?.role === "ORGMEMBER";
      } else {
        return true;
      }
    },
  },
});

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] };
