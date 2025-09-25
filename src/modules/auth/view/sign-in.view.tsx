import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/modules/auth/components/auth-layout";
import Link from "next/link";

const SignInView = () => {
  return (
    <AuthLayout header="Sign In to your account">
      <form
        className="flex flex-col space-y-4"
      >
        <Input placeholder="Email" label="Email" />
        <Input placeholder="Password" label="Password" />

        <Button>
          Sign In
        </Button>
      </form>

      <Link href="/auth/forgot-password" className="text-primary">
        Forgot your password?
      </Link>
    </AuthLayout>
  );
}

export default SignInView;
